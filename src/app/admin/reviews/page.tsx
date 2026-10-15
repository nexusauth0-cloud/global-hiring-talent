import type { Metadata } from "next";
import { Badge, Card, CardBody, statusTone } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StarRating } from "@/components/reviews/StarRating";
import { getAdminReviews } from "@/lib/queries";
import { formatDate, humanizeStatus } from "@/lib/utils";
import { ReviewModerationForm } from "./ReviewModerationForm";

export const metadata: Metadata = { title: "Reviews" };
export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-900">Reviews</h1>
        <p className="mt-1 text-sm text-slate-600">
          Moderate reviews before they appear publicly.
        </p>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          title="No reviews submitted"
          description="Reviews submitted on the public site will appear here for moderation."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardBody>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-brand-900">{review.authorName}</p>
                    <p className="text-xs text-slate-500">
                      {review.authorEmail} · {humanizeStatus(review.category)} ·{" "}
                      {formatDate(review.createdAt)}
                      {review.reportedCount > 0 &&
                        ` · ${review.reportedCount} report${
                          review.reportedCount === 1 ? "" : "s"
                        }`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StarRating value={review.rating} size={16} />
                    <Badge tone={statusTone(review.status)}>
                      {humanizeStatus(review.status)}
                    </Badge>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm text-slate-700">
                  {review.body}
                </p>
                <div className="mt-4">
                  <ReviewModerationForm
                    reviewId={review.id}
                    currentStatus={review.status}
                  />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
