import { generateArticle } from "@/lib/ai";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { getSetting, setSetting, getBacklinks } from "@/lib/settings";

async function getNews() {
  try {
    const res = await fetch(
      `https://newsapi.org/v2/everything?q=restauration OR CHR&language=fr&sortBy=publishedAt&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`
    );

    const data = await res.json();
    return data.articles || [];
  } catch (error) {
    console.error("Erreur récupération news:", error);
    return [];
  }
}

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
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const articlesPerDay =
      parseInt(await getSetting("articles_per_day")) || 3;

    const autoPublish =
      (await getSetting("auto_publish")) === "true";

    const backlinks = await getBacklinks();

    const news = await getNews();

    const results = [];

    for (let i = 0; i < articlesPerDay; i++) {

      const brief =
        news.length > 0
          ? {
              topic: news[Math.floor(Math.random() * news.length)].title,
              family: "actualite-resto",
              keywords: ["actualité restauration", "CHR news"],
              angle: "actualité",
            }
          : AUTO_BRIEFS[Math.floor(Math.random() * AUTO_BRIEFS.length)];

      const anchor =
        backlinks.length > 0
          ? backlinks[Math.floor(Math.random() * backlinks.length)]
          : "foxytable";

      try {
        const result = await generateArticle({
          ...brief,
          targetLength: 1000,
          backlinkAnchor: anchor,
          withNews: true,
        });

        const slugBase = result.slug;

        const existing = await db.query.articles.findFirst({
          where: (a, { eq }) => eq(a.slug, slugBase),
        });

        const finalSlug = existing
          ? `${slugBase}-${Date.now()}`
          : slugBase;

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

        results.push({
          slug: finalSlug,
          success: true,
        });

      } catch (err) {
        console.error("Erreur génération :", err);

        results.push({
          brief: brief.topic,
          success: false,
          error: String(err),
        });
      }
    }

    await setSetting("last_cron", new Date().toISOString());

    return Response.json({
      success: true,
      generated: results,
      usedNews: news.length > 0,
    });

  } catch (err) {
    return Response.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}