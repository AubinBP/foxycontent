// app/(blog)/page.tsx
// ─── SEO maximal : metadata complète, JSON-LD WebSite + ItemList, sitemap hint ───

import Link from "next/link";
import { getPublishedArticles } from "@/lib/articles";
import type { Metadata } from "next";
import SearchBar from "@/components/searchbar";

export const dynamic = "force-dynamic";

// ── Metadata Next.js ─────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "CHR Insights — Actualités Café, Hôtel, Restauration",
  description:
    "CHR Insights : toute l'actualité des professionnels CHR. Emballages éco-responsables, tendances boissons & bar, gestion de restaurant, guides pratiques et données de marché.",
  keywords: [
    "actualité CHR",
    "café hôtel restaurant",
    "emballages restauration",
    "packaging CHR",
    "tendances restauration",
    "gestion restaurant",
    "boissons bar",
    "foxytable emballages",
  ],
  alternates: {
    canonical: process.env.NEXT_PUBLIC_URL ?? "https://chr-insights.fr",
  },
  openGraph: {
    title: "CHR Insights — Actualités Café, Hôtel, Restauration",
    description:
      "Le média de référence des professionnels CHR : emballages, boissons, gestion, tendances marché.",
    type: "website",
    url: process.env.NEXT_PUBLIC_URL ?? "https://chr-insights.fr",
    siteName: "CHR Insights",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "CHR Insights — Actualités CHR",
    description: "Emballages, boissons, gestion de restaurant : l'actu des pros CHR.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1 },
  },
};

// ── Constantes ────────────────────────────────────────────────────────────────

const FAMILIES = [
  { value: "", label: "Tous les sujets" },
  { value: "emballages-chr", label: "Emballages CHR" },
  { value: "boissons-bar", label: "Boissons & Bar" },
  { value: "actualite-resto", label: "Actualité Resto" },
  { value: "guides-pratiques", label: "Guides pratiques" },
  { value: "data-chiffres", label: "Data & Chiffres" },
];

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

const PER_PAGE = 10;
const SITE_URL = process.env.NEXT_PUBLIC_URL ?? "https://chr-insights.fr";

