# Deployment Guide

## Prerequisites
- PostgreSQL database (Neon/Render/Supabase etc)
- Vercel account (or other hosting)
- SMTP provider (or leave empty; emails will be recorded as skipped)
- No external storage needed: CVs are stored in PostgreSQL (`documents.data`, `bytea`).

## Environment Variables
Set these in Vercel (and locally in `.env`):

| Variable | Notes |
|---|---|
| `NODE_ENV` | `production` in prod |
| `DATABASE_URL` | Production PostgreSQL URL |
| `AUTH_SECRET` | Long random string (>=32 chars) |
| `SMTP_URL` | Optional SMTP connection string |
| `FORMSUBMIT_EMAIL` | Optional FormSubmit target |
| `RECRUITMENT_NOTIFY_EMAIL` | Internal mailbox for application/hiring notifications; falls back to a real `COMPANY_EMAIL` |
| `EMAIL_VERIFICATION_ENFORCED` | `false` (default) or `true`. Keep `false` until email delivery works, then enable to block unverified self-service accounts |
| `UPLOAD_DIR` | Legacy read path only; new CVs are stored in PostgreSQL |
| `COMPANY_NAME` | Optional; defaults to placeholder if not set |
| `COMPANY_EMAIL` | Must be configured for real contact; currently placeholders in config |
| `COMPANY_PHONE` | Placeholder-safe |
| `COMPANY_ADDRESS` | Placeholder-safe |
| `COMPANY_WEBSITE` | Placeholder-safe |
| `COMPANY_DOMAIN` | Placeholder-safe |
| `COMPANY_REGISTRATION` | Placeholder-safe |

Notes:
- Auth uses scrypt password hashes and SHA-256 session tokens in DB; cookie is `ght_session` (14 days).
- No public admin signup — use `npm run create-admin` against the production DB.
- Emails: if SMTP/forFormSubmit not configured, attempts are logged to `notifications` with `skipped` status; the app never fabricates delivery.
- Rate limiting is in-memory per process (documented limitation for serverless).
- Uploads: magic-byte + extension + MIME validation; bytes stored in PostgreSQL (`documents.data`); private, authorization-checked download route. `UPLOAD_DIR` is only read for legacy files created before the bytea migration.
- Email verification for self-service accounts (candidate and employer) is gated by `EMAIL_VERIFICATION_ENFORCED`. While it is `false` (default), unverified accounts can use their dashboards normally and verification stays optional — this avoids locking out accounts before email delivery is configured. Set `EMAIL_VERIFICATION_ENFORCED=true` once emails can be delivered: unverified accounts can still sign in and resend a link, but dashboards and protected actions are blocked until verified. Staff accounts (admin/recruiter) are always treated as verified.
- Resending a verification link, or requesting a new password reset, invalidates earlier unused links.

## Database Setup
1. Provision PostgreSQL
2. Run migrations: `npm run db:migrate` (or set env and run `tsx scripts/migrate.ts`)
3. Create admin: `npm run create-admin` (follow prompts)
4. (Optional) Seed dev data: `npm run db:seed` (disabled in production by design)

## Build & Deploy (Vercel)
1. Connect repo to Vercel
2. Set environment variables
3. Build command: `npm run build`
4. Start command: `npm run start` (or let Vercel use Next.js defaults)
5. Ensure `DATABASE_URL` is accessible from Vercel
6. Deploy

## Verification
- Health: `/api/health` returns 200 with DB ok
- Smoke: `/`, `/jobs`, `/contact`, `/login` return 200
- Protected routes redirect to login (307)
- Typecheck/lint/build/tests all pass

## Important Notes
- The project is honest about contact details — placeholders are centralised in `src/lib/config.ts`; do not invent real company info.
- Image assets validated via `npm run verify-images`; subject-matter needs human review (see `docs/IMAGE-ASSET-PLAN.md`).
- Playwright e2e specs can run against a preview deployment or local server.
