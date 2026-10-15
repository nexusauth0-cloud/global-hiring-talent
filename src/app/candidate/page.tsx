import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Send, UserCheck, Briefcase } from "lucide-react";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  statusTone,
} from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAuthContext, findCandidateProfile } from "@/lib/auth/session";
import { getCandidateApplications } from "@/lib/queries";
import { formatDate, humanizeStatus } from "@/lib/utils";

export const metadata: Metadata = { title: "Candidate dashboard" };
export const dynamic = "force-dynamic";

export default async function CandidateDashboardPage() {
  const ctx = await getAuthContext();
  if (!ctx) return null;
  const profile = await findCandidateProfile(ctx.user.id);
  if (!profile) return null;

  const applications = await getCandidateApplications(profile.id);
  const active = applications.filter(
    (a) => !["withdrawn", "rejected", "hired"].includes(a.status)
  );

  const checklist = [
    {
      label: "Upload a CV",
      done: Boolean(profile.resumeDocumentId),
      href: "/candidate/profile",
    },
    {
      label: "Add a professional headline",
      done: Boolean(profile.headline),
      href: "/candidate/profile",
    },
    {
      label: "Add your phone number",
      done: Boolean(profile.phone),
      href: "/candidate/profile",
    },
    {
      label: "Add your skills",
      done: profile.skills.length > 0,
      href: "/candidate/profile",
    },
  ];
  const completed = checklist.filter((c) => c.done).length;
  const pct = Math.round((completed / checklist.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-900">
          Welcome, {profile.firstName}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your profile, CV and job applications.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Send className="h-5 w-5" aria-hidden="true" />}
          value={applications.length}
          label="Total applications"
        />
        <StatCard
          icon={<Briefcase className="h-5 w-5" aria-hidden="true" />}
          value={active.length}
          label="Active applications"
        />
        <StatCard
          icon={<FileText className="h-5 w-5" aria-hidden="true" />}
          value={profile.resumeDocumentId ? 1 : 0}
          label="CV on file"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent applications</CardTitle>
            <ButtonLink href="/candidate/applications" variant="ghost" size="sm">
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
                        href={`/candidate/applications/${app.id}`}
                        className="font-semibold text-brand-900 hover:underline"
                      >
                        {app.jobTitle}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {app.organizationName} · Applied {formatDate(app.createdAt)}
                      </p>
                    </div>
                    <Badge tone={statusTone(app.status)}>
                      {humanizeStatus(app.status)}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-5">
                <EmptyState
                  title="No applications yet"
                  description="When you apply for a role, it will appear here so you can track its progress."
                  action={<ButtonLink href="/jobs">Browse jobs</ButtonLink>}
                />
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile completeness</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="mb-4">
              <p className="mb-1.5 text-sm font-semibold text-brand-900">
                {pct}% complete
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-600"
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Profile completeness"
                />
              </div>
            </div>
            <ul className="space-y-2.5">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-2.5 text-sm">
                  <span
                    className={
                      item.done
                        ? "flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700"
                        : "flex h-5 w-5 items-center justify-center rounded-full border border-slate-300"
                    }
                    aria-hidden="true"
                  >
                    {item.done ? "✓" : ""}
                  </span>
                  <Link href={item.href} className="text-slate-700 hover:text-brand-800">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ButtonLink
              href="/candidate/profile"
              variant="outline"
              className="mt-5 w-full"
            >
              <UserCheck className="h-4 w-4" aria-hidden="true" />
              Complete profile
            </ButtonLink>
          </CardBody>
        </Card>
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
