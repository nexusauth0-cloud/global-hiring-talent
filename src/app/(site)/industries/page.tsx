import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Card, CardBody, CardHeader, CardTitle, Badge } from "@/components/ui/Card";
import { industries } from "@/lib/content";

export const metadata: Metadata = {
  title: "Industries we serve",
  description:
    "Specialist recruitment across technology, manufacturing, healthcare, finance, logistics and energy.",
};

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="Sector expertise that improves hiring outcomes"
        intro="We recruit for specialist functions across the industries that keep organisations running, with an understanding of the skills, qualifications and compliance each sector demands."
      />

      <section className="container-page space-y-10 py-20">
        {industries.map((industry, index) => (
          <Card key={industry.slug} as="article" className="overflow-hidden">
            <div
              className={`grid lg:grid-cols-2 ${index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              <div className="relative aspect-[3/2] lg:aspect-auto lg:min-h-[20rem]">
                <Image
                  src={industry.image}
                  alt={industry.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div>
                <CardHeader>
                  <CardTitle className="text-xl">{industry.title}</CardTitle>
                </CardHeader>
                <CardBody>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {industry.summary}
                  </p>
                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Typical functions
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {industry.roles.map((role) => (
                      <li key={role}>
                        <Badge tone="brand">{role}</Badge>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <CtaBand
        title="Hiring in a specialist sector?"
        description="Tell us about the role and the market you are recruiting in — we will advise on the most effective approach."
      />
    </>
  );
}
