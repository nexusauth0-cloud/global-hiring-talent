import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  applications,
  documents,
  employers,
  jobs,
} from "@/db/schema";
import { getAuthContext } from "@/lib/auth/session";
import { readStoredFile } from "@/lib/uploads";

export const dynamic = "force-dynamic";

async function canAccess(
  userId: string,
  role: string,
  documentId: string,
  ownerUserId: string
): Promise<boolean> {
  if (ownerUserId === userId) return true;
  if (role === "admin" || role === "recruiter") return true;

  if (role === "employer") {
    const rows = await db
      .select({ id: applications.id })
      .from(applications)
      .innerJoin(jobs, eq(jobs.id, applications.jobId))
      .innerJoin(employers, eq(employers.organizationId, jobs.organizationId))
      .where(
        and(
          eq(applications.resumeDocumentId, documentId),
          eq(employers.userId, userId)
        )
      )
      .limit(1);
    return rows.length > 0;
  }

  return false;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const ctx = await getAuthContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);
  const doc = rows[0];
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!(await canAccess(ctx.user.id, ctx.user.role, doc.id, doc.ownerUserId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let buffer: Buffer;
  if (doc.data && doc.data.length > 0) {
    buffer = Buffer.from(doc.data);
  } else {
    try {
      buffer = await readStoredFile(doc.storageKey);
    } catch {
      return NextResponse.json(
        { error: "The document could not be retrieved." },
        { status: 404 }
      );
    }
  }

  const safeName = (doc.originalName ?? "document").replace(/"/g, "");
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Length": String(buffer.length),
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
