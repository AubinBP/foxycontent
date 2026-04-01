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
    <main>
      <div>
        <h1>Dashboard</h1>
        <Link href="/admin/generate">
          + Nouvel article
        </Link>
      </div>

      <div>
        <Card title="Total articles" value={total} />
        <Card title="Publiés" value={published} color="green" />
        <Card title="Brouillons" value={draft} color="orange" />
      </div>

      <div>
        <h2>Tous les articles</h2>

        {allArticles.length === 0 ? (
          <div>
            <p>Aucun article pour l&apos;instant.</p>
            <Link href="/admin/generate">
              Générer le premier article →
            </Link>
          </div>
        ) : (
          <div>
            <table>
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Catégorie</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allArticles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <Link href={`/admin/articles/${article.id}`}>
                        {article.title ?? "Sans titre"}
                      </Link>
                      <p>/{article.slug}</p>
                    </td>
                    <td>
                      {article.family ? (
                        <span>
                          {article.family.replace(/-/g, " ")}
                        </span>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                    <td>
                      <span>
                        {article.status === "published" ? "Publié" : "Brouillon"}
                      </span>
                    </td>
                    <td>
                      {article.createdAt
                        ? new Date(article.createdAt).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td>
                      <div>
                        {article.status !== "published" && (
                          <Link href={`/admin/articles/${article.id}`}>
                            Réviser
                          </Link>
                        )}
                        {article.status === "published" && (
                          <a
                            href={`/${article.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Voir
                          </a>
                        )}
                        <form action={deleteAction}>
                          <input type="hidden" name="id" value={article.id} />
                          <DeleteButton id={article.id} />
                        </form>
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
  return (
    <div>
      <p>{title}</p>
      <p>{value}</p>
    </div>
  );
}