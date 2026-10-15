"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  articles,
  contactInquiries,
  hiringRequests,
  organizations,
  reviews,
  users,
} from "@/db/schema";
import { requireRole } from "@/lib/auth/rbac";
import { recordAudit } from "@/lib/audit";
import { uniqueSlug } from "@/lib/utils";
import {
  articleSchema,
  flattenZodError,
} from "@/lib/validation/schemas";
import { ok, fail, type ActionResult } from "@/server/action-result";

type StaffContext = { user: { id: string; role: string } };

async function requireStaff(): Promise<StaffContext> {
  return (await requireRole("admin", "recruiter")) as unknown as StaffContext;
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

async function articleSlugExists(slug: string): Promise<boolean> {
  const rows = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.slug, slug))
    .limit(1);
  return rows.length > 0;
}

export async function setOrganizationStatusAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  let c;
  try {
    c = await requireStaff();
  } catch {
    return fail("You do not have permission to do this.", undefined, "FORBIDDEN");
  }
  const organizationId = text(formData, "organizationId");
  const status = text(formData, "status");
  const note = text(formData, "note");
  if (!["pending", "approved", "rejected"].includes(status)) {
    return fail("Invalid organisation status.");
  }

  try {
    await db
      .update(organizations)
      .set({
        status: status as "pending" | "approved" | "rejected",
        statusNote: note || null,
        statusChangedBy: c.user.id,
        statusChangedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, organizationId));
  } catch {
    return fail("We could not update the organisation.");
  }

  await recordAudit({
    actorUserId: c.user.id,
    action: "organization.status_update",
    targetType: "organization",
    targetId: organizationId,
    metadata: { status },
  });
  revalidatePath("/admin/employers");
  revalidatePath("/admin");
  return ok("Organisation status updated.");
}

export async function setHiringRequestStatusAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  let c;
  try {
    c = await requireStaff();
  } catch {
    return fail("You do not have permission to do this.", undefined, "FORBIDDEN");
  }
  const requestId = text(formData, "requestId");
  const status = text(formData, "status");
  const note = text(formData, "note");
  if (!["new", "in_progress", "quote_sent", "fulfilled", "cancelled"].includes(status)) {
    return fail("Invalid request status.");
  }

  try {
    await db
      .update(hiringRequests)
      .set({
        status: status as typeof hiringRequests.$inferSelect.status,
        statusNote: note || null,
        statusChangedBy: c.user.id,
        statusChangedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(hiringRequests.id, requestId));
  } catch {
    return fail("We could not update the request.");
  }

  await recordAudit({
    actorUserId: c.user.id,
    action: "hiring_request.status_update",
    targetType: "hiring_request",
    targetId: requestId,
    metadata: { status },
  });
  revalidatePath("/admin/hiring-requests");
  revalidatePath("/admin");
  return ok("Hiring request updated.");
}

export async function moderateReviewAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  let c;
  try {
    c = await requireStaff();
  } catch {
    return fail("You do not have permission to do this.", undefined, "FORBIDDEN");
  }
  const reviewId = text(formData, "reviewId");
  const status = text(formData, "status");
  const note = text(formData, "note");
  if (!["pending", "approved", "rejected"].includes(status)) {
    return fail("Invalid review status.");
  }

  try {
    await db
      .update(reviews)
      .set({
        status: status as "pending" | "approved" | "rejected",
        statusNote: note || null,
        moderatedBy: c.user.id,
        moderatedAt: new Date(),
      })
      .where(eq(reviews.id, reviewId));
  } catch {
    return fail("We could not update the review.");
  }

  await recordAudit({
    actorUserId: c.user.id,
    action: "review.moderate",
    targetType: "review",
    targetId: reviewId,
    metadata: { status },
  });
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  revalidatePath("/");
  return ok(status === "approved" ? "Review published." : "Review updated.");
}

