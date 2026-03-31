import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite", // On utilise "dialect" à la place de "driver"
  dbCredentials: {
    url: "./foxycontent.db",
  },
} satisfies Config;