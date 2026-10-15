import type { Metadata } from "next";
import { Badge, Card, CardBody, statusTone } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAdminHiringRequests } from "@/lib/queries";
import { formatDate, humanizeStatus } from "@/lib/utils";
import { RequestStatusForm } from "./RequestStatusForm";

export const metadata: Metadata = { title: "Hiring requests" };
export const dynamic = "force-dynamic";

export default async function AdminHiringRequestsPage() {
  const requests = await getAdminHiringRequests();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-900">Hiring requests</h1>
        <p className="mt-1 text-sm text-slate-600">
          Requirements submitted by employers.
        </p>
      </div>

      {requests.length === 0 ? (
        <EmptyState title="No hiring requests yet" />
      ) : (
        <div className="space-y-4">
          {requests.map(({ request, organizationName }) => (
            <Card key={request.id}>
              <CardBody>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-brand-900">{request.title}</h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {organizationName} · {request.rolesNeeded} role
                      {request.rolesNeeded === 1 ? "" : "s"} ·{" "}
                      {humanizeStatus(request.employmentType)} · Submitted{" "}
                      {formatDate(request.createdAt)}
                    </p>
                  </div>
                  <Badge tone={statusTone(request.status)}>
                    {humanizeStatus(request.status)}
                  </Badge>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm text-slate-700">
                  {request.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                  {(request.location || request.country) && (
                    <span>
                      Location:{" "}
                      {[request.location, request.country].filter(Boolean).join(", ")}
                    </span>
                  )}
                  {request.urgency && <span>Urgency: {request.urgency}</span>}
                  {(request.budgetMin != null || request.budgetMax != null) && (
                    <span>
                      Budget: {request.currency}{" "}
                      {request.budgetMin ?? "?"}–{request.budgetMax ?? "?"}
                    </span>
                  )}
                </div>
                <RequestStatusForm
                  requestId={request.id}
                  currentStatus={request.status}
                  currentNote={request.statusNote ?? ""}
                />
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
