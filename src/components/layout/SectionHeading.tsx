import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-brand-600">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-extrabold text-brand-900 sm:text-4xl">{title}</h2>
      {intro && (
        <p className="mt-4 text-base leading-relaxed text-slate-600">{intro}</p>
      )}
    </div>
  );
}
