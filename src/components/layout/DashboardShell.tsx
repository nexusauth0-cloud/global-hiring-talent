import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { DashboardNav, type NavItem } from "@/components/layout/DashboardNav";
import { logoutAction } from "@/server/actions/auth";
import { Badge } from "@/components/ui/Card";

export function DashboardShell({
  navItems,
  roleLabel,
  email,
  children,
}: {
  navItems: NavItem[];
  roleLabel: string;
  email: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-page flex items-center justify-between gap-4 py-3.5">
          <Link href="/" aria-label="Global Hiring Talent home">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-brand-900">{email}</p>
              <Badge tone="brand">{roleLabel}</Badge>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-brand-800 hover:bg-brand-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="container-page py-8">
        <div className="lg:grid lg:grid-cols-[18rem_1fr] lg:gap-8 xl:grid-cols-[20rem_1fr] xl:gap-10">
          <aside className="mb-6 lg:mb-0">
            <div className="rounded-xl border border-slate-200 bg-white p-3 lg:sticky lg:top-6">
              <DashboardNav items={navItems} />
              <div className="mt-3 border-t border-slate-100 pt-3">
                <Link
                  href="/"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
                >
                  ← Back to website
                </Link>
              </div>
            </div>
          </aside>
          <main id="main-content">{children}</main>
        </div>
      </div>
    </div>
  );
}
