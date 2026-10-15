import type { Metadata } from "next";
import { ProseText } from "@/components/content/ProseText";
import { PageHero } from "@/components/layout/PageHero";
import { company } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing use of Global Hiring Talent's website and services.",
};

const body = `## 1. Agreement

These Terms of Service ("Terms") govern your access to and use of the website and services provided by ${company.name} ("we", "us", "our"). By creating an account or using our services, you agree to these Terms.

These Terms are a working document that must be reviewed and approved by the Company before public launch.

## 2. Accounts

You must provide accurate information when creating an account and keep your credentials secure. You are responsible for activity carried out under your account. You must not share your account or impersonate another person or organisation. We may suspend or terminate accounts that breach these Terms.

## 3. Candidate obligations

If you use our services as a candidate, you confirm that the information and documents you submit are accurate and that you have the right to provide them. You must not submit false or misleading information.

## 4. Employer obligations

If you use our services as an employer, you confirm that your organisation is accurately identified, that you are authorised to submit hiring requirements, and that you will use candidate information only for legitimate recruitment purposes and in accordance with applicable law. Employer accounts and job postings may be reviewed before publication.

## 5. Acceptable use

You must not:

- Use the services for unlawful purposes or to discriminate unlawfully.
- Attempt to access data without authorisation or interfere with the security or integrity of the services.
- Upload malicious code or content that infringes the rights of others.
- Scrape, harvest or misuse personal information.
- Post reviews that are false, abusive, defamatory or not based on genuine experience.

## 6. Reviews

Reviews you submit must reflect your genuine experience. Reviews are moderated and may be edited for formatting or rejected. We may remove reviews that breach these Terms.

## 7. Intellectual property

The website, brand, content and software are owned by or licensed to us and are protected by applicable laws. You may not copy or redistribute protected material without permission.

## 8. Disclaimers

We work to keep information accurate but do not guarantee that all content is complete or error free. Job listings are provided by employers; we do not guarantee the availability, terms or outcome of any role. Our services are provided without warranties except where such warranties cannot be excluded by law.

## 9. Limitation of liability

To the extent permitted by law, we are not liable for indirect or consequential losses arising from your use of the services.

## 10. Changes

We may update these Terms from time to time. Continued use of the services after changes take effect constitutes acceptance of the updated Terms.

## 11. Contact

For questions about these Terms, contact us using the details published on our Contact page.`;

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        intro="Last updated: these terms are pending final review before public launch."
      />
      <div className="container-page py-12">
        <ProseText text={body} className="prose-corporate" />
      </div>
    </>
  );
}
