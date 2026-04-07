import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { computeSeoScore } from "@/lib/seo";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import DeleteButton from "../../../components/DeleteButton";
export const dynamic = "force-dynamic";

const FAMILIES = [
  { value: "", label: "Toutes catégories" },
  { value: "emballages-chr", label: "Emballages CHR" },
  { value: "boissons-bar", label: "Boissons & Bar" },
  { value: "actualite-resto", label: "Actualité Resto" },
  { value: "guides-pratiques", label: "Guides pratiques" },
  { value: "data-chiffres", label: "Data & Chiffres" },
];

async function deleteAction(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));

  await db.delete(articles).where(eq(articles.id, id));

  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export default async function ArticlesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ family?: string; q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const allArticles = await db.select().from(articles).orderBy(desc(articles.createdAt));

  const filtered = allArticles.filter((a) => {
    const matchFamily = !params.family || a.family === params.family;
    const matchStatus = !params.status || a.status === params.status;
    const matchQ = !params.q || (a.title ?? "").toLowerCase().includes(params.q.toLowerCase());
    return matchFamily && matchStatus && matchQ;
  });

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Articles</h1>
          <p className="text-sm text-gray-400 mt-1">{filtered.length} article{filtered.length > 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/generate" className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Nouvel article
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-6">
        <form method="GET" className="flex flex-wrap gap-3 w-full">
          <input
            type="text"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Rechercher un article..."
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
          />
          <select
            name="family"
            defaultValue={params.family ?? ""}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {FAMILIES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={params.status ?? ""}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Tous les statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
          </select>
          <button type="submit" className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            Filtrer
          </button>
          {(params.q || params.family || params.status) && (
            <Link href="/admin/articles" className="text-sm text-gray-400 hover:text-gray-600 px-2 py-2 transition-colors">
              Réinitialiser
            </Link>
          )}
        </form>
      </div>

      {/* Tableau */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">Aucun article trouvé.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Article</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Catégorie</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Score SEO</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Alertes</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((article) => {
                const seo = computeSeoScore(article);
                const alerts = Object.values(seo.details).filter((d) => !d.ok);
                return (
                  <tr key={article.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <Link href={`/admin/articles/${article.id}`} className="font-medium text-gray-800 hover:text-green-600 transition-colors">
                        {article.title ?? "Sans titre"}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {article.readingTime ? `${article.readingTime} min` : ""} · /{article.slug}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      {article.family ? (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap">
                          {article.family.replace(/-/g, " ")}
                        </span>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${seo.score >= 80 ? "bg-green-500" : seo.score >= 50 ? "bg-orange-400" : "bg-red-400"}`}
                            style={{ width: `${seo.score}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${seo.score >= 80 ? "text-green-600" : seo.score >= 50 ? "text-orange-500" : "text-red-500"}`}>
                          {seo.score}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {alerts.length === 0 ? (
                        <span className="text-xs text-green-600">✓</span>
                      ) : (
                        <div className="relative group inline-block">
                          <span className="text-xs text-orange-500 cursor-help">
                            ⚠ {alerts.length} alerte{alerts.length > 1 ? "s" : ""}
                          </span>
                          <div className="absolute left-0 top-6 w-56 bg-gray-900 text-white text-xs rounded-lg p-2.5 hidden group-hover:block z-10 shadow-lg">
                            {alerts.map((a, i) => (
                              <p key={i} className="py-0.5">· {a.message}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${article.status === "published" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-600"}`}>
                        {article.status === "published" ? "Publié" : "Brouillon"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-400 whitespace-nowrap">
                      {article.createdAt ? new Date(article.createdAt).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td className="px-4 py-4 flex items-center gap-3">
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Modifier
                      </Link>

                      <form action={deleteAction}>
                        <input type="hidden" name="id" value={article.id} />
                        <DeleteButton
                          id={article.id}
                          className="text-xs text-red-600 hover:underline"
                        />
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}