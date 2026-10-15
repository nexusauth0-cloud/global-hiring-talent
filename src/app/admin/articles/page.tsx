import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, CardBody, statusTone } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAdminArticles } from "@/lib/queries";
import { formatDate, humanizeStatus } from "@/lib/utils";

export const metadata: Metadata = { title: "Articles" };
export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const articles = await getAdminArticles();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-900">Articles</h1>
          <p className="mt-1 text-sm text-slate-600">
            Insights published on the public site.
          </p>
        </div>
        <ButtonLink href="/admin/articles/new">New article</ButtonLink>
      </div>

      {articles.length === 0 ? (
        <EmptyState
          title="No articles yet"
          description="Create your first insight article."
          action={<ButtonLink href="/admin/articles/new">New article</ButtonLink>}
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-5 py-3 font-semibold">Title</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Category</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Published</th>
                    <th scope="col" className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4 font-semibold text-brand-900">
                        {article.title}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {article.category ?? "—"}
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={statusTone(article.status)}>
                          {humanizeStatus(article.status)}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(article.publishedAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/articles/${article.id}`}
                          className="font-semibold text-brand-700 hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
