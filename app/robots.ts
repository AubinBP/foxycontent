import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_URL ?? "https://chr-insights.fr"; //Quand on aura l'url à remplacer

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
