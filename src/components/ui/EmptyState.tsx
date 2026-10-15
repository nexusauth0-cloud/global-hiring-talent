import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-12 text-center",
        className
      )}
    >
      {icon && <div className="mb-3 text-brand-400">{icon}</div>}
      <h3 className="text-base font-bold text-brand-900">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-md text-sm text-slate-600">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
