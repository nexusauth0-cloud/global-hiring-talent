import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { CtaBand } from "@/components/marketing/CtaBand";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { servicesBySlug } from "@/lib/content";

export const metadata: Metadata = {
  title: "For employers",
  description:
    "Permanent, contract and executive recruitment for employers. Register your organisation and manage hiring requests with Global Hiring Talent.",
};

const processSteps = [
  {
    title: "Share your requirement",
    body: "Tell us about the role, team and timeline through your employer dashboard or a hiring request.",
  },
  {
    title: "Review screened shortlists",
    body: "We source, screen and assess candidates against agreed criteria, with evidence for each.",
  },
  {
    title: "Interview with support",
    body: "We coordinate interviews, gather structured feedback and keep you informed throughout.",
  },
  {
    title: "Onboard with confidence",
    body: "We support offers, contracts and a smooth start for your new hire.",
  },
];

const employerServiceSlugs = [
  "permanent-recruitment",
  "contract-staffing",
  "executive-search",
  "managed-services",
];

export default function EmployersPage() {
  return (
    <>
      <PageHero
        eyebrow="For employers"
        title="Hire with evidence, not guesswork"
        intro="Register your organisation, submit a hiring request and review screened candidates — all in one place."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/register/employer" variant="primary" size="lg">
            Register as an employer
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline" size="lg">
            Talk to our team
          </ButtonLink>
        </div>
      </PageHero>

      <section className="container-page grid gap-12 py-20 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
          <Image
            src="/images/employers-hero.webp"
            alt="Two business professionals shaking hands after a meeting"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <SectionHeading
            eyebrow="Why employers work with us"
            title="A recruitment process you can trust"
          />
          <ul className="mt-6 space-y-3.5">
            {[
              "Screened shortlists with supporting evidence",
              "Clear timelines and honest market feedback",
              "Permanent, contract and executive hiring",
              "Consistent process from briefing to onboarding",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-slate-700">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-brand-600"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <ButtonLink href="/register/employer" className="mt-8">
            Start hiring
          </ButtonLink>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="container-page py-20">
          <SectionHeading
            eyebrow="How it works"
            title="A straightforward hiring process"
            align="center"
          />
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, i) => (
              <li
                key={step.title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)]"
              >
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-700 text-base font-bold text-white"
                >
                  {i + 1}
                </span>
                <h3 className="mt-4 text-base font-bold text-brand-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-20">
        <SectionHeading
          eyebrow="Solutions"
          title="Services for employers"
          intro="Choose the engagement model that fits your hiring need."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {employerServiceSlugs.map((slug) => {
            const service = servicesBySlug.get(slug);
            if (!service) return null;
            return (
              <Card key={slug} as="article">
                <CardBody>
                  <h3 className="text-lg font-bold text-brand-900">{service.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {service.summary}
                  </p>
                  <Link
                    href={`/services/${service.slug}`}
                    className="mt-4 inline-block text-sm font-bold text-brand-700 hover:underline"
                  >
                    Learn more
                  </Link>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </section>

      <CtaBand
        title="Tell us who you need to hire"
        primary={{ href: "/register/employer", label: "Register as an employer" }}
        secondary={{ href: "/contact", label: "Contact our team" }}
      />
    </>
  );
}
