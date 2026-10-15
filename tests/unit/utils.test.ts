import { describe, it, expect } from "vitest";
import {
  slugify,
  uniqueSlug,
  truncate,
  formatSalary,
  humanizeStatus,
  initials,
} from "@/lib/utils";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Senior Mechanical Engineer")).toBe("senior-mechanical-engineer");
  });
  it("strips accents and punctuation", () => {
    expect(slugify("Café & Co. — Ops")).toBe("cafe-co-ops");
  });
  it("trims leading/trailing hyphens", () => {
    expect(slugify("  hello world  ")).toBe("hello-world");
  });
});

describe("uniqueSlug", () => {
  it("returns the base slug when free", async () => {
    expect(await uniqueSlug("role", async () => false)).toBe("role");
  });
  it("appends a numeric suffix when taken", async () => {
    const taken = new Set(["role", "role-2"]);
    expect(await uniqueSlug("role", async (s) => taken.has(s))).toBe("role-3");
  });
});

describe("truncate", () => {
  it("leaves short strings untouched", () => {
    expect(truncate("abc", 5)).toBe("abc");
  });
  it("truncates and adds an ellipsis", () => {
    expect(truncate("abcdefghij", 5)).toBe("abcd…");
  });
});

describe("formatSalary", () => {
  it("formats a range", () => {
    expect(formatSalary(50000, 70000, "USD")).toContain("50,000");
    expect(formatSalary(50000, 70000, "USD")).toContain("70,000");
  });
  it("formats a minimum only", () => {
    expect(formatSalary(50000, null, "USD")).toMatch(/^From /);
  });
  it("returns null when both bounds are missing", () => {
    expect(formatSalary(null, null, "USD")).toBeNull();
  });
});

describe("humanizeStatus", () => {
  it("converts snake_case to Title Case", () => {
    expect(humanizeStatus("under_review")).toBe("Under Review");
  });
});

describe("initials", () => {
  it("takes up to two initials", () => {
    expect(initials("Jane Mary Doe")).toBe("JM");
  });
});
