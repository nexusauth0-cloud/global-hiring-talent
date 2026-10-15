import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label="Global Hiring Talent mark"
      className={cn("h-9 w-9", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ght-mark-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1f5393" />
          <stop offset="100%" stopColor="#0b2b4a" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#ght-mark-grad)" />
      <circle
        cx="20"
        cy="20"
        r="12.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.6"
        opacity="0.55"
      />
      <path
        d="M20 8.5c-3.6 2.6-5.6 6.8-5.6 11.5S16.4 28.9 20 31.5c3.6-2.6 5.6-6.8 5.6-11.5S23.6 11.1 20 8.5Z"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.6"
        opacity="0.55"
      />
      <path d="M8.5 20h23" stroke="#ffffff" strokeWidth="1.6" opacity="0.55" />
      <path
        d="M15.3 22.4l3.2 3.1 6.4-7.1"
        fill="none"
        stroke="#f4a742"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label="Global Hiring Talent home"
    >
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-[1.05rem] font-extrabold tracking-tight",
            variant === "light" ? "text-white" : "text-brand-900"
          )}
        >
          Global Hiring Talent
        </span>
        <span
          className={cn(
            "mt-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em]",
            variant === "light" ? "text-brand-100/80" : "text-slate-soft"
          )}
        >
          Workforce Solutions
        </span>
      </span>
    </span>
  );
}
