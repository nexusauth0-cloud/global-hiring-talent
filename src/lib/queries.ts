import "server-only";
import {
  and,
  or,
  eq,
  ilike,
  sql,
  desc,
  asc,
  count,
  avg,
  isNull,
  gte,
  type SQL,
} from "drizzle-orm";
import { db } from "@/lib/db";
import {
  jobs,
  organizations,
  applications,
  reviews,
  articles,
  candidates,
  applicationStatusHistory,
  users,
  contactInquiries,
  hiringRequests,
  notifications,
  auditLogs,
} from "@/db/schema";

export type JobFilters = {
  q?: string;
  location?: string;
  employmentType?: string;
  industry?: string;
  department?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
};

export function publicJobCondition(): SQL {
  return and(
    eq(jobs.status, "published"),
    or(isNull(jobs.expiresAt), gte(jobs.expiresAt, new Date()))!,
    sql`(${jobs.applicationDeadline} is null or ${jobs.applicationDeadline} >= current_date)`
  )!;
}

export async function listPublishedJobs(filters: JobFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 10));
  const conditions: SQL[] = [publicJobCondition(), eq(organizations.status, "approved")];

  if (filters.q) {
    const term = `%${filters.q}%`;
    conditions.push(
      or(
        ilike(jobs.title, term),
        ilike(jobs.description, term),
        ilike(jobs.summary, term),
        sql`array_to_string(${jobs.skills}, ' ') ilike ${term}`,
        ilike(organizations.name, term)
      )!
    );
  }
  if (filters.location) {
    conditions.push(ilike(jobs.location, `%${filters.location}%`));
  }
  if (
    filters.employmentType &&
    ["remote", "hybrid", "onsite"].includes(filters.employmentType)
  ) {
    conditions.push(
      eq(jobs.employmentType, filters.employmentType as "remote" | "hybrid" | "onsite")
    );
  }
  if (filters.industry) conditions.push(eq(jobs.industry, filters.industry));
  if (filters.department) conditions.push(eq(jobs.department, filters.department));

  const where = and(...conditions);

  const orderBy =
    filters.sort === "oldest"
      ? [asc(jobs.publishedAt)]
      : filters.sort === "title"
        ? [asc(jobs.title)]
        : [desc(jobs.publishedAt)];

  const [rows, totalRow] = await Promise.all([
    db
      .select({
        id: jobs.id,
        slug: jobs.slug,
        title: jobs.title,
        summary: jobs.summary,
        employmentType: jobs.employmentType,
        location: jobs.location,
        country: jobs.country,
        department: jobs.department,
        industry: jobs.industry,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        currency: jobs.currency,
        skills: jobs.skills,
        publishedAt: jobs.publishedAt,
        applicationDeadline: jobs.applicationDeadline,
        organizationName: organizations.name,
      })
      .from(jobs)
      .innerJoin(organizations, eq(organizations.id, jobs.organizationId))
      .where(where)
      .orderBy(...orderBy)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ value: count() })
      .from(jobs)
      .innerJoin(organizations, eq(organizations.id, jobs.organizationId))
      .where(where),
  ]);

  const total = Number(totalRow[0]?.value ?? 0);
  return {
    jobs: rows,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getFeaturedJobs(limit = 6) {
  return db
    .select({
      id: jobs.id,
      slug: jobs.slug,
      title: jobs.title,
      summary: jobs.summary,
      employmentType: jobs.employmentType,
      location: jobs.location,
      country: jobs.country,
      industry: jobs.industry,
      salaryMin: jobs.salaryMin,
      salaryMax: jobs.salaryMax,
      currency: jobs.currency,
      skills: jobs.skills,
      publishedAt: jobs.publishedAt,
      organizationName: organizations.name,
    })
    .from(jobs)
    .innerJoin(organizations, eq(organizations.id, jobs.organizationId))
    .where(and(publicJobCondition(), eq(organizations.status, "approved")))
    .orderBy(desc(jobs.publishedAt))
    .limit(limit);
}

export async function getJobBySlug(slug: string) {
  const rows = await db
    .select({
      job: jobs,
      organization: organizations,
    })
    .from(jobs)
    .innerJoin(organizations, eq(organizations.id, jobs.organizationId))
    .where(eq(jobs.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getJobFilterOptions() {
  const [departmentRows, industryRows] = await Promise.all([
    db
      .selectDistinct({ value: jobs.department })
      .from(jobs)
      .where(and(eq(jobs.status, "published"), sql`${jobs.department} is not null`)),
    db
      .selectDistinct({ value: jobs.industry })
      .from(jobs)
      .where(and(eq(jobs.status, "published"), sql`${jobs.industry} is not null`)),
  ]);
  return {
    departments: departmentRows
      .map((r) => r.value)
      .filter((v): v is string => Boolean(v))
      .sort(),
    industries: industryRows
      .map((r) => r.value)
      .filter((v): v is string => Boolean(v))
      .sort(),
  };
}

export async function getApprovedReviews(limit = 6) {
  return db
    .select({
      id: reviews.id,
      authorName: reviews.authorName,
      rating: reviews.rating,
      category: reviews.category,
      body: reviews.body,
      verification: reviews.verification,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(eq(reviews.status, "approved"))
    .orderBy(desc(reviews.createdAt))
    .limit(limit);
}

export async function getReviewAggregate() {
  const rows = await db
    .select({
      total: count(),
      average: avg(reviews.rating),
    })
    .from(reviews)
    .where(eq(reviews.status, "approved"));
  const total = Number(rows[0]?.total ?? 0);
  const average = rows[0]?.average ? Number(rows[0].average) : 0;
  return { total, average: Number.isFinite(average) ? average : 0 };
}

export async function getPublishedArticles(limit = 3) {
  return db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      category: articles.category,
      coverImage: articles.coverImage,
      authorName: articles.authorName,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

export async function getArticleBySlug(slug: string) {
  const rows = await db
    .select()
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
    .limit(1);
  return rows[0] ?? null;
}

export async function getPublicStats() {
  const [jobRow, orgRow, reviewRow] = await Promise.all([
    db
      .select({ value: count() })
      .from(jobs)
      .innerJoin(organizations, eq(organizations.id, jobs.organizationId))
      .where(and(publicJobCondition(), eq(organizations.status, "approved"))),
    db
      .select({ value: count() })
      .from(organizations)
      .where(eq(organizations.status, "approved")),
    db.select({ value: count() }).from(reviews).where(eq(reviews.status, "approved")),
  ]);
  return {
    openJobs: Number(jobRow[0]?.value ?? 0),
    approvedOrganizations: Number(orgRow[0]?.value ?? 0),
    approvedReviews: Number(reviewRow[0]?.value ?? 0),
  };
}

export async function getCandidateApplications(candidateId: string) {
  return db
    .select({
      id: applications.id,
      status: applications.status,
      createdAt: applications.createdAt,
      updatedAt: applications.updatedAt,
      jobTitle: jobs.title,
      jobSlug: jobs.slug,
      employmentType: jobs.employmentType,
      location: jobs.location,
      country: jobs.country,
      organizationName: organizations.name,
    })
    .from(applications)
    .innerJoin(jobs, eq(jobs.id, applications.jobId))
    .innerJoin(organizations, eq(organizations.id, jobs.organizationId))
    .where(eq(applications.candidateId, candidateId))
    .orderBy(desc(applications.createdAt));
}

export async function getCandidateApplicationDetail(
  applicationId: string,
  candidateId: string
) {
  const rows = await db
    .select({
      application: applications,
      job: {
        id: jobs.id,
        title: jobs.title,
        slug: jobs.slug,
        employmentType: jobs.employmentType,
        location: jobs.location,
        country: jobs.country,
        status: jobs.status,
      },
      organizationName: organizations.name,
    })
    .from(applications)
    .innerJoin(jobs, eq(jobs.id, applications.jobId))
    .innerJoin(organizations, eq(organizations.id, jobs.organizationId))
    .where(
      and(eq(applications.id, applicationId), eq(applications.candidateId, candidateId))
    )
    .limit(1);

  if (rows.length === 0) return null;

  const history = await db
    .select()
    .from(applicationStatusHistory)
    .where(eq(applicationStatusHistory.applicationId, applicationId))
    .orderBy(asc(applicationStatusHistory.createdAt));

  return { ...rows[0], history };
}

export async function getEmployerJobs(organizationId: string) {
  return db
    .select({
      id: jobs.id,
      title: jobs.title,
      slug: jobs.slug,
      status: jobs.status,
      employmentType: jobs.employmentType,
      location: jobs.location,
      country: jobs.country,
      publishedAt: jobs.publishedAt,
      createdAt: jobs.createdAt,
      applicationCount: sql<number>`(
        select count(*)::int from ${applications}
        where ${applications.jobId} = ${jobs.id}
      )`,
    })
    .from(jobs)
    .where(eq(jobs.organizationId, organizationId))
    .orderBy(desc(jobs.createdAt));
}

export async function getEmployerJobById(id: string, organizationId: string) {
  const rows = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, id), eq(jobs.organizationId, organizationId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getEmployerApplications(organizationId: string) {
  return db
    .select({
      id: applications.id,
      status: applications.status,
      createdAt: applications.createdAt,
      contactEmail: applications.contactEmail,
      candidateFirst: candidates.firstName,
      candidateLast: candidates.lastName,
      headline: candidates.headline,
      jobTitle: jobs.title,
      jobId: jobs.id,
    })
    .from(applications)
    .innerJoin(jobs, eq(jobs.id, applications.jobId))
    .innerJoin(candidates, eq(candidates.id, applications.candidateId))
    .where(eq(jobs.organizationId, organizationId))
    .orderBy(desc(applications.createdAt));
}

export async function getEmployerApplicationDetail(
  applicationId: string,
  organizationId: string
) {
  const rows = await db
    .select({
      application: applications,
      job: { id: jobs.id, title: jobs.title, slug: jobs.slug },
      candidate: candidates,
    })
    .from(applications)
    .innerJoin(jobs, eq(jobs.id, applications.jobId))
    .innerJoin(candidates, eq(candidates.id, applications.candidateId))
    .where(
      and(
        eq(applications.id, applicationId),
        eq(jobs.organizationId, organizationId)
      )
    )
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  const history = await db
    .select()
    .from(applicationStatusHistory)
    .where(eq(applicationStatusHistory.applicationId, applicationId))
    .orderBy(asc(applicationStatusHistory.createdAt));
  return { ...row, history };
}

export async function getEmployerHiringRequests(organizationId: string) {
  return db
    .select()
    .from(hiringRequests)
    .where(eq(hiringRequests.organizationId, organizationId))
    .orderBy(desc(hiringRequests.createdAt));
}

export async function getEmployerMetrics(organizationId: string) {
  const [jobTotal, jobPublished, appTotal, appNew, requestTotal] = await Promise.all([
    db.select({ value: count() }).from(jobs).where(eq(jobs.organizationId, organizationId)),
    db
      .select({ value: count() })
      .from(jobs)
      .where(and(eq(jobs.organizationId, organizationId), eq(jobs.status, "published"))),
    db
      .select({ value: count() })
      .from(applications)
      .innerJoin(jobs, eq(jobs.id, applications.jobId))
      .where(eq(jobs.organizationId, organizationId)),
    db
      .select({ value: count() })
      .from(applications)
      .innerJoin(jobs, eq(jobs.id, applications.jobId))
      .where(and(eq(jobs.organizationId, organizationId), eq(applications.status, "submitted"))),
    db
      .select({ value: count() })
      .from(hiringRequests)
      .where(eq(hiringRequests.organizationId, organizationId)),
  ]);
  const n = (r: { value: number | string }[]) => Number(r[0]?.value ?? 0);
  return {
    jobs: n(jobTotal),
    jobsPublished: n(jobPublished),
    applications: n(appTotal),
    applicationsNew: n(appNew),
    hiringRequests: n(requestTotal),
  };
}

export async function getAdminOrganizations() {
  return db
    .select({
      id: organizations.id,
      name: organizations.name,
      industry: organizations.industry,
      country: organizations.country,
      status: organizations.status,
      statusNote: organizations.statusNote,
      createdAt: organizations.createdAt,
      jobCount: sql<number>`(
        select count(*)::int from ${jobs}
        where ${jobs.organizationId} = ${organizations.id}
      )`,
    })
    .from(organizations)
    .orderBy(desc(organizations.createdAt));
}

export async function getAdminJobs() {
  return db
    .select({
      id: jobs.id,
      title: jobs.title,
      slug: jobs.slug,
      status: jobs.status,
      employmentType: jobs.employmentType,
      createdAt: jobs.createdAt,
      publishedAt: jobs.publishedAt,
      organizationName: organizations.name,
    })
    .from(jobs)
    .innerJoin(organizations, eq(organizations.id, jobs.organizationId))
    .orderBy(desc(jobs.createdAt));
}

export async function getAdminApplications() {
  return db
    .select({
      id: applications.id,
      status: applications.status,
      createdAt: applications.createdAt,
      contactEmail: applications.contactEmail,
      candidateFirst: candidates.firstName,
      candidateLast: candidates.lastName,
      jobTitle: jobs.title,
      organizationName: organizations.name,
    })
    .from(applications)
    .innerJoin(jobs, eq(jobs.id, applications.jobId))
    .innerJoin(candidates, eq(candidates.id, applications.candidateId))
    .innerJoin(organizations, eq(organizations.id, jobs.organizationId))
    .orderBy(desc(applications.createdAt));
}

export async function getAdminReviews() {
  return db
    .select()
    .from(reviews)
    .orderBy(desc(reviews.createdAt));
}

export async function getAdminHiringRequests() {
  return db
    .select({
      request: hiringRequests,
      organizationName: organizations.name,
    })
    .from(hiringRequests)
    .innerJoin(organizations, eq(organizations.id, hiringRequests.organizationId))
    .orderBy(desc(hiringRequests.createdAt));
}

export async function getAdminInquiries() {
  return db.select().from(contactInquiries).orderBy(desc(contactInquiries.createdAt));
}

export async function getAdminUsers() {
  return db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      emailVerifiedAt: users.emailVerifiedAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
}

export async function getAdminArticles() {
  return db.select().from(articles).orderBy(desc(articles.createdAt));
}

export async function getAdminArticleById(id: string) {
  const rows = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getAdminNotifications(limit = 100) {
  return db
    .select()
    .from(notifications)
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getAdminAuditLogs(limit = 100) {
  return db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

export async function getAdminCandidates() {
  return db
    .select({
      id: candidates.id,
      firstName: candidates.firstName,
      lastName: candidates.lastName,
      headline: candidates.headline,
      country: candidates.country,
      hasResume: sql<boolean>`${candidates.resumeDocumentId} is not null`,
      createdAt: candidates.createdAt,
      applicationCount: sql<number>`(
        select count(*)::int from ${applications}
        where ${applications.candidateId} = ${candidates.id}
      )`,
    })
    .from(candidates)
    .orderBy(desc(candidates.createdAt));
}

export async function getAdminMetrics() {
  const [
    userRow,
    candidateRow,
    orgPendingRow,
    jobPublishedRow,
    jobDraftRow,
    appRow,
    appNewRow,
    reviewPendingRow,
    articleRow,
    inquiryNewRow,
    hiringRow,
    notifFailedRow,
  ] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(candidates),
    db
      .select({ value: count() })
      .from(organizations)
      .where(eq(organizations.status, "pending")),
    db.select({ value: count() }).from(jobs).where(eq(jobs.status, "published")),
    db.select({ value: count() }).from(jobs).where(eq(jobs.status, "draft")),
    db.select({ value: count() }).from(applications),
    db
      .select({ value: count() })
      .from(applications)
      .where(eq(applications.status, "submitted")),
    db.select({ value: count() }).from(reviews).where(eq(reviews.status, "pending")),
    db.select({ value: count() }).from(articles),
    db
      .select({ value: count() })
      .from(contactInquiries)
      .where(eq(contactInquiries.status, "new")),
    db.select({ value: count() }).from(hiringRequests),
    db
      .select({ value: count() })
      .from(notifications)
      .where(eq(notifications.status, "failed")),
  ]);

  const n = (r: { value: number | string }[]) => Number(r[0]?.value ?? 0);
  return {
    users: n(userRow),
    candidates: n(candidateRow),
    organizationsPending: n(orgPendingRow),
    jobsPublished: n(jobPublishedRow),
    jobsDraft: n(jobDraftRow),
    applications: n(appRow),
    applicationsNew: n(appNewRow),
    reviewsPending: n(reviewPendingRow),
    articles: n(articleRow),
    inquiriesNew: n(inquiryNewRow),
    hiringRequests: n(hiringRow),
    notificationsFailed: n(notifFailedRow),
  };
}
