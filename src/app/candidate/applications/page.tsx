import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, CardBody, statusTone } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAuthContext, findCandidateProfile } from "@/lib/auth/session";
import { getCandidateApplications } from "@/lib/queries";
import { formatDate, humanizeStatus } from "@/lib/utils";

export const metadata: Metadata = { title: "My applications" };
export const dynamic = "force-dynamic";

export default async function CandidateApplicationsPage() {
  const ctx = await getAuthContext();
  if (!ctx) return null;
  const profile = await findCandidateProfile(ctx.user.id);
  if (!profile) return null;

  const applications = await getCandidateApplications(profile.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-900">My applications</h1>
        <p className="mt-1 text-sm text-slate-600">
          Track the status of every role you have applied for.
        </p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Browse open roles and submit your first application."
          action={<ButtonLink href="/jobs">Browse jobs</ButtonLink>}
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Role
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Location
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Applied
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-brand-900">{app.jobTitle}</p>
                        <p className="text-xs text-slate-500">{app.organizationName}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {app.location ?? app.country ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(app.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={statusTone(app.status)}>
                          {humanizeStatus(app.status)}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/candidate/applications/${app.id}`}
                          className="font-semibold text-brand-700 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
