"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  applications,
  applicationStatusHistory,
  candidates,
  hiringRequests,
  jobs,
  organizations,
} from "@/db/schema";
import { requireRole } from "@/lib/auth/rbac";
import {
  AuthError,
  findEmployerProfile,
  type SessionUser,
} from "@/lib/auth/session";
import { recordAudit } from "@/lib/audit";
import { sendNotification } from "@/lib/email/adapter";
import { rateLimit } from "@/lib/rate-limit";
import { rateLimitKey } from "@/lib/request";
import {
  applicationStatusSchema,
  flattenZodError,
  hiringRequestSchema,
  jobSchema,
  organizationProfileSchema,
  splitList,
} from "@/lib/validation/schemas";
import { humanizeStatus, uniqueSlug } from "@/lib/utils";
import { ok, fail, type ActionResult } from "@/server/action-result";

async function requireEmployer() {
  const ctx = await requireRole("employer");
  const profile = await findEmployerProfile(ctx.user.id);
  if (!profile) throw new AuthError("FORBIDDEN", "No organization linked to account.");
  return { ctx, employer: profile.employer, org: profile.organization };
}

function slugExists(model: "jobs" | "organizations") {
  return async (slug: string): Promise<boolean> => {
    if (model === "jobs") {
      const rows = await db
        .select({ id: jobs.id })
        .from(jobs)
        .where(eq(jobs.slug, slug))
        .limit(1);
      return rows.length > 0;
    }
    const rows = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);
    return rows.length > 0;
  };
}

export async function updateOrganizationProfileAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  let c;
  try {
    c = await requireEmployer();
  } catch {
    return fail("You must be signed in as an employer.", undefined, "FORBIDDEN");
  }

  const parsed = organizationProfileSchema.safeParse({
    name: formData.get("name"),
    website: formData.get("website") ?? "",
    industry: formData.get("industry") ?? "",
    companySize: formData.get("companySize") ?? "",
    description: formData.get("description") ?? "",
    country: formData.get("country") ?? "",
    city: formData.get("city") ?? "",
    contactEmail: formData.get("contactEmail") ?? "",
    contactPhone: formData.get("contactPhone") ?? "",
  });
  if (!parsed.success) {
    return fail("Please correct the highlighted fields.", flattenZodError(parsed.error));
  }
  const data = parsed.data;
  const nameChanged = data.name !== c.org.name;
  const slug = nameChanged
    ? await uniqueSlug(data.name, slugExists("organizations"))
    : c.org.slug;

  try {
    await db
      .update(organizations)
      .set({
        name: data.name,
        slug,
        website: data.website || null,
        industry: data.industry || null,
        companySize: data.companySize || null,
        description: data.description || null,
        country: data.country || null,
        city: data.city || null,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, c.org.id));
  } catch {
    return fail("We could not save your company profile. Please try again.");
  }

  await recordAudit({
    actorUserId: c.ctx.user.id,
    action: "organization.profile_update",
    targetType: "organization",
    targetId: c.org.id,
  });
  revalidatePath("/employer/profile");
  revalidatePath("/employer");
  return ok("Company profile updated.");
}

function jobValuesFrom(data: ReturnType<typeof jobSchema.parse>, organizationId: string) {
  return {
    organizationId,
    title: data.title,
    summary: data.summary || null,
    description: data.description,
    responsibilities: data.responsibilities || null,
    requirements: data.requirements || null,
    employmentType: data.employmentType,
    location: data.location || null,
    country: data.country || null,
    department: data.department || null,
    industry: data.industry || null,
    salaryMin: data.salaryMin ?? null,
    salaryMax: data.salaryMax || null,
    currency: data.currency || "USD",
    skills: splitList(data.skills),
    applicationDeadline: data.applicationDeadline || null,
    status: data.status,
  };
}

export async function createJobAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  let c;
  try {
    c = await requireEmployer();
  } catch {
    return fail("You must be signed in as an employer.", undefined, "FORBIDDEN");
  }
  if (c.org.status !== "approved") {
    return fail(
      "Your organization must be approved before you can post jobs.",
      undefined,
      "ORG_NOT_APPROVED"
    );
  }

  const parsed = jobSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary") ?? "",
    description: formData.get("description"),
    responsibilities: formData.get("responsibilities") ?? "",
    requirements: formData.get("requirements") ?? "",
    employmentType: formData.get("employmentType"),
    location: formData.get("location") ?? "",
    country: formData.get("country") ?? "",
    department: formData.get("department") ?? "",
    industry: formData.get("industry") ?? "",
    salaryMin: formData.get("salaryMin") || undefined,
    salaryMax: formData.get("salaryMax") || undefined,
    currency: formData.get("currency") ?? "",
    skills: formData.get("skills") ?? "",
    applicationDeadline: formData.get("applicationDeadline") ?? "",
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return fail("Please correct the highlighted fields.", flattenZodError(parsed.error));
  }
  const data = parsed.data;
  const slug = await uniqueSlug(
    `${data.title}-${c.org.name}`,
    slugExists("jobs")
  );

  let jobId = "";
  try {
    const [job] = await db
      .insert(jobs)
      .values({
        ...jobValuesFrom(data, c.org.id),
        slug,
        status: data.status,
        publishedAt: data.status === "published" ? new Date() : null,
        createdBy: c.ctx.user.id,
      })
      .returning({ id: jobs.id, slug: jobs.slug });
    jobId = job.id;
  } catch {
    return fail("We could not create the job. Please try again.");
  }

  await recordAudit({
    actorUserId: c.ctx.user.id,
    action: "job.create",
    targetType: "job",
    targetId: jobId,
    metadata: { status: data.status },
  });
  revalidatePath("/employer/jobs");
  revalidatePath("/employer");
  revalidatePath("/jobs");
  return ok("Job saved successfully.");
}

