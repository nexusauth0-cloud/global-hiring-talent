import Link from "next/link";
import { MapPin, Building2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Card";
import { company } from "@/lib/config";
import {
  employmentTypeLabel,
  formatDate,
  formatSalary,
  cn,
} from "@/lib/utils";

export type JobCardData = {
  slug: string;
  title: string;
  summary: string | null;
  employmentType: string;
  location: string | null;
  country: string | null;
  industry?: string | null;
  department?: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  skills: string[];
  publishedAt?: Date | string | null;
  applicationDeadline?: string | null;
  organizationName?: string | null;
};

export function JobCard({
  job,
  className,
}: {
  job: JobCardData;
  className?: string;
}) {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency);
  const place = [job.location, job.country].filter(Boolean).join(", ");

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-elevated)]",
        className
      )}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone="brand">{employmentTypeLabel(job.employmentType)}</Badge>
        {job.industry && <Badge tone="neutral">{job.industry}</Badge>}
      </div>

      <h3 className="text-lg font-bold leading-snug text-brand-900">
        <Link href={`/jobs/${job.slug}`} className="hover:text-brand-700">
          <span className="absolute inset-0" aria-hidden="true" />
          {job.title}
        </Link>
      </h3>

      {job.organizationName && (
        <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-600">
          <Building2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          {job.organizationName}
        </p>
      )}

      {job.summary && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
          {job.summary}
        </p>
      )}

      {job.skills.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 4).map((skill) => (
            <li
              key={skill}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
            >
              {skill}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-5 text-sm text-slate-600">
        {place && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
            {place}
          </span>
        )}
        {salary && (
          <span className="font-semibold text-brand-800">{salary}</span>
        )}
      </div>

      {(job.publishedAt || job.applicationDeadline) && (
        <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {job.applicationDeadline
            ? `Apply by ${formatDate(job.applicationDeadline)}`
            : `Posted ${formatDate(job.publishedAt ?? null)}`}
        </div>
      )}

      <span className="sr-only">
        View details for {job.title}
        {job.organizationName ? ` at ${job.organizationName}` : ""} on{" "}
        {company.name}
      </span>
    </article>
  );
}
