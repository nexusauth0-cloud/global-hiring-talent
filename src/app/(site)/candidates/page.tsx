import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, FileText, Search, Send, UserCheck } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { CtaBand } from "@/components/marketing/CtaBand";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "For candidates",
  description:
    "Create a candidate profile, upload your CV securely and apply to genuine vacancies with Global Hiring Talent.",
};

const steps = [
  {
    icon: <UserCheck className="h-6 w-6" aria-hidden="true" />,
    title: "Create your profile",
    body: "Register a candidate account and add your experience, skills and preferences.",
  },
  {
    icon: <FileText className="h-6 w-6" aria-hidden="true" />,
    title: "Upload your CV",
    body: "Upload a PDF, DOC or DOCX CV. Your documents are stored privately and never public.",
  },
  {
    icon: <Search className="h-6 w-6" aria-hidden="true" />,
    title: "Find suitable roles",
    body: "Search and filter genuine vacancies by location, work type and industry.",
  },
  {
    icon: <Send className="h-6 w-6" aria-hidden="true" />,
    title: "Apply and track",
    body: "Submit applications and follow their status from your dashboard.",
  },
];

export default function CandidatesPage() {
  return (
    <>
      <PageHero
        eyebrow="For candidates"
        title="Find work that fits your life and your goals"
        intro="Apply to genuine vacancies, keep your CV secure and track every application in one place."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/register/candidate" variant="primary" size="lg">
            Create a candidate account
          </ButtonLink>
          <ButtonLink href="/jobs" variant="outline" size="lg">
            Browse jobs
          </ButtonLink>
        </div>
      </PageHero>

      <section className="container-page grid gap-12 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading
            eyebrow="Your privacy"
            title="Your CV stays private"
          />
          <p className="mt-4 text-slate-600">
            Documents you upload are stored privately and are only accessible to
            you and, when you apply, to the hiring organisation through our
            secure system. They are never published on public pages or shared
            with third-party form relays.
          </p>
          <ul className="mt-6 space-y-3.5">
            {[
              "Private, access-controlled document storage",
              "You control your profile and contact details",
              "Track application status in real time",
              "Withdraw an application when you need to",
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
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
          <Image
            src="/images/candidates-hero.webp"
            alt="A professional working at a desk with a laptop"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="container-page py-20">
          <SectionHeading
            eyebrow="Getting started"
            title="How to apply in four steps"
            align="center"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <Card key={step.title} as="article">
                <CardBody>
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                    {step.icon}
                  </span>
                  <h3 className="mt-4 text-base font-bold text-brand-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {step.body}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardBody>
              <h2 className="text-xl font-bold text-brand-900">
                What you can do in your dashboard
              </h2>
              <ul className="mt-4 space-y-3">
                {[
                  "Manage your profile and contact details",
                  "Upload and replace your CV",
                  "View and track every application",
                  "Withdraw an application you no longer want considered",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-slate-700">
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-brand-600"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <h2 className="text-xl font-bold text-brand-900">
                No vacancies right now?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Our job board shows only genuine, approved vacancies. If nothing
                matches today, register your profile so you can apply quickly when
                new roles are published, or contact our team to discuss your
                experience.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <ButtonLink href="/register/candidate" variant="primary">
                  Register your profile
                </ButtonLink>
                <ButtonLink href="/contact" variant="outline">
                  Contact us
                </ButtonLink>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      <CtaBand
        title="Ready to find your next role?"
        primary={{ href: "/register/candidate", label: "Create your account" }}
        secondary={{ href: "/jobs", label: "Browse jobs" }}
      />
    </>
  );
}
