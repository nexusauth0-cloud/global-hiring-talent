import type { Metadata } from "next";
import { Badge } from "@/components/ui/Card";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAdminCandidates } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Candidates" };
export const dynamic = "force-dynamic";

export default async function AdminCandidatesPage() {
  const candidates = await getAdminCandidates();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-900">Candidates</h1>
        <p className="mt-1 text-sm text-slate-600">
          Registered candidate profiles.
        </p>
      </div>

      {candidates.length === 0 ? (
        <EmptyState title="No candidates yet" />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-5 py-3 font-semibold">Name</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Headline</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Country</th>
                    <th scope="col" className="px-5 py-3 font-semibold">CV</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Applications</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidates.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4 font-semibold text-brand-900">
                        {c.firstName} {c.lastName}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{c.headline ?? "—"}</td>
                      <td className="px-5 py-4 text-slate-600">{c.country ?? "—"}</td>
                      <td className="px-5 py-4">
                        <Badge tone={c.hasResume ? "success" : "neutral"}>
                          {c.hasResume ? "Yes" : "No"}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{c.applicationCount}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(c.createdAt)}
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
