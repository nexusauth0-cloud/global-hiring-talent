import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Card, CardBody } from "@/components/ui/Card";
import { services } from "@/lib/content";

export const metadata: Metadata = {
  title: "Workforce & recruitment services",
  description:
    "Permanent recruitment, contract staffing, executive search, workforce consulting, managed services and talent assessment.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Workforce solutions across the talent lifecycle"
        intro="From a single specialist hire to a fully managed recruitment programme, we provide practical, well-governed solutions tailored to your organisation."
      />

      <section className="container-page py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          {services.map((service) => (
            <Card
              key={service.slug}
              as="article"
              className="group flex flex-col overflow-hidden sm:flex-row"
            >
              <div className="relative aspect-[3/2] sm:aspect-auto sm:w-2/5 sm:shrink-0">
                <Image
                  src={service.image}
                  alt={service.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 20vw, 100vw"
                  className="object-cover"
                />
              </div>
              <CardBody className="flex flex-1 flex-col">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
                  {service.tagline}
                </p>
                <h2 className="mt-2 text-xl font-bold text-brand-900">
                  {service.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {service.summary}
                </p>
                <Link
                  href={`/services/${service.slug}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-900"
                >
                  Learn more
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
