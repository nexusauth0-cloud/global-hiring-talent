import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, CardBody, statusTone } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAuthContext, findEmployerProfile } from "@/lib/auth/session";
import { getEmployerJobs } from "@/lib/queries";
import { formatDate, humanizeStatus } from "@/lib/utils";

export const metadata: Metadata = { title: "Jobs" };
export const dynamic = "force-dynamic";

export default async function EmployerJobsPage() {
  const ctx = await getAuthContext();
  if (!ctx) return null;
  const profile = await findEmployerProfile(ctx.user.id);
  if (!profile) return null;

  const jobs = await getEmployerJobs(profile.organization.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-900">Jobs</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create, publish and manage your job posts.
          </p>
        </div>
        <ButtonLink href="/employer/jobs/new">Post a job</ButtonLink>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          title="No job posts yet"
          description="Create your first job post to start receiving applications."
          action={<ButtonLink href="/employer/jobs/new">Post a job</ButtonLink>}
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Title
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Type
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Applications
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Published
                    </th>
                    <th scope="col" className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <Link
                          href={`/employer/jobs/${job.id}`}
                          className="font-semibold text-brand-900 hover:underline"
                        >
                          {job.title}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {humanizeStatus(job.employmentType)}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {job.applicationCount}
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={statusTone(job.status)}>
                          {humanizeStatus(job.status)}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(job.publishedAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/employer/jobs/${job.id}`}
                          className="font-semibold text-brand-700 hover:underline"
                        >
                          Edit
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
