export interface ArticleOutput {
  title: string;
  metaDescription: string;
  slug: string;
  tags: string[];
  readingTime: number;
  internalLinks: string[];
  content: string;
}

export interface ValidationResult {
  ok: boolean;
  issues: string[];
}

const RSS_SOURCES = [
  "https://www.lerepairedescommercants.fr/feed/",
  "https://www.snacking.fr/feed/",
  "https://www.lesechos.fr/rss/rss_hotel.xml",
  "https://www.lineaires.com/feed/",
  "https://www.food-service.fr/feed/",
];

interface NewsItem {
  title: string;
  description: string;
  pubDate: string;
}

async function fetchRssFeed(url: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "FoxyContent/1.0 RSS Reader" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const items: NewsItem[] = [];

    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
    for (const match of itemMatches) {
      const block = match[1];
      const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)?.[1] ?? "";
      const desc = block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/)?.[1] ?? "";
      const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
      if (title) items.push({ title: title.trim(), description: desc.trim().slice(0, 200), pubDate });
      if (items.length >= 5) break;
    }
    return items;
  } catch {
    return [];
  }
}
export async function fetchRecentNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(RSS_SOURCES.map(fetchRssFeed));
  const all: NewsItem[] = [];

  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  const seen = new Set<string>();
  return all
    .filter((item) => {
      if (seen.has(item.title)) return false;
      seen.add(item.title);
      return true;
    })
    .slice(0, 8);
}

