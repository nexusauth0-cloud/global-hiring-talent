import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from "@/lib/auth/password";

describe("password hashing", () => {
  it("produces a scrypt-formatted hash", async () => {
    const hash = await hashPassword("CorrectHorse1");
    expect(hash).toMatch(/^scrypt\$\d+\$\d+\$\d+\$[^$]+\$[^$]+$/);
  });

  it("verifies the correct password and rejects a wrong one", async () => {
    const hash = await hashPassword("CorrectHorse1");
    expect(await verifyPassword("CorrectHorse1", hash)).toBe(true);
    expect(await verifyPassword("wrongpassword", hash)).toBe(false);
  });

  it("rejects malformed or missing stored hashes", async () => {
    expect(await verifyPassword("x", null)).toBe(false);
    expect(await verifyPassword("x", "not-a-hash")).toBe(false);
    expect(await verifyPassword("x", "scrypt$0$0$0$a$b")).toBe(false);
  });
});

describe("password strength", () => {
  it("rejects short passwords", () => {
    expect(validatePasswordStrength("abc1").ok).toBe(false);
  });
  it("rejects passwords without a digit", () => {
    expect(validatePasswordStrength("onlyletters").ok).toBe(false);
  });
  it("rejects common passwords", () => {
    expect(validatePasswordStrength("password123").ok).toBe(false);
  });
  it("accepts a strong password", () => {
    expect(validatePasswordStrength("StrongPass9").ok).toBe(true);
  });
});
