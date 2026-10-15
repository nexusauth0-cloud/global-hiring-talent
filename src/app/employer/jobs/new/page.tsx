import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { getAuthContext, findEmployerProfile } from "@/lib/auth/session";
import { JobForm } from "../JobForm";

export const metadata: Metadata = { title: "New job" };
export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  const ctx = await getAuthContext();
  if (!ctx) return null;
  const profile = await findEmployerProfile(ctx.user.id);
  if (!profile) return null;

  return (
    <div className="space-y-6">
      <Link
        href="/employer/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to jobs
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold text-brand-900">Post a job</h1>
        <p className="mt-1 text-sm text-slate-600">
          Job posts appear publicly once published and your account is approved.
        </p>
      </div>

      {profile.organization.status !== "approved" && (
        <Alert tone="warning">
          Your organization is not yet approved. You can save this role as a draft,
          but it cannot be published until an administrator approves your account.
        </Alert>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <JobForm
          mode="create"
          defaults={{
            title: "",
            summary: "",
            description: "",
            responsibilities: "",
            requirements: "",
            employmentType: "onsite",
            location: "",
            country: "",
            department: "",
            industry: profile.organization.industry ?? "",
            salaryMin: "",
            salaryMax: "",
            currency: "USD",
            skills: "",
            applicationDeadline: "",
            status: "draft",
          }}
        />
      </div>
    </div>
  );
}
