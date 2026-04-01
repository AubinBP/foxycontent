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
      <main>
        <p>Article introuvable</p>
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
    <main>
      <header>
        <p>
          ID: {article.id} · Status: {article.status}
        </p>
        <h1>{article.title}</h1>
        {article.metaDescription && (
          <p>{article.metaDescription}</p>
        )}
      </header>

      <div>
        {article.status !== "published" && (
          <form action={publishAction}>
            <input type="hidden" name="id" value={article.id} />
            <button>Publier</button>
          </form>
        )}
      </div>

      <article>
        <ReactMarkdown>{article.content ?? ""}</ReactMarkdown>
      </article>

      {tags.length > 0 && (
        <footer>
          <div>
            {tags.map((tag) => (
              <span key={tag}>
                #{tag}
              </span>
            ))}
          </div>
        </footer>
      )}
    </main>
  );
}