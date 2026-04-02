import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import ReactMarkdown from "react-markdown";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function ArticlePage({
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
    return (
      <main className="p-10">
        <p className="text-red-500">Article introuvable</p>
      </main>
    );
  }

  const tags: string[] = article.tags ? JSON.parse(article.tags) : [];

  async function publishAction(formData: FormData) {
    "use server";
    const articleId = Number(formData.get("id"));

    await db
      .update(articles)
      .set({
        status: "published",
        publishedAt: new Date(),
      })
      .where(eq(articles.id, articleId));

    revalidatePath("/"); 
    revalidatePath("/(blog)/[slug]");
    
    redirect("/admin/dashboard");
  }

  return (
    <main className="max-w-3xl mx-auto p-10">
      <header className="mb-6">
        <p className="text-sm text-gray-400 mb-2">
          ID: {article.id} · Status: {article.status}
        </p>
        <h1 className="text-3xl font-bold">{article.title}</h1>
        {article.metaDescription && (
          <p className="text-gray-500 mt-2">{article.metaDescription}</p>
        )}
      </header>

      <div className="flex gap-4 mb-8">
        {article.status !== "published" && (
          <form action={publishAction}>
            <input type="hidden" name="id" value={article.id} />
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Publier</button>
          </form>
        )}
      </div>

      <article className="prose prose-gray max-w-none">
        <ReactMarkdown>{article.content ?? ""}</ReactMarkdown>
      </article>

      {tags.length > 0 && (
        <footer className="mt-10 pt-6 border-t">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>
        </footer>
      )}
    </main>
  );
}