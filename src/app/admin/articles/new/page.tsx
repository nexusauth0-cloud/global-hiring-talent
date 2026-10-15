import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ArticleForm } from "../ArticleForm";

export const metadata: Metadata = { title: "New article" };
export const dynamic = "force-dynamic";

export default function NewArticlePage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/articles"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to articles
      </Link>
      <h1 className="text-2xl font-extrabold text-brand-900">New article</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <ArticleForm
          defaults={{
            title: "",
            excerpt: "",
            body: "",
            category: "",
            coverImage: "",
            authorName: "",
            status: "draft",
          }}
        />
      </div>
    </div>
  );
}
