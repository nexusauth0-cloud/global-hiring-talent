import { describe, it, expect } from "vitest";
import {
  requiresEmailVerification,
  needsEmailVerification,
  VERIFICATION_REQUIRED_ROLES,
  roleDashboard,
} from "@/lib/auth/session";
import {
  recruitmentRecipient,
  emailVerificationEnforced,
  company,
} from "@/lib/config";

describe("requiresEmailVerification", () => {
  it("requires verification for candidate and employer accounts", () => {
    expect(requiresEmailVerification("candidate")).toBe(true);
    expect(requiresEmailVerification("employer")).toBe(true);
    expect(VERIFICATION_REQUIRED_ROLES).toEqual(["candidate", "employer"]);
  });

  it("does not require verification for provisioned staff accounts", () => {
    expect(requiresEmailVerification("admin")).toBe(false);
    expect(requiresEmailVerification("recruiter")).toBe(false);
  });
});

describe("needsEmailVerification", () => {
  it("blocks an unverified candidate/employer only when enforcement is on", () => {
    const unverified = { role: "candidate" as const, emailVerifiedAt: null };
    expect(needsEmailVerification(unverified, true)).toBe(true);
    expect(needsEmailVerification(unverified, false)).toBe(false);
  });

  it("never blocks verified accounts or provisioned staff", () => {
    const verified = { role: "candidate" as const, emailVerifiedAt: new Date() };
    expect(needsEmailVerification(verified, true)).toBe(false);
    expect(
      needsEmailVerification(
        { role: "admin" as const, emailVerifiedAt: null },
        true
      )
    ).toBe(false);
  });
});

describe("emailVerificationEnforced", () => {
  it("defaults to off so accounts are not locked out before email is configured", () => {
    expect(emailVerificationEnforced()).toBe(false);
  });
});

describe("roleDashboard", () => {
  it("maps each role to its dashboard", () => {
    expect(roleDashboard("candidate")).toBe("/candidate");
    expect(roleDashboard("employer")).toBe("/employer");
    expect(roleDashboard("admin")).toBe("/admin");
    expect(roleDashboard("recruiter")).toBe("/admin");
  });
});

describe("recruitmentRecipient", () => {
  it("returns empty when neither override nor real company email is configured", () => {
    // With the default test env, COMPANY_EMAIL is still a placeholder.
    if (!company.hasRealContactEmail) {
      expect(recruitmentRecipient()).toBe("");
    }
  });
});
