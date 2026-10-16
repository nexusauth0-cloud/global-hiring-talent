"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  candidates,
  applications,
  applicationStatusHistory,
  documents,
  jobs,
  organizations,
} from "@/db/schema";
import { requireVerifiedRole } from "@/lib/auth/rbac";
import { AuthError, findCandidateProfile, requireUser } from "@/lib/auth/session";
import { recordAudit } from "@/lib/audit";
import { sendNotification } from "@/lib/email/adapter";
import { validateResumeFile, UploadError } from "@/lib/uploads";
import { rateLimit } from "@/lib/rate-limit";
import { rateLimitKey } from "@/lib/request";
import {
  applicationSchema,
  candidateProfileSchema,
  flattenZodError,
  splitList,
} from "@/lib/validation/schemas";
import { publicJobCondition } from "@/lib/queries";
import { ok, fail, type ActionResult } from "@/server/action-result";
import { recruitmentRecipient, siteUrl } from "@/lib/config";

type CandidateCtx = Awaited<ReturnType<typeof requireVerifiedRole>>;

async function authCandidate(): Promise<
  { ctx: CandidateCtx } | { error: ActionResult }
> {
  try {
    return { ctx: await requireVerifiedRole("candidate") };
  } catch (err) {
    if (err instanceof AuthError && err.code === "EMAIL_NOT_VERIFIED") {
      return {
        error: fail(
          "Please verify your email address before continuing.",
          undefined,
          "EMAIL_NOT_VERIFIED"
        ),
      };
    }
    return {
      error: fail("You must be signed in as a candidate.", undefined, "FORBIDDEN"),
    };
  }
}

export async function updateCandidateProfileAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const auth = await authCandidate();
  if ("error" in auth) return auth.error;
  const { ctx } = auth;

  const parsed = candidateProfileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone") ?? "",
    headline: formData.get("headline") ?? "",
    summary: formData.get("summary") ?? "",
    location: formData.get("location") ?? "",
    country: formData.get("country") ?? "",
    linkedinUrl: formData.get("linkedinUrl") ?? "",
    skills: formData.get("skills") ?? "",
  });
  if (!parsed.success) {
    return fail("Please correct the highlighted fields.", flattenZodError(parsed.error));
  }
  const data = parsed.data;
  const profile = await findCandidateProfile(ctx.user.id);
  if (!profile) return fail("Candidate profile not found.");

  try {
    await db
      .update(candidates)
      .set({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        headline: data.headline || null,
        summary: data.summary || null,
        location: data.location || null,
        country: data.country || null,
        linkedinUrl: data.linkedinUrl || null,
        skills: splitList(data.skills),
        updatedAt: new Date(),
      })
      .where(eq(candidates.id, profile.id));
  } catch {
    return fail("We could not save your profile. Please try again.");
  }

  await recordAudit({
    actorUserId: ctx.user.id,
    action: "candidate.profile_update",
    targetType: "candidate",
    targetId: profile.id,
  });
  revalidatePath("/candidate/profile");
  revalidatePath("/candidate");
  return ok("Your profile has been updated.");
}

export async function uploadResumeAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const auth = await authCandidate();
  if ("error" in auth) return auth.error;
  const { ctx } = auth;

  const key = await rateLimitKey("upload", ctx.user.id);
  if (!rateLimit(key, 10, 60 * 60 * 1000).allowed) {
    return fail("Too many uploads. Please try again later.", undefined, "RATE_LIMITED");
  }

  const file = formData.get("resume");
  if (!(file instanceof File) || file.size === 0) {
    return fail("Please select a PDF, DOC or DOCX file to upload.", {
      resume: "No file selected.",
    });
  }

  const profile = await findCandidateProfile(ctx.user.id);
  if (!profile) return fail("Candidate profile not found.");

  let validated;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    validated = validateResumeFile({ name: file.name, size: file.size, buffer });
  } catch (err) {
    if (err instanceof UploadError) {
      return fail("The file could not be accepted.", { resume: err.message });
    }
    return fail("The file could not be processed.", { resume: "Unreadable file." });
  }

  try {
    await db.transaction(async (tx) => {
      const [doc] = await tx
        .insert(documents)
        .values({
          ownerUserId: ctx.user.id,
          kind: "resume",
          storageKey: validated.storageKey,
          data: validated.buffer,
          originalName: validated.originalName,
          mimeType: validated.mimeType,
          sizeBytes: validated.sizeBytes,
        })
        .returning({ id: documents.id });

      await tx
        .update(candidates)
        .set({ resumeDocumentId: doc.id, updatedAt: new Date() })
        .where(eq(candidates.id, profile.id));
    });
  } catch {
    return fail("We could not store your document. Please try again.");
  }

  await recordAudit({
    actorUserId: ctx.user.id,
    action: "candidate.resume_upload",
    targetType: "candidate",
    targetId: profile.id,
    metadata: { mimeType: validated.mimeType, sizeBytes: validated.sizeBytes },
  });
  revalidatePath("/candidate/profile");
  revalidatePath("/candidate");
  return ok("Your CV has been uploaded.");
}

