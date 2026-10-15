"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { reviews, reviewReports } from "@/db/schema";
import { recordAudit } from "@/lib/audit";
import { sendNotification } from "@/lib/email/adapter";
import { rateLimit } from "@/lib/rate-limit";
import { rateLimitKey } from "@/lib/request";
import {
  reviewSchema,
  reviewReportSchema,
  flattenZodError,
} from "@/lib/validation/schemas";
import { ok, fail, type ActionResult } from "@/server/action-result";

export async function submitReviewAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const parsed = reviewSchema.safeParse({
    authorName: formData.get("authorName"),
    authorEmail: formData.get("authorEmail"),
    rating: formData.get("rating"),
    category: formData.get("category"),
    body: formData.get("body"),
    consent: formData.get("consent") === "on",
  });
  if (!parsed.success) {
    return fail("Please correct the highlighted fields.", flattenZodError(parsed.error));
  }
  const data = parsed.data;

  const key = await rateLimitKey("review", data.authorEmail);
  if (!rateLimit(key, 3, 24 * 60 * 60 * 1000).allowed) {
    return fail(
      "You have submitted several reviews recently. Please try again later.",
      undefined,
      "RATE_LIMITED"
    );
  }

  // Duplicate-submission control: same email + identical body within a day.
  const recent = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(
      sql`lower(${reviews.authorEmail}) = ${data.authorEmail} and ${reviews.body} = ${data.body} and ${reviews.createdAt} > now() - interval '1 day'`
    )
    .limit(1);
  if (recent.length > 0) {
    return fail("We have already received this review. Thank you.");
  }

  let reviewId = "";
  try {
    const [row] = await db
      .insert(reviews)
      .values({
        authorName: data.authorName,
        authorEmail: data.authorEmail,
        rating: data.rating,
        category: data.category,
        body: data.body,
        status: "pending",
        verification: "unverified",
      })
      .returning({ id: reviews.id });
    reviewId = row.id;
  } catch {
    return fail("We could not submit your review. Please try again.");
  }

  await sendNotification({
    template: "review_received",
    to: data.authorEmail,
    meta: { reviewId },
    data: { authorName: data.authorName },
  });

  await recordAudit({
    action: "review.submit",
    targetType: "review",
    targetId: reviewId,
    metadata: { rating: data.rating, category: data.category },
  });

  return ok(
    "Thank you for your review. Reviews are moderated and will appear once approved."
  );
}

export async function reportReviewAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const parsed = reviewReportSchema.safeParse({
    reviewId: formData.get("reviewId"),
    reason: formData.get("reason"),
    reporterEmail: formData.get("reporterEmail") ?? "",
  });
  if (!parsed.success) {
    return fail("Please describe the issue.", flattenZodError(parsed.error));
  }
  const data = parsed.data;

  const key = await rateLimitKey("review-report", data.reviewId);
  if (!rateLimit(key, 10, 24 * 60 * 60 * 1000).allowed) {
    return fail("Too many reports submitted.", undefined, "RATE_LIMITED");
  }

  const exists = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.id, data.reviewId))
    .limit(1);
  if (exists.length === 0) return fail("Review not found.");

  await db.transaction(async (tx) => {
    await tx.insert(reviewReports).values({
      reviewId: data.reviewId,
      reason: data.reason,
      reporterEmail: data.reporterEmail || null,
    });
    await tx
      .update(reviews)
      .set({ reportedCount: sql`${reviews.reportedCount} + 1` })
      .where(eq(reviews.id, data.reviewId));
  });

  await recordAudit({
    action: "review.report",
    targetType: "review",
    targetId: data.reviewId,
  });

  return ok("Thank you. Our moderation team will review this report.");
}
