import { company, siteUrl } from "@/lib/config";

export type EmailTemplate =
  | "application_received"
  | "application_status_changed"
  | "internal_application_notice"
  | "employer_inquiry_received"
  | "internal_hiring_request_notice"
  | "contact_inquiry_received"
  | "email_verification"
  | "password_reset"
  | "password_changed"
  | "review_received";

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

function layout(heading: string, bodyHtml: string, footNote?: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1c2530;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px 12px;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e2e8ee;">
          <tr>
            <td style="background:#0b2b4a;padding:20px 28px;">
              <span style="color:#ffffff;font-size:18px;font-weight:bold;letter-spacing:0.3px;">${escapeHtml(
                company.name
              )}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;color:#0b2b4a;">${escapeHtml(
                heading
              )}</h1>
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px;background:#f8fafc;border-top:1px solid #e2e8ee;font-size:12px;color:#5b6b7c;">
              ${footNote ? `<p style="margin:0 0 8px;">${escapeHtml(footNote)}</p>` : ""}
              <p style="margin:0;">This message was sent by ${escapeHtml(
                company.name
              )}. Please do not reply directly to this automated email.</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;">${escapeHtml(
    text
  )}</p>`;
}

function button(label: string, href: string): string {
  return `<p style="margin:20px 0;"><a href="${escapeHtml(
    href
  )}" style="display:inline-block;background:#0b6bcb;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-size:15px;font-weight:bold;">${escapeHtml(
    label
  )}</a></p>`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type TemplateData = Record<string, string>;

export function renderEmail(
  template: EmailTemplate,
  data: TemplateData
): RenderedEmail {
  switch (template) {
    case "application_received": {
      const subject = `Application received – ${data.jobTitle}`;
      return {
        subject,
        html: layout(
          "We received your application",
          p(`Hello ${data.candidateName},`) +
            p(
              `Thank you for applying for the ${data.jobTitle} role at ${company.name}. Your application reference is ${data.applicationRef}.`
            ) +
            p(
              "Our recruitment team will review your details and contact you if your profile matches the requirements. You can track your application status from your candidate dashboard."
            ) +
            button("View your applications", `${siteUrl}/candidate/applications`)
        ),
        text: [
          `Hello ${data.candidateName},`,
          `Thank you for applying for the ${data.jobTitle} role at ${company.name}.`,
          `Your application reference is ${data.applicationRef}.`,
          `Track your status: ${siteUrl}/candidate/applications`,
        ].join("\n\n"),
      };
    }
    case "application_status_changed": {
      const subject = `Application update – ${data.jobTitle}`;
      return {
        subject,
        html: layout(
          "Your application status changed",
          p(`Hello ${data.candidateName},`) +
            p(
              `The status of your application for ${data.jobTitle} is now: ${data.statusLabel}.`
            ) +
            (data.note ? p(`Note from the recruitment team: ${data.note}`) : "") +
            button("View your applications", `${siteUrl}/candidate/applications`)
        ),
        text: [
          `Hello ${data.candidateName},`,
          `Your application for ${data.jobTitle} is now: ${data.statusLabel}.`,
          data.note ? `Note: ${data.note}` : "",
          `View: ${siteUrl}/candidate/applications`,
        ]
          .filter(Boolean)
          .join("\n\n"),
      };
    }
    case "internal_application_notice": {
      const subject = `New application – ${data.jobTitle}`;
      const submitted = data.submittedAt
        ? new Date(data.submittedAt).toUTCString()
        : "just now";
      const details = [
        `Candidate: ${data.candidateName}`,
        `Email: ${data.candidateEmail}`,
        data.candidatePhone ? `Phone: ${data.candidatePhone}` : "",
        `Submitted: ${submitted}`,
        `Reference: ${data.applicationRef}`,
      ]
        .filter(Boolean)
        .join("\n");
      return {
        subject,
        html: layout(
          "New job application",
          p(`A new application was submitted for ${data.jobTitle}.`) +
            p(`Candidate: ${data.candidateName} (${data.candidateEmail})`) +
            (data.candidatePhone ? p(`Phone: ${data.candidatePhone}`) : "") +
            p(`Submitted: ${submitted}`) +
            p(`Reference: ${data.applicationRef}`) +
            (data.jobUrl ? button("View job posting", data.jobUrl) : "") +
            (data.cvUrl ? button("Download CV", data.cvUrl) : "") +
            button("Review in admin", `${siteUrl}/admin/applications`)
        ),
        text: [
          `New application for ${data.jobTitle}.`,
          details,
          data.jobUrl ? `Job posting: ${data.jobUrl}` : "",
          data.cvUrl ? `Download CV: ${data.cvUrl}` : "",
          `Review: ${siteUrl}/admin/applications`,
        ]
          .filter(Boolean)
          .join("\n\n"),
      };
    }
    case "employer_inquiry_received": {
      const subject = `We received your hiring request – ${data.requestTitle}`;
      return {
        subject,
        html: layout(
          "Hiring request received",
          p(`Hello ${data.contactName},`) +
            p(
              `Thank you for submitting a hiring request for "${data.requestTitle}" on behalf of ${data.organizationName}.`
            ) +
            p(
              "A consultant will review your requirement and follow up. You can track the status from your employer dashboard."
            ) +
            button("View your requests", `${siteUrl}/employer/requests`)
        ),
        text: [
          `Hello ${data.contactName},`,
          `We received your hiring request: ${data.requestTitle}.`,
          `Track it at: ${siteUrl}/employer/requests`,
        ].join("\n\n"),
      };
    }
    case "internal_hiring_request_notice": {
      const subject = `New hiring request – ${data.requestTitle}`;
      return {
        subject,
        html: layout(
          "New employer hiring request",
          p(`${data.organizationName} submitted a new hiring request.`) +
            p(`Title: ${data.requestTitle}`) +
            p(`Roles needed: ${data.rolesNeeded}`) +
            button("Review in admin", `${siteUrl}/admin/hiring-requests`)
        ),
        text: [
          `New hiring request from ${data.organizationName}.`,
          `Title: ${data.requestTitle}`,
          `Roles needed: ${data.rolesNeeded}`,
          `Review: ${siteUrl}/admin/hiring-requests`,
        ].join("\n\n"),
      };
    }
    case "contact_inquiry_received": {
      const subject = `We received your message`;
      return {
        subject,
        html: layout(
          "Thank you for contacting us",
          p(`Hello ${data.name},`) +
            p(
              `Thank you for contacting ${company.name}. Our team has received your enquiry and will respond as soon as possible.`
            )
        ),
        text: `Hello ${data.name},\n\nThank you for contacting ${company.name}. We will respond as soon as possible.`,
      };
    }
    case "email_verification": {
      const subject = `${company.name}: verify your email`;
      return {
        subject,
        html: layout(
          "Verify your email address",
          p(`Hello ${data.name},`) +
            p("Please confirm your email address to activate your account.") +
            button("Verify email", `${siteUrl}/verify-email?token=${data.token}`)
        ),
        text: `Verify your email: ${siteUrl}/verify-email?token=${data.token}`,
      };
    }
    case "password_reset": {
      const subject = `${company.name}: reset your password`;
      return {
        subject,
        html: layout(
          "Reset your password",
          p(`Hello ${data.name},`) +
            p(
              "A password reset was requested for your account. This link expires in 60 minutes. If you did not request this, you can ignore this email."
            ) +
            button("Reset password", `${siteUrl}/reset-password?token=${data.token}`)
        ),
        text: `Reset your password: ${siteUrl}/reset-password?token=${data.token}`,
      };
    }
    case "password_changed": {
      const subject = `${company.name}: your password was changed`;
      const when = data.changedAt
        ? new Date(data.changedAt).toUTCString()
        : "just now";
      return {
        subject,
        html: layout(
          "Your password was changed",
          p(`Hello ${data.name},`) +
            p(`The password for your ${company.name} account was changed on ${when}.`) +
            p(
              "If you made this change, no further action is needed. If you did not, your account may be compromised — please reset your password immediately and contact our team."
            )
        ),
        text: [
          `Hello ${data.name},`,
          `The password for your ${company.name} account was changed on ${when}.`,
          "If you did not make this change, reset your password immediately and contact our team.",
        ].join("\n\n"),
      };
    }
    case "review_received": {
      const subject = `Thank you for your review`;
      return {
        subject,
        html: layout(
          "Your review was received",
          p(`Hello ${data.authorName},`) +
            p(
              "Thank you for sharing your experience. Reviews are moderated before publication, so yours will appear once it has been reviewed by our team."
            )
        ),
        text: `Thank you for your review. It will appear once moderated.`,
      };
    }
  }
}
