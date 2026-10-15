import { Header, type HeaderUser } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getAuthContext, roleDashboard } from "@/lib/auth/session";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAuthContext();
  const user: HeaderUser = ctx
    ? {
        email: ctx.user.email,
        role: ctx.user.role,
        dashboardHref: roleDashboard(ctx.user.role),
      }
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
