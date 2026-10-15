import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  integer,
  timestamp,
  boolean,
  jsonb,
  date,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userRole = pgEnum("user_role", [
  "candidate",
  "employer",
  "recruiter",
  "admin",
]);

export const jobEmploymentType = pgEnum("job_employment_type", [
  "remote",
  "hybrid",
  "onsite",
]);

export const jobStatus = pgEnum("job_status", [
  "draft",
  "published",
  "closed",
  "archived",
]);

export const applicationStatus = pgEnum("application_status", [
  "submitted",
  "under_review",
  "shortlisted",
  "interview",
  "offered",
  "hired",
  "rejected",
  "withdrawn",
]);

export const documentKind = pgEnum("document_kind", [
  "resume",
  "job_attachment",
  "org_logo",
]);

export const organizationStatus = pgEnum("organization_status", [
  "pending",
  "approved",
  "rejected",
]);

export const reviewStatus = pgEnum("review_status", [
  "pending",
  "approved",
  "rejected",
]);

export const reviewCategory = pgEnum("review_category", [
  "candidate",
  "employer",
  "service",
]);

export const reviewVerification = pgEnum("review_verification", [
  "unverified",
  "verified_client",
  "verified_candidate",
]);

export const hiringRequestStatus = pgEnum("hiring_request_status", [
  "new",
  "in_progress",
  "quote_sent",
  "fulfilled",
  "cancelled",
]);

export const inquiryStatus = pgEnum("inquiry_status", [
  "new",
  "in_progress",
  "resolved",
  "spam",
]);

export const inquiryInterest = pgEnum("inquiry_interest", [
  "employer",
  "candidate",
  "other",
]);

export const notificationStatus = pgEnum("notification_status", [
  "queued",
  "sending",
  "sent",
  "failed",
  "skipped",
]);

export const articleStatus = pgEnum("article_status", ["draft", "published"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 254 }).notNull(),
    passwordHash: text("password_hash"),
    role: userRole("role").notNull().default("candidate"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("users_email_unique").on(sql`lower(${t.email})`),
    index("users_role_idx").on(t.role),
  ]
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    userAgent: text("user_agent"),
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("sessions_token_hash_unique").on(t.tokenHash),
    index("sessions_user_id_idx").on(t.userId),
    index("sessions_expires_at_idx").on(t.expiresAt),
  ]
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("password_reset_tokens_hash_unique").on(t.tokenHash),
    index("password_reset_tokens_user_id_idx").on(t.userId),
  ]
);

export const emailVerificationTokens = pgTable(
  "email_verification_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("email_verification_tokens_hash_unique").on(t.tokenHash),
    index("email_verification_tokens_user_id_idx").on(t.userId),
  ]
);

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull(),
    website: varchar("website", { length: 300 }),
    industry: varchar("industry", { length: 120 }),
    companySize: varchar("company_size", { length: 60 }),
    description: text("description"),
    country: varchar("country", { length: 100 }),
    city: varchar("city", { length: 120 }),
    contactEmail: varchar("contact_email", { length: 254 }),
    contactPhone: varchar("contact_phone", { length: 40 }),
    status: organizationStatus("status").notNull().default("pending"),
    statusNote: text("status_note"),
    statusChangedBy: uuid("status_changed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    statusChangedAt: timestamp("status_changed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("organizations_slug_unique").on(t.slug),
    index("organizations_status_idx").on(t.status),
  ]
);

export const employers = pgTable(
  "employers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 120 }),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("employers_user_id_unique").on(t.userId),
    index("employers_organization_id_idx").on(t.organizationId),
  ]
);

export const candidates = pgTable(
  "candidates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    headline: varchar("headline", { length: 160 }),
    summary: text("summary"),
    location: varchar("location", { length: 140 }),
    country: varchar("country", { length: 100 }),
    linkedinUrl: varchar("linkedin_url", { length: 300 }),
    skills: text("skills").array().notNull().default(sql`'{}'::text[]`),
    resumeDocumentId: uuid("resume_document_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("candidates_user_id_unique").on(t.userId),
    index("candidates_last_name_idx").on(t.lastName),
  ]
);

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: documentKind("kind").notNull(),
    storageKey: text("storage_key").notNull(),
    originalName: varchar("original_name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 120 }).notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("documents_storage_key_unique").on(t.storageKey),
    index("documents_owner_user_id_idx").on(t.ownerUserId),
    check("documents_size_positive", sql`${t.sizeBytes} > 0`),
  ]
);

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    slug: varchar("slug", { length: 240 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    summary: varchar("summary", { length: 400 }),
    description: text("description").notNull(),
    responsibilities: text("responsibilities"),
    requirements: text("requirements"),
    employmentType: jobEmploymentType("employment_type").notNull(),
    location: varchar("location", { length: 140 }),
    country: varchar("country", { length: 100 }),
    department: varchar("department", { length: 120 }),
    industry: varchar("industry", { length: 120 }),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    currency: varchar("currency", { length: 8 }).default("USD"),
    skills: text("skills").array().notNull().default(sql`'{}'::text[]`),
    applicationDeadline: date("application_deadline"),
    status: jobStatus("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("jobs_slug_unique").on(t.slug),
    index("jobs_status_idx").on(t.status),
    index("jobs_organization_id_idx").on(t.organizationId),
    index("jobs_employment_type_idx").on(t.employmentType),
    index("jobs_industry_idx").on(t.industry),
    index("jobs_department_idx").on(t.department),
    check("jobs_salary_range_valid", sql`${t.salaryMin} <= ${t.salaryMax}`)
  ]
);

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "restrict" }),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => candidates.id, { onDelete: "cascade" }),
    resumeDocumentId: uuid("resume_document_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    coverLetter: text("cover_letter"),
    contactEmail: varchar("contact_email", { length: 254 }).notNull(),
    contactPhone: varchar("contact_phone", { length: 40 }),
    status: applicationStatus("status").notNull().default("submitted"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("applications_job_candidate_unique").on(t.jobId, t.candidateId),
    index("applications_candidate_id_idx").on(t.candidateId),
    index("applications_status_idx").on(t.status),
  ]
);

