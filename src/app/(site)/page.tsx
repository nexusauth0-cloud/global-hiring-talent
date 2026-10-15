import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { JobCard } from "@/components/jobs/JobCard";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { StarRating } from "@/components/reviews/StarRating";
import { company } from "@/lib/config";
import { services, industries } from "@/lib/content";
import { formatDate } from "@/lib/utils";
import {
  getFeaturedJobs,
  getApprovedReviews,
  getReviewAggregate,
  getPublishedArticles,
  getPublicStats,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredJobs, reviews, aggregate, articles, stats] = await Promise.all([
    getFeaturedJobs(6),
    getApprovedReviews(3),
    getReviewAggregate(),
    getPublishedArticles(3),
    getPublicStats(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-workforce.webp"
            alt="Diverse group of professionals collaborating around a table in a modern office"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/90 to-brand-900/60" />
        </div>

        <div className="container-page relative py-20 sm:py-28 lg:py-32">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-100">
              Workforce solutions & recruitment
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl">
              Connecting Talent With Top Leading Organizations
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-100/90">
              {company.name} helps employers build capable teams and helps
              professionals find meaningful work — through permanent, contract
              and executive recruitment across multiple industries.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/employers" variant="accent" size="lg">
                I&apos;m hiring
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink
                href="/jobs"
                variant="outline"
                size="lg"
                className="border-white/30 bg-white/5 text-white hover:bg-white/10"
              >
                Find a job
              </ButtonLink>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-brand-100/90">
              <li className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent-400" aria-hidden="true" />
                Transparent, evidence-based process
              </li>
              <li className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent-400" aria-hidden="true" />
                Permanent, contract & executive hiring
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Dual audience */}
      <section className="container-page -mt-10 relative z-10 sm:-mt-14">
        <div className="grid gap-6 md:grid-cols-2">
          <AudienceCard
            image="/images/home-employers.webp"
            alt="Two business professionals shaking hands after a successful meeting"
            eyebrow="For employers"
            title="Build the team you need, faster"
            description="Share your requirement and get qualified, assessed candidates. Permanent, contract and executive hiring with clear communication at every step."
            href="/employers"
            cta="Explore employer solutions"
            icon={<Building2 className="h-5 w-5" aria-hidden="true" />}
          />
          <AudienceCard
            image="/images/home-candidates.webp"
            alt="Professional reviewing job opportunities on a laptop"
            eyebrow="For candidates"
            title="Find work that fits you"
            description="Create a profile, upload your CV and apply to opportunities matched to your skills, experience and location."
            href="/candidates"
            cta="Explore the candidate portal"
            icon={<Users className="h-5 w-5" aria-hidden="true" />}
          />
        </div>
      </section>

      {/* Services */}
      <section className="container-page py-20 sm:py-24">
        <SectionHeading
          eyebrow="What we do"
          title="Workforce solutions across the talent lifecycle"
          intro="From a single specialist hire to a managed recruitment programme, we provide practical solutions tailored to how your organisation works."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.slug} as="article" className="group flex flex-col">
              <div className="relative aspect-[3/2] overflow-hidden rounded-t-xl">
                <Image
                  src={service.image}
                  alt={service.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <CardBody className="flex flex-1 flex-col">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
                  {service.tagline}
                </p>
                <h3 className="mt-2 text-lg font-bold text-brand-900">
                  {service.title}
                </h3>
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

      {/* Stats — only genuine database figures */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="container-page py-14">
          <div className="grid gap-8 sm:grid-cols-3">
            <Stat
              icon={<Briefcase className="h-6 w-6" aria-hidden="true" />}
              value={stats.openJobs}
              label="Open positions"
              href="/jobs"
            />
            <Stat
              icon={<Building2 className="h-6 w-6" aria-hidden="true" />}
              value={stats.approvedOrganizations}
              label="Registered organisations"
            />
            <Stat
              icon={<Users className="h-6 w-6" aria-hidden="true" />}
              value={stats.approvedReviews}
              label="Published reviews"
              href="/reviews"
            />
          </div>
          <p className="mt-6 text-center text-xs text-slate-500">
            Figures are calculated live from records stored in {company.name}&apos;s
            database. No estimated or projected statistics are shown.
          </p>
        </div>
      </section>

      {/* Featured jobs */}
      <section className="container-page py-20 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Latest opportunities"
            title="Featured jobs"
            intro="Genuine vacancies published by approved organisations."
          />
          <ButtonLink href="/jobs" variant="outline">
            View all jobs
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
        </div>

        <div className="mt-12">
          {featuredJobs.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Search className="h-8 w-8" aria-hidden="true" />}
              title="No positions are open right now"
              description="Our job board is currently empty. New opportunities will appear here as soon as approved organisations publish them — check back soon or submit your CV via our contact form."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <ButtonLink href="/jobs" variant="outline">
                    Visit the job board
                  </ButtonLink>
                  <ButtonLink href="/contact" variant="primary">
                    Submit an enquiry
                  </ButtonLink>
                </div>
              }
            />
          )}
        </div>
      </section>

      {/* Industries */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="container-page py-20 sm:py-24">
          <SectionHeading
            eyebrow="Industries"
            title="Sector expertise where it matters"
            intro="We recruit for specialist functions across the industries that keep organisations running."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry) => (
              <Link
                key={industry.slug}
                href="/industries"
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-brand-950"
              >
                <div className="relative aspect-[3/2]">
                  <Image
                    src={industry.image}
                    alt={industry.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    loading="lazy"
                    className="object-cover opacity-70 transition-opacity group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/50 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h3 className="text-lg font-bold">{industry.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-brand-100/85">
                    {industry.summary}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="container-page py-20 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="What people say"
            title="Reviews"
            intro="Only genuine, moderated reviews are published here."
          />
          <ButtonLink href="/reviews" variant="outline">
            Read & submit reviews
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
        </div>

        {aggregate.total > 0 && (
          <div className="mt-6 flex items-center gap-3">
            <StarRating value={aggregate.average} size={22} />
            <span className="text-sm font-semibold text-brand-900">
              {aggregate.average.toFixed(1)} average from {aggregate.total}{" "}
              published review{aggregate.total === 1 ? "" : "s"}
            </span>
          </div>
        )}

        <div className="mt-10">
          {reviews.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No published reviews yet"
              description="We only publish genuine reviews after moderation. Be the first to share your experience — reviews are never fabricated or purchased."
              action={
                <ButtonLink href="/reviews" variant="primary">
                  Submit a review
                </ButtonLink>
              }
            />
          )}
        </div>
      </section>

      {/* Insights */}
      {articles.length > 0 && (
        <section className="border-t border-slate-200 bg-slate-50">
          <div className="container-page py-20 sm:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Insights"
                title="Workforce insights & guidance"
              />
              <ButtonLink href="/insights" variant="outline">
                All insights
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {articles.map((article) => (
                <Card key={article.id} as="article" className="flex flex-col">
                  {article.coverImage && (
                    <div className="relative aspect-[16/9] overflow-hidden rounded-t-xl">
                      <Image
                        src={article.coverImage}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        loading="lazy"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardBody className="flex flex-1 flex-col">
                    {article.category && (
                      <Badge tone="brand" className="mb-2 self-start">
                        {article.category}
                      </Badge>
                    )}
                    <h3 className="text-lg font-bold text-brand-900">
                      <Link href={`/insights/${article.slug}`} className="hover:text-brand-700">
                        {article.title}
                      </Link>
                    </h3>
                    {article.excerpt && (
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                        {article.excerpt}
                      </p>
                    )}
                    <p className="mt-4 text-xs text-slate-500">
                      {article.authorName ? `${article.authorName} · ` : ""}
                      {formatDate(article.publishedAt)}
                    </p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section className="container-page py-20 sm:py-24">
        <div className="overflow-hidden rounded-2xl bg-brand-800 px-6 py-14 text-white sm:px-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Let&apos;s talk about your workforce needs
            </h2>
            <p className="mt-4 text-lg text-brand-100/90">
              Whether you are hiring at scale or looking for your next role, our
              team will respond personally.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/contact" variant="accent" size="lg">
                Contact our team
              </ButtonLink>
              <ButtonLink
                href="/services"
                variant="outline"
                size="lg"
                className="border-white/30 bg-white/5 text-white hover:bg-white/10"
              >
                Review our services
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function AudienceCard({
  image,
  alt,
  eyebrow,
  title,
  description,
  href,
  cta,
  icon,
}: {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[16/9]">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <CardBody>
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-600">
          <span className="text-brand-700">{icon}</span>
          {eyebrow}
        </p>
        <h2 className="mt-2 text-xl font-bold text-brand-900">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-900"
        >
          {cta}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </CardBody>
    </Card>
  );
}

function Stat({
  icon,
  value,
  label,
  href,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
        {icon}
      </span>
      <div>
        <p className="text-3xl font-extrabold text-brand-900">
          {value.toLocaleString()}
        </p>
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="rounded-lg transition-colors hover:bg-white p-2 -m-2">
      {content}
    </Link>
  ) : (
    <div className="p-2 -m-2">{content}</div>
  );
}
