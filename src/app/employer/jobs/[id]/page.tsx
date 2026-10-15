import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  statusTone,
} from "@/components/ui/Card";
import { getAuthContext, findEmployerProfile } from "@/lib/auth/session";
import { getEmployerJobById } from "@/lib/queries";
import { humanizeStatus } from "@/lib/utils";
import { JobForm } from "../JobForm";
import { JobStatusForm } from "./JobStatusForm";

export const metadata: Metadata = { title: "Edit job" };
export const dynamic = "force-dynamic";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getAuthContext();
  if (!ctx) return null;
  const profile = await findEmployerProfile(ctx.user.id);
  if (!profile) return null;

  const job = await getEmployerJobById(id, profile.organization.id);
  if (!job) return null;

  return (
    <div className="space-y-6">
      <Link
        href="/employer/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to jobs
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-900">{job.title}</h1>
          <p className="mt-1 text-sm text-slate-600">
            Current status: {job.status}
          </p>
        </div>
        <span className="text-sm">
          <a
            href={`/jobs/${job.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-700 hover:underline"
          >
            View public page ↗
          </a>
        </span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Quick actions
        </h2>
        <JobStatusForm jobId={job.id} currentStatus={job.status} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <JobForm
          mode="edit"
          jobId={job.id}
          defaults={{
            title: job.title,
            summary: job.summary ?? "",
            description: job.description,
            responsibilities: job.responsibilities ?? "",
            requirements: job.requirements ?? "",
            employmentType: job.employmentType,
            location: job.location ?? "",
            country: job.country ?? "",
            department: job.department ?? "",
            industry: job.industry ?? "",
            salaryMin: job.salaryMin != null ? String(job.salaryMin) : "",
            salaryMax: job.salaryMax != null ? String(job.salaryMax) : "",
            currency: job.currency ?? "USD",
            skills: (job.skills ?? []).join(", "),
            applicationDeadline: job.applicationDeadline
              ? String(job.applicationDeadline)
              : "",
            status: job.status,
          }}
        />
      </div>
    </div>
  );
}
