import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <div>
        <h1 className="text-2xl font-extrabold text-brand-900">Invalid reset link</h1>
        <p className="mt-2 text-sm text-slate-600">
          This password reset link is missing or invalid. Please request a new one.
        </p>
        <p className="mt-6">
          <Link href="/forgot-password" className="font-semibold text-brand-700 hover:underline">
            Request a new reset link
          </Link>
        </p>
      </div>
    );
  }
  return <ResetPasswordForm token={token} />;
}
