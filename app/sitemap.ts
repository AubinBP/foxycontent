import { getPublishedArticles } from "@/lib/articles";
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_URL ?? "https://chr-insights.fr";

const FAMILIES = [
  "emballages-chr",
  "boissons-bar",
  "actualite-resto",
  "guides-pratiques",
  "data-chiffres",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedArticles();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/mentions-legales`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/confidentialite`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    ...FAMILIES.map((f) => ({
      url: `${SITE_URL}/?family=${f}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/${a.slug}`,
    lastModified: a.publishedAt ? new Date(a.publishedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...articlePages];
}
