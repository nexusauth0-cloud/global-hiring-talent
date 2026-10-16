"use server";

import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  users,
  candidates,
  organizations,
  employers,
  passwordResetTokens,
  emailVerificationTokens,
} from "@/db/schema";
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  generateToken,
  sha256,
} from "@/lib/auth/password";
import {
  createSession,
  destroySession,
  revokeAllSessions,
  requireUser,
  requiresEmailVerification,
  needsEmailVerification,
  roleDashboard,
} from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import { rateLimitKey } from "@/lib/request";
import { recordAudit } from "@/lib/audit";
import { sendNotification } from "@/lib/email/adapter";
import {
  registerCandidateSchema,
  registerEmployerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  flattenZodError,
} from "@/lib/validation/schemas";
import { slugify, uniqueSlug } from "@/lib/utils";
import { ok, fail, type ActionResult } from "@/server/action-result";

const EMAIL_TOKEN_TTL = 1000 * 60 * 60 * 24;
const RESET_TOKEN_TTL = 1000 * 60 * 60;

async function emailTaken(email: string): Promise<boolean> {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(sql`lower(${users.email})`, email))
    .limit(1);
  return rows.length > 0;
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "23505"
  );
}

export async function registerCandidateAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const key = await rateLimitKey("register", "candidate");
  const limit = rateLimit(key, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return fail("Too many registration attempts. Please try again later.", undefined, "RATE_LIMITED");
  }

  const parsed = registerCandidateSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone") ?? "",
    country: formData.get("country") ?? "",
    location: formData.get("location") ?? "",
    acceptTerms: formData.get("acceptTerms") === "on",
  });
  if (!parsed.success) {
    return fail("Please correct the highlighted fields.", flattenZodError(parsed.error));
  }
  const data = parsed.data;

  const strength = validatePasswordStrength(data.password);
  if (!strength.ok) {
    return fail("Please choose a stronger password.", { password: strength.reason! });
  }
  if (await emailTaken(data.email)) {
    return fail("An account with this email already exists.", {
      email: "This email is already registered.",
    });
  }

  try {
    const userId = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          email: data.email,
          passwordHash: await hashPassword(data.password),
          role: "candidate",
        })
        .returning({ id: users.id });
      await tx.insert(candidates).values({
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        country: data.country || null,
        location: data.location || null,
      });
      return user.id;
    });

    await issueVerificationToken(userId, data.email, data.firstName);
    await recordAudit({
      actorUserId: userId,
      action: "auth.register",
      targetType: "user",
      targetId: userId,
      metadata: { role: "candidate" },
    });
    await createSession(userId);
  } catch (err) {
    if (isUniqueViolation(err)) {
      return fail("An account with this email already exists.", {
        email: "This email is already registered.",
      });
    }
    return fail("We could not create your account right now. Please try again.");
  }

  redirect(
    needsEmailVerification({ role: "candidate", emailVerifiedAt: null })
      ? "/verify-email?required=1"
      : "/candidate"
  );
}

