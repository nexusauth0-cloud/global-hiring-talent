import type { Metadata } from "next";
import { Badge, Card, CardBody, statusTone } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAdminJobs } from "@/lib/queries";
import { formatDate, humanizeStatus } from "@/lib/utils";

export const metadata: Metadata = { title: "Jobs" };
export const dynamic = "force-dynamic";

export default async function AdminJobsPage() {
  const jobs = await getAdminJobs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-900">All jobs</h1>
        <p className="mt-1 text-sm text-slate-600">
          Every job post across all organisations.
        </p>
      </div>

      {jobs.length === 0 ? (
        <EmptyState title="No job posts yet" />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-5 py-3 font-semibold">Title</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Organisation</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Type</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Created</th>
                    <th scope="col" className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4 font-semibold text-brand-900">
                        {job.title}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{job.organizationName}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {humanizeStatus(job.employmentType)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={statusTone(job.status)}>
                          {humanizeStatus(job.status)}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(job.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <a
                          href={`/jobs/${job.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-brand-700 hover:underline"
                        >
                          View
                        </a>
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
