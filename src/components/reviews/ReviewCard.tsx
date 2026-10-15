import { Badge, Card, CardBody } from "@/components/ui/Card";
import { StarRating } from "@/components/reviews/StarRating";
import { initials, formatDate } from "@/lib/utils";

export type ReviewData = {
  id: string;
  authorName: string;
  rating: number;
  category: string;
  body: string;
  verification: string;
  createdAt: Date | string;
};

const categoryLabel: Record<string, string> = {
  candidate: "Candidate experience",
  employer: "Employer experience",
  service: "Service quality",
};

export function ReviewCard({ review }: { review: ReviewData }) {
  return (
    <Card as="article" className="flex h-full flex-col">
      <CardBody className="flex h-full flex-col">
        <header className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800"
          >
            {initials(review.authorName)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-bold text-brand-900">{review.authorName}</p>
            <p className="text-xs text-slate-500">
              {categoryLabel[review.category] ?? review.category} ·{" "}
              {formatDate(review.createdAt)}
            </p>
          </div>
        </header>

        <div className="mt-3 flex items-center gap-2">
          <StarRating value={review.rating} />
          {review.verification !== "unverified" && (
            <Badge tone="success">
              {review.verification === "verified_client"
                ? "Verified client"
                : "Verified candidate"}
            </Badge>
          )}
        </div>

        <blockquote className="mt-3 text-sm leading-relaxed text-slate-700">
          &ldquo;{review.body}&rdquo;
        </blockquote>
      </CardBody>
    </Card>
  );
}
