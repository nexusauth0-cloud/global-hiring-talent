import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { Card, CardBody } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { company } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Contact Global Hiring Talent about hiring, recruitment or general enquiries.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk"
        intro="Tell us how we can help. Our team will respond as soon as possible."
      />

      <section className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_20rem]">
        <div>
          <h2 className="text-2xl font-bold text-brand-900">
            Send us a message
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Your enquiry is stored securely on our platform. We will never share
            your details with third parties for marketing.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardBody>
              <h2 className="text-base font-bold text-brand-900">Contact details</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="font-semibold text-slate-700">Email</dt>
                  <dd className="mt-1 text-slate-600">
                    {company.hasRealContactEmail ? (
                      <a
                        href={`mailto:${company.email}`}
                        className="text-brand-700 hover:underline"
                      >
                        {company.email}
                      </a>
                    ) : (
                      <span className="italic text-slate-500">
                        To be confirmed
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Telephone</dt>
                  <dd className="mt-1 text-slate-600">
                    {company.hasRealContactPhone ? (
                      company.phone
                    ) : (
                      <span className="italic text-slate-500">
                        To be confirmed
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Office</dt>
                  <dd className="mt-1 text-slate-600">
                    {company.hasRealAddress ? (
                      company.address
                    ) : (
                      <span className="italic text-slate-500">
                        Address to be confirmed before public launch
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          {!company.hasRealContactEmail && (
            <Alert tone="warning" title="Contact details pending">
              Official contact details are not yet confirmed. They are centralised
              in configuration and will appear here once verified — no placeholder
              information is presented as real.
            </Alert>
          )}
        </aside>
      </section>
    </>
  );
}