export async function registerEmployerAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const key = await rateLimitKey("register", "employer");
  const limit = rateLimit(key, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return fail("Too many registration attempts. Please try again later.", undefined, "RATE_LIMITED");
  }

  const parsed = registerEmployerSchema.safeParse({
    organizationName: formData.get("organizationName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone") ?? "",
    website: formData.get("website") ?? "",
    industry: formData.get("industry") ?? "",
    country: formData.get("country") ?? "",
    acceptTerms: formData.get("acceptTerms") === "on",
  });
  if (!parsed.success) {
    return fail("Please correct the highlighted fields.", flattenZodError(parsed.error));
  }
  const data = parsed.data;

  const strength = validatePasswordStrength(data.password);
  if (!strength.ok) {
    return fail("Please choose a stronger password.", { password: strength.reason! });
  }
  if (await emailTaken(data.email)) {
    return fail("An account with this email already exists.", {
      email: "This email is already registered.",
    });
  }

  try {
    const userId = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          email: data.email,
          passwordHash: await hashPassword(data.password),
          role: "employer",
        })
        .returning({ id: users.id });

      const slug = await uniqueSlug(data.organizationName, async (s) => {
        const found = await tx
          .select({ id: organizations.id })
          .from(organizations)
          .where(eq(organizations.slug, s))
          .limit(1);
        return found.length > 0;
      });

      const [org] = await tx
        .insert(organizations)
        .values({
          name: data.organizationName,
          slug,
          website: data.website || null,
          industry: data.industry || null,
          country: data.country || null,
          contactEmail: data.email,
          contactPhone: data.phone || null,
          status: "pending",
        })
        .returning({ id: organizations.id });

      await tx.insert(employers).values({
        userId: user.id,
        organizationId: org.id,
        title: data.contactName,
        isPrimary: true,
      });
      return user.id;
    });

    await issueVerificationToken(userId, data.email, data.contactName);
    await recordAudit({
      actorUserId: userId,
      action: "auth.register",
      targetType: "user",
      targetId: userId,
      metadata: { role: "employer", organization: slugify(data.organizationName) },
    });
    await createSession(userId);
  } catch (err) {
    if (isUniqueViolation(err)) {
      return fail("An account with this email already exists.", {
        email: "This email is already registered.",
      });
    }
    return fail("We could not create your account right now. Please try again.");
  }

  redirect(
    needsEmailVerification({ role: "employer", emailVerifiedAt: null })
      ? "/verify-email?required=1"
      : "/employer"
  );
}

export async function loginAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return fail("Please correct the highlighted fields.", flattenZodError(parsed.error));
  }
  const { email, password } = parsed.data;
  const next = String(formData.get("next") ?? "");

  const ipKey = await rateLimitKey("login-ip", "global");
  const emailKey = await rateLimitKey("login-email", email);
  const ipLimit = rateLimit(ipKey, 20, 15 * 60 * 1000);
  const emailLimit = rateLimit(emailKey, 8, 15 * 60 * 1000);
  if (!ipLimit.allowed || !emailLimit.allowed) {
    return fail(
      "Too many sign-in attempts. Please wait a few minutes and try again.",
      undefined,
      "RATE_LIMITED"
    );
  }

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      passwordHash: users.passwordHash,
      isActive: users.isActive,
      emailVerifiedAt: users.emailVerifiedAt,
    })
    .from(users)
    .where(eq(sql`lower(${users.email})`, email))
    .limit(1);

  const user = rows[0];
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !valid) {
    await recordAudit({
      action: "auth.login_failed",
      targetType: "user",
      metadata: { email },
    });
    return fail("Invalid email or password.");
  }
  if (!user.isActive) {
    return fail("This account has been disabled. Please contact support.");
  }

  await createSession(user.id);
  await recordAudit({
    actorUserId: user.id,
    action: "auth.login",
    targetType: "user",
    targetId: user.id,
  });

  if (needsEmailVerification(user)) {
    redirect("/verify-email?required=1");
  }

  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : null;
  redirect(safeNext ?? roleDashboard(user.role));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function forgotPasswordAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return fail("Please enter a valid email address.", flattenZodError(parsed.error));
  }
  const key = await rateLimitKey("forgot", parsed.data.email);
  const limit = rateLimit(key, 4, 60 * 60 * 1000);

  const generic = ok(
    "If an account exists for that email, we have sent password reset instructions."
  );
  if (!limit.allowed) return generic;

  const rows = await db
    .select({ id: users.id, email: users.email, isActive: users.isActive })
    .from(users)
    .where(eq(sql`lower(${users.email})`, parsed.data.email))
    .limit(1);
  const user = rows[0];
  if (!user || !user.isActive) return generic;

  // Requesting a new link invalidates any earlier, still-unused reset link.
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(passwordResetTokens.userId, user.id),
        isNull(passwordResetTokens.usedAt)
      )
    );

  const token = generateToken(32);
  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash: sha256(token),
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL),
  });

  await sendNotification({
    template: "password_reset",
    to: user.email,
    userId: user.id,
    data: {
      name: user.email.split("@")[0],
      token,
    },
  });

  return generic;
}

