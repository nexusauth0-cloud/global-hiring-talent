import type { Metadata } from "next";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { verifyEmailAction } from "@/server/actions/auth";

export const metadata: Metadata = { title: "Verify email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token
    ? await verifyEmailAction(token)
    : { ok: false, message: "No verification token was provided." };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-900">Email verification</h1>
      <div className="mt-5">
        <Alert tone={result.ok ? "success" : "error"}>
          {result.message}
        </Alert>
      </div>
      <p className="mt-6 text-sm text-slate-600">
        {result.ok ? (
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            Continue to sign in
          </Link>
        ) : (
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            Return to sign in
          </Link>
        )}
      </p>
    </div>
  );
}
