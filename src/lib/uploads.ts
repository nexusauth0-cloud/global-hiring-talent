import "server-only";
import { readFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";
import {
  env,
  MAX_UPLOAD_BYTES,
  ALLOWED_RESUME_MIME_TYPES,
  ALLOWED_RESUME_EXTENSIONS,
} from "@/lib/config";

const MAGIC: Array<{ mime: string; bytes: number[] }> = [
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mime: "application/msword", bytes: [0xd0, 0xcf, 0x11, 0xe0] },
  { mime: "application/zip", bytes: [0x50, 0x4b, 0x03, 0x04] }, // docx is zip
];

export type ValidatedUpload = {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  buffer: Buffer;
};

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadError";
  }
}

function extensionOf(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.slice(idx).toLowerCase() : "";
}

function detectMime(buffer: Buffer): string | null {
  for (const sig of MAGIC) {
    if (sig.bytes.every((b, i) => buffer[i] === b)) return sig.mime;
  }
  return null;
}

export function validateResumeFile(file: {
  name: string;
  size: number;
  buffer: Buffer;
}): ValidatedUpload {
  if (!file.name || file.size <= 0) {
    throw new UploadError("The uploaded file is empty.");
  }
  if (file.buffer.length > MAX_UPLOAD_BYTES) {
    throw new UploadError(
      `File exceeds the maximum size of ${Math.floor(MAX_UPLOAD_BYTES / 1024 / 1024)} MB.`
    );
  }
  const ext = extensionOf(file.name);
  if (!ALLOWED_RESUME_EXTENSIONS.includes(ext as (typeof ALLOWED_RESUME_EXTENSIONS)[number])) {
    throw new UploadError("Only PDF, DOC and DOCX resume files are allowed.");
  }
  const detected = detectMime(file.buffer);
  if (!detected) {
    throw new UploadError("The file content could not be recognised as a document.");
  }
  let mimeType: string;
  if (detected === "application/zip") {
    if (ext !== ".docx") {
      throw new UploadError("The file extension does not match its content.");
    }
    mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  } else if (detected === "application/msword") {
    if (ext !== ".doc") {
      throw new UploadError("The file extension does not match its content.");
    }
    mimeType = detected;
  } else {
    if (ext !== ".pdf") {
      throw new UploadError("The file extension does not match its content.");
    }
    mimeType = detected;
  }
  if (!ALLOWED_RESUME_MIME_TYPES.includes(mimeType as (typeof ALLOWED_RESUME_MIME_TYPES)[number])) {
    throw new UploadError("Unsupported document type.");
  }

  const storageKey = `${randomUUID()}${ext}`;
  return {
    originalName: file.name.slice(0, 200),
    mimeType,
    sizeBytes: file.buffer.length,
    storageKey,
    buffer: file.buffer,
  };
}

/**
 * New uploads are stored in PostgreSQL (`documents.data`, a `bytea` column)
 * so they survive on serverless hosts such as Vercel. The filesystem helpers
 * below are a read-only fallback for documents created before that change,
 * whose bytes still live under `UPLOAD_DIR`.
 */
function uploadRoot(): string {
  return resolve(process.cwd(), env.UPLOAD_DIR);
}

function resolveKey(storageKey: string): string {
  const root = uploadRoot();
  const full = resolve(join(root, storageKey));
  if (full !== root && !full.startsWith(root + sep)) {
    throw new UploadError("Invalid storage key.");
  }
  return full;
}

export async function readStoredFile(storageKey: string): Promise<Buffer> {
  return readFile(resolveKey(storageKey));
}
