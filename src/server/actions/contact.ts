"use server";

import { db } from "@/lib/db";
import { contactInquiries } from "@/db/schema";
import { recordAudit } from "@/lib/audit";
import { sendNotification } from "@/lib/email/adapter";
import { rateLimit } from "@/lib/rate-limit";
import { rateLimitKey } from "@/lib/request";
import { contactSchema, flattenZodError } from "@/lib/validation/schemas";
import { company } from "@/lib/config";
import { ok, fail, type ActionResult } from "@/server/action-result";

export async function submitContactAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    company: formData.get("company") ?? "",
    interest: formData.get("interest"),
    message: formData.get("message"),
    consent: formData.get("consent") === "on",
  });
  if (!parsed.success) {
    return fail("Please correct the highlighted fields.", flattenZodError(parsed.error));
  }
  const data = parsed.data;

  const key = await rateLimitKey("contact", data.email);
  if (!rateLimit(key, 5, 60 * 60 * 1000).allowed) {
    return fail(
      "Too many enquiries submitted. Please try again later.",
      undefined,
      "RATE_LIMITED"
    );
  }

  let inquiryId = "";
  try {
    const [row] = await db
      .insert(contactInquiries)
      .values({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        interest: data.interest,
        message: data.message,
      })
      .returning({ id: contactInquiries.id });
    inquiryId = row.id;
  } catch {
    return fail("We could not record your enquiry. Please try again.");
  }

  // Delivery failures never lose the stored enquiry.
  if (company.hasRealContactEmail) {
    await sendNotification({
      template: "contact_inquiry_received",
      to: data.email,
      meta: { inquiryId },
      data: { name: data.name },
    });
  }

  await recordAudit({
    action: "contact.inquiry_created",
    targetType: "contact_inquiry",
    targetId: inquiryId,
    metadata: { interest: data.interest },
  });

  return ok(
    "Thank you — your enquiry has been recorded and our team will respond as soon as possible."
  );
}