export async function updateJobAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  let c;
  try {
    c = await requireEmployer();
  } catch {
    return fail("You must be signed in as an employer.", undefined, "FORBIDDEN");
  }
  const jobId = String(formData.get("jobId") ?? "");
  if (!jobId) return fail("Missing job reference.");

  const owned = await db
    .select({ id: jobs.id, status: jobs.status, publishedAt: jobs.publishedAt })
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.organizationId, c.org.id)))
    .limit(1);
  if (owned.length === 0) return fail("Job not found.");

  const parsed = jobSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary") ?? "",
    description: formData.get("description"),
    responsibilities: formData.get("responsibilities") ?? "",
    requirements: formData.get("requirements") ?? "",
    employmentType: formData.get("employmentType"),
    location: formData.get("location") ?? "",
    country: formData.get("country") ?? "",
    department: formData.get("department") ?? "",
    industry: formData.get("industry") ?? "",
    salaryMin: formData.get("salaryMin") || undefined,
    salaryMax: formData.get("salaryMax") || undefined,
    currency: formData.get("currency") ?? "",
    skills: formData.get("skills") ?? "",
    applicationDeadline: formData.get("applicationDeadline") ?? "",
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return fail("Please correct the highlighted fields.", flattenZodError(parsed.error));
  }
  const data = parsed.data;
  if (data.status === "published" && c.org.status !== "approved") {
    return fail("Your organization must be approved before publishing jobs.");
  }

  try {
    await db
      .update(jobs)
      .set({
        ...jobValuesFrom(data, c.org.id),
        publishedAt:
          data.status === "published" && !owned[0].publishedAt
            ? new Date()
            : owned[0].publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));
  } catch {
    return fail("We could not update the job. Please try again.");
  }

  await recordAudit({
    actorUserId: c.ctx.user.id,
    action: "job.update",
    targetType: "job",
    targetId: jobId,
  });
  revalidatePath("/employer/jobs");
  revalidatePath(`/employer/jobs/${jobId}`);
  revalidatePath("/jobs");
  return ok("Job updated successfully.");
}

export async function setJobStatusAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  let c;
  try {
    c = await requireEmployer();
  } catch {
    return fail("You must be signed in as an employer.", undefined, "FORBIDDEN");
  }
  const jobId = String(formData.get("jobId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["draft", "published", "closed", "archived"].includes(status)) {
    return fail("Invalid status.");
  }
  if (status === "published" && c.org.status !== "approved") {
    return fail("Your organization must be approved before publishing jobs.");
  }

  const owned = await db
    .select({ id: jobs.id, publishedAt: jobs.publishedAt })
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.organizationId, c.org.id)))
    .limit(1);
  if (owned.length === 0) return fail("Job not found.");

  await db
    .update(jobs)
    .set({
      status: status as "draft" | "published" | "closed" | "archived",
      publishedAt:
        status === "published" && !owned[0].publishedAt
          ? new Date()
          : owned[0].publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, jobId));

  await recordAudit({
    actorUserId: c.ctx.user.id,
    action: "job.status_change",
    targetType: "job",
    targetId: jobId,
    metadata: { status },
  });
  revalidatePath("/employer/jobs");
  revalidatePath("/jobs");
  return ok(`Job marked as ${humanizeStatus(status)}.`);
}

