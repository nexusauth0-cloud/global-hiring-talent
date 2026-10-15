import type { Metadata } from "next";
import { Badge, Card, CardBody, CardHeader, CardTitle, statusTone } from "@/components/ui/Card";
import { getAuthContext, findEmployerProfile } from "@/lib/auth/session";
import { humanizeStatus } from "@/lib/utils";
import { OrganizationProfileForm } from "./OrganizationProfileForm";

export const metadata: Metadata = { title: "Company profile" };
export const dynamic = "force-dynamic";

export default async function EmployerProfilePage() {
  const ctx = await getAuthContext();
  if (!ctx) return null;
  const profile = await findEmployerProfile(ctx.user.id);
  if (!profile) return null;
  const { organization } = profile;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-900">Company profile</h1>
          <p className="mt-1 text-sm text-slate-600">
            This information appears on your job posts.
          </p>
        </div>
        <Badge tone={statusTone(organization.status)}>
          {humanizeStatus(organization.status)}
        </Badge>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <OrganizationProfileForm
          defaults={{
            name: organization.name,
            website: organization.website ?? "",
            industry: organization.industry ?? "",
            companySize: organization.companySize ?? "",
            description: organization.description ?? "",
            country: organization.country ?? "",
            city: organization.city ?? "",
            contactEmail: organization.contactEmail ?? "",
            contactPhone: organization.contactPhone ?? "",
          }}
        />
      </div>
    </div>
  );
}
