export interface SeoScore {
  score: number; // /100
  details: {
    titleLength: { ok: boolean; message: string };
    metaLength: { ok: boolean; message: string };
    wordCount: { ok: boolean; count: number; message: string };
    h2Count: { ok: boolean; count: number; message: string };
    backlinkCount: { ok: boolean; count: number; message: string };
    slugFormat: { ok: boolean; message: string };
  };
}

export function computeSeoScore(article: {
  title?: string | null;
  metaDescription?: string | null;
  content?: string | null;
  slug?: string | null;
  internalLinks?: string | null;
}): SeoScore {
  const title = article.title ?? "";
  const meta = article.metaDescription ?? "";
  const content = article.content ?? "";
  const slug = article.slug ?? "";

  const titleOk = title.length >= 30 && title.length <= 60;

  const metaOk = meta.length >= 120 && meta.length <= 155;

  const words = content.split(/\s+/).filter(Boolean).length;
  const wordOk = words >= 800 && words <= 1400;

  const h2Matches = content.match(/^## .+/gm) ?? [];
  const h2Count = h2Matches.length;
  const h2Ok = h2Count >= 3 && h2Count <= 5;

const backlinkMatches = content.match(/foxytable\.com/gi) ?? [];  
const backlinkCount = backlinkMatches.length;
  const backlinkOk = backlinkCount >= 2 && backlinkCount <= 3;

  const slugOk = /^[a-z0-9-]+$/.test(slug) && slug.length > 5;

  const points = [
    titleOk ? 20 : title.length > 0 ? 10 : 0,
    metaOk ? 20 : meta.length > 0 ? 10 : 0,
    wordOk ? 20 : words > 500 ? 10 : 0,
    h2Ok ? 20 : h2Count > 0 ? 10 : 0,
    backlinkOk ? 15 : backlinkCount > 0 ? 7 : 0,
    slugOk ? 5 : 0,
  ];
  const score = points.reduce((a, b) => a + b, 0);

  return {
    score,
    details: {
      titleLength: {
        ok: titleOk,
        message: titleOk
          ? `Titre OK (${title.length} car.)`
          : `Titre ${title.length} car. — idéal : 30-60`,
      },
      metaLength: {
        ok: metaOk,
        message: metaOk
          ? `Meta OK (${meta.length} car.)`
          : `Meta ${meta.length} car. — idéal : 120-155`,
      },
      wordCount: {
        ok: wordOk,
        count: words,
        message: wordOk
          ? `${words} mots — OK`
          : `${words} mots — idéal : 800-1400`,
      },
      h2Count: {
        ok: h2Ok,
        count: h2Count,
        message: h2Ok
          ? `${h2Count} sections H2 — OK`
          : `${h2Count} sections H2 — idéal : 3-5`,
      },
      backlinkCount: {
        ok: backlinkOk,
        count: backlinkCount,
        message: backlinkOk
          ? `${backlinkCount} backlinks — OK`
          : `${backlinkCount} backlinks foxtable.com — idéal : 2-3`,
      },
      slugFormat: {
        ok: slugOk,
        message: slugOk ? "Slug valide" : "Slug invalide (majuscules ou espaces)",
      },
    },
  };
}

export function getSeoColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 50) return "text-orange-500";
  return "text-red-500";
}

export function getSeoLabel(score: number): string {
  if (score >= 80) return "Bon";
  if (score >= 50) return "Moyen";
  return "Faible";
}