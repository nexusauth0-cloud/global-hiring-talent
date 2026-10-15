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
import { getAuthContext, findCandidateProfile } from "@/lib/auth/session";
import { getCandidateApplicationDetail } from "@/lib/queries";
import { formatDate, formatDateTime, humanizeStatus } from "@/lib/utils";
import { WithdrawButton } from "./WithdrawButton";

export const metadata: Metadata = { title: "Application detail" };
export const dynamic = "force-dynamic";

const WITHDRAWABLE = ["submitted", "under_review", "shortlisted", "interview"];

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getAuthContext();
  if (!ctx) return null;
  const profile = await findCandidateProfile(ctx.user.id);
  if (!profile) return null;

  const result = await getCandidateApplicationDetail(id, profile.id);
  if (!result) notFound();

  const { application, job, organizationName, history } = result;

  return (
    <div className="space-y-6">
      <Link
        href="/candidate/applications"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to applications
      </Link>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>{job.title}</CardTitle>
            <p className="mt-1 text-sm text-slate-600">
              {organizationName} · {job.location ?? job.country ?? "Location flexible"}
            </p>
          </div>
          <Badge tone={statusTone(application.status)}>
            {humanizeStatus(application.status)}
          </Badge>
        </CardHeader>
        <CardBody>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Applied on
              </dt>
              <dd className="mt-0.5 text-sm text-brand-900">
                {formatDate(application.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Last updated
              </dt>
              <dd className="mt-1 text-sm text-brand-900">
                {formatDateTime(application.updatedAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Contact email
              </dt>
              <dd className="mt-1 text-sm text-slate-700">{application.contactEmail}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Contact phone
              </dt>
              <dd className="mt-1 text-sm text-slate-600">
                {application.contactPhone ?? "—"}
              </dd>
            </div>
          </dl>

          {application.coverLetter && (
            <div className="mt-5 border-t border-slate-100 pt-5">
              <h2 className="text-sm font-semibold text-brand-900">Cover letter</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
                {application.coverLetter}
              </p>
            </div>
          )}

          {application.resumeDocumentId && (
            <p className="mt-5 text-sm">
              <Link
                href={`/api/documents/${application.resumeDocumentId}`}
                className="font-semibold text-brand-700 hover:underline"
              >
                Download the CV submitted with this application
              </Link>
            </p>
          )}

          {WITHDRAWABLE.includes(application.status) && (
            <div className="mt-6 border-t border-slate-100 pt-5">
              <WithdrawButton applicationId={application.id} />
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status timeline</CardTitle>
        </CardHeader>
        <CardBody>
          <ol className="relative space-y-6 border-l border-slate-200 pl-6">
            {history.map((entry) => (
              <li key={entry.id} className="relative">
                <span
                  className="absolute -left-[1.85rem] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-brand-600"
                  aria-hidden="true"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={statusTone(entry.toStatus)}>
                    {humanizeStatus(entry.toStatus)}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {formatDateTime(entry.createdAt)}
                  </span>
                </div>
                {entry.note && (
                  <p className="mt-1.5 text-sm text-slate-700">{entry.note}</p>
                )}
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>
    </div>
  );
}
