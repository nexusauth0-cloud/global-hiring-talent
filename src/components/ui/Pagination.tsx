import Link from "next/link";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  buildHref,
  className,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center justify-center gap-1.5", className)}
    >
      <PaginationLink
        href={buildHref(page - 1)}
        disabled={page <= 1}
        label="Previous"
      >
        ‹ Prev
      </PaginationLink>
      {start > 1 && (
        <>
          <PaginationLink href={buildHref(1)}>1</PaginationLink>
          {start > 2 && <span className="px-1 text-slate-400">…</span>}
        </>
      )}
      {pages.map((p) => (
        <PaginationLink key={p} href={buildHref(p)} current={p === page}>
          {p}
        </PaginationLink>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-slate-400">…</span>}
          <PaginationLink href={buildHref(totalPages)}>{totalPages}</PaginationLink>
        </>
      )}
      <PaginationLink
        href={buildHref(page + 1)}
        disabled={page >= totalPages}
        label="Next"
      >
        Next ›
      </PaginationLink>
    </nav>
  );
}

function PaginationLink({
  href,
  children,
  current,
  disabled,
  label,
}: {
  href: string;
  children: React.ReactNode;
  current?: boolean;
  disabled?: boolean;
  label?: string;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        aria-label={label}
        className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-300"
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={current ? "page" : undefined}
      className={cn(
        "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
        current
          ? "border-brand-700 bg-brand-700 text-white"
          : "border-slate-200 bg-white text-brand-800 hover:bg-brand-50"
      )}
    >
      {children}
    </Link>
  );
}