// ── Page ──────────────────────────────────────────────────────────────────────

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

  const featured = paginated[0];
  const rest = paginated.slice(1);

  // JSON-LD : WebSite (SearchAction pour Google Sitelinks Search Box)
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CHR Insights",
    url: SITE_URL,
    description:
      "Le média de référence des professionnels du café, hôtel et restauration.",
    inLanguage: "fr-FR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // JSON-LD : ItemList des articles visibles (aide Google à comprendre la liste)
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: selectedFamily
      ? `Articles ${FAMILY_LABELS[selectedFamily] ?? selectedFamily} — CHR Insights`
      : "Derniers articles CHR Insights",
    url: selectedFamily ? `${SITE_URL}/?family=${selectedFamily}` : SITE_URL,
    numberOfItems: filtered.length,
    itemListElement: paginated.map((a, i) => ({
      "@type": "ListItem",
      position: (currentPage - 1) * PER_PAGE + i + 1,
      url: `${SITE_URL}/${a.slug}`,
      name: a.title,
    })),
  };

  // JSON-LD : Organization
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CHR Insights",
    url: SITE_URL,
    description:
      "Média d'information professionnelle CHR : emballages, boissons, restauration.",
  };

  return (
    <>
      {/* ── Structured data ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      <div className="min-h-screen bg-[#F7F5F0] font-['Crimson_Pro',serif]">

        {/* ── TOP BAR ── */}
        <div className="bg-[#1A1A18] text-gray-400 text-xs font-['DM_Sans',sans-serif] tracking-widest uppercase">
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
            <span>Le média des pros CHR</span>
            <time dateTime={new Date().toISOString().split("T")[0]}>
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </div>

        {/* ── MASTHEAD ── */}
        <header className="bg-[#1A1A18] text-white border-b-4 border-[#D4A853]">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <p className="font-['DM_Sans',sans-serif] text-[#D4A853] text-xs tracking-[0.3em] uppercase mb-2">
                  Café · Hôtel · Restaurant
                </p>
                {/* h1 sémantique sur la homepage = nom du site */}
                <h1
                  className="text-6xl md:text-7xl font-black tracking-tight leading-none"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  CHR<span className="text-[#D4A853]">.</span>
                  <br />
                  <span className="text-4xl md:text-5xl font-normal italic">Insights</span>
                </h1>
                {/* Tagline indexable */}
                <p className="mt-3 font-['DM_Sans',sans-serif] text-sm text-gray-400 max-w-md">
                  Actualités, analyses et guides pour les professionnels du café, de l&apos;hôtellerie et de la restauration.
                </p>
              </div>
              <div className="md:w-80">
                <SearchBar articles={allArticles} />
              </div>
            </div>
          </div>

          {/* ── NAV CATÉGORIES ── */}
          <nav aria-label="Catégories d'articles" className="border-t border-white/10">
            <div className="max-w-7xl mx-auto px-6">
              <ul className="flex overflow-x-auto font-['DM_Sans',sans-serif] text-sm" role="list">
                {FAMILIES.map((f) => {
                  const href = f.value === "" ? "/" : `/?family=${f.value}`;
                  const active = selectedFamily === f.value;
                  return (
                    <li key={f.value}>
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={`block px-4 py-4 whitespace-nowrap border-b-2 transition-colors ${
                          active
                            ? "border-[#D4A853] text-[#D4A853]"
                            : "border-transparent text-gray-400 hover:text-white hover:border-white/40"
                        }`}
                      >
                        {f.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        </header>

        {/* ── CONTENT ── */}
        <main className="max-w-7xl mx-auto px-6 py-10">
          {/* Titre de rubrique indexable si filtre actif */}
          {selectedFamily && (
            <h2
              className="font-['DM_Sans',sans-serif] text-xs tracking-widest uppercase text-gray-500 mb-6"
              aria-label={`Rubrique : ${FAMILY_LABELS[selectedFamily]}`}
            >
              Rubrique : {FAMILY_LABELS[selectedFamily]}
              <span className="ml-2 text-gray-400">— {filtered.length} article{filtered.length > 1 ? "s" : ""}</span>
            </h2>
          )}

          {paginated.length === 0 ? (
            <p className="text-gray-500 font-['DM_Sans',sans-serif] py-20 text-center">
              Aucun article publié pour l&apos;instant.
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

              {/* ── ARTICLES ── */}
              <section aria-label="Liste des articles" className="lg:col-span-8 space-y-0">

                {/* Article à la une */}
                {featured && (
                  <article
                    className="mb-8 pb-8 border-b-2 border-[#1A1A18]"
                    itemScope
                    itemType="https://schema.org/Article"
                  >
                    <meta itemProp="publisher" content="CHR Insights" />
                    {featured.publishedAt && (
                      <meta itemProp="datePublished" content={new Date(featured.publishedAt).toISOString()} />
                    )}

                    {featured.family && (
                      <span
                        className={`inline-block text-xs font-['DM_Sans',sans-serif] font-semibold tracking-widest uppercase px-3 py-1 rounded-sm mb-4 ${
                          FAMILY_COLORS[featured.family] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {FAMILY_LABELS[featured.family] ?? featured.family}
                      </span>
                    )}

                    <Link href={`/${featured.slug}`} className="group">
                      <h2
                        className="text-4xl md:text-5xl font-bold leading-tight group-hover:text-[#B8912A] transition-colors mb-4"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        itemProp="headline"
                        data-title={featured.title.toLowerCase()}
                      >
                        {featured.title}
                      </h2>
                    </Link>

                    {featured.metaDescription && (
                      <p
                        className="text-xl text-gray-600 leading-relaxed mb-4"
                        style={{ fontFamily: "'Crimson Pro', serif" }}
                        itemProp="description"
                      >
                        {featured.metaDescription}
                      </p>
                    )}

                    <div className="flex items-center gap-3 font-['DM_Sans',sans-serif] text-sm text-gray-500">
                      {featured.publishedAt && (
                        <time dateTime={new Date(featured.publishedAt).toISOString()}>
                          {new Date(featured.publishedAt).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </time>
                      )}
                      {featured.readingTime && (
                        <>
                          <span className="text-[#D4A853]">·</span>
                          <span>{featured.readingTime} min de lecture</span>
                        </>
                      )}
                      <span className="text-[#D4A853]">·</span>
                      <Link
                        href={`/${featured.slug}`}
                        className="text-[#B8912A] font-semibold hover:underline"
                      >
                        Lire l&apos;article →
                      </Link>
                    </div>
                  </article>
                )}

                {/* Liste des autres articles */}
                <div className="divide-y divide-gray-200">
                  {rest.map((article) => (
                    <article
                      key={article.slug}
                      className="py-6 group"
                      itemScope
                      itemType="https://schema.org/Article"
                    >
                      <meta itemProp="publisher" content="CHR Insights" />
                      {article.publishedAt && (
                        <meta itemProp="datePublished" content={new Date(article.publishedAt).toISOString()} />
                      )}

                      <div className="flex gap-6 items-start">
                        <div className="hidden sm:block w-1 self-stretch bg-gray-200 group-hover:bg-[#D4A853] transition-colors rounded-full flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {article.family && (
                              <span
                                className={`text-xs font-['DM_Sans',sans-serif] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-sm ${
                                  FAMILY_COLORS[article.family] ?? "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {FAMILY_LABELS[article.family] ?? article.family}
                              </span>
                            )}
                            {article.publishedAt && (
                              <time
                                dateTime={new Date(article.publishedAt).toISOString()}
                                className="font-['DM_Sans',sans-serif] text-xs text-gray-400"
                              >
                                {new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </time>
                            )}
                            {article.readingTime && (
                              <span className="font-['DM_Sans',sans-serif] text-xs text-gray-400">
                                · {article.readingTime} min
                              </span>
                            )}
                          </div>

                          <Link href={`/${article.slug}`}>
                            <h2
                              className="text-2xl font-bold leading-snug group-hover:text-[#B8912A] transition-colors mb-2"
                              style={{ fontFamily: "'Playfair Display', serif" }}
                              itemProp="headline"
                              data-title={article.title.toLowerCase()}
                            >
                              {article.title}
                            </h2>
                          </Link>

                          {article.metaDescription && (
                            <p
                              className="text-gray-600 text-lg leading-relaxed line-clamp-2"
                              style={{ fontFamily: "'Crimson Pro', serif" }}
                              itemProp="description"
                            >
                              {article.metaDescription}
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination avec liens canoniques */}
                {totalPages > 1 && (
                  <nav
                    aria-label="Pagination des articles"
                    className="pt-8 mt-8 border-t border-gray-300 flex items-center gap-2 font-['DM_Sans',sans-serif]"
                  >
                    <span className="text-sm text-gray-500 mr-2">Page :</span>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      const href = selectedFamily
                        ? `/?family=${selectedFamily}&page=${page}`
                        : `/?page=${page}`;
                      return (
                        <Link
                          key={page}
                          href={href}
                          aria-current={page === currentPage ? "page" : undefined}
                          aria-label={`Page ${page}`}
                          className={`w-9 h-9 flex items-center justify-center text-sm border transition-colors ${
                            page === currentPage
                              ? "bg-[#1A1A18] text-white border-[#1A1A18]"
                              : "bg-white border-gray-300 hover:border-[#D4A853] hover:text-[#B8912A]"
                          }`}
                        >
                          {page}
                        </Link>
                      );
                    })}
                  </nav>
                )}
              </section>

              {/* ── SIDEBAR ── */}
              <aside aria-label="Informations complémentaires" className="lg:col-span-4 space-y-8">

                <div className="bg-[#1A1A18] text-white p-6">
                  <p className="font-['DM_Sans',sans-serif] text-[#D4A853] text-xs tracking-widest uppercase mb-3">
                    À propos
                  </p>
                  <p className="text-lg leading-relaxed text-gray-300" style={{ fontFamily: "'Crimson Pro', serif" }}>
                    CHR Insights est le média de référence pour les professionnels
                    du secteur café, hôtel et restauration. Analyses, guides et
                    tendances sur les emballages et l&apos;actualité du marché.
                  </p>
                </div>

                <nav aria-label="Rubriques du blog" className="bg-white border border-gray-200 p-6">
                  <p className="font-['DM_Sans',sans-serif] text-xs tracking-widest uppercase text-gray-500 mb-4">
                    Rubriques
                  </p>
                  <ul className="space-y-0 divide-y divide-gray-100">
                    {FAMILIES.filter((f) => f.value !== "").map((f) => (
                      <li key={f.value}>
                        <Link
                          href={`/?family=${f.value}`}
                          className={`flex items-center justify-between py-3 font-['DM_Sans',sans-serif] text-sm transition-colors group ${
                            selectedFamily === f.value
                              ? "text-[#B8912A] font-semibold"
                              : "text-gray-700 hover:text-[#B8912A]"
                          }`}
                        >
                          <span>{f.label}</span>
                          <span className="text-gray-300 group-hover:text-[#D4A853] transition-colors">→</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="p-6 border-2 border-[#D4A853]" style={{ background: "linear-gradient(135deg,#fffdf7,#fdf6e3)" }}>
                  <p className="font-['DM_Sans',sans-serif] text-[#B8912A] text-xs tracking-widest uppercase mb-2">Newsletter</p>
                  <p className="text-xl font-bold text-[#1A1A18] mb-3 leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Restez informé des tendances CHR
                  </p>
                  <p className="font-['DM_Sans',sans-serif] text-sm text-gray-600 mb-4">
                    Chaque semaine, les analyses et actualités qui comptent pour votre activité.
                  </p>
                  <div className="space-y-2">
                    <input type="email" placeholder="votre@email.com" aria-label="Adresse email newsletter"
                      className="w-full px-3 py-2 border border-gray-300 text-sm font-['DM_Sans',sans-serif] focus:outline-none focus:border-[#D4A853]" />
                    <button className="w-full bg-[#1A1A18] text-white text-sm font-['DM_Sans',sans-serif] font-semibold tracking-wide uppercase py-2.5 hover:bg-[#D4A853] hover:text-[#1A1A18] transition-colors">
                      S&apos;abonner
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 p-6">
                  <p className="font-['DM_Sans',sans-serif] text-xs tracking-widest uppercase text-gray-500 mb-4">
                    Sujets tendance
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Emballages eco", "Réglementation 2025", "Marché HORECA", "Plastique alternatif", "Food cost", "Livraison", "Barista", "Menu engineering"].map((tag) => (
                      <span key={tag}
                        className="text-xs font-['DM_Sans',sans-serif] border border-gray-300 px-2.5 py-1 text-gray-600 hover:border-[#D4A853] hover:text-[#B8912A] cursor-pointer transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          )}
        </main>

        {/* ── FOOTER ── */}
        <footer className="bg-[#1A1A18] text-gray-400 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
              <div>
                <p className="text-white text-3xl font-black mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                  CHR<span className="text-[#D4A853]">.</span>
                  <span className="text-xl font-normal italic">Insights</span>
                </p>
                <p className="text-sm leading-relaxed">
                  Le média indépendant dédié aux professionnels du café, hôtel et restauration en France.
                </p>
              </div>
              <nav aria-label="Rubriques footer">
                <p className="font-['DM_Sans',sans-serif] text-xs tracking-widest uppercase text-[#D4A853] mb-4">Rubriques</p>
                <ul className="space-y-2 text-sm font-['DM_Sans',sans-serif]">
                  {FAMILIES.filter((f) => f.value !== "").map((f) => (
                    <li key={f.value}>
                      <Link href={`/?family=${f.value}`} className="hover:text-white transition-colors">{f.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <nav aria-label="Liens légaux">
                <p className="font-['DM_Sans',sans-serif] text-xs tracking-widest uppercase text-[#D4A853] mb-4">Informations</p>
                <ul className="space-y-2 text-sm font-['DM_Sans',sans-serif]">
                  <li><Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
                  <li><Link href="/confidentialite" className="hover:text-white transition-colors">Politique de confidentialité</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </nav>
            </div>
            <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-xs font-['DM_Sans',sans-serif]">© {new Date().getFullYear()} CHR Insights — Tous droits réservés</p>
              <p className="text-xs font-['DM_Sans',sans-serif] text-gray-600">Média d&apos;information professionnelle CHR</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
