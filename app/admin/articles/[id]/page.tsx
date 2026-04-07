import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { computeSeoScore } from "@/lib/seo";
import ArticleEditor from "./Editor";

export const dynamic = "force-dynamic";

export default async function ArticleAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const article = await db
    .select()
    .from(articles)
    .where(eq(articles.id, Number(id)))
    .then((r) => r[0]);

  if (!article) {
    return <div className="p-8 text-red-500">Article introuvable</div>;
  }

  const seo = computeSeoScore(article);
  const alerts = Object.values(seo.details).filter((d) => !d.ok);

  async function publishAction(formData: FormData) {
    "use server";
    await db.update(articles).set({ status: "published", publishedAt: new Date() }).where(eq(articles.id, Number(id)));
    revalidatePath("/");
    revalidatePath(`/(blog)/${article.slug}`);
    redirect("/admin/articles");
  }

  async function unpublishAction(formData: FormData) {
    "use server";
    await db.update(articles).set({ status: "draft", publishedAt: null }).where(eq(articles.id, Number(id)));
    revalidatePath("/");
    redirect("/admin/articles");
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/articles" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Articles
          </Link>
          <span className="text-gray-200">/</span>
          <span className="text-sm text-gray-600 truncate max-w-xs">{article.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {article.status === "published" && (
            <a
              href={`/${article.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              ↗ Voir
            </a>
          )}
          {article.status !== "published" ? (
            <form action={publishAction}>
              <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors">
                Publier
              </button>
            </form>
          ) : (
            <form action={unpublishAction}>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors">
                Dépublier
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Score SEO</h2>
          <span className={`text-lg font-bold ${seo.score >= 80 ? "text-green-600" : seo.score >= 50 ? "text-orange-500" : "text-red-500"}`}>
            {seo.score}/100
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all ${seo.score >= 80 ? "bg-green-500" : seo.score >= 50 ? "bg-orange-400" : "bg-red-400"}`}
            style={{ width: `${seo.score}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(seo.details).map((detail, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className={detail.ok ? "text-green-500" : "text-orange-500"}>
                {detail.ok ? "✓" : "⚠"}
              </span>
              <span className={detail.ok ? "text-gray-500" : "text-gray-700"}>
                {detail.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-5">Modifier l&apos;article</h2>
        <ArticleEditor
          articleId={article.id}
          initialContent={article.content ?? ""}
          initialTitle={article.title ?? ""}
          initialMeta={article.metaDescription ?? ""}
        />
      </div>
    </div>
  );
}