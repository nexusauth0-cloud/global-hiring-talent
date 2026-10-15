import type { Metadata } from "next";
import { Badge, Card, CardBody, statusTone } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAdminInquiries } from "@/lib/queries";
import { formatDateTime, humanizeStatus } from "@/lib/utils";
import { InquiryStatusForm } from "./InquiryStatusForm";

export const metadata: Metadata = { title: "Inquiries" };
export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const inquiries = await getAdminInquiries();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-900">Contact enquiries</h1>
        <p className="mt-1 text-sm text-slate-600">
          Messages submitted through the public contact form.
        </p>
      </div>

      {inquiries.length === 0 ? (
        <EmptyState title="No enquiries yet" />
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id}>
              <CardBody>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-brand-900">{inquiry.name}</p>
                    <p className="text-xs text-slate-500">
                      {inquiry.email}
                      {inquiry.phone ? ` · ${inquiry.phone}` : ""}
                      {inquiry.company ? ` · ${inquiry.company}` : ""} ·{" "}
                      {humanizeStatus(inquiry.interest)} ·{" "}
                      {formatDateTime(inquiry.createdAt)}
                    </p>
                  </div>
                  <Badge tone={statusTone(inquiry.status)}>
                    {humanizeStatus(inquiry.status)}
                  </Badge>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm text-slate-700">
                  {inquiry.message}
                </p>
                <div className="mt-4 flex flex-wrap items-end gap-4">
                  <InquiryStatusForm
                    inquiryId={inquiry.id}
                    currentStatus={inquiry.status}
                  />
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="text-sm font-semibold text-brand-700 hover:underline"
                  >
                    Reply by email
                  </a>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
