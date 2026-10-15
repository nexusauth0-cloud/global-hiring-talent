import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tones = {
  info: "border-brand-200 bg-brand-50 text-brand-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  error: "border-red-200 bg-red-50 text-red-900",
} as const;

export function Alert({
  tone = "info",
  title,
  children,
  className,
  role,
}: {
  tone?: keyof typeof tones;
  title?: string;
  children: ReactNode;
  className?: string;
  role?: "status" | "alert";
}) {
  return (
    <div
      role={role ?? (tone === "error" ? "alert" : "status")}
      className={cn("rounded-lg border px-4 py-3 text-sm", tones[tone], className)}
    >
      {title && <p className="mb-0.5 font-bold">{title}</p>}
      <div className="[&_a]:underline">{children}</div>
    </div>
  );
}
