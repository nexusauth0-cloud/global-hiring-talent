import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, FileCheck, Inbox, Send } from "lucide-react";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  statusTone,
} from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { getAuthContext, findEmployerProfile } from "@/lib/auth/session";
import {
  getEmployerApplications,
  getEmployerMetrics,
} from "@/lib/queries";
import { formatDate, humanizeStatus } from "@/lib/utils";

export const metadata: Metadata = { title: "Employer dashboard" };
export const dynamic = "force-dynamic";

export default async function EmployerDashboardPage() {
  const ctx = await getAuthContext();
  if (!ctx) return null;
  const profile = await findEmployerProfile(ctx.user.id);
  if (!profile) return null;
  const { organization } = profile;

  const [metrics, applications] = await Promise.all([
    getEmployerMetrics(organization.id),
    getEmployerApplications(organization.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-900">
          {organization.name}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your job posts and applications.
        </p>
      </div>

      {organization.status === "pending" && (
        <Alert tone="warning" title="Verification pending">
          Your organization is awaiting approval. You can prepare drafts, but job
          posts cannot be published until an administrator approves your account.
        </Alert>
      )}
      {organization.status === "rejected" && (
        <Alert tone="error" title="Verification not approved">
          Your organization was not approved.
          {organization.statusNote ? ` Reason: ${organization.statusNote}` : ""}
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Briefcase className="h-5 w-5" aria-hidden="true" />}
          value={metrics.jobs}
          label="Job posts"
        />
        <StatCard
          icon={<FileCheck className="h-5 w-5" aria-hidden="true" />}
          value={metrics.jobsPublished}
          label="Published"
        />
        <StatCard
          icon={<Inbox className="h-5 w-5" aria-hidden="true" />}
          value={metrics.applications}
          label="Applications"
        />
        <StatCard
          icon={<Send className="h-5 w-5" aria-hidden="true" />}
          value={metrics.hiringRequests}
          label="Hiring requests"
        />
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recent applications</CardTitle>
          <ButtonLink href="/employer/applications" variant="ghost" size="sm">
            View all
          </ButtonLink>
        </CardHeader>
        <CardBody className="p-0">
          {applications.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {applications.slice(0, 5).map((app) => (
                <li
                  key={app.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div>
                    <Link
                      href={`/employer/applications/${app.id}`}
                      className="font-semibold text-brand-900 hover:underline"
                    >
                      {app.candidateFirst} {app.candidateLast}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {app.jobTitle} · {formatDate(app.createdAt)}
                    </p>
                  </div>
                  <Badge tone={statusTone(app.status)}>
                    {humanizeStatus(app.status)}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-6 text-sm text-slate-600">
              No applications yet.{" "}
              <Link href="/employer/jobs/new" className="font-semibold text-brand-700 hover:underline">
                Post a job
              </Link>{" "}
              to start receiving applications.
            </p>
          )}
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/employer/jobs/new">Post a job</ButtonLink>
        <ButtonLink href="/employer/requests/new" variant="outline">
          Submit a hiring request
        </ButtonLink>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
          {icon}
        </span>
        <div>
          <p className="text-2xl font-extrabold text-brand-900">{value}</p>
          <p className="text-sm text-slate-600">{label}</p>
        </div>
      </CardBody>
    </Card>
  );
}
