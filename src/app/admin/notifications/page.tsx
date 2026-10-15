import type { Metadata } from "next";
import { Badge, Card, CardBody, statusTone } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAdminNotifications } from "@/lib/queries";
import { formatDateTime, humanizeStatus } from "@/lib/utils";

export const metadata: Metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const notifications = await getAdminNotifications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-900">Notifications</h1>
        <p className="mt-1 text-sm text-slate-600">
          Honest delivery records for every email the platform attempts. Rows marked
          &ldquo;Skipped&rdquo; mean no email provider is configured.
        </p>
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="No notifications recorded yet" />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-5 py-3 font-semibold">Recipient</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Template</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Provider</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4 text-slate-700">{n.toEmail}</td>
                      <td className="px-5 py-4 text-slate-600">{n.template}</td>
                      <td className="px-5 py-4">
                        <Badge tone={statusTone(n.status)}>
                          {humanizeStatus(n.status)}
                        </Badge>
                        {n.error && (
                          <p className="mt-1 max-w-xs text-xs text-slate-500">
                            {n.error}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{n.provider ?? "—"}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatDateTime(n.createdAt)}
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
