import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { StarRating } from "@/components/reviews/StarRating";
import { ReviewForm } from "@/components/forms/ReviewForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardBody } from "@/components/ui/Card";
import { getApprovedReviews, getReviewAggregate } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "Genuine, moderated reviews from candidates and employers. Submit your own experience.",
};

export default async function ReviewsPage() {
  const [reviews, aggregate] = await Promise.all([
    getApprovedReviews(24),
    getReviewAggregate(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Reviews"
        title="Genuine reviews from real people"
        intro="We publish only genuine reviews submitted by candidates and employers, after moderation. Reviews are never purchased or fabricated."
      />

      <section className="container-page py-14">
        {aggregate.total > 0 ? (
          <div className="mb-10 flex flex-col items-start gap-2 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:gap-6">
            <p className="text-4xl font-extrabold text-brand-900">
              {aggregate.average.toFixed(1)}
            </p>
            <div>
              <StarRating value={aggregate.average} size={24} />
              <p className="mt-1 text-sm text-slate-600">
                Based on {aggregate.total} published review
                {aggregate.total === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-12 lg:grid-cols-[1fr_26rem]">
          <div>
            <h2 className="text-2xl font-bold text-brand-900">Published reviews</h2>
            {reviews.length > 0 ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <div className="mt-6">
                <EmptyState
                  title="No published reviews yet"
                  description="We only publish genuine reviews after moderation, so this space stays empty until real reviews are approved. Be the first to share your experience."
                />
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardBody>
                <h2 className="text-lg font-bold text-brand-900">Submit a review</h2>
                <p className="mt-1.5 text-sm text-slate-600">
                  Share your genuine experience. Reviews are moderated before
                  publication and your email is never published.
                </p>
                <div className="mt-5">
                  <ReviewForm />
                </div>
              </CardBody>
            </Card>
          </aside>
        </div>
      </section>
    </>
  );
}
