import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs, organizations, users } from "@/db/schema";
import {
  getJobBySlug,
  getPublicStats,
  listPublishedJobs,
} from "@/lib/queries";

const suffix = Math.random().toString(36).slice(2, 9);
let organizationId = "";
let jobId = "";
const slug = `integration-role-${suffix}`;

beforeAll(async () => {
  const [org] = await db
    .insert(organizations)
    .values({
      name: `Integration Org ${suffix}`,
      slug: `integration-org-${suffix}`,
      status: "approved",
    })
    .returning({ id: organizations.id });
  organizationId = org.id;

  const [job] = await db
    .insert(jobs)
    .values({
      organizationId,
      slug,
      title: "Integration Test Role",
      description: "A role created by the integration test suite.",
      employmentType: "remote",
      status: "published",
      publishedAt: new Date(),
    })
    .returning({ id: jobs.id });
  jobId = job.id;
});

afterAll(async () => {
  if (jobId) await db.delete(jobs).where(eq(jobs.id, jobId));
  if (organizationId) await db.delete(organizations).where(eq(organizations.id, organizationId));
});

describe("public job queries", () => {
  it("includes a published job for an approved organisation in listPublishedJobs", async () => {
    const result = await listPublishedJobs({ q: "Integration Test Role" });
    expect(result.jobs.some((j) => j.slug === slug)).toBe(true);
    expect(result.total).toBeGreaterThanOrEqual(1);
  });

  it("loads the job by slug", async () => {
    const row = await getJobBySlug(slug);
    expect(row?.job.title).toBe("Integration Test Role");
    expect(row?.organization.name).toContain("Integration Org");
  });

  it("counts the published job in public stats", async () => {
    const stats = await getPublicStats();
    expect(stats.openJobs).toBeGreaterThanOrEqual(1);
    expect(stats.approvedOrganizations).toBeGreaterThanOrEqual(1);
  });
});

describe("data integrity", () => {
  it("enforces a unique email (case-insensitive)", async () => {
    const email = `Dup-${suffix}@Example.com`;
    const [user] = await db
      .insert(users)
      .values({ email, role: "candidate" })
      .returning({ id: users.id });

    await expect(
      db.insert(users).values({ email: email.toLowerCase(), role: "candidate" })
    ).rejects.toThrow();

    await db.delete(users).where(eq(users.id, user.id));
  });

  it("rejects a job with a max salary below the min", async () => {
    await expect(
      db.insert(jobs).values({
        organizationId,
        slug: `bad-salary-${suffix}`,
        title: "Bad Salary",
        description: "Should fail the check constraint.",
        employmentType: "onsite",
        salaryMin: 90000,
        salaryMax: 10000,
      })
    ).rejects.toThrow();
  });
});