export async function createHiringRequestAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  let c;
  try {
    c = await requireEmployer();
  } catch {
    return fail("You must be signed in as an employer.", undefined, "FORBIDDEN");
  }

  const key = await rateLimitKey("hiring_request", c.ctx.user.id);
  if (!rateLimit(key, 20, 24 * 60 * 60 * 1000).allowed) {
    return fail("Too many requests submitted. Please try again later.", undefined, "RATE_LIMITED");
  }

  const parsed = hiringRequestSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    rolesNeeded: formData.get("rolesNeeded"),
    employmentType: formData.get("employmentType"),
    location: formData.get("location") ?? "",
    country: formData.get("country") ?? "",
    industry: formData.get("industry") ?? "",
    budgetMin: formData.get("budgetMin") || undefined,
    budgetMax: formData.get("budgetMax") || undefined,
    currency: formData.get("currency") ?? "",
    urgency: formData.get("urgency"),
  });
  if (!parsed.success) {
    return fail("Please correct the highlighted fields.", flattenZodError(parsed.error));
  }
  const data = parsed.data;

  let requestId = "";
  try {
    const [row] = await db
      .insert(hiringRequests)
      .values({
        organizationId: c.org.id,
        createdBy: c.ctx.user.id,
        title: data.title,
        description: data.description,
        rolesNeeded: data.rolesNeeded,
        employmentType: data.employmentType,
        location: data.location || null,
        country: data.country || null,
        industry: data.industry || null,
        budgetMin: data.budgetMin ?? null,
        budgetMax: data.budgetMax ?? null,
        currency: data.currency || "USD",
        urgency: data.urgency,
        status: "new",
      })
      .returning({ id: hiringRequests.id });
    requestId = row.id;
  } catch {
    return fail("We could not submit your hiring request. Please try again.");
  }

  await sendNotification({
    template: "employer_inquiry_received",
    to: c.org.contactEmail ?? c.ctx.user.email,
    userId: c.ctx.user.id,
    meta: { hiringRequestId: requestId },
    data: {
      contactName: c.ctx.user.email,
      requestTitle: data.title,
      organizationName: c.org.name,
    },
  });

  await recordAudit({
    actorUserId: c.ctx.user.id,
    action: "hiring_request.create",
    targetType: "hiring_request",
    targetId: requestId,
    metadata: { rolesNeeded: data.rolesNeeded },
  });

  revalidatePath("/employer/requests");
  revalidatePath("/employer");
  return ok("Your hiring request has been submitted.");
}

const EMPLOYER_TRANSITIONS = [
  "under_review",
  "shortlisted",
  "interview",
  "offered",
  "hired",
  "rejected",
] as const;

export async function updateApplicationStatusAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  let c;
  try {
    c = await requireEmployer();
  } catch {
    return fail("You must be signed in as an employer.", undefined, "FORBIDDEN");
  }

  const parsed = applicationStatusSchema.safeParse({
    applicationId: formData.get("applicationId"),
    status: formData.get("status"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) {
    return fail("Please correct the highlighted fields.", flattenZodError(parsed.error));
  }
  const data = parsed.data;
  if (!EMPLOYER_TRANSITIONS.includes(data.status as (typeof EMPLOYER_TRANSITIONS)[number])) {
    return fail("You cannot set this application status.");
  }

  const rows = await db
    .select({
      id: applications.id,
      status: applications.status,
      contactEmail: applications.contactEmail,
      candidateId: applications.candidateId,
      jobTitle: jobs.title,
      candidateFirst: candidates.firstName,
      candidateLast: candidates.lastName,
    })
    .from(applications)
    .innerJoin(jobs, eq(jobs.id, applications.jobId))
    .innerJoin(candidates, eq(candidates.id, applications.candidateId))
    .where(and(eq(applications.id, data.applicationId), eq(jobs.organizationId, c.org.id)))
    .limit(1);
  const app = rows[0];
  if (!app) return fail("Application not found.");
  if (app.status === data.status) {
    return fail("The application is already in this status.");
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(applications)
        .set({ status: data.status, updatedAt: new Date() })
        .where(eq(applications.id, app.id));
      await tx.insert(applicationStatusHistory).values({
        applicationId: app.id,
        fromStatus: app.status,
        toStatus: data.status,
        actorUserId: c.ctx.user.id,
        note: data.note || null,
      });
    });
  } catch {
    return fail("We could not update the application status. Please try again.");
  }

  await sendNotification({
    template: "application_status_changed",
    to: app.contactEmail,
    meta: { applicationId: app.id, status: data.status },
    data: {
      candidateName: `${app.candidateFirst} ${app.candidateLast}`,
      jobTitle: app.jobTitle,
      statusLabel: humanizeStatus(data.status),
      note: data.note || "",
    },
  });

  await recordAudit({
    actorUserId: c.ctx.user.id,
    action: "application.status_update",
    targetType: "application",
    targetId: app.id,
    metadata: { from: app.status, to: data.status },
  });

  revalidatePath(`/employer/applications/${app.id}`);
  revalidatePath("/employer/applications");
  revalidatePath("/candidate/applications");
  return ok(`Application marked as ${humanizeStatus(data.status)}.`);
}

export async function requireEmployerOrNull(): Promise<SessionUser | null> {
  try {
    const ctx = await requireRole("employer");
    return ctx.user;
  } catch {
    return null;
  }
}
