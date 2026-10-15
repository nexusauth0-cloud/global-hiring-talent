import { describe, it, expect } from "vitest";
import { validateResumeFile, UploadError } from "@/lib/uploads";
import { MAX_UPLOAD_BYTES } from "@/lib/config";

function pdfBuffer(extra = 100): Buffer {
  const head = Buffer.from("%PDF-1.4\n");
  return Buffer.concat([head, Buffer.alloc(extra, 0x20)]);
}

describe("validateResumeFile", () => {
  it("accepts a PDF whose extension matches its content", () => {
    const buf = pdfBuffer();
    const result = validateResumeFile({ name: "cv.pdf", size: buf.length, buffer: buf });
    expect(result.mimeType).toBe("application/pdf");
    expect(result.storageKey.endsWith(".pdf")).toBe(true);
  });

  it("accepts a DOCX (zip) with .docx extension", () => {
    const buf = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x03, 0x04]),
      Buffer.alloc(50, 0),
    ]);
    const result = validateResumeFile({
      name: "cv.docx",
      size: buf.length,
      buffer: buf,
    });
    expect(result.mimeType).toContain("wordprocessingml");
  });

  it("rejects an extension that does not match the content", () => {
    const buf = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x03, 0x04]),
      Buffer.alloc(50, 0),
    ]);
    expect(() =>
      validateResumeFile({ name: "cv.pdf", size: buf.length, buffer: buf })
    ).toThrow(UploadError);
  });

  it("rejects unsupported extensions", () => {
    const buf = pdfBuffer();
    expect(() =>
      validateResumeFile({ name: "cv.txt", size: buf.length, buffer: buf })
    ).toThrow(UploadError);
  });

  it("rejects an empty file", () => {
    expect(() =>
      validateResumeFile({ name: "cv.pdf", size: 0, buffer: Buffer.alloc(0) })
    ).toThrow(UploadError);
  });

  it("rejects files larger than the configured maximum", () => {
    const buf = Buffer.concat([
      Buffer.from("%PDF-1.4\n"),
      Buffer.alloc(MAX_UPLOAD_BYTES + 1, 0x20),
    ]);
    expect(() =>
      validateResumeFile({ name: "cv.pdf", size: buf.length, buffer: buf })
    ).toThrow(UploadError);
  });
});
