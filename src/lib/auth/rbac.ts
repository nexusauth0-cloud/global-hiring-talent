import "server-only";
import {
  requireUser,
  needsEmailVerification,
  AuthError,
  type SessionUser,
} from "@/lib/auth/session";
import type { User } from "@/db/schema";

type Role = User["role"];

export const ACTIONS_BY_ROLE: Record<Role, string[]> = {
  candidate: ["candidate.self"],
  employer: ["employer.self", "hiring_request.create"],
  recruiter: [
    "jobs.manage",
    "applications.review",
    "candidates.view",
    "employers.view",
    "hiring_requests.manage",
    "reviews.moderate",
    "articles.manage",
    "inquiries.manage",
    "notifications.view",
  ],
  admin: ["*"],
};

export function hasPermission(role: Role, action: string): boolean {
  const allowed = ACTIONS_BY_ROLE[role] ?? [];
  return allowed.includes("*") || allowed.includes(action);
}

export async function requireRole(
  ...roles: Role[]
): Promise<{ user: SessionUser; sessionId: string }> {
  const ctx = await requireUser();
  if (!roles.includes(ctx.user.role)) {
    throw new AuthError("FORBIDDEN");
  }
  return ctx;
}

/**
 * Like `requireRole`, but also rejects self-service accounts (candidate /
 * employer) whose email address has not been verified yet.
 */
export async function requireVerifiedRole(
  ...roles: Role[]
): Promise<{ user: SessionUser; sessionId: string }> {
  const ctx = await requireRole(...roles);
  if (needsEmailVerification(ctx.user)) {
    throw new AuthError(
      "EMAIL_NOT_VERIFIED",
      "Please verify your email address to continue."
    );
  }
  return ctx;
}

export async function requirePermission(
  action: string
): Promise<{ user: SessionUser; sessionId: string }> {
  const ctx = await requireUser();
  if (!hasPermission(ctx.user.role, action)) {
    throw new AuthError("FORBIDDEN");
  }
  return ctx;
}

export function isStaff(role: Role): boolean {
  return role === "recruiter" || role === "admin";
}
