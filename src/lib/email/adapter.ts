import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notifications } from "@/db/schema";
import { env, company } from "@/lib/config";
import {
  renderEmail,
  type EmailTemplate,
  type TemplateData,
} from "@/lib/email/templates";

export type DeliveryResult = {
  status: "sent" | "failed" | "skipped";
  provider: string;
  providerMessageId?: string;
  error?: string;
  notificationId: string;
};

type ProviderName = "smtp" | "formsubmit" | "outbox";

function selectProvider(): ProviderName {
  if (env.SMTP_URL) return "smtp";
  if (env.FORMSUBMIT_EMAIL) return "formsubmit";
  return "outbox";
}

async function sendViaSmtp(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<{ id?: string }> {
  const nodemailer = (await import("nodemailer")).default;
  const transport = nodemailer.createTransport(env.SMTP_URL);
  const from = env.SMTP_FROM || `${company.name} <no-reply@${company.domain}>`;
  const info = await transport.sendMail({ from, to, subject, html, text });
  return { id: info.messageId };
}

async function sendViaFormSubmit(
  to: string,
  subject: string,
  text: string
): Promise<{ id?: string; error?: string }> {
  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      _subject: subject,
      _template: "box",
      _captcha: "false",
      message: text,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    return { error: `FormSubmit responded ${res.status}` };
  }
  const data = (await res.json().catch(() => ({}))) as { success?: string | boolean };
  if (data.success === false || data.success === "false") {
    return { error: "FormSubmit reported failure" };
  }
  return { id: typeof data.success === "string" ? data.success : undefined };
}

/**
 * Sends an email and records an honest delivery record. It never throws for
 * delivery failures: the caller's business operation must not be lost because
 * an email provider is unavailable.
 */
export async function sendNotification(params: {
  template: EmailTemplate;
  to: string;
  data: TemplateData;
  userId?: string | null;
  meta?: Record<string, unknown>;
}): Promise<DeliveryResult> {
  const { subject, html, text } = renderEmail(params.template, params.data);

  const [record] = await db
    .insert(notifications)
    .values({
      userId: params.userId ?? null,
      toEmail: params.to,
      template: params.template,
      subject,
      status: "sending",
      meta: (params.meta ?? {}) as Record<string, unknown>,
    })
    .returning({ id: notifications.id });

  const notificationId = record.id;
  const provider = selectProvider();

  try {
    if (provider === "outbox") {
      await db
        .update(notifications)
        .set({
          status: "skipped",
          provider: "outbox",
          error: "No email provider configured (set SMTP_URL or FORMSUBMIT_EMAIL).",
        })
        .where(eq(notifications.id, notificationId));
      return {
        status: "skipped",
        provider: "outbox",
        error: "No email provider configured.",
        notificationId,
      };
    }

    if (provider === "smtp") {
      const result = await sendViaSmtp(params.to, subject, html, text);
      await db
        .update(notifications)
        .set({
          status: "sent",
          provider: "smtp",
          providerMessageId: result.id ?? null,
          sentAt: new Date(),
        })
        .where(eq(notifications.id, notificationId));
      return {
        status: "sent",
        provider: "smtp",
        providerMessageId: result.id,
        notificationId,
      };
    }

    const result = await sendViaFormSubmit(params.to, subject, text);
    if (result.error) {
      await db
        .update(notifications)
        .set({ status: "failed", provider: "formsubmit", error: result.error })
        .where(eq(notifications.id, notificationId));
      return {
        status: "failed",
        provider: "formsubmit",
        error: result.error,
        notificationId,
      };
    }
    await db
      .update(notifications)
      .set({
        status: "sent",
        provider: "formsubmit",
        providerMessageId: result.id ?? null,
        sentAt: new Date(),
      })
      .where(eq(notifications.id, notificationId));
    return {
      status: "sent",
      provider: "formsubmit",
      providerMessageId: result.id,
      notificationId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    await db
      .update(notifications)
      .set({ status: "failed", provider, error: message.slice(0, 500) })
      .where(eq(notifications.id, notificationId));
    return { status: "failed", provider, error: message, notificationId };
  }
}