export async function resetPasswordAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return fail("Please correct the highlighted fields.", flattenZodError(parsed.error));
  }
  const strength = validatePasswordStrength(parsed.data.password);
  if (!strength.ok) {
    return fail("Please choose a stronger password.", { password: strength.reason! });
  }

  const rows = await db
    .select({
      id: passwordResetTokens.id,
      userId: passwordResetTokens.userId,
      email: users.email,
    })
    .from(passwordResetTokens)
    .innerJoin(users, eq(users.id, passwordResetTokens.userId))
    .where(
      and(
        eq(passwordResetTokens.tokenHash, sha256(parsed.data.token)),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    )
    .limit(1);
  const record = rows[0];
  if (!record) {
    return fail("This reset link is invalid or has expired. Please request a new one.");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ passwordHash: await hashPassword(parsed.data.password), updatedAt: new Date() })
      .where(eq(users.id, record.userId));
    await tx
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, record.id));
    // Any other outstanding reset links for this user are now void.
    await tx
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(passwordResetTokens.userId, record.userId),
          isNull(passwordResetTokens.usedAt)
        )
      );
  });
  await revokeAllSessions(record.userId);
  await recordAudit({
    actorUserId: record.userId,
    action: "auth.password_reset",
    targetType: "user",
    targetId: record.userId,
  });

  // Inform the account owner that their password changed.
  await sendNotification({
    template: "password_changed",
    to: record.email,
    userId: record.userId,
    data: {
      name: record.email.split("@")[0],
      changedAt: new Date().toISOString(),
    },
  });

  return ok("Your password has been reset. You can now sign in.");
}

export async function verifyEmailAction(
  token: string
): Promise<ActionResult> {
  if (!token || token.length < 10) {
    return fail("This verification link is invalid.");
  }
  const rows = await db
    .select({ id: emailVerificationTokens.id, userId: emailVerificationTokens.userId })
    .from(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.tokenHash, sha256(token)),
        isNull(emailVerificationTokens.usedAt),
        gt(emailVerificationTokens.expiresAt, new Date())
      )
    )
    .limit(1);
  const record = rows[0];
  if (!record) {
    return fail("This verification link is invalid or has expired.");
  }
  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ emailVerifiedAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, record.userId));
    // Mark this link (and any siblings) as used so they cannot be replayed.
    await tx
      .update(emailVerificationTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(emailVerificationTokens.userId, record.userId),
          isNull(emailVerificationTokens.usedAt)
        )
      );
  });
  await recordAudit({
    actorUserId: record.userId,
    action: "auth.email_verified",
    targetType: "user",
    targetId: record.userId,
  });
  return ok("Your email address has been verified.");
}

async function issueVerificationToken(
  userId: string,
  email: string,
  name: string
): Promise<void> {
  // Issuing a new link invalidates any earlier, still-unused verification link.
  await db
    .update(emailVerificationTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(emailVerificationTokens.userId, userId),
        isNull(emailVerificationTokens.usedAt)
      )
    );

  const token = generateToken(32);
  await db.insert(emailVerificationTokens).values({
    userId,
    tokenHash: sha256(token),
    expiresAt: new Date(Date.now() + EMAIL_TOKEN_TTL),
  });
  await sendNotification({
    template: "email_verification",
    to: email,
    userId,
    data: { name, token },
  });
}

export async function resendVerificationAction(
  _prev: ActionResult | undefined,
  _formData: FormData
): Promise<ActionResult> {
  let ctx;
  try {
    ctx = await requireUser();
  } catch {
    return fail("You must be signed in to request a new verification email.");
  }

  if (!requiresEmailVerification(ctx.user.role)) {
    return ok("This account does not require email verification.");
  }
  if (ctx.user.emailVerifiedAt) {
    return ok("Your email address is already verified.");
  }

  const key = await rateLimitKey("resend-verification", ctx.user.id);
  if (!rateLimit(key, 3, 60 * 60 * 1000).allowed) {
    return fail(
      "You have requested several verification emails already. Please wait an hour before trying again.",
      undefined,
      "RATE_LIMITED"
    );
  }

  await issueVerificationToken(
    ctx.user.id,
    ctx.user.email,
    ctx.user.email.split("@")[0]
  );
  await recordAudit({
    actorUserId: ctx.user.id,
    action: "auth.verification_resent",
    targetType: "user",
    targetId: ctx.user.id,
  });

  return ok(
    "We have sent a new verification link to your email address if it is not yet verified."
  );
}
