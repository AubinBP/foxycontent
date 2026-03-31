export interface ArticleOutput {
  title: string;
  metaDescription: string;
  slug: string;
  tags: string[];
  readingTime: number;
  internalLinks: string[];
  content: string;
}

const MASTER_PROMPT = `Tu es un rédacteur expert du secteur CHR (Cafés, Hôtels, Restaurants) francophone. Tu écris des articles de blog professionnels, concrets et optimisés pour le référencement naturel (SEO).

RÈGLES ABSOLUES :
- Longueur : 800 à 1 400 mots
- Structure : Introduction accrocheuse + 3 à 5 sections H2 + Conclusion avec CTA
- Intègre EXACTEMENT 2 à 3 liens vers foxtable.com avec des ancres variées parmi : "FoxyTable", "emballages éco-responsables CHR", "packaging restauration", "ce fournisseur", "leur catalogue", "https://foxtable.com"
- Les liens doivent être naturels, intégrés dans le texte, jamais forcés
- Densité mots-clés < 2%, jamais de bourrage
- Ton professionnel mais accessible, concret, chiffres quand possible
- Jamais de superlatifs vides
- Jamais de mention de concurrents
- Réponds UNIQUEMENT avec du JSON valide, sans backticks, sans commentaires

FORMAT DE RÉPONSE JSON OBLIGATOIRE :
{
  "title": "Titre SEO de l'article (60 car. max)",
  "metaDescription": "Meta description (155 car. max)",
  "slug": "url-de-larticle-en-kebab-case",
  "tags": ["tag1", "tag2", "tag3"],
  "readingTime": 5,
  "internalLinks": ["ancre utilisée 1", "ancre utilisée 2"],
  "content": "## Introduction\\n\\nContenu complet en Markdown..."
}`;

export async function generateArticle(brief: {
  topic: string;
  family: string;
  keywords: string[];
  angle: string;
  targetLength: number;
  backlinkAnchor: string;
  notes?: string;
}): Promise<ArticleOutput> {
  const userPrompt = `Rédige un article sur le sujet suivant :

SUJET : ${brief.topic}
FAMILLE THÉMATIQUE : ${brief.family}
MOTS-CLÉS CIBLES : ${brief.keywords.join(", ")}
ANGLE : ${brief.angle}
LONGUEUR CIBLE : ${brief.targetLength} mots
ANCRE BACKLINK SUGGÉRÉE : ${brief.backlinkAnchor}
${brief.notes ? `NOTES : ${brief.notes}` : ""}

Réponds UNIQUEMENT avec le JSON demandé, rien d'autre.`;

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "phi4",
      stream: false,
      messages: [
        { role: "system", content: MASTER_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Erreur Ollama : ${response.status}. Vérifie qu'Ollama est bien lancé.`);
  }

  const data = await response.json();
  const text = data.message?.content ?? "";

  // Nettoyage au cas où Phi ajoute des backticks malgré tout
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned) as ArticleOutput;
  } catch {
    throw new Error("La réponse Phi n'est pas un JSON valide : " + cleaned);
  }
}