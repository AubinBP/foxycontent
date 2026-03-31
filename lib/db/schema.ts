import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const articles = sqliteTable("articles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  metaDescription: text("meta_description"),
  family: text("family"),
  tags: text("tags"), // JSON stringifié
  status: text("status").notNull().default("draft"), // draft | published
  readingTime: integer("reading_time"),
  content: text("content"), // MDX complet
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  publishedAt: integer("published_at", { mode: "timestamp" }),
});

export const briefs = sqliteTable("briefs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  filename: text("filename"),
  topic: text("topic"),
  family: text("family"),
  status: text("status").notNull().default("pending"), // pending | generating | done | error
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const logs = sqliteTable("logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  articleId: integer("article_id"),
  tokensUsed: integer("tokens_used"),
  model: text("model"),
  error: text("error"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});