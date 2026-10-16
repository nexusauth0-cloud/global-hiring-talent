import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { verifyEmailAction } from "@/server/actions/auth";
import {
  getAuthContext,
  requiresEmailVerification,
  roleDashboard,
} from "@/lib/auth/session";
import { ResendVerificationForm } from "./ResendVerificationForm";

export const metadata: Metadata = { title: "Verify email" };
export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; required?: string }>;
}) {
  const { token } = await searchParams;
  const ctx = await getAuthContext();

  const result = token
    ? await verifyEmailAction(token)
    : null;

  if (result?.ok && ctx) {
    redirect(roleDashboard(ctx.user.role));
  }

  const canVerify = Boolean(
    ctx && requiresEmailVerification(ctx.user.role) && !ctx.user.emailVerifiedAt
  );

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-900">Email verification</h1>

      {result ? (
        <div className="mt-5">
          <Alert tone={result.ok ? "success" : "error"}>{result.message}</Alert>
        </div>
      ) : (
        <div className="mt-5">
          <Alert tone="info">
            {canVerify
              ? "We have sent a verification link to your email address. Click the link to activate your account."
              : "Enter your email verification link to activate your account."}
          </Alert>
        </div>
      )}

      {canVerify && <ResendVerificationForm />}

      <p className="mt-6 text-sm text-slate-600">
        {ctx ? (
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            Return to sign in
          </Link>
        ) : (
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            Continue to sign in
          </Link>
        )}
      </p>
    </div>
  );
}
