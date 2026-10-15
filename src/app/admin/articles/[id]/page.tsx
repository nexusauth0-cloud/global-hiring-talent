import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAdminArticleById } from "@/lib/queries";
import { ArticleForm } from "../ArticleForm";

export const metadata: Metadata = { title: "Edit article" };
export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getAdminArticleById(id);
  if (!article) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/articles"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to articles
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-brand-900">Edit article</h1>
        {article.status === "published" && (
          <a
            href={`/insights/${article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            View public page ↗
          </a>
        )}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <ArticleForm
          articleId={article.id}
          defaults={{
            title: article.title,
            excerpt: article.excerpt ?? "",
            body: article.body,
            category: article.category ?? "",
            coverImage: article.coverImage ?? "",
            authorName: article.authorName ?? "",
            status: article.status,
          }}
        />
      </div>
    </div>
  );
}
