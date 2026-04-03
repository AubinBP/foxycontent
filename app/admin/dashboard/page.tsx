import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { count, eq, desc } from "drizzle-orm";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const totalResult = await db.select({ value: count() }).from(articles);
  const publishedResult = await db
    .select({ value: count() })
    .from(articles)
    .where(eq(articles.status, "published"));
  const draftResult = await db
    .select({ value: count() })
    .from(articles)
    .where(eq(articles.status, "draft"));

  const allArticles = await db
    .select()
    .from(articles)
    .orderBy(desc(articles.createdAt));

  const total = totalResult[0]?.value ?? 0;
  const published = publishedResult[0]?.value ?? 0;
  const draft = draftResult[0]?.value ?? 0;

  async function deleteAction(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    await db.delete(articles).where(eq(articles.id, id));
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    redirect("/admin/dashboard");
  }

  return (
    <main className="max-w-5xl mx-auto p-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-bold text-3xl">Dashboard</h1>
<div className="flex items-center gap-3">
  <Link
    href="/admin/settings"
    className="border border-gray-300 hover:border-gray-400 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
  >
    ⚙ Paramètres
  </Link>
  <Link
    href="/admin/generate"
    className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
  >
    + Nouvel article
  </Link>
</div>
      </div>

      

      <div className="grid grid-cols-3 gap-6 mb-10">
        <Card  title="Total articles" value={total} />
        <Card title="Publiés" value={published} color="green" />
        <Card title="Brouillons" value={draft} color="orange" />
      </div>

      <div>
        <h2 className="font-semibold text-lg mb-4">Tous les articles</h2>

        {allArticles.length === 0 ? (
          <div>
            <p>Aucun article pour l&apos;instant.</p>
            <Link href="/admin/generate">
              Générer le premier article →
            </Link>
          </div>
        ) : (
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left font-medium px-4 py-3 text-gray-700">Titre</th>
                  <th className="text-left font-medium px-4 py-3 text-gray-700">Catégorie</th>
                  <th className="text-left font-medium px-4 py-3 text-gray-700">Statut</th>
                  <th className="text-left font-medium px-4 py-3 text-gray-700">Date</th>
                  <th className="text-left font-medium px-4 py-3 text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/articles/${article.id}`} className="font-medium text-gray-800 hover:text-green-600 transition-colors">
                        {article.title ?? "Sans titre"}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">/{article.slug}</p>
                    </td>
                    <td className="text-xs">
                      {article.family ? (
                        <span className="whitespace-nowrap text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {article.family.replace(/-/g, " ")}
                        </span>
                      ) : (
                        <span className="px-4 py-3">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${article.status === "published" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                        {article.status === "published" ? "Publié" : "Brouillon"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {article.createdAt
                        ? new Date(article.createdAt).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {article.status !== "published" && (
                          <Link href={`/admin/articles/${article.id}`}className="text-xs text-blue-600 hover:underline">
                            Réviser
                          </Link>
                        )}
                        {article.status === "published" && (
                          <a
                            href={`/${article.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-green-600 hover:underline"
                          >
                            Voir
                          </a>
                        )}
                        <form action={deleteAction}>
                          <input type="hidden" name="id" value={article.id} />
                          <DeleteButton id={article.id} className="text-xs text-red-900 hover:text-red-800 hover:underline" />                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function Card({
  title,
  value,
  color = "gray",
}: {
  title: string;
  value: number;
  color?: "gray" | "green" | "orange";
}) {
  const colors = {
    gray: "border-gray-200",
    green: "border-green-200 bg-green-50",
    orange: "border-orange-200 bg-orange-50",
  };

  return (
    <div className={`p-6 rounded-xl border ${colors[color]}`}>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}