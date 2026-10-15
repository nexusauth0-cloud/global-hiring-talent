import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getAuthContext, roleDashboard } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/rbac";

const navItems = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/jobs", label: "Jobs" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/employers", label: "Employers" },
  { href: "/admin/candidates", label: "Candidates" },
  { href: "/admin/hiring-requests", label: "Hiring requests" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/audit", label: "Audit log" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login?next=/admin");
  if (!["admin", "recruiter"].includes(ctx.user.role)) {
    redirect(roleDashboard(ctx.user.role));
  }

  return (
    <DashboardShell
      navItems={navItems}
      roleLabel={ctx.user.role === "admin" ? "Administrator" : "Recruiter"}
      email={ctx.user.email}
    >
      {children}
    </DashboardShell>
  );
}
