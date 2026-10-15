import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
        404
      </p>
      <h1 className="mt-3 text-3xl font-extrabold text-brand-900 sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-slate-600">
        The page you are looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonClasses("primary", "md")}>
          Go to homepage
        </Link>
        <Link href="/jobs" className={buttonClasses("outline", "md")}>
          Browse jobs
        </Link>
      </div>
    </main>
  );
}
