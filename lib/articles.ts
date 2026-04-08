import { db } from "./db";
import { articles } from "./db/schema";
import { eq, desc } from "drizzle-orm";

export async function getPublishedArticles() {
  return db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      metaDescription: articles.metaDescription,
      family: articles.family,
      tags: articles.tags,
      readingTime: articles.readingTime,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt)); 
}

export async function getArticleBySlug(slug: string) {
  const result = await db
    .select()
    .from(articles)
    .where(eq(articles.slug, slug))
    .limit(1);
  return result[0] ?? null;
}