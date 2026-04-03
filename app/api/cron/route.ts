import { generateArticle } from "@/lib/ai";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { getSetting, setSetting, getBacklinks } from "@/lib/settings";

// Les familles et sujets automatiques — rotation
const AUTO_BRIEFS = [
  {
    topic: "Les tendances des emballages biodégradables en CHR en 2025",
    family: "emballages-chr",
    keywords: ["emballage biodégradable", "CHR écolo", "packaging durable"],
    angle: "actualité",
  },
  {
    topic: "Comment réduire ses déchets d'emballage en restauration",
    family: "emballages-chr",
    keywords: ["réduction déchets", "emballage restaurant", "zéro déchet CHR"],
    angle: "guide pratique",
  },
  {
    topic: "Craft beer et CHR : comment référencer les bonnes bières",
    family: "boissons-bar",
    keywords: ["craft beer CHR", "bière artisanale restaurant", "carte bières"],
    angle: "guide pratique",
  },
  {
    topic: "Réglementation AGEC : ce que les restaurateurs doivent savoir",
    family: "actualite-resto",
    keywords: ["AGEC restauration", "loi emballage", "réglementation CHR"],
    angle: "actualité",
  },
  {
    topic: "Choisir son emballage selon le type de plat : le guide complet",
    family: "guides-pratiques",
    keywords: ["choisir emballage", "packaging plat chaud", "emballage livraison"],
    angle: "guide pratique",
  },
  {
    topic: "Statistiques CHR 2025 : chiffres clés du secteur",
    family: "data-chiffres",
    keywords: ["statistiques CHR", "chiffres restauration", "données secteur"],
    angle: "data",
  },
  {
    topic: "Les alternatives au plastique à usage unique en restauration",
    family: "emballages-chr",
    keywords: ["alternative plastique", "emballage sans plastique", "CHR durable"],
    angle: "guide pratique",
  },
  {
    topic: "Cocktails signature : comment se démarquer en bar CHR",
    family: "boissons-bar",
    keywords: ["cocktail signature", "bar CHR", "carte cocktails originale"],
    angle: "guide pratique",
  },
  {
    topic: "SIRHA 2026 : les innovations packaging à retenir",
    family: "actualite-resto",
    keywords: ["SIRHA 2026", "innovation packaging", "salon restauration"],
    angle: "actualité",
  },
  {
    topic: "Impact carbone des emballages en restauration : les vrais chiffres",
    family: "data-chiffres",
    keywords: ["impact carbone emballage", "bilan carbone CHR", "emballage écologique"],
    angle: "data",
  },
];

export async function GET(req: Request) {
  // Vérifie le token secret pour sécuriser le cron
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET){
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const articlesPerDay = parseInt(await getSetting("articles_per_day")) || 3;
    const autoPublish = (await getSetting("auto_publish")) === "true";
    const backlinks = await getBacklinks();

    const results = [];

    for (let i = 0; i < articlesPerDay; i++) {
      // Choisit un brief aléatoire dans la liste
      const brief = AUTO_BRIEFS[Math.floor(Math.random() * AUTO_BRIEFS.length)];

      // Choisit une ancre backlink aléatoire dans les backlinks configurés
      const anchor = backlinks[Math.floor(Math.random() * backlinks.length)];

      try {
        const result = await generateArticle({
          ...brief,
          targetLength: 1000,
          backlinkAnchor: anchor,
        });

        // Vérifie que le slug n'existe pas déjà
        const slugBase = result.slug;
        const existing = await db.query.articles.findFirst({
          where: (a, { eq }) => eq(a.slug, slugBase),
        });
        const finalSlug = existing ? `${slugBase}-${Date.now()}` : slugBase;

        await db.insert(articles).values({
          slug: finalSlug,
          title: result.title,
          metaDescription: result.metaDescription,
          family: brief.family,
          tags: JSON.stringify(result.tags),
          internalLinks: JSON.stringify(result.internalLinks),
          content: result.content,
          readingTime: result.readingTime,
          status: autoPublish ? "published" : "draft",
          publishedAt: autoPublish ? new Date() : null,
        });

        results.push({ slug: finalSlug, success: true });
      } catch (err) {
        results.push({ brief: brief.topic, success: false, error: String(err) });
      }
    }

    await setSetting("last_cron", new Date().toISOString());

    return Response.json({ success: true, generated: results });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}