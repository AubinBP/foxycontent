import Link from "next/link";
import { getPublishedArticles } from "@/lib/articles";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CHR Insights — Actualités emballages & restauration",
  description:
    "Conseils, tendances et ressources pour les professionnels CHR : emballages éco-responsables, boissons, gestion de restaurant.",
};

export default async function BlogPage() {
  const articles = await getPublishedArticles();

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">CHR Insights</h1>
      <p className="text-gray-500 mb-10">
        Ressources pour les professionnels de la restauration et de l&apos;hôtellerie.
      </p>

      {articles.length === 0 ? (
        <p className="text-gray-400 italic">Aucun article publié pour l&apos;instant.</p>
      ) : (
        <ul className="space-y-8">
          {articles.map((article) => (
            <li key={article.slug} className="border-b pb-8">
              <Link href={`/${article.slug}`} className="group">
                <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h2>
              </Link>
              <p className="text-gray-500 mt-1 text-sm">
                {article.publishedAt
                  ? new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : ""}
                {article.readingTime ? ` · ${article.readingTime} min de lecture` : ""}
              </p>
              {article.metaDescription && (
                <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                  {article.metaDescription}
                </p>
              )}
              {article.family && (
                <span className="inline-block mt-3 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {article.family}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}