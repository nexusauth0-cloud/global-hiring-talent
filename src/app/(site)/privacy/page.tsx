import type { Metadata } from "next";
import { ProseText } from "@/components/content/ProseText";
import { PageHero } from "@/components/layout/PageHero";
import { company } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Global Hiring Talent collects, uses and protects personal information.",
};

const body = `## 1. About this policy

This Privacy Policy explains how ${company.name} ("we", "us", "our") collects, uses, stores and protects personal information when you use our website and services. We are committed to handling personal information lawfully, fairly and transparently.

This policy is a working document that must be reviewed and approved by the Company before public launch, and adapted where required to the jurisdictions in which the Company operates and to any applicable data protection legislation.

## 2. Information we collect

We collect the following categories of information:

- Account information: your name, email address, password (stored only as a secure hash) and role.
- Candidate information: contact details, CV and other documents you upload, employment history, skills and the contents of applications you submit.
- Employer information: organisation details, business contact information and hiring requirements you submit.
- Communications: messages sent through our contact form and email delivery records.
- Technical information: limited technical data such as a hashed form of your IP address, used for security, abuse prevention and rate limiting.

We aim to collect only the information necessary to provide our services.

## 3. How we use your information

We use your information to:

- Provide, operate and secure our website and services.
- Create and manage your account and authenticate your access.
- Process job applications and share them with the relevant hiring organisation where you apply.
- Respond to your enquiries.
- Send service-related notifications, including application confirmations and status updates.
- Detect, prevent and address fraud, abuse and security incidents.
- Comply with our legal obligations.

## 4. Legal bases

Where applicable law requires a legal basis, we process personal information on the basis of: the performance of a contract with you; your consent (for example, where you submit a review or accept these terms); our legitimate interests in operating and improving our services and preventing abuse; and compliance with legal obligations.

## 5. Sharing your information

We share candidate application information with the hiring organisation you choose to apply to. We use service providers to deliver email and to host and store data, and they process information on our behalf under appropriate safeguards. We do not sell your personal information.

## 6. Document storage and security

Documents you upload, such as CVs, are stored privately. They are not accessible through public URLs, and downloads are restricted to authorised users. We use access controls, password hashing, encrypted connections and other technical measures to protect your information.

## 7. Retention

We keep personal information only for as long as necessary for the purposes described in this policy, including to meet legal, accounting and reporting requirements. Application and account data are retained while your account is active and for a reasonable period afterwards, after which they are deleted or irreversibly anonymised.

## 8. Your rights

Depending on your location, you may have rights to access, correct, delete or restrict the processing of your personal information, to object to processing, and to data portability. You may also have the right to withdraw consent. To exercise these rights, contact us using the details below.

## 9. Cookies

We use a strictly necessary session cookie to keep you signed in. This cookie is HTTP-only and, in production, is only sent over secure connections. We do not use advertising cookies.

## 10. Changes to this policy

We may update this policy from time to time. Material changes will be communicated through our website. Please review this policy periodically.

## 11. Contact

For privacy questions or requests, contact us using the contact details published on our Contact page. Official contact details and the Company's registration information must be confirmed before public launch.`;

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        intro="Last updated: this policy is pending final review before public launch."
      />
      <div className="container-page py-12">
        {!company.hasRealContactEmail && (
          <p className="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <strong>Draft notice:</strong> Company contact details, registration
            information and jurisdiction-specific wording must be confirmed before
            this policy is published as final.
          </p>
        )}
        <ProseText text={body} className="prose-corporate" />
      </div>
    </>
  );
}
