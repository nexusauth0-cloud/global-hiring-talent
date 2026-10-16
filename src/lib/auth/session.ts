import "server-only";
import { cookies, headers } from "next/headers";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions, users, candidates, employers, organizations } from "@/db/schema";
import type { User } from "@/db/schema";
import { generateToken, sha256 } from "@/lib/auth/password";
import { env, emailVerificationEnforced } from "@/lib/config";

const COOKIE_NAME = "ght_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;

export type SessionUser = Pick<
  User,
  "id" | "email" | "role" | "isActive" | "emailVerifiedAt"
>;

export type AuthContext = {
  user: SessionUser;
  sessionId: string;
} | null;

async function clientMeta(): Promise<{ userAgent?: string; ipHash?: string }> {
  const h = await headers();
  const ua = h.get("user-agent")?.slice(0, 300) ?? undefined;
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown";
  return { userAgent: ua, ipHash: sha256(ip) };
}

export async function createSession(userId: string): Promise<void> {
  const raw = generateToken(32);
  const tokenHash = sha256(raw);
  const meta = await clientMeta();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessions).values({
    userId,
    tokenHash,
    expiresAt,
    userAgent: meta.userAgent,
    ipHash: meta.ipHash,
  });

  const store = await cookies();
  store.set(COOKIE_NAME, raw, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function getAuthContext(): Promise<AuthContext> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const tokenHash = sha256(raw);

  const rows = await db
    .select({
      sessionId: sessions.id,
      id: users.id,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      emailVerifiedAt: users.emailVerifiedAt,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(
        eq(sessions.tokenHash, tokenHash),
        gt(sessions.expiresAt, new Date()),
        isNull(sessions.revokedAt),
        eq(users.isActive, true)
      )
    )
    .limit(1);

  if (rows.length === 0) return null;
  const { sessionId, ...user } = rows[0];
  return { user, sessionId };
}

export async function requireUser(): Promise<
  { user: SessionUser; sessionId: string }
> {
  const ctx = await getAuthContext();
  if (!ctx) throw new AuthError("UNAUTHENTICATED");
  return ctx;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (raw) {
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.tokenHash, sha256(raw)));
  }
  store.delete(COOKIE_NAME);
}

export async function revokeAllSessions(userId: string): Promise<void> {
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
}

export async function cleanupExpiredSessions(): Promise<void> {
  await db.delete(sessions).where(sql`${sessions.expiresAt} < now()`);
}

export async function findCandidateProfile(userId: string) {
  const rows = await db
    .select()
    .from(candidates)
    .where(eq(candidates.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function findEmployerProfile(userId: string) {
  const rows = await db
    .select({
      employer: employers,
      organization: organizations,
    })
    .from(employers)
    .innerJoin(organizations, eq(organizations.id, employers.organizationId))
    .where(eq(employers.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

export class AuthError extends Error {
  constructor(public code: string, message?: string) {
    super(message ?? code);
    this.name = "AuthError";
  }
}

/**
 * Self-service account types that must confirm their email address before
 * reaching their dashboards. Staff accounts (admin/recruiter) are provisioned
 * internally via `create-admin` and are considered verified.
 */
export const VERIFICATION_REQUIRED_ROLES = ["candidate", "employer"] as const;

export function requiresEmailVerification(role: User["role"]): boolean {
  return (VERIFICATION_REQUIRED_ROLES as readonly string[]).includes(role);
}

/**
 * Whether this account is currently *blocked* pending email verification.
 * This is the enforcement-aware check used to redirect/deny access. It is
 * `false` whenever `EMAIL_VERIFICATION_ENFORCED` is off, so accounts are never
 * locked out before verification emails can be delivered. The `enforced`
 * parameter is injectable for testing.
 */
export function needsEmailVerification(
  user: { role: User["role"]; emailVerifiedAt: Date | null },
  enforced: boolean = emailVerificationEnforced()
): boolean {
  return enforced && requiresEmailVerification(user.role) && !user.emailVerifiedAt;
}

export function roleDashboard(role: User["role"]): string {
  switch (role) {
    case "candidate":
      return "/candidate";
    case "employer":
      return "/employer";
    case "recruiter":
    case "admin":
      return "/admin";
  }
}
