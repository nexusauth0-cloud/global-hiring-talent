import "server-only";
import { headers } from "next/headers";
import { sha256 } from "@/lib/auth/password";

export async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

export async function rateLimitKey(scope: string, identifier: string): Promise<string> {
  const ip = await getClientIp();
  return `${scope}:${sha256(`${ip}:${identifier}`).slice(0, 32)}`;
}

export async function getOrigin(): Promise<string> {
  const h = await headers();
  return h.get("origin") ?? "";
}

/** Basic same-origin check for state-changing actions. */
export async function assertSameOrigin(): Promise<boolean> {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("host");
  if (!origin) return true; // server actions from same site may omit origin in some clients
  try {
    const o = new URL(origin);
    return o.host === host;
  } catch {
    return false;
  }
}
