import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, CardBody, statusTone } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAuthContext, findEmployerProfile } from "@/lib/auth/session";
import { getEmployerApplications } from "@/lib/queries";
import { formatDate, humanizeStatus } from "@/lib/utils";

export const metadata: Metadata = { title: "Applications" };
export const dynamic = "force-dynamic";

export default async function EmployerApplicationsPage() {
  const ctx = await getAuthContext();
  if (!ctx) return null;
  const profile = await findEmployerProfile(ctx.user.id);
  if (!profile) return null;

  const applications = await getEmployerApplications(profile.organization.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-900">Applications</h1>
        <p className="mt-1 text-sm text-slate-600">
          Review candidates who applied to your job posts.
        </p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Applications to your published jobs will appear here."
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Candidate
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Job
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
                        <p className="font-semibold text-brand-900">
                          {app.candidateFirst} {app.candidateLast}
                        </p>
                        <p className="text-xs text-slate-500">
                          {app.headline ?? app.contactEmail}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{app.jobTitle}</td>
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
                          href={`/employer/applications/${app.id}`}
                          className="font-semibold text-brand-700 hover:underline"
                        >
                          Review
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
