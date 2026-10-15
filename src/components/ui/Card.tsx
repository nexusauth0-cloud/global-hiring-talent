import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li" | "section";
}) {
  return (
    <As
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-[var(--shadow-card)]",
        className
      )}
    >
      {children}
    </As>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("border-b border-slate-100 px-5 py-4", className)}>{children}</div>;
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("px-5 py-5", className)}>{children}</div>;
}

export function CardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-base font-bold text-brand-900", className)}>{children}</h3>
  );
}

const badgeTones = {
  neutral: "bg-slate-100 text-slate-700",
  brand: "bg-brand-50 text-brand-800",
  success: "bg-emerald-50 text-emerald-800",
  warning: "bg-amber-50 text-amber-800",
  danger: "bg-red-50 text-red-700",
  accent: "bg-orange-50 text-orange-800",
} as const;

export type BadgeTone = keyof typeof badgeTones;

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        badgeTones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): BadgeTone {
  switch (status) {
    case "published":
    case "approved":
    case "sent":
    case "hired":
    case "fulfilled":
    case "resolved":
      return "success";
    case "draft":
    case "pending":
    case "new":
    case "submitted":
    case "queued":
    case "sending":
    case "unverified":
      return "warning";
    case "rejected":
    case "failed":
    case "cancelled":
    case "closed":
    case "spam":
      return "danger";
    case "archived":
    case "withdrawn":
    case "skipped":
      return "neutral";
    case "under_review":
    case "shortlisted":
    case "interview":
    case "offered":
    case "in_progress":
    case "quote_sent":
      return "brand";
    default:
      return "neutral";
  }
}
