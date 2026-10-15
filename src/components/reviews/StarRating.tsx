import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  size = 18,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const rounded = Math.round(value);
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          aria-hidden="true"
          className={
            i <= rounded ? "fill-accent-500 text-accent-500" : "fill-slate-200 text-slate-200"
          }
        />
      ))}
    </span>
  );
}

export function StarInput({
  name,
  defaultValue = 5,
}: {
  name: string;
  defaultValue?: number;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-semibold text-brand-900">
        Rating <span className="text-danger">*</span>
      </legend>
      <div className="inline-flex flex-row-reverse items-center gap-0.5">
        {[5, 4, 3, 2, 1].map((v) => (
          <label
            key={v}
            className="cursor-pointer text-slate-300 transition-colors has-[:checked]:text-accent-500 hover:text-accent-400"
            title={`${v} star${v > 1 ? "s" : ""}`}
          >
            <input
              type="radio"
              name={name}
              value={v}
              defaultChecked={v === defaultValue}
              className="peer sr-only"
            />
            <Star width={28} height={28} aria-hidden="true" className="fill-current" />
            <span className="sr-only">{v} stars</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
