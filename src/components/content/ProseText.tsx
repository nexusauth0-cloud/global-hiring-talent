import { cn } from "@/lib/utils";

/**
 * Renders plain-text content safely. React escapes all text, so stored content
 * cannot inject HTML. Paragraph breaks are preserved.
 */
export function ProseText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className={cn("space-y-4", className)}>
      {paragraphs.map((paragraph, i) => {
        const lines = paragraph.split("\n");
        const isList = lines.every((l) => /^\s*[-*•]\s+/.test(l) && l.trim());
        if (isList && lines.length > 0) {
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-5 text-slate-700">
              {lines.map((line, j) => (
                <li key={j}>{line.replace(/^\s*[-*•]\s+/, "")}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="leading-relaxed text-slate-700 whitespace-pre-line">
            {paragraph}
          </p>
        );
      })}
    </div>
  );
}
