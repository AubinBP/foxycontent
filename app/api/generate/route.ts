import { generateArticle } from "@/lib/ai";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const formData = await req.formData();

const withNewsRaw = formData.get("withNews");

const withNews =
  withNewsRaw === null
    ? true 
    : withNewsRaw === "true";

  const brief = {
    topic: formData.get("topic") as string,
    family: formData.get("family") as string,
    keywords: (formData.get("keywords") as string)
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    angle: formData.get("angle") as string,
    targetLength: Number(formData.get("length") ?? 1000),
    backlinkAnchor: (formData.get("anchor") as string) || "packaging restauration",
    notes: (formData.get("notes") as string) || undefined,
    withNews,
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

  revalidatePath("/");
  revalidatePath("/admin/articles");

  return Response.json({
    success: true,
    usedNews: result.usedNews,
    validationOk: result.validation.ok,
    validationIssues: result.validation.issues,
  });
}
