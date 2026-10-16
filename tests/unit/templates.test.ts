import { describe, it, expect } from "vitest";
import { renderEmail, escapeHtml } from "@/lib/email/templates";
import { company } from "@/lib/config";

describe("escapeHtml", () => {
  it("escapes angle brackets, quotes and ampersands", () => {
    expect(escapeHtml(`<b>"x" & 'y'</b>`)).toBe(
      "&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;"
    );
  });
});

describe("password_changed template", () => {
  it("announces the change and includes the company name", () => {
    const { subject, html, text } = renderEmail("password_changed", {
      name: "Alex",
      changedAt: "2026-01-02T03:04:05.000Z",
    });
    expect(subject).toContain(company.name);
    expect(html).toContain("Alex");
    expect(html.toLowerCase()).toContain("password");
    expect(text).toContain("Alex");
  });
});

describe("internal_application_notice template", () => {
  it("includes candidate contact details, job and CV links", () => {
    const { html, text } = renderEmail("internal_application_notice", {
      candidateName: "Jamie Lee",
      candidateEmail: "jamie@example.com",
      candidatePhone: "+1 555 0100",
      jobTitle: "Site Reliability Engineer",
      jobUrl: "https://example.test/jobs/sre",
      applicationRef: "ABC12345",
      submittedAt: "2026-01-02T03:04:05.000Z",
      cvUrl: "https://example.test/api/documents/abc",
    });
    expect(html).toContain("jamie@example.com");
    expect(html).toContain("+1 555 0100");
    expect(html).toContain("https://example.test/jobs/sre");
    expect(html).toContain("https://example.test/api/documents/abc");
    expect(text).toContain("https://example.test/api/documents/abc");
  });

  it("escapes untrusted candidate input in the HTML body", () => {
    const { html, text } = renderEmail("internal_application_notice", {
      candidateName: "<script>alert(1)</script>",
      candidateEmail: "x@example.com",
      jobTitle: "Role",
      applicationRef: "REF",
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
    // Plain-text part is not HTML, so the raw value is retained there.
    expect(text).toContain("<script>alert(1)</script>");
  });
});

describe("email_verification template", () => {
  it("builds a verification link containing the token", () => {
    const { html, text } = renderEmail("email_verification", {
      name: "Sam",
      token: "tok_123ABC",
    });
    expect(html).toContain("/verify-email?token=tok_123ABC");
    expect(text).toContain("/verify-email?token=tok_123ABC");
  });
});
