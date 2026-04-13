import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite", 
  dbCredentials: {
    url: "./foxycontent.db",
  },
} satisfies Config;