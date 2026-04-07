import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  await db
    .update(articles)
    .set({
      title: body.title,
      metaDescription: body.metaDescription,
      content: body.content,
    })
    .where(eq(articles.id, Number(id)));

  revalidatePath("/");
  revalidatePath(`/admin/articles/${id}`);

  return Response.json({ success: true });
}