export async function submitApplicationAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const auth = await authCandidate();
  if ("error" in auth) return auth.error;
  const { ctx } = auth;

  const parsed = applicationSchema.safeParse({
    jobId: formData.get("jobId"),
    coverLetter: formData.get("coverLetter") ?? "",
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    consent: formData.get("consent") === "on",
  });
  if (!parsed.success) {
    return fail("Please correct the highlighted fields.", flattenZodError(parsed.error));
  }
  const data = parsed.data;

  const profile = await findCandidateProfile(ctx.user.id);
  if (!profile) {
    return fail("Please complete your candidate profile before applying.");
  }
  if (!profile.resumeDocumentId) {
    return fail("Please upload a CV before applying.", {
      _form: "A CV is required to apply.",
    });
  }

  const jobRows = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      slug: jobs.slug,
      organizationId: jobs.organizationId,
      orgName: organizations.name,
    })
    .from(jobs)
    .innerJoin(organizations, eq(organizations.id, jobs.organizationId))
    .where(and(eq(jobs.id, data.jobId), publicJobCondition(), eq(organizations.status, "approved")))
    .limit(1);
  const job = jobRows[0];
  if (!job) {
    return fail("This position is no longer accepting applications.");
  }

  const key = await rateLimitKey("apply", ctx.user.id);
  if (!rateLimit(key, 30, 60 * 60 * 1000).allowed) {
    return fail("Too many applications submitted. Please try again later.", undefined, "RATE_LIMITED");
  }

  let applicationId = "";
  try {
    applicationId = await db.transaction(async (tx) => {
      const [app] = await tx
        .insert(applications)
        .values({
          jobId: job.id,
          candidateId: profile.id,
          resumeDocumentId: profile.resumeDocumentId,
          coverLetter: data.coverLetter || null,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          status: "submitted",
        })
        .returning({ id: applications.id });

      await tx.insert(applicationStatusHistory).values({
        applicationId: app.id,
        toStatus: "submitted",
        actorUserId: ctx.user.id,
        note: "Application submitted by candidate.",
      });
      return app.id;
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return fail("You have already applied for this position.");
    }
    return fail("We could not submit your application. Please try again.");
  }

  // Emails must never destroy the stored application; failures are recorded.
  await sendNotification({
    template: "application_received",
    to: data.contactEmail,
    userId: ctx.user.id,
    meta: { applicationId },
    data: {
      candidateName: `${profile.firstName} ${profile.lastName}`,
      jobTitle: job.title,
      applicationRef: applicationId.slice(0, 8).toUpperCase(),
    },
  });

  const internalRecipient = recruitmentRecipient();
  if (internalRecipient) {
    await sendNotification({
      template: "internal_application_notice",
      to: internalRecipient,
      meta: { applicationId },
      data: {
        candidateName: `${profile.firstName} ${profile.lastName}`,
        candidateEmail: data.contactEmail,
        candidatePhone: data.contactPhone || "Not provided",
        jobTitle: job.title,
        jobUrl: `${siteUrl}/jobs/${job.slug}`,
        applicationRef: applicationId.slice(0, 8).toUpperCase(),
        submittedAt: new Date().toISOString(),
        cvUrl: `${siteUrl}/api/documents/${profile.resumeDocumentId}`,
      },
    });
  }

  await recordAudit({
    actorUserId: ctx.user.id,
    action: "application.submit",
    targetType: "application",
    targetId: applicationId,
    metadata: { jobId: job.id, jobTitle: job.title },
  });

  revalidatePath("/candidate/applications");
  revalidatePath(`/jobs/${job.slug}`);
  return ok("Your application has been submitted successfully.");
}

export async function withdrawApplicationAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const auth = await authCandidate();
  if ("error" in auth) return auth.error;
  const { ctx } = auth;
  const applicationId = String(formData.get("applicationId") ?? "");
  if (!applicationId) return fail("Missing application reference.");

  const profile = await findCandidateProfile(ctx.user.id);
  if (!profile) return fail("Candidate profile not found.");

  const rows = await db
    .select({ id: applications.id, status: applications.status })
    .from(applications)
    .where(
      and(eq(applications.id, applicationId), eq(applications.candidateId, profile.id))
    )
    .limit(1);
  const app = rows[0];
  if (!app) return fail("Application not found.");
  if (["hired", "rejected", "withdrawn"].includes(app.status)) {
    return fail("This application can no longer be withdrawn.");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(applications)
      .set({ status: "withdrawn", updatedAt: new Date() })
      .where(eq(applications.id, app.id));
    await tx.insert(applicationStatusHistory).values({
      applicationId: app.id,
      fromStatus: app.status,
      toStatus: "withdrawn",
      actorUserId: ctx.user.id,
      note: "Withdrawn by candidate.",
    });
  });

  await recordAudit({
    actorUserId: ctx.user.id,
    action: "application.withdraw",
    targetType: "application",
    targetId: app.id,
  });

  revalidatePath("/candidate/applications");
  return ok("Your application has been withdrawn.");
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "23505"
  );
}

export async function requireCandidateOrRedirect() {
  try {
    return await requireUser();
  } catch (err) {
    if (err instanceof AuthError) return null;
    throw err;
  }
}
