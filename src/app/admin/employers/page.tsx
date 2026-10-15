import type { Metadata } from "next";
import { Badge, Card, CardBody, statusTone } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAdminOrganizations } from "@/lib/queries";
import { formatDate, humanizeStatus } from "@/lib/utils";
import { OrganizationStatusForm } from "./OrganizationStatusForm";

export const metadata: Metadata = { title: "Employers" };
export const dynamic = "force-dynamic";

export default async function AdminEmployersPage() {
  const organizations = await getAdminOrganizations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-900">Employers</h1>
        <p className="mt-1 text-sm text-slate-600">
          Review and verify employer accounts.
        </p>
      </div>

      {organizations.length === 0 ? (
        <EmptyState title="No employer accounts yet" />
      ) : (
        <div className="space-y-4">
          {organizations.map((org) => (
            <Card key={org.id}>
              <CardBody>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-brand-900">{org.name}</h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {[org.industry, org.country].filter(Boolean).join(" · ") || "—"} ·{" "}
                      {org.jobCount} job{org.jobCount === 1 ? "" : "s"} · Registered{" "}
                      {formatDate(org.createdAt)}
                    </p>
                  </div>
                  <Badge tone={statusTone(org.status)}>
                    {humanizeStatus(org.status)}
                  </Badge>
                </div>
                <OrganizationStatusForm
                  organizationId={org.id}
                  currentStatus={org.status}
                  currentNote={org.statusNote ?? ""}
                />
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
