import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getAuthContext, roleDashboard } from "@/lib/auth/session";

const navItems = [
  { href: "/candidate", label: "Overview", exact: true },
  { href: "/candidate/applications", label: "My applications" },
  { href: "/candidate/profile", label: "Profile & CV" },
];

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login?next=/candidate");
  if (ctx.user.role !== "candidate") redirect(roleDashboard(ctx.user.role));

  return (
    <DashboardShell
      navItems={navItems}
      roleLabel="Candidate"
      email={ctx.user.email}
    >
      {children}
    </DashboardShell>
  );
}