export const applicationAnswers = pgTable(
  "application_answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("application_answers_application_id_idx").on(t.applicationId)]
);

export const applicationStatusHistory = pgTable(
  "application_status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    fromStatus: applicationStatus("from_status"),
    toStatus: applicationStatus("to_status").notNull(),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("application_status_history_application_id_idx").on(t.applicationId),
  ]
);

export const hiringRequests = pgTable(
  "hiring_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    rolesNeeded: integer("roles_needed").notNull().default(1),
    employmentType: jobEmploymentType("employment_type").notNull(),
    location: varchar("location", { length: 140 }),
    country: varchar("country", { length: 100 }),
    industry: varchar("industry", { length: 120 }),
    budgetMin: integer("budget_min"),
    budgetMax: integer("budget_max"),
    currency: varchar("currency", { length: 8 }).default("USD"),
    urgency: varchar("urgency", { length: 40 }),
    status: hiringRequestStatus("status").notNull().default("new"),
    statusNote: text("status_note"),
    statusChangedBy: uuid("status_changed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    statusChangedAt: timestamp("status_changed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("hiring_requests_organization_id_idx").on(t.organizationId),
    index("hiring_requests_status_idx").on(t.status),
  ]
);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorName: varchar("author_name", { length: 120 }).notNull(),
    authorEmail: varchar("author_email", { length: 254 }).notNull(),
    rating: integer("rating").notNull(),
    category: reviewCategory("category").notNull(),
    body: text("body").notNull(),
    status: reviewStatus("status").notNull().default("pending"),
    verification: reviewVerification("verification")
      .notNull()
      .default("unverified"),
    reportedCount: integer("reported_count").notNull().default(0),
    statusNote: text("status_note"),
    moderatedBy: uuid("moderated_by").references(() => users.id, {
      onDelete: "set null",
    }),
    moderatedAt: timestamp("moderated_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("reviews_status_idx").on(t.status),
    index("reviews_category_idx").on(t.category),
    check("reviews_rating_range", sql`${t.rating} BETWEEN 1 AND 5`),
  ]
);

export const reviewReports = pgTable(
  "review_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reviewId: uuid("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    reporterEmail: varchar("reporter_email", { length: 254 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("review_reports_review_id_idx").on(t.reviewId)]
);

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 240 }).notNull(),
    title: varchar("title", { length: 220 }).notNull(),
    excerpt: varchar("excerpt", { length: 400 }),
    body: text("body").notNull(),
    category: varchar("category", { length: 120 }),
    coverImage: varchar("cover_image", { length: 300 }),
    authorName: varchar("author_name", { length: 140 }),
    status: articleStatus("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("articles_slug_unique").on(t.slug),
    index("articles_status_idx").on(t.status),
  ]
);

export const contactInquiries = pgTable(
  "contact_inquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 140 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    company: varchar("company", { length: 160 }),
    interest: inquiryInterest("interest").notNull().default("other"),
    message: text("message").notNull(),
    status: inquiryStatus("status").notNull().default("new"),
    handledBy: uuid("handled_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("contact_inquiries_status_idx").on(t.status)]
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    toEmail: varchar("to_email", { length: 254 }).notNull(),
    template: varchar("template", { length: 80 }).notNull(),
    subject: varchar("subject", { length: 240 }).notNull(),
    status: notificationStatus("status").notNull().default("queued"),
    provider: varchar("provider", { length: 40 }),
    providerMessageId: varchar("provider_message_id", { length: 240 }),
    error: text("error"),
    meta: jsonb("meta").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
  },
  (t) => [
    index("notifications_status_idx").on(t.status),
    index("notifications_to_email_idx").on(t.toEmail),
  ]
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 120 }).notNull(),
    targetType: varchar("target_type", { length: 60 }),
    targetId: varchar("target_id", { length: 64 }),
    metadata: jsonb("metadata").notNull().default({}),
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("audit_logs_actor_user_id_idx").on(t.actorUserId),
    index("audit_logs_action_idx").on(t.action),
    index("audit_logs_created_at_idx").on(t.createdAt),
  ]
);

export type User = typeof users.$inferSelect;
export type Candidate = typeof candidates.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type Employer = typeof employers.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type DocumentRow = typeof documents.$inferSelect;
export type HiringRequest = typeof hiringRequests.$inferSelect;
export type ContactInquiry = typeof contactInquiries.$inferSelect;
export type NotificationRow = typeof notifications.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
