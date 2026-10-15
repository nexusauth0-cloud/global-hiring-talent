import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Badge, Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPublishedArticles } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Articles and guidance on hiring, workforce planning and talent from Global Hiring Talent.",
};

export default async function InsightsPage() {
  const articles = await getPublishedArticles(24);

  return (
    <>
      <PageHero
        eyebrow="Insights"
        title="Workforce insights & guidance"
        intro="Practical articles on hiring, workforce planning and supporting people at work."
      />

      <section className="container-page py-16">
        {articles.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Card key={article.id} as="article" className="group flex flex-col overflow-hidden">
                {article.coverImage ? (
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={article.coverImage}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[16/9] items-center justify-center bg-brand-50">
                    <Newspaper className="h-10 w-10 text-brand-300" aria-hidden="true" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  {article.category && (
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                      {article.category}
                    </span>
                  )}
                  <h2 className="mt-2 text-lg font-bold leading-snug text-brand-900">
                    <Link href={`/insights/${article.slug}`} className="hover:text-brand-700">
                      {article.title}
                    </Link>
                  </h2>
                  {article.excerpt && (
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                      {article.excerpt}
                    </p>
                  )}
                  <p className="mt-4 text-xs text-slate-500">
                    {article.authorName ? `${article.authorName} · ` : ""}
                    {formatDate(article.publishedAt)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Newspaper className="h-8 w-8" aria-hidden="true" />}
            title="No insights published yet"
            description="We publish articles from our team as they are written and approved. Please check back soon."
          />
        )}
      </section>
    </>
  );
}
