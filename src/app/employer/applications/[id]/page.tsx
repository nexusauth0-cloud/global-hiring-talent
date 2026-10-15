import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  statusTone,
} from "@/components/ui/Card";
import { getAuthContext, findEmployerProfile } from "@/lib/auth/session";
import { getEmployerApplicationDetail } from "@/lib/queries";
import { formatDate, formatDateTime, humanizeStatus } from "@/lib/utils";
import { ApplicationStatusForm } from "./ApplicationStatusForm";

export const metadata: Metadata = { title: "Application review" };
export const dynamic = "force-dynamic";

export default async function EmployerApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getAuthContext();
  if (!ctx) return null;
  const profile = await findEmployerProfile(ctx.user.id);
  if (!profile) return null;

  const result = await getEmployerApplicationDetail(id, profile.organization.id);
  if (!result) notFound();

  const { application, job, candidate, history } = result;
  const name = `${candidate.firstName} ${candidate.lastName}`;

  return (
    <div className="space-y-6">
      <Link
        href="/employer/applications"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to applications
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>{name}</CardTitle>
                <p className="mt-1 text-sm text-slate-600">
                  Applied for {job.title} · {formatDate(application.createdAt)}
                </p>
              </div>
              <Badge tone={statusTone(application.status)}>
                {humanizeStatus(application.status)}
              </Badge>
            </CardHeader>
            <CardBody className="space-y-4">
              {candidate.headline && (
                <p className="text-sm font-semibold text-brand-900">
                  {candidate.headline}
                </p>
              )}
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {application.contactEmail}
                </li>
                {application.contactPhone && (
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {application.contactPhone}
                  </li>
                )}
                {(candidate.location || candidate.country) && (
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {[candidate.location, candidate.country].filter(Boolean).join(", ")}
                  </li>
                )}
              </ul>
              {candidate.summary && (
                <div>
                  <h2 className="text-sm font-semibold text-brand-900">Summary</h2>
                  <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
                    {candidate.summary}
                  </p>
                </div>
              )}
              {candidate.skills.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-brand-900">Skills</h2>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {candidate.skills.map((skill) => (
                      <li
                        key={skill}
                        className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {application.coverLetter && (
                <div>
                  <h2 className="text-sm font-semibold text-brand-900">Cover letter</h2>
                  <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
                    {application.coverLetter}
                  </p>
                </div>
              )}
              {application.resumeDocumentId && (
                <Link
                  href={`/api/documents/${application.resumeDocumentId}`}
                  className="inline-block text-sm font-semibold text-brand-700 hover:underline"
                >
                  Download CV (PDF/DOCX)
                </Link>
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

        <Card>
          <CardHeader>
            <CardTitle>Update status</CardTitle>
          </CardHeader>
          <CardBody>
            <ApplicationStatusForm
              applicationId={application.id}
              currentStatus={application.status}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
