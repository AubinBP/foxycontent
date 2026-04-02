import Link from "next/link";
import { getPublishedArticles } from "@/lib/articles";
import type { Metadata } from "next";
import SearchBar from "@/components/searchbar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CHR Insights - Actualités emballages & restauration",
  description:
    "Conseils, tendances et ressources pour les professionnels CHR : emballages éco-responsables, boissons, gestion de restaurant.",
  openGraph: {
    title: "CHR Insights - Actualités emballages & restauration",
    description:
      "Conseils, tendances et ressources pour les professionnels CHR.",
    type: "website",
  },
};

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

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-gray-900 font-['Crimson_Pro',serif]">
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
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="font-['DM_Sans',sans-serif] text-[#D4A853] text-xs tracking-[0.3em] uppercase mb-2">
                Café · Hôtel · Restaurant
              </p>
              <h1
                className="text-6xl md:text-7xl font-black tracking-tight leading-none"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                CHR
                <span className="text-[#D4A853]">.</span>
                <br />
                <span className="text-4xl md:text-5xl font-normal italic">
                  Insights
                </span>
              </h1>
            </div>

            <div className="md:w-80">
              <SearchBar />
            </div>
          </div>
        </div>

        <nav className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            <ul className="flex overflow-x-auto scrollbar-hide font-['DM_Sans',sans-serif] text-sm">
              {FAMILIES.map((f) => {
                const href = f.value === "" ? "/" : `/?family=${f.value}`;
                const active = selectedFamily === f.value;
                return (
                  <li key={f.value}>
                    <Link
                      href={href}
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

      <main className="max-w-7xl mx-auto px-6 py-10">
        {paginated.length === 0 ? (
          <div className="text-center py-24 text-gray-500 font-['DM_Sans',sans-serif]">
            <p className="text-2xl">Aucun article disponible pour l&apos;instant.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            <section className="lg:col-span-8 space-y-0">

              {featured && (
                <article className="mb-8 pb-8 border-b-2 border-[#1A1A18]">
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
                      data-title={featured.title.toLowerCase()}
                    >
                      {featured.title}
                    </h2>
                  </Link>
                  {featured.metaDescription && (
                    <p className="text-xl text-gray-600 leading-relaxed mb-4" style={{ fontFamily: "'Crimson Pro', serif" }}>
                      {featured.metaDescription}
                    </p>
                  )}
                  <div className="flex items-center gap-3 font-['DM_Sans',sans-serif] text-sm text-gray-500">
                    {featured.publishedAt && (
                      <time>
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

              <div className="divide-y divide-gray-200">
                {rest.map((article) => (
                  <article
                    key={article.slug}
                    className="py-6 group"
                  >
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
                            <time className="font-['DM_Sans',sans-serif] text-xs text-gray-400">
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
                            data-title={article.title.toLowerCase()}
                          >
                            {article.title}
                          </h2>
                        </Link>

                        {article.metaDescription && (
                          <p className="text-gray-600 text-lg leading-relaxed line-clamp-2" style={{ fontFamily: "'Crimson Pro', serif" }}>
                            {article.metaDescription}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {totalPages > 1 && (
                <nav className="pt-8 mt-8 border-t border-gray-300 flex items-center gap-2 font-['DM_Sans',sans-serif]">
                  <span className="text-sm text-gray-500 mr-2">Page :</span>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const href = selectedFamily
                      ? `/?family=${selectedFamily}&page=${page}`
                      : `/?page=${page}`;
                    return (
                      <Link
                        key={page}
                        href={href}
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
                  {FAMILIES.filter((f) => f.value !== "").map((f) => {
                    const isActive = selectedFamily === f.value;
                    return (
                      <li key={f.value}>
                        <Link
                          href={`/?family=${f.value}`}
                          className={`flex items-center justify-between py-3 font-['DM_Sans',sans-serif] text-sm transition-colors group ${
                            isActive
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
                    );
                  })}
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
        )}
      </main>

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
                {FAMILIES.filter((f) => f.value !== "").map((f) => (
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
  );
}
