import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { company } from "@/lib/config";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Link href="/" aria-label="Global Hiring Talent home" className="self-start">
          <Logo />
        </Link>
        <main id="main-content" className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </main>
        <p className="text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {company.name}
        </p>
      </div>

      <aside className="relative hidden overflow-hidden bg-brand-950 lg:block">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #2f6db4 0, transparent 40%), radial-gradient(circle at 80% 70%, #f4a742 0, transparent 35%)",
          }}
          aria-hidden="true"
        />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-200">
            Workforce solutions
          </p>
          <div>
            <h2 className="max-w-md text-3xl font-extrabold leading-tight">
              One account for hiring, applying and managing your talent workflows
            </h2>
            <p className="mt-4 max-w-md text-brand-100/80">
              {company.name} connects employers with qualified professionals and
              gives candidates a secure portal to manage applications and
              documents.
            </p>
          </div>
          <p className="text-xs text-brand-100/60">
            Your data is handled securely. See our Privacy Policy.
          </p>
        </div>
      </aside>
    </div>
  );
}
