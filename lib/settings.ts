import { db } from "./db";
import { settings } from "./db/schema";
import { eq } from "drizzle-orm";

// Valeurs par défaut
const DEFAULTS: Record<string, string> = {
  articles_per_day: "3",
  auto_publish: "true",
  backlinks: JSON.stringify([
    "FoxyTable",
    "emballages éco-responsables CHR",
    "packaging restauration",
    "ce fournisseur",
    "leur catalogue",
    "https://foxtable.com",
  ]),
  last_cron: "",
};

export async function getSetting(key: string): Promise<string> {
  try {
    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);
    return result[0]?.value ?? DEFAULTS[key] ?? "";
  } catch {
    return DEFAULTS[key] ?? "";
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}

export async function getBacklinks(): Promise<string[]> {
  const raw = await getSetting("backlinks");
  try {
    return JSON.parse(raw);
  } catch {
    return Object.values(JSON.parse(DEFAULTS.backlinks));
  }
}