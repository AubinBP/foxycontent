import { notFound } from "next/navigation";
import { getArticleBySlug, getPublishedArticles } from "@/lib/articles";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";

// Génère les routes statiques pour tous les articles publiés
export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

// Génère les métadonnées SEO dynamiquement
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.metaDescription ?? undefined,
    openGraph: {
      title: article.title,
      description: article.metaDescription ?? undefined,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticleBySlug(params.slug);
  if (!article || article.status !== "published") notFound();

  const tags: string[] = article.tags ? JSON.parse(article.tags) : [];

  // JSON-LD Schema.org Article
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.publishedAt?.toISOString(),
    author: {
      "@type": "Organization",
      name: "CHR Insights",
    },
  };

  return (
    <>
      {/* JSON-LD injecté dans le <head> */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* En-tête article */}
        <header className="mb-8">
          {article.family && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full mb-4 inline-block">
              {article.family}
            </span>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-3">
            {article.title}
          </h1>
          <p className="text-gray-400 text-sm">
            {article.publishedAt
              ? new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : ""}
            {article.readingTime ? ` · ${article.readingTime} min de lecture` : ""}
          </p>
        </header>

        {/* Corps de l'article en Markdown */}
        <article className="prose prose-gray max-w-none">
          <ReactMarkdown>{article.content ?? ""}</ReactMarkdown>
        </article>

        {/* Tags */}
        {tags.length > 0 && (
          <footer className="mt-10 pt-6 border-t">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </footer>
        )}
      </main>
    </>
  );
}