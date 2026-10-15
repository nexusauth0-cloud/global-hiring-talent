import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(254)
  .email("Enter a valid email address.");

export const phoneSchema = z
  .string()
  .trim()
  .min(6, "Enter a valid phone number.")
  .max(40)
  .regex(/^[+()\-\s0-9]+$/, "Phone number may only contain digits and +()- characters.");

export const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters.")
  .max(200);

const safeText = (max: number) => z.string().trim().max(max);

export const registerCandidateSchema = z.object({
  firstName: safeText(100).min(1, "First name is required."),
  lastName: safeText(100).min(1, "Last name is required."),
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema.optional().or(z.literal("")),
  country: safeText(100).optional().or(z.literal("")),
  location: safeText(140).optional().or(z.literal("")),
  acceptTerms: z.literal(true, {
    message: "You must accept the terms to continue.",
  }),
});

export const registerEmployerSchema = z.object({
  organizationName: safeText(200).min(2, "Company name is required."),
  contactName: safeText(140).min(1, "Your name is required."),
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema.optional().or(z.literal("")),
  website: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  industry: safeText(120).optional().or(z.literal("")),
  country: safeText(100).optional().or(z.literal("")),
  acceptTerms: z.literal(true, {
    message: "You must accept the terms to continue.",
  }),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required.").max(200),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const contactSchema = z.object({
  name: safeText(140).min(1, "Your name is required."),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal("")),
  company: safeText(160).optional().or(z.literal("")),
  interest: z.enum(["employer", "candidate", "other"]),
  message: safeText(5000).min(10, "Please provide a little more detail."),
  consent: z.literal(true, {
    message: "Please confirm consent to be contacted.",
  }),
});

export const jobSchema = z
  .object({
    title: safeText(200).min(3, "Job title is required."),
    summary: safeText(400).optional().or(z.literal("")),
    description: safeText(20000).min(20, "Description is required."),
    responsibilities: safeText(20000).optional().or(z.literal("")),
    requirements: safeText(20000).optional().or(z.literal("")),
    employmentType: z.enum(["remote", "hybrid", "onsite"]),
    location: safeText(140).optional().or(z.literal("")),
    country: safeText(100).optional().or(z.literal("")),
    department: safeText(120).optional().or(z.literal("")),
    industry: safeText(120).optional().or(z.literal("")),
    salaryMin: z.coerce.number().int().nonnegative().optional(),
    salaryMax: z.coerce.number().int().nonnegative().optional(),
    currency: z.string().trim().max(8).optional().or(z.literal("")),
    skills: z.string().trim().max(1000).optional().or(z.literal("")),
    applicationDeadline: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format.")
      .optional()
      .or(z.literal("")),
    status: z.enum(["draft", "published", "closed", "archived"]),
  })
  .refine(
    (v) =>
      v.salaryMin === undefined ||
      v.salaryMax === undefined ||
      v.salaryMax >= v.salaryMin,
    { message: "Maximum salary must be greater than or equal to minimum.", path: ["salaryMax"] }
  );

export const applicationSchema = z.object({
  jobId: z.string().uuid(),
  coverLetter: safeText(8000).optional().or(z.literal("")),
  contactEmail: emailSchema,
  contactPhone: phoneSchema,
  useProfileResume: z.coerce.boolean().optional(),
  consent: z.literal(true, {
    message: "Please confirm the information is accurate.",
  }),
});

export const candidateProfileSchema = z.object({
  firstName: safeText(100).min(1, "First name is required."),
  lastName: safeText(100).min(1, "Last name is required."),
  phone: phoneSchema.optional().or(z.literal("")),
  headline: safeText(160).optional().or(z.literal("")),
  summary: safeText(5000).optional().or(z.literal("")),
  location: safeText(140).optional().or(z.literal("")),
  country: safeText(100).optional().or(z.literal("")),
  linkedinUrl: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  skills: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const organizationProfileSchema = z.object({
  name: safeText(200).min(2, "Company name is required."),
  website: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  industry: safeText(120).optional().or(z.literal("")),
  companySize: safeText(60).optional().or(z.literal("")),
  description: safeText(5000).optional().or(z.literal("")),
  country: safeText(100).optional().or(z.literal("")),
  city: safeText(120).optional().or(z.literal("")),
  contactEmail: emailSchema.optional().or(z.literal("")),
  contactPhone: phoneSchema.optional().or(z.literal("")),
});

export const hiringRequestSchema = z.object({
  title: safeText(200).min(3, "Role title is required."),
  description: safeText(8000).min(20, "Please describe the requirement."),
  rolesNeeded: z.coerce.number().int().min(1).max(5000),
  employmentType: z.enum(["remote", "hybrid", "onsite"]),
  location: safeText(140).optional().or(z.literal("")),
  country: safeText(100).optional().or(z.literal("")),
  industry: safeText(120).optional().or(z.literal("")),
  budgetMin: z.coerce.number().int().nonnegative().optional(),
  budgetMax: z.coerce.number().int().nonnegative().optional(),
  currency: z.string().trim().max(8).optional().or(z.literal("")),
  urgency: z.enum(["low", "medium", "high", "critical"]),
});

export const reviewSchema = z.object({
  authorName: safeText(120).min(2, "Please enter your name."),
  authorEmail: emailSchema,
  rating: z.coerce.number().int().min(1, "Select a rating.").max(5),
  category: z.enum(["candidate", "employer", "service"]),
  body: safeText(4000).min(20, "Please write at least 20 characters."),
  consent: z.literal(true, {
    message: "Please confirm this is your genuine experience.",
  }),
});

export const reviewReportSchema = z.object({
  reviewId: z.string().uuid(),
  reason: safeText(1000).min(10, "Please describe the issue."),
  reporterEmail: emailSchema.optional().or(z.literal("")),
});

export const articleSchema = z.object({
  title: safeText(220).min(3, "Title is required."),
  excerpt: safeText(400).optional().or(z.literal("")),
  body: safeText(40000).min(50, "Article body is required."),
  category: safeText(120).optional().or(z.literal("")),
  coverImage: z.string().trim().max(300).optional().or(z.literal("")),
  authorName: safeText(140).optional().or(z.literal("")),
  status: z.enum(["draft", "published"]),
});

export const applicationStatusSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum([
    "submitted",
    "under_review",
    "shortlisted",
    "interview",
    "offered",
    "hired",
    "rejected",
    "withdrawn",
  ]),
  note: safeText(1000).optional().or(z.literal("")),
});

export function splitList(value: string | undefined | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50);
}

export function flattenZodError(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
