import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  Inbox,
  Star,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { getAdminMetrics } from "@/lib/queries";

export const metadata: Metadata = { title: "Admin dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const metrics = await getAdminMetrics();

  const cards = [
    { label: "Users", value: metrics.users, href: "/admin/users" },
    { label: "Candidates", value: metrics.candidates, href: "/admin/candidates" },
    { label: "Pending organisations", value: metrics.organizationsPending, href: "/admin/employers" },
    { label: "Published jobs", value: metrics.jobsPublished, href: "/admin/jobs" },
    { label: "Draft jobs", value: metrics.jobsDraft, href: "/admin/jobs" },
    { label: "Applications", value: metrics.applications, href: "/admin/applications" },
    { label: "Reviews pending", value: metrics.reviewsPending, href: "/admin/reviews" },
    { label: "Articles", value: metrics.articles, href: "/admin/articles" },
    { label: "New inquiries", value: metrics.inquiriesNew, href: "/admin/inquiries" },
    { label: "Hiring requests", value: metrics.hiringRequests, href: "/admin/hiring-requests" },
    { label: "Failed emails", value: metrics.notificationsFailed, href: "/admin/notifications" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-900">Administration</h1>
        <p className="mt-1 text-sm text-slate-600">
          Platform overview and moderation queue.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.organizationsPending > 0 && (
          <Link
            href="/admin/employers"
            className="rounded-xl border border-amber-200 bg-amber-50 p-5 hover:bg-amber-100"
          >
            <p className="text-sm font-semibold text-amber-900">
              {metrics.organizationsPending} organisation
              {metrics.organizationsPending === 1 ? "" : "s"} awaiting review
            </p>
            <p className="mt-1 text-xs text-amber-800">Review employer accounts →</p>
          </Link>
        )}
        {metrics.reviewsPending > 0 && (
          <Link
            href="/admin/reviews"
            className="rounded-xl border border-amber-200 bg-amber-50 p-5 hover:bg-amber-100"
          >
            <p className="text-sm font-semibold text-amber-900">
              {metrics.reviewsPending} review
              {metrics.reviewsPending === 1 ? "" : "s"} awaiting moderation
            </p>
            <p className="mt-1 text-xs text-amber-800">Moderate reviews →</p>
          </Link>
        )}
        {metrics.inquiriesNew > 0 && (
          <Link
            href="/admin/inquiries"
            className="rounded-xl border border-amber-200 bg-amber-50 p-5 hover:bg-amber-100"
          >
            <p className="text-sm font-semibold text-amber-900">
              {metrics.inquiriesNew} new enquir
              {metrics.inquiriesNew === 1 ? "y" : "ies"}
            </p>
            <p className="mt-1 text-xs text-amber-800">View enquiries →</p>
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((metric) => (
          <Link
            key={metric.href + metric.label}
            href={metric.href}
            className="rounded-xl border border-slate-200 bg-white p-5 hover:bg-brand-50"
          >
            <p className="text-2xl font-extrabold text-brand-900">{metric.value}</p>
            <p className="mt-1 text-sm text-slate-600">{metric.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}