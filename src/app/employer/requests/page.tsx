import type { Metadata } from "next";
import { Badge, Card, CardBody, statusTone } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAuthContext, findEmployerProfile } from "@/lib/auth/session";
import { getEmployerHiringRequests } from "@/lib/queries";
import { formatDate, humanizeStatus } from "@/lib/utils";

export const metadata: Metadata = { title: "Hiring requests" };
export const dynamic = "force-dynamic";

export default async function EmployerRequestsPage() {
  const ctx = await getAuthContext();
  if (!ctx) return null;
  const profile = await findEmployerProfile(ctx.user.id);
  if (!profile) return null;

  const requests = await getEmployerHiringRequests(profile.organization.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-900">Hiring requests</h1>
          <p className="mt-1 text-sm text-slate-600">
            Ask our recruitment team to source talent for a role.
          </p>
        </div>
        <ButtonLink href="/employer/requests/new">New request</ButtonLink>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          title="No hiring requests yet"
          description="Submit a hiring request and a consultant will follow up."
          action={<ButtonLink href="/employer/requests/new">New request</ButtonLink>}
        />
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardBody>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-brand-900">{request.title}</h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {request.rolesNeeded} role
                      {request.rolesNeeded === 1 ? "" : "s"} · Submitted{" "}
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
                {request.statusNote && (
                  <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    Note from the team: {request.statusNote}
                  </p>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