function countWords(text: string): number {
  return text
    .replace(/#{1,6}\s/g, "")
    .replace(/\[.*?\]\(.*?\)/g, "mot")
    .replace(/[*_`]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function countH2(content: string): number {
  return (content.match(/^## /gm) ?? []).length;
}

function countBacklinks(content: string): number {
  return (content.match(/foxtable\.com/gi) ?? []).length;
}

function validate(article: ArticleOutput): ValidationResult {
  const issues: string[] = [];
  const words = countWords(article.content);
  const h2 = countH2(article.content);
  const backlinks = countBacklinks(article.content);

  if (words < 900) issues.push(`Trop court : ${words} mots (min 900)`);
  if (words > 1500) issues.push(`Trop long : ${words} mots (max 1500)`);
  if (h2 < 3) issues.push(`Pas assez de H2 : ${h2} (min 3)`);
  if (h2 > 5) issues.push(`Trop de H2 : ${h2} (max 5)`);
  if (backlinks < 2) issues.push(`Pas assez de backlinks : ${backlinks} (min 2)`);
  if (backlinks > 3) issues.push(`Trop de backlinks : ${backlinks} (max 3)`);
  if (article.title.length > 60) issues.push(`Titre trop long : ${article.title.length} car.`);
  if (article.metaDescription.length > 155) issues.push(`Meta trop longue : ${article.metaDescription.length} car.`);

  return { ok: issues.length === 0, issues };
}

// Le prompt (à améliorer si besoin - Mais j'arrive pas à faire mieux)
const MASTER_PROMPT = `Tu es un rédacteur expert du secteur CHR (Cafés, Hôtels, Restaurants) francophone.
Tu rédiges des articles de blog professionnels, concrets, optimisés SEO.

CONTRAINTES STRICTES — respecte-les TOUTES sans exception :

[LONGUEUR — CRITIQUE]
- Le champ "content" doit contenir OBLIGATOIREMENT entre 1400 et 2000 mots
- C'est la contrainte la plus importante. Un article de 500 mots est un échec.
- Structure OBLIGATOIRE :
  * Introduction : 150-200 mots
  * Section H2 n°1 : 200-250 mots
  * Section H2 n°2 : 200-250 mots
  * Section H2 n°3 : 200-250 mots
  * Section H2 n°4 (optionnelle) : 150-200 mots
  * Conclusion avec CTA : 100-150 mots
- Chaque section doit être développée avec des exemples concrets, des chiffres, des conseils pratiques

[TITRE]
- Maximum 60 caractères
- Doit contenir le mot-clé principal

[META DESCRIPTION]
- Entre 120 et 155 caractères
- Doit contenir le mot-clé principal

[BACKLINKS — RÈGLE CRITIQUE]
- Intègre EXACTEMENT 2 backlinks vers foxytable.com dans le texte du content
- Format Markdown : [ancre](https://foxytable.com)
- Ancres possibles : "FoxyTable", "emballages éco-responsables CHR", "packaging restauration", "leur catalogue"
- Place-les dans des phrases naturelles, jamais en liste

[ACTUALITÉ]
- Si un contexte d'actualité est fourni, intègre-le naturellement 
- Donne des chiffres si besoin et des conseils pratiques liés à cette actualité
- Donne des termes techniques ou des noms de solutions concrètes si possible
- Donne bien des infos de l'actualité, ne te contente pas de la paraphraser

[FORMAT DE SORTIE]
Réponds UNIQUEMENT avec ce JSON valide, zéro texte autour, zéro backtick :
{
  "title": "...",
  "metaDescription": "...",
  "slug": "slug-kebab-case",
  "tags": ["tag1", "tag2", "tag3"],
  "readingTime": 5,
  "internalLinks": ["ancre 1", "ancre 2"],
  "content": "## Introduction\\n\\nTexte de 150 mots minimum...\\n\\n## Titre section 1\\n\\nTexte de 200 mots minimum..."
}`;

function buildUserPrompt(
  brief: {
    topic: string;
    family: string;
    keywords: string[];
    angle: string;
    targetLength: number;
    backlinkAnchor: string;
    notes?: string;
  },
  newsContext: string
): string {
  return `Rédige un article sur ce sujet :

SUJET : ${brief.topic}
FAMILLE : ${brief.family}
MOTS-CLÉS : ${brief.keywords.join(", ")}
ANGLE : ${brief.angle}
LONGUEUR CIBLE : entre 900 et 1300 mots dans le champ content
ANCRE BACKLINK : ${brief.backlinkAnchor}
${brief.notes ? `NOTES : ${brief.notes}` : ""}
${
  newsContext
    ? `\nACTUALITÉ RÉCENTE À INTÉGRER (synthétise, ne cite pas les sources) :\n${newsContext}`
    : ""
}

Avant de répondre, vérifie :
1. Mon content fait entre 900 et 1300 mots ?
2. Ai-je exactement 2 liens [ancre](https://foxytable.com) ?
3. Ai-je entre 3 et 5 sections ## ?

Réponds UNIQUEMENT avec le JSON.`;
}

function buildRetryPrompt(issues: string[]): string {
  return `Ton article ne respectait pas ces critères :
${issues.map((i) => `- ${i}`).join("\n")}

Corrige UNIQUEMENT ces points et régénère l'article complet.
Rappels : 900-1300 mots dans content, exactement 2 liens [ancre](https://foxytable.com), 3-5 sections ##.
Réponds UNIQUEMENT avec le JSON.`;
}

async function callOllama(
  messages: { role: string; content: string }[]
): Promise<string> {
  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "phi4",
      stream: false,
      options: {
        temperature: 0.8,
        num_predict: 6000,
      },
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Erreur Ollama : ${response.status}. Vérifie qu'Ollama est bien lancé.`);
  }

  const data = await response.json();
  return data.message?.content ?? "";
}

function parseArticle(raw: string): ArticleOutput {
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .replace(/^[^{]*/, "")
    .replace(/[^}]*$/, "")
    .trim();

  const open = (cleaned.match(/{/g) ?? []).length;
  const close = (cleaned.match(/}/g) ?? []).length;
  const fixed = open > close ? cleaned + "}".repeat(open - close) : cleaned;

  try {
    return JSON.parse(fixed) as ArticleOutput;
  } catch {
    throw new Error("JSON invalide : " + fixed.slice(0, 400));
  }
}

export async function generateArticle(brief: {
  topic: string;
  family: string;
  keywords: string[];
  angle: string;
  targetLength: number;
  backlinkAnchor: string;
  notes?: string;
  withNews?: boolean;
}): Promise<ArticleOutput & { validation: ValidationResult; usedNews: boolean }> {

  let newsContext = "";
  let usedNews = false;

  if (brief.withNews !== false) {
    // Par défaut ON, sauf si explicitement désactivé
    const news = await fetchRecentNews();
    if (news.length > 0) {
      newsContext = news
        .map((n) => `- ${n.title}${n.description ? ` : ${n.description.slice(0, 100)}` : ""}`)
        .join("\n");
      usedNews = true;
    }
  }

  const MAX_RETRIES = 2;
  const messages: { role: string; content: string }[] = [
    { role: "system", content: MASTER_PROMPT },
    { role: "user", content: buildUserPrompt(brief, newsContext) },
  ];

  let lastArticle: ArticleOutput | null = null;
  let lastValidation: ValidationResult = { ok: false, issues: ["Non généré"] };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const raw = await callOllama(messages);
    let article: ArticleOutput;

    try {
      article = parseArticle(raw);
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err;
      messages.push({ role: "assistant", content: raw });
      messages.push({
        role: "user",
        content: "Ta réponse n'est pas un JSON valide. Réponds UNIQUEMENT avec le JSON demandé, sans aucun texte autour.",
      });
      continue;
    }

    const validation = validate(article);
    lastArticle = article;
    lastValidation = validation;

    if (validation.ok) {
      return { ...article, validation, usedNews };
    }

    if (attempt < MAX_RETRIES) {
      messages.push({ role: "assistant", content: raw });
      messages.push({ role: "user", content: buildRetryPrompt(validation.issues) });
    }
  }

  return { ...lastArticle!, validation: lastValidation, usedNews };
}
