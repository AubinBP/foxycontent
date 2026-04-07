import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { count, eq, desc } from "drizzle-orm";
import Link from "next/link";
import { computeSeoScore } from "@/lib/seo";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import DeleteButton from "../../../components/DeleteButton";
import TriggerButton from "./TriggerButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const totalResult = await db.select({ value: count() }).from(articles);
  const publishedResult = await db.select({ value: count() }).from(articles).where(eq(articles.status, "published"));
  const draftResult = await db.select({ value: count() }).from(articles).where(eq(articles.status, "draft"));
  const recentArticles = await db.select().from(articles).orderBy(desc(articles.createdAt)).limit(5);

  const total = totalResult[0]?.value ?? 0;
  const published = publishedResult[0]?.value ?? 0;
  const draft = draftResult[0]?.value ?? 0;

  const allForScore = await db.select().from(articles);
  const avgScore = allForScore.length
    ? Math.round(allForScore.reduce((acc, a) => acc + computeSeoScore(a).score, 0) / allForScore.length)
    : 0;

  async function deleteAction(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    await db.delete(articles).where(eq(articles.id, id));
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    redirect("/admin/dashboard");
  }

  async function triggerNow() {
    "use server";
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const secret = process.env.CRON_SECRET || "foxycontent-secret-2026";

    try {
      await fetch(`${baseUrl}/api/cron?token=${secret}`);
    } catch (e) {
      console.error("Erreur déclenchement cron:", e);
    }

    revalidatePath("/admin/dashboard");
    redirect("/admin/dashboard");
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Vue d&apos;ensemble</h1>
        <p className="text-sm text-gray-400 mt-1">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <KpiCard label="Total articles" value={total} />
        <KpiCard label="Publiés" value={published} color="green" />
        <KpiCard label="Brouillons" value={draft} color="orange" />
        <KpiCard label="Score SEO moyen" value={`${avgScore}/100`} color={avgScore >= 80 ? "green" : avgScore >= 50 ? "orange" : "red"} />
      </div>
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Link href="/admin/generate" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all group">
          <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-colors">✦</div>
          <div>
            <p className="text-sm font-medium text-gray-800">Générer à la main</p>
            <p className="text-xs text-gray-400">Lancer une génération unique</p>
          </div>
        </Link>

        <form action={triggerNow} className="h-full">
          <TriggerButton />
        </form>

        <Link href="/admin/articles" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all group">
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">≡</div>
          <div>
            <p className="text-sm font-medium text-gray-800">Voir les articles</p>
            <p className="text-xs text-gray-400">{total} articles au total</p>
          </div>
        </Link>

        <Link href="/admin/settings" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all group">
          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 group-hover:bg-gray-200 transition-colors">⚙</div>
          <div>
            <p className="text-sm font-medium text-gray-800">Paramètres du Cron</p>
            <p className="text-xs text-gray-400">Cron, backlinks...</p>
          </div>
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Articles récents</h2>
          <Link href="/admin/articles" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Voir tout →
          </Link>
        </div>

        {recentArticles.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400 text-sm">Aucun article pour l&apos;instant.</p>
            <Link href="/admin/generate" className="inline-block mt-3 text-sm text-green-600 hover:underline">
              Générer le premier →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-50">
              {recentArticles.map((article) => {
                const seo = computeSeoScore(article);
                return (
                  <tr key={article.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/articles/${article.id}`} className="font-medium text-gray-800 hover:text-green-600 transition-colors text-sm">
                        {article.title ?? "Sans titre"}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">/{article.slug}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                      {article.family?.replace(/-/g, " ") ?? "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold ${seo.score >= 80 ? "text-green-600" : seo.score >= 50 ? "text-orange-500" : "text-red-500"}`}>
                        {seo.score}/100
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${article.status === "published" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-600"}`}>
                        {article.status === "published" ? "Publié" : "Brouillon"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                      {article.createdAt ? new Date(article.createdAt).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <form action={deleteAction} className="inline">
                        <input type="hidden" name="id" value={article.id} />
                        <DeleteButton id={article.id} />
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function KpiCard({ label, value, color = "gray" }: { label: string; value: string | number; color?: string }) {
  const colors: Record<string, string> = {
    gray: "bg-white border-gray-200",
    green: "bg-white border-gray-200",
    orange: "bg-white border-gray-200",
    red: "bg-white border-gray-200",
  };
  const valueColors: Record<string, string> = {
    gray: "text-gray-900",
    green: "text-green-600",
    orange: "text-orange-500",
    red: "text-red-500",
  };
  return (
    <div className={`p-5 rounded-xl border ${colors[color]}`}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${valueColors[color]}`}>{value}</p>
    </div>
  );
}