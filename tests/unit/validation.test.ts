import { describe, it, expect } from "vitest";
import {
  registerCandidateSchema,
  registerEmployerSchema,
  contactSchema,
  jobSchema,
  hiringRequestSchema,
  articleSchema,
  applicationSchema,
} from "@/lib/validation/schemas";

describe("registerCandidateSchema", () => {
  it("accepts a valid payload and lowercases the email", () => {
    const parsed = registerCandidateSchema.parse({
      firstName: "Jane",
      lastName: "Doe",
      email: "Jane.Doe@Example.com",
      password: "StrongPass9",
      acceptTerms: true,
    });
    expect(parsed.email).toBe("jane.doe@example.com");
  });

  it("requires accepting the terms", () => {
    const result = registerCandidateSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      password: "StrongPass9",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a weak password", () => {
    const result = registerCandidateSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      password: "short",
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("registerEmployerSchema", () => {
  it("rejects an invalid website URL", () => {
    const result = registerEmployerSchema.safeParse({
      organizationName: "Acme Ltd",
      contactName: "Sam",
      email: "sam@acme.com",
      password: "StrongPass9",
      website: "not a url",
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("contactSchema", () => {
  it("requires a message of at least 20 characters", () => {
    const result = contactSchema.safeParse({
      name: "Sam",
      email: "sam@example.com",
      interest: "employer",
      message: "too short",
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("jobSchema", () => {
  const base = {
    title: "Site Engineer",
    description: "A sufficiently long description of the role and duties.",
    employmentType: "onsite",
    status: "draft",
  };
  it("rejects a max salary below the min", () => {
    const result = jobSchema.safeParse({ ...base, salaryMin: 90000, salaryMax: 50000 });
    expect(result.success).toBe(false);
  });
  it("accepts a valid job", () => {
    expect(jobSchema.safeParse(base).success).toBe(true);
  });
});

describe("hiringRequestSchema", () => {
  it("coerces rolesNeeded and enforces the urgency enum", () => {
    const parsed = hiringRequestSchema.parse({
      title: "QA Lead",
      description: "We need a QA lead for a six month engagement.",
      rolesNeeded: "2",
      employmentType: "hybrid",
      urgency: "high",
    });
    expect(parsed.rolesNeeded).toBe(2);
  });
  it("rejects an invalid urgency", () => {
    const result = hiringRequestSchema.safeParse({
      title: "QA Lead",
      description: "We need a QA lead for a six month engagement.",
      rolesNeeded: 1,
      employmentType: "hybrid",
      urgency: "soon",
    });
    expect(result.success).toBe(false);
  });
});

describe("articleSchema", () => {
  it("requires a body of at least 50 characters", () => {
    const result = articleSchema.safeParse({
      title: "Hello",
      body: "too short",
      status: "draft",
    });
    expect(result.success).toBe(false);
  });
});

describe("applicationSchema", () => {
  it("requires consent and a uuid jobId", () => {
    const result = applicationSchema.safeParse({
      jobId: "not-a-uuid",
      contactEmail: "a@b.com",
      contactPhone: "+123456",
      consent: false,
    });
    expect(result.success).toBe(false);
  });
});