export async function setInquiryStatusAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  let c;
  try {
    c = await requireStaff();
  } catch {
    return fail("You do not have permission to do this.", undefined, "FORBIDDEN");
  }
  const inquiryId = text(formData, "inquiryId");
  const status = text(formData, "status");
  if (!["new", "in_progress", "resolved", "spam"].includes(status)) {
    return fail("Invalid inquiry status.");
  }

  try {
    await db
      .update(contactInquiries)
      .set({
        status: status as typeof contactInquiries.$inferSelect.status,
        handledBy: c.user.id,
        updatedAt: new Date(),
      })
      .where(eq(contactInquiries.id, inquiryId));
  } catch {
    return fail("We could not update the inquiry.");
  }

  await recordAudit({
    actorUserId: c.user.id,
    action: "contact_inquiry.status_update",
    targetType: "contact_inquiry",
    targetId: inquiryId,
    metadata: { status },
  });
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
  return ok("Inquiry updated.");
}

export async function saveArticleAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  let c;
  try {
    c = await requireStaff();
  } catch {
    return fail("You do not have permission to do this.", undefined, "FORBIDDEN");
  }
  const articleId = text(formData, "articleId");
  const parsed = articleSchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt") ?? "",
    body: formData.get("body"),
    category: formData.get("category") ?? "",
    coverImage: formData.get("coverImage") ?? "",
    authorName: formData.get("authorName") ?? "",
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return fail("Please correct the highlighted fields.", flattenZodError(parsed.error));
  }
  const data = parsed.data;
  const publishedAt =
    data.status === "published" ? new Date() : null;

  try {
    if (articleId) {
      await db
        .update(articles)
        .set({
          title: data.title,
          excerpt: data.excerpt || null,
          body: data.body,
          category: data.category || null,
          coverImage: data.coverImage || null,
          authorName: data.authorName || null,
          status: data.status,
          publishedAt,
          updatedAt: new Date(),
        })
        .where(eq(articles.id, articleId));
    } else {
      const slug = await uniqueSlug(data.title, articleSlugExists);
      await db.insert(articles).values({
        slug,
        title: data.title,
        excerpt: data.excerpt || null,
        body: data.body,
        category: data.category || null,
        coverImage: data.coverImage || null,
        authorName: data.authorName || null,
        status: data.status,
        publishedAt,
        createdBy: c.user.id,
      });
    }
  } catch {
    return fail("We could not save the article.");
  }

  await recordAudit({
    actorUserId: c.user.id,
    action: articleId ? "article.update" : "article.create",
    targetType: "article",
    targetId: articleId || undefined,
    metadata: { status: data.status },
  });
  revalidatePath("/admin/articles");
  revalidatePath("/insights");
  return ok("Article saved.");
}

export async function setUserActiveAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  let c;
  try {
    c = await requireRole("admin");
  } catch {
    return fail("Only administrators can manage users.", undefined, "FORBIDDEN");
  }
  const userId = text(formData, "userId");
  const active = text(formData, "isActive") === "true";
  if (userId === c.user.id) {
    return fail("You cannot deactivate your own account.");
  }

  try {
    await db
      .update(users)
      .set({ isActive: active, updatedAt: new Date() })
      .where(eq(users.id, userId));
  } catch {
    return fail("We could not update the user.");
  }

  await recordAudit({
    actorUserId: c.user.id,
    action: "user.set_active",
    targetType: "user",
    targetId: userId,
    metadata: { isActive: active },
  });
  revalidatePath("/admin/users");
  return ok(active ? "User activated." : "User deactivated.");
}

export async function setUserRoleAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  let c;
  try {
    c = await requireRole("admin");
  } catch {
    return fail("Only administrators can manage roles.", undefined, "FORBIDDEN");
  }
  const userId = text(formData, "userId");
  const role = text(formData, "role");
  if (!["candidate", "employer", "recruiter", "admin"].includes(role)) {
    return fail("Invalid role.");
  }
  if (userId === c.user.id) {
    return fail("You cannot change your own role.");
  }

  try {
    await db
      .update(users)
      .set({ role: role as typeof users.$inferSelect.role, updatedAt: new Date() })
      .where(eq(users.id, userId));
  } catch {
    return fail("We could not update the user role.");
  }

  await recordAudit({
    actorUserId: c.user.id,
    action: "user.set_role",
    targetType: "user",
    targetId: userId,
    metadata: { role },
  });
  revalidatePath("/admin/users");
  return ok("User role updated.");
}
