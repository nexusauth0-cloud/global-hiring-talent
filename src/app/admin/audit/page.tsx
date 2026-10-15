import type { Metadata } from "next";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAdminAuditLogs } from "@/lib/queries";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Audit log" };
export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const logs = await getAdminAuditLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-900">Audit log</h1>
        <p className="mt-1 text-sm text-slate-600">
          Immutable record of sensitive actions. Sensitive fields are redacted.
        </p>
      </div>

      {logs.length === 0 ? (
        <EmptyState title="No audit entries yet" />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-5 py-3 font-semibold">Action</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Actor</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Target</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Metadata</th>
                    <th scope="col" className="px-5 py-3 font-semibold">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="align-top hover:bg-slate-50/70">
                      <td className="px-5 py-4 font-semibold text-brand-900">
                        {log.action}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {log.actorUserId ? log.actorUserId.slice(0, 8) : "system"}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {log.targetType ?? "—"}
                        {log.targetId ? ` · ${log.targetId.slice(0, 8)}` : ""}
                      </td>
                      <td className="px-5 py-4">
                        <code className="break-all text-xs text-slate-500">
                          {JSON.stringify(log.metadata)}
                        </code>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatDateTime(log.createdAt)}
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
