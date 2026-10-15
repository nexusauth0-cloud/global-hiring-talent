import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getAuthContext, roleDashboard } from "@/lib/auth/session";

const navItems = [
  { href: "/employer", label: "Overview", exact: true },
  { href: "/employer/jobs", label: "Jobs" },
  { href: "/employer/applications", label: "Applications" },
  { href: "/employer/requests", label: "Hiring requests" },
  { href: "/employer/profile", label: "Company profile" },
];

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login?next=/employer");
  if (ctx.user.role !== "employer") redirect(roleDashboard(ctx.user.role));

  return (
    <DashboardShell
      navItems={navItems}
      roleLabel="Employer"
      email={ctx.user.email}
    >
      {children}
    </DashboardShell>
  );
}
