import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/marketing/CtaBand";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { services, servicesBySlug } from "@/lib/content";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = servicesBySlug.get(slug);
  if (!service) return { title: "Service not found" };
  return { title: service.title, description: service.summary };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = servicesBySlug.get(slug);
  if (!service) notFound();

  const others = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <PageHero eyebrow={service.tagline} title={service.title} intro={service.summary}>
        <ButtonLink href="/contact" variant="primary" size="lg">
          Discuss your requirement
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </ButtonLink>
      </PageHero>

      <section className="container-page grid gap-12 py-20 lg:grid-cols-2 lg:items-start">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
          <Image
            src={service.image}
            alt={service.imageAlt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <SectionHeading eyebrow="What's included" title="How we deliver" />
          <ul className="mt-6 space-y-3.5">
            {service.offerings.map((item) => (
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
      </section>

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="container-page py-16">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-600">
            Related services
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {others.map((other) => (
              <Card key={other.slug} as="article">
                <CardBody>
                  <h3 className="text-lg font-bold text-brand-900">
                    <Link
                      href={`/services/${other.slug}`}
                      className="hover:text-brand-700"
                    >
                      {other.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {other.summary}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
