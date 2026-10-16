import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  TEST_DATABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  AUTH_SECRET: z
    .string()
    .min(16, "AUTH_SECRET must be at least 16 characters")
    .default("dev-only-secret-change-me!!"),
  SMTP_URL: z.string().optional().default(""),
  SMTP_FROM: z.string().optional().default(""),
  FORMSUBMIT_EMAIL: z.string().optional().default(""),
  RECRUITMENT_NOTIFY_EMAIL: z.string().optional().default(""),
  EMAIL_VERIFICATION_ENFORCED: z.string().optional().default("false"),
  STORAGE_DRIVER: z.enum(["local"]).default("local"),
  UPLOAD_DIR: z.string().default("var/uploads"),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024),
  COMPANY_NAME: z.string().default("Global Hiring Talent"),
  COMPANY_EMAIL: z.string().default("contact@example.com"),
  COMPANY_PHONE: z.string().default("+00 000 000 0000"),
  COMPANY_ADDRESS: z.string().default("Address to be confirmed"),
  COMPANY_DOMAIN: z.string().default("globalhiringtalent.com"),
  COMPANY_REGISTRATION: z.string().default("Registration details to be confirmed"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  return parsed.data;
}

export const env: Env = loadEnv();

export const PLACEHOLDER_TOKENS = [
  "example.com",
  "to be confirmed",
  "change-me",
  "example.org",
];

export function isPlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  return PLACEHOLDER_TOKENS.some((t) => lower.includes(t));
}

export const company = {
  name: env.COMPANY_NAME,
  email: env.COMPANY_EMAIL,
  phone: env.COMPANY_PHONE,
  address: env.COMPANY_ADDRESS,
  domain: env.COMPANY_DOMAIN,
  registration: env.COMPANY_REGISTRATION,
  get hasRealContactEmail() {
    return !isPlaceholder(this.email);
  },
  get hasRealContactPhone() {
    return !isPlaceholder(this.phone);
  },
  get hasRealAddress() {
    return !isPlaceholder(this.address);
  },
  get hasRealRegistration() {
    return !isPlaceholder(this.registration);
  },
};

export const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

/**
 * Internal mailbox that should receive recruitment notifications (new
 * applications, hiring requests). Prefers the explicit
 * `RECRUITMENT_NOTIFY_EMAIL`; falls back to the company contact address only
 * when it is a real address (not a placeholder). Returns "" when nothing is
 * configured, in which case the notification is skipped and recorded honestly.
 */
export function recruitmentRecipient(): string {
  if (env.RECRUITMENT_NOTIFY_EMAIL) return env.RECRUITMENT_NOTIFY_EMAIL;
  if (!isPlaceholder(env.COMPANY_EMAIL)) return env.COMPANY_EMAIL;
  return "";
}

/**
 * Whether unverified candidate/employer accounts are blocked from their
 * dashboards and protected actions. Defaults to `false` so the feature can be
 * deployed safely before an email transport is available; enable (set
 * `EMAIL_VERIFICATION_ENFORCED=true`) only once verification emails can be
 * delivered, otherwise existing unverified users would be locked out.
 */
export function emailVerificationEnforced(): boolean {
  return ["1", "true", "yes", "on"].includes(
    env.EMAIL_VERIFICATION_ENFORCED.trim().toLowerCase()
  );
}

export const MAX_UPLOAD_BYTES = env.MAX_UPLOAD_BYTES;

export const ALLOWED_RESUME_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const ALLOWED_RESUME_EXTENSIONS = [".pdf", ".doc", ".docx"] as const;
