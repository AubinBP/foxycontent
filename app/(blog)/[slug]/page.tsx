import { notFound } from "next/navigation";
import { getArticleBySlug, getPublishedArticles } from "@/lib/articles";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.title + " — CHR Insights",
    description: article.metaDescription ?? undefined,
    openGraph: {
      title: article.title,
      description: article.metaDescription ?? undefined,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      siteName: "CHR Insights",
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article || article.status !== "published") notFound();

  const tags: string[] = article.tags ? JSON.parse(article.tags) : [];
  const internalLinks: string[] = article.internalLinks
    ? JSON.parse(article.internalLinks)
    : [];

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
    publisher: {
      "@type": "Organization",
      name: "CHR Insights",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>
        {/* Breadcrumb */}
        <nav aria-label="Fil d'ariane">
          <Link href="/">
            ← Retour aux articles
          </Link>
        </nav>

        {/* En-tête article */}
        <header>
          {article.family && (
            <span>
              {article.family.replace(/-/g, " ")}
            </span>
          )}
          <h1>
            {article.title}
          </h1>
          {article.metaDescription && (
            <p>
              {article.metaDescription}
            </p>
          )}
          <div>
            <time dateTime={article.publishedAt?.toISOString()}>
              {article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : ""}
            </time>
            {article.readingTime && (
              <>
                <span>·</span>
                <span>{article.readingTime} min de lecture</span>
              </>
            )}
          </div>
        </header>

        <hr />

        {/* Corps de l'article */}
        <article>
          <ReactMarkdown>{article.content ?? ""}</ReactMarkdown>
        </article>

        {/* Section backlinks */}
        {internalLinks.length > 0 && (
          <section aria-label="Ressources associées">
            <h2>
              Ressources associées
            </h2>
            <ul>
              {internalLinks.map((anchor) => (
                <li key={anchor}>
                  <a
                    href="https://foxtable.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    → {anchor}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Tags */}
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

        {/* Footer page */}
        <div>
          <p>
            CHR Insights — Ressources pour les professionnels de la restauration
          </p>
        </div>
      </div>
    </>
  );
}