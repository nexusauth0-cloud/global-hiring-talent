import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProseText } from "@/components/content/ProseText";
import { Badge } from "@/components/ui/Card";
import { getArticleBySlug } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article not found" };
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <article className="container-page max-w-3xl py-12">
      <Link
        href="/insights"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All insights
      </Link>

      {article.category && (
        <div className="mt-6">
          <Badge tone="brand">{article.category}</Badge>
        </div>
      )}

      <h1 className="mt-4 text-3xl font-extrabold leading-tight text-brand-900 sm:text-4xl">
        {article.title}
      </h1>

      <p className="mt-3 text-sm text-slate-500">
        {article.authorName ? `${article.authorName} · ` : ""}
        {formatDate(article.publishedAt)}
      </p>

      {article.coverImage && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
          <Image
            src={article.coverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 768px, 100vw"
            priority
            className="object-cover"
          />
        </div>
      )}

      <div className="mt-8">
        <ProseText text={article.body} />
      </div>
    </article>
  );
}
