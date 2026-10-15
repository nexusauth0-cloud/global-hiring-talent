import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAuthContext, findEmployerProfile } from "@/lib/auth/session";
import { HiringRequestForm } from "./HiringRequestForm";

export const metadata: Metadata = { title: "New hiring request" };
export const dynamic = "force-dynamic";

export default async function NewHiringRequestPage() {
  const ctx = await getAuthContext();
  if (!ctx) return null;
  const profile = await findEmployerProfile(ctx.user.id);
  if (!profile) return null;

  return (
    <div className="space-y-6">
      <Link
        href="/employer/requests"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to requests
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold text-brand-900">New hiring request</h1>
        <p className="mt-1 text-sm text-slate-600">
          Tell us about your hiring need and our team will follow up.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <HiringRequestForm />
      </div>
    </div>
  );
}
