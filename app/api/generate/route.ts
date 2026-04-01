import { generateArticle } from "@/lib/ai";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";

export async function POST(req: Request) {
  const formData = await req.formData();

  const brief = {
    topic: formData.get("topic") as string,
    family: formData.get("family") as string,   
    keywords: (formData.get("keywords") as string).split(","),
    angle: formData.get("angle") as string,
    targetLength: Number(formData.get("length")),
    backlinkAnchor: formData.get("anchor") as string,
    notes: formData.get("notes") as string,
  };

  const result = await generateArticle(brief);

  await db.insert(articles).values({
    slug: result.slug,
    title: result.title,
    metaDescription: result.metaDescription,
    family: brief.family,                         
    tags: JSON.stringify(result.tags),
    internalLinks: JSON.stringify(result.internalLinks),
    content: result.content,
    readingTime: result.readingTime,
    status: "draft",
  });

  return Response.json({ success: true });
}