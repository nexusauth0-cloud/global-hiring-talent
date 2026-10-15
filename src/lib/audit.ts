import "server-only";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auditLogs } from "@/db/schema";
import { sha256 } from "@/lib/auth/password";

const SENSITIVE_KEYS = [
  "password",
  "passwordhash",
  "token",
  "secret",
  "authorization",
  "cookie",
  "coverletter",
];

function scrub(metadata: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s))) {
      out[key] = "[redacted]";
      continue;
    }
    if (typeof value === "string" && value.length > 300) {
      out[key] = value.slice(0, 300) + "…";
      continue;
    }
    out[key] = value;
  }
  return out;
}

export async function recordAudit(params: {
  actorUserId?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  let ipHash: string | undefined;
  try {
    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      "unknown";
    ipHash = sha256(ip);
  } catch {
    ipHash = undefined;
  }

  try {
    await db.insert(auditLogs).values({
      actorUserId: params.actorUserId ?? null,
      action: params.action,
      targetType: params.targetType ?? null,
      targetId: params.targetId ?? null,
      metadata: scrub(params.metadata ?? {}) as Record<string, unknown>,
      ipHash,
    });
  } catch {
    // Audit logging must never crash the primary operation.
  }
}
