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
    title: article.title + " - CHR Insights",
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

const FAMILY_COLORS: Record<string, string> = {
  "emballages-chr": "bg-emerald-100 text-emerald-800",
  "boissons-bar": "bg-amber-100 text-amber-800",
  "actualite-resto": "bg-rose-100 text-rose-800",
  "guides-pratiques": "bg-sky-100 text-sky-800",
  "data-chiffres": "bg-violet-100 text-violet-800",
};

const FAMILY_LABELS: Record<string, string> = {
  "emballages-chr": "Emballages CHR",
  "boissons-bar": "Boissons & Bar",
  "actualite-resto": "Actualité Resto",
  "guides-pratiques": "Guides pratiques",
  "data-chiffres": "Data & Chiffres",
};

const FAMILIES = [
  { value: "emballages-chr", label: "Emballages CHR" },
  { value: "boissons-bar", label: "Boissons & Bar" },
  { value: "actualite-resto", label: "Actualité Resto" },
  { value: "guides-pratiques", label: "Guides pratiques" },
  { value: "data-chiffres", label: "Data & Chiffres" },
];

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
    author: { "@type": "Organization", name: "CHR Insights" },
    publisher: { "@type": "Organization", name: "CHR Insights" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#F7F5F0] font-['Crimson_Pro',serif]">
        <div className="bg-[#1A1A18] text-gray-400 text-xs font-['DM_Sans',sans-serif] tracking-widest uppercase">
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
            <span>Le média des pros CHR</span>
            <span>
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <header className="bg-[#1A1A18] text-white border-b-4 border-[#D4A853]">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <Link href="/" className="inline-block group">
              <p className="font-['DM_Sans',sans-serif] text-[#D4A853] text-xs tracking-[0.3em] uppercase mb-2">
                Café · Hôtel · Restaurant
              </p>
              <h1
                className="text-5xl md:text-6xl font-black tracking-tight leading-none"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                CHR
                <span className="text-[#D4A853]">.</span>
                <span className="text-3xl md:text-4xl font-normal italic">
                  Insights
                </span>
              </h1>
            </Link>
          </div>

          <nav className="border-t border-white/10">
            <div className="max-w-7xl mx-auto px-6">
              <ul className="flex overflow-x-auto font-['DM_Sans',sans-serif] text-sm">
                <li>
                  <Link
                    href="/"
                    className="block px-4 py-4 whitespace-nowrap border-b-2 border-transparent text-gray-400 hover:text-white hover:border-white/40 transition-colors"
                  >
                    Tous les sujets
                  </Link>
                </li>
                {FAMILIES.map((f) => (
                  <li key={f.value}>
                    <Link
                      href={`/?family=${f.value}`}
                      className={`block px-4 py-4 whitespace-nowrap border-b-2 transition-colors ${
                        article.family === f.value
                          ? "border-[#D4A853] text-[#D4A853]"
                          : "border-transparent text-gray-400 hover:text-white hover:border-white/40"
                      }`}
                    >
                      {f.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </header>

        <div className="max-w-7xl mx-auto px-6 pt-6">
          <nav
            aria-label="Fil d'ariane"
            className="font-['DM_Sans',sans-serif] text-sm text-gray-500 flex items-center gap-2"
          >
            <Link href="/" className="hover:text-[#B8912A] transition-colors">
              Accueil
            </Link>
            <span className="text-gray-300">/</span>
            {article.family && (
              <>
                <Link
                  href={`/?family=${article.family}`}
                  className="hover:text-[#B8912A] transition-colors"
                >
                  {FAMILY_LABELS[article.family] ?? article.family}
                </Link>
                <span className="text-gray-300">/</span>
              </>
            )}
            <span className="text-gray-400 truncate max-w-xs">{article.title}</span>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

          <div className="lg:col-span-8">

            <header className="mb-8 pb-8 border-b-2 border-[#1A1A18]">
              {article.family && (
                <span
                  className={`inline-block text-xs font-['DM_Sans',sans-serif] font-semibold tracking-widest uppercase px-3 py-1 rounded-sm mb-5 ${
                    FAMILY_COLORS[article.family] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {FAMILY_LABELS[article.family] ?? article.family}
                </span>
              )}

              <h1
                className="text-4xl md:text-5xl font-bold leading-tight mb-5"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {article.title}
              </h1>

              {article.metaDescription && (
                <p
                  className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-5"
                  style={{ fontFamily: "'Crimson Pro', serif" }}
                >
                  {article.metaDescription}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 font-['DM_Sans',sans-serif] text-sm text-gray-500">
                <span className="font-semibold text-gray-700">CHR Insights</span>
                {article.publishedAt && (
                  <>
                    <span className="text-[#D4A853]">·</span>
                    <time dateTime={article.publishedAt.toISOString()}>
                      {new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </>
                )}
                {article.readingTime && (
                  <>
                    <span className="text-[#D4A853]">·</span>
                    <span>{article.readingTime} min de lecture</span>
                  </>
                )}
              </div>
            </header>

            <article className="prose prose-lg max-w-none
              prose-headings:font-['Playfair_Display',serif] prose-headings:font-bold prose-headings:text-[#1A1A18]
              prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-lg
              prose-a:text-[#B8912A] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-[#1A1A18] prose-strong:font-semibold
              prose-blockquote:border-l-4 prose-blockquote:border-[#D4A853] prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:not-italic
              prose-ul:space-y-1 prose-li:text-gray-700 prose-li:text-lg
              prose-hr:border-gray-200
              prose-img:rounded-sm"
              style={{ fontFamily: "'Crimson Pro', serif" }}
            >
              <ReactMarkdown>{article.content ?? ""}</ReactMarkdown>
            </article>

            {tags.length > 0 && (
              <footer className="mt-10 pt-6 border-t border-gray-200">
                <p className="font-['DM_Sans',sans-serif] text-xs tracking-widest uppercase text-gray-500 mb-3">
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-['DM_Sans',sans-serif] border border-gray-300 px-3 py-1 text-gray-600 hover:border-[#D4A853] hover:text-[#B8912A] cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </footer>
            )}

            {internalLinks.length > 0 && (
              <section
                aria-label="Ressources associées"
                className="mt-10 p-6 bg-[#1A1A18] text-white"
              >
                <p className="font-['DM_Sans',sans-serif] text-[#D4A853] text-xs tracking-widest uppercase mb-4">
                  Ressources associées
                </p>
                <ul className="space-y-3">
                  {internalLinks.map((anchor) => (
                    <li key={anchor}>
                      <a
                        href="https://foxtable.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 group"
                      >
                        <span className="text-[#D4A853] mt-0.5 flex-shrink-0">→</span>
                        <span
                          className="text-gray-300 group-hover:text-white transition-colors text-lg underline underline-offset-2 decoration-gray-600 group-hover:decoration-[#D4A853]"
                          style={{ fontFamily: "'Crimson Pro', serif" }}
                        >
                          {anchor}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="mt-10 pt-6 border-t border-gray-200">
              <Link
                href="/"
                className="inline-flex items-center gap-2 font-['DM_Sans',sans-serif] text-sm text-gray-500 hover:text-[#B8912A] transition-colors group"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                Retour aux articles
              </Link>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-8">

            <div className="bg-[#1A1A18] text-white p-6">
              <p className="font-['DM_Sans',sans-serif] text-[#D4A853] text-xs tracking-widest uppercase mb-3">
                À propos
              </p>
              <p
                className="text-lg leading-relaxed text-gray-300"
                style={{ fontFamily: "'Crimson Pro', serif" }}
              >
                CHR Insights est le média de référence pour les professionnels
                du secteur café, hôtel et restauration. Analyses, guides et
                tendances sur les emballages et l&apos;actualité du marché.
              </p>
            </div>

            <div className="bg-white border border-gray-200 p-6">
              <p className="font-['DM_Sans',sans-serif] text-xs tracking-widest uppercase text-gray-500 mb-4">
                Rubriques
              </p>
              <ul className="space-y-0 divide-y divide-gray-100">
                {FAMILIES.map((f) => (
                  <li key={f.value}>
                    <Link
                      href={`/?family=${f.value}`}
                      className={`flex items-center justify-between py-3 font-['DM_Sans',sans-serif] text-sm transition-colors group ${
                        article.family === f.value
                          ? "text-[#B8912A] font-semibold"
                          : "text-gray-700 hover:text-[#B8912A]"
                      }`}
                    >
                      <span>{f.label}</span>
                      <span className="text-gray-300 group-hover:text-[#D4A853] transition-colors">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-6">
              <p className="font-['DM_Sans',sans-serif] text-xs tracking-widest uppercase text-gray-500 mb-4">
                Sujets tendance
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Emballages eco",
                  "Réglementation 2025",
                  "Marché HORECA",
                  "Plastique alternatif",
                  "Food cost",
                  "Livraison",
                  "Barista",
                  "Menu engineering",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-['DM_Sans',sans-serif] border border-gray-300 px-2.5 py-1 text-gray-600 hover:border-[#D4A853] hover:text-[#B8912A] cursor-pointer transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <footer className="bg-[#1A1A18] text-gray-400 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
              <div>
                <h2
                  className="text-white text-3xl font-black mb-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  CHR<span className="text-[#D4A853]">.</span>
                  <span className="text-xl font-normal italic">Insights</span>
                </h2>
                <p className="text-sm leading-relaxed">
                  Le média indépendant dédié aux professionnels du café, hôtel et
                  restauration en France.
                </p>
              </div>

              <div>
                <p className="font-['DM_Sans',sans-serif] text-xs tracking-widest uppercase text-[#D4A853] mb-4">
                  Rubriques
                </p>
                <ul className="space-y-2 text-sm font-['DM_Sans',sans-serif]">
                  {FAMILIES.map((f) => (
                    <li key={f.value}>
                      <Link
                        href={`/?family=${f.value}`}
                        className="hover:text-white transition-colors"
                      >
                        {f.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-['DM_Sans',sans-serif] text-xs tracking-widest uppercase text-[#D4A853] mb-4">
                  Mentions légales
                </p>
                <ul className="space-y-2 text-sm font-['DM_Sans',sans-serif]">
                  <li>
                    <Link href="/mentions-legales" className="hover:text-white transition-colors">
                      Mentions légales
                    </Link>
                  </li>
                  <li>
                    <Link href="/confidentialite" className="hover:text-white transition-colors">
                      Politique de confidentialité
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-xs font-['DM_Sans',sans-serif]">
                © {new Date().getFullYear()} CHR Insights - Tous droits réservés
              </p>
              <p className="text-xs font-['DM_Sans',sans-serif] text-gray-600">
                Média d&apos;information professionnelle CHR
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
