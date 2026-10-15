import type { Metadata } from "next";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Card, CardBody } from "@/components/ui/Card";
import { companyValues } from "@/lib/content";
import { company } from "@/lib/config";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Global Hiring Talent is a workforce solutions and recruitment partner connecting organisations with qualified professionals.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="A recruitment partner built on evidence and integrity"
        intro={`${company.name} exists to make hiring more reliable for employers and more transparent for candidates. We combine structured assessment with genuine market knowledge to connect the right people with the right work.`}
      />

      <section className="container-page grid gap-12 py-20 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
          <Image
            src="/images/about-team.webp"
            alt="A team of colleagues working together in a modern open-plan office"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <SectionHeading
            eyebrow="Our approach"
            title="Practical recruitment, grounded in how organisations actually work"
          />
          <div className="prose-corporate mt-6">
            <p>
              We work across permanent, contract and executive hiring, and we
              support workforce planning and assessment. Rather than applying a
              single formula, we shape our process around the role, the team and
              the market you are hiring into.
            </p>
            <p>
              Our consultants are measured on the quality and longevity of the
              placements they make — not simply on activity. That means honest
              shortlists, clear communication and respect for the time of both
              hiring managers and candidates.
            </p>
          </div>
          <ul className="mt-6 space-y-3">
            {[
              "Structured, evidence-based candidate assessment",
              "Transparent communication at every stage",
              "Respect for candidate privacy and data",
              "Sector knowledge across multiple industries",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-brand-600"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="container-page py-20">
          <SectionHeading
            eyebrow="Our values"
            title="What guides the way we work"
            align="center"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {companyValues.map((value) => (
              <Card key={value.title} as="article">
                <CardBody>
                  <h3 className="text-lg font-bold text-brand-900">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {value.description}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page grid gap-12 py-20 lg:grid-cols-2 lg:items-center">
        <div className="order-2 lg:order-1">
          <SectionHeading
            eyebrow="Our commitment"
            title="Honest information, always"
          />
          <div className="prose-corporate mt-6">
            <p>
              We do not publish invented statistics, client logos or testimonials.
              Where we present figures, they are calculated from real records in
              our platform. Where we present reviews, they are genuine submissions
              that have passed moderation.
            </p>
            <p>
              Full company registration and contact details are published once
              confirmed. Until then, clearly labelled placeholders are shown rather
              than invented information.
            </p>
          </div>
        </div>
        <div className="relative order-1 aspect-[4/3] overflow-hidden rounded-2xl lg:order-2">
          <Image
            src="/images/about-culture.webp"
            alt="Colleagues in discussion around a meeting table with notebooks"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <CtaBand
        title="Work with a partner who values your time"
        secondary={{ href: "/services", label: "Explore our services" }}
      />
    </>
  );
}
