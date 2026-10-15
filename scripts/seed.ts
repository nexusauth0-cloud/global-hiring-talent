#!/usr/bin/env tsx
import { db } from "../src/lib/db";
import { organizations, jobs, users, candidates, reviews } from "../src/db/schema";
import { hashPassword } from "../src/lib/auth/password";
import { eq, or } from "drizzle-orm";


async function main() {


  const suffix = Math.random().toString(36).slice(2, 8);
  console.log("Seeding demo data...");

  const [admin] = await db
    .insert(users)
    .values({
      email: `admin.${suffix}@example.com`,
      role: "admin",
      passwordHash: await hashPassword("AdminPass9"),
      isActive: true,
    })
    .onConflictDoNothing()
    .returning({ id: users.id });
  console.log("admin:", admin?.id);

  const [employerUser] = await db
    .insert(users)
    .values({
      email: `employer.${suffix}@example.com`,
      role: "employer",
      passwordHash: await hashPassword("EmployerPass9"),
      isActive: true,
    })
    .onConflictDoNothing()
    .returning({ id: users.id });

  const [org] = await db
    .insert(organizations)
    .values({
      slug: `acme-demo-${suffix}`,
      name: "Acme Demo Ltd",
      status: "approved",

    })
    .onConflictDoNothing()
    .returning({ id: organizations.id });

  if (employerUser && org) {
    // link via email match if needed; keep minimal
  }

  const [candidateUser] = await db
    .insert(users)
    .values({
      email: `candidate.${suffix}@example.com`,
      role: "candidate",
      passwordHash: await hashPassword("CandidatePass9"),
      isActive: true,
    })
    .onConflictDoNothing()
    .returning({ id: users.id });

  const [cand] = await db
    .insert(candidates)
    .values({
      userId: candidateUser!.id,
      firstName: "Jordan",
      lastName: "Taylor",
    })
    .onConflictDoNothing()
    .returning({ id: candidates.id });

  const [job] = await db
    .insert(jobs)
    .values({
      organizationId: org!.id,
      slug: `demo-role-${suffix}`,
      title: "Demo Frontend Engineer",
      description: "Demo job created by seed script for integration testing.",
      summary: "Demo frontend role",
      employmentType: "remote",
      status: "published",
      publishedAt: new Date(),
      skills: ["TypeScript", "Next.js"],
    })
    .onConflictDoNothing()
    .returning({ id: jobs.id });

  const [review] = await db
    .insert(reviews)
    .values({
      authorName: "Jordan Taylor",
      authorEmail: `candidate.${suffix}@example.com`,
      rating: 5,
      category: "employer",
      body: "This is demo feedback for testing only. Do not use as a real testimonial.",
      status: "approved",
    })
    .onConflictDoNothing()
    .returning({ id: reviews.id });

  console.log("Seed complete:");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
