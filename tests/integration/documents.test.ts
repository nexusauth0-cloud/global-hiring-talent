import { describe, it, expect, afterAll } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { documents, users } from "@/db/schema";

const suffix = Math.random().toString(36).slice(2, 9);
let ownerId = "";

afterAll(async () => {
  if (ownerId) await db.delete(users).where(eq(users.id, ownerId));
});

describe("CV document storage (bytea)", () => {
  it("stores and returns the exact bytes in documents.data", async () => {
    const [owner] = await db
      .insert(users)
      .values({ email: `doc-owner-${suffix}@example.com`, role: "candidate" })
      .returning({ id: users.id });
    ownerId = owner.id;

    const bytes = Buffer.concat([
      Buffer.from("%PDF-1.4\n"),
      Buffer.from(`document-${suffix}`),
    ]);

    const [doc] = await db
      .insert(documents)
      .values({
        ownerUserId: owner.id,
        kind: "resume",
        storageKey: `${suffix}.pdf`,
        data: bytes,
        originalName: "cv.pdf",
        mimeType: "application/pdf",
        sizeBytes: bytes.length,
      })
      .returning({ id: documents.id });

    const [row] = await db
      .select({ data: documents.data, sizeBytes: documents.sizeBytes })
      .from(documents)
      .where(eq(documents.id, doc.id))
      .limit(1);

    expect(row).toBeTruthy();
    const stored = Buffer.from(row.data as Buffer);
    expect(stored.length).toBe(bytes.length);
    expect(stored.equals(bytes)).toBe(true);
    expect(row.sizeBytes).toBe(bytes.length);
  });
});
