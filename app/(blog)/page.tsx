import Link from "next/link";
import { getPublishedArticles } from "@/lib/articles";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CHR Insights — Actualités emballages & restauration",
  description:
    "Conseils, tendances et ressources pour les professionnels CHR : emballages éco-responsables, boissons, gestion de restaurant.",
  openGraph: {
    title: "CHR Insights — Actualités emballages & restauration",
    description:
      "Conseils, tendances et ressources pour les professionnels CHR.",
    type: "website",
  },
};

const FAMILIES = [
  { value: "", label: "Tous" },
  { value: "emballages-chr", label: "Emballages CHR" },
  { value: "boissons-bar", label: "Boissons & Bar" },
  { value: "actualite-resto", label: "Actualité Resto" },
  { value: "guides-pratiques", label: "Guides pratiques" },
  { value: "data-chiffres", label: "Data & Chiffres" },
];

const PER_PAGE = 10;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ family?: string; page?: string }>;
}) {
  const params = await searchParams;
  const selectedFamily = params.family ?? "";
  const currentPage = Math.max(1, Number(params.page ?? 1));

  const allArticles = await getPublishedArticles();

  const filtered = selectedFamily
    ? allArticles.filter((a) => a.family === selectedFamily)
    : allArticles;

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  return (
    <main>
      <header>
        <h1>CHR Insights</h1>
        <p>
          Ressources pour les professionnels de la restauration et de
          l&apos;hôtellerie.
        </p>
      </header>

      <nav aria-label="Filtres thématiques">
        {FAMILIES.map((f) => {
          const href =
            f.value === ""
              ? "/"
              : `/?family=${f.value}`;
          return (
            <Link
              key={f.value}
              href={href}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      {paginated.length === 0 ? (
        <p>Aucun article publié pour l&apos;instant.</p>
      ) : (
        <ul>
          {paginated.map((article) => (
            <li key={article.slug}>
              <article>
                <Link href={`/${article.slug}`}>
                  <h2>
                    {article.title}
                  </h2>
                </Link>
                <p>
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : ""}
                  {article.readingTime
                    ? ` · ${article.readingTime} min de lecture`
                    : ""}
                </p>
                {article.metaDescription && (
                  <p>
                    {article.metaDescription}
                  </p>
                )}
                {article.family && (
                  <span>
                    {article.family}
                  </span>
                )}
              </article>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav aria-label="Pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            const href = selectedFamily
              ? `/?family=${selectedFamily}&page=${page}`
              : `/?page=${page}`;
            return (
              <Link
                key={page}
                href={href}
              >
                {page}
              </Link>
            );
          })}
        </nav>
      )}
    </main>
  );
}