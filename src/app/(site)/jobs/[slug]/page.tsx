import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  MapPin,
  Briefcase,
  Banknote,
} from "lucide-react";
import { Badge, Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProseText } from "@/components/content/ProseText";
import { ApplyPanel } from "@/components/jobs/ApplyPanel";
import { getJobBySlug } from "@/lib/queries";
import { getAuthContext } from "@/lib/auth/session";
import { findCandidateProfile } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { applications } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import {
  formatDate,
  formatSalary,
  employmentTypeLabel,
  isExpired,
} from "@/lib/utils";
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const row = await getJobBySlug(slug);
  if (!row) return { title: "Job not found" };
  return {
    title: row.job.title,
    description: row.job.summary ?? row.job.title,
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const row = await getJobBySlug(slug);
  if (!row) notFound();

  const { job, organization } = row;
  const isPublic =
    job.status === "published" &&
    organization.status === "approved" &&
    !isExpired(job.expiresAt) &&
    (job.applicationDeadline === null ||
      new Date(job.applicationDeadline) >= new Date(new Date().toDateString()));

  if (!isPublic) notFound();

  const ctx = await getAuthContext();
  const isCandidate = ctx?.user.role === "candidate";
  const profile = ctx && isCandidate ? await findCandidateProfile(ctx.user.id) : null;

  let alreadyApplied = false;
  if (profile) {
    const existing = await db
      .select({ id: applications.id })
      .from(applications)
      .where(
        and(eq(applications.jobId, job.id), eq(applications.candidateId, profile.id))
      )
      .limit(1);
    alreadyApplied = existing.length > 0;
  }

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency);

  return (
    <div className="bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="container-page py-6">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to all jobs
          </Link>
        </div>
      </div>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_22rem]">
        <article>
          <header className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{employmentTypeLabel(job.employmentType)}</Badge>
              {job.industry && <Badge tone="neutral">{job.industry}</Badge>}
              {job.department && <Badge tone="neutral">{job.department}</Badge>}
            </div>
            <h1 className="mt-4 text-3xl font-extrabold text-brand-900 sm:text-4xl">
              {job.title}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-base font-medium text-slate-600">
              <Building2 className="h-5 w-5 text-brand-500" aria-hidden="true" />
              {organization.name}
            </p>

            <dl className="mt-6 grid gap-4 sm:grid-cols-3">
              <MetaItem
                icon={<MapPin className="h-4 w-4" aria-hidden="true" />}
                label="Location"
                value={[job.location, job.country].filter(Boolean).join(", ") || "Not specified"}
              />
              <MetaItem
                icon={<Briefcase className="h-4 w-4" aria-hidden="true" />}
                label="Work type"
                value={employmentTypeLabel(job.employmentType)}
              />
              <MetaItem
                icon={<Banknote className="h-4 w-4" aria-hidden="true" />}
                label="Salary"
                value={salary ?? "Not disclosed"}
              />
            </dl>

            {job.applicationDeadline && (
              <p className="mt-5 inline-flex items-center gap-2 rounded-md bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900">
                <CalendarClock className="h-4 w-4" aria-hidden="true" />
                Apply by {formatDate(job.applicationDeadline)}
              </p>
            )}
          </header>

          <div className="mt-8 space-y-8">
            <JobSection title="About the role">
              <ProseText text={job.description} />
            </JobSection>

            {job.responsibilities && (
              <JobSection title="Responsibilities">
                <ProseText text={job.responsibilities} />
              </JobSection>
            )}

            {job.requirements && (
              <JobSection title="Requirements & qualifications">
                <ProseText text={job.requirements} />
              </JobSection>
            )}

            {job.skills.length > 0 && (
              <JobSection title="Required skills">
                <ul className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <li key={skill}>
                      <Badge tone="brand">{skill}</Badge>
                    </li>
                  ))}
                </ul>
              </JobSection>
            )}

            <p className="text-sm text-slate-500">
              Posted {formatDate(job.publishedAt)} · Reference{" "}
              {job.slug.slice(0, 12)}
            </p>
          </div>
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Application</CardTitle>
            </CardHeader>
            <CardBody>
              <ApplyPanel
                jobId={job.id}
                isLoggedIn={Boolean(ctx)}
                isCandidate={isCandidate}
                hasResume={Boolean(profile?.resumeDocumentId)}
                alreadyApplied={alreadyApplied}
                defaultEmail={ctx?.user.email ?? ""}
                defaultPhone={profile?.phone ?? ""}
              />
            </CardBody>
          </Card>

          <Card className="mt-4">
            <CardBody>
              <h2 className="text-sm font-bold text-brand-900">About the company</h2>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                {organization.name}
              </p>
              {organization.description ? (
                <p className="mt-2 text-sm text-slate-600">{organization.description}</p>
              ) : (
                <p className="mt-2 text-sm text-slate-600">
                  {[organization.industry, organization.city, organization.country]
                    .filter(Boolean)
                    .join(" · ") || "Organisation details are being completed."}
                </p>
              )}
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function JobSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
      <h2 className="mb-4 text-xl font-bold text-brand-900">{title}</h2>
      {children}
    </section>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <span className="text-brand-500">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}
