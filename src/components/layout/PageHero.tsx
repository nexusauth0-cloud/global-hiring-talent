import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "border-b border-slate-200 bg-gradient-to-b from-brand-50 to-white",
        className
      )}
    >
      <div className="container-page py-14 sm:py-20">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-600">
              {eyebrow}
            </p>
          )}
          <h1 className="text-4xl font-extrabold leading-tight text-brand-900 sm:text-5xl">
            {title}
          </h1>
          {intro && (
            <div className="mt-5 text-lg leading-relaxed text-slate-600">{intro}</div>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}
