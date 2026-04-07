import { getSetting, setSetting, getBacklinks } from "@/lib/settings";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const articlesPerDay = await getSetting("articles_per_day");
  const autoPublish = await getSetting("auto_publish");
  const backlinks = await getBacklinks();
  const lastCron = await getSetting("last_cron");

  async function saveSettings(formData: FormData) {
    "use server";

    const perDay = formData.get("articles_per_day") as string;
    const auto = formData.get("auto_publish") === "on" ? "true" : "false";

    const links = [];
    for (let i = 0; i < 6; i++) {
      const val = formData.get(`backlink_${i}`) as string;
      if (val?.trim()) links.push(val.trim());
    }

    await setSetting("articles_per_day", perDay);
    await setSetting("auto_publish", auto);
    await setSetting("backlinks", JSON.stringify(links));

    revalidatePath("/admin/settings");
    redirect("/admin/settings");
  }

  return (
    <main className="max-w-2xl mx-auto p-10">
      <div className="mb-8">
        <Link href="/admin/dashboard" className="text-sm text-gray-400 hover:text-gray-600">
          ← Retour au dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-2">Paramètres</h1>
      <p className="text-gray-500 text-sm mb-8">
        Configure la génération automatique et les backlinks.
      </p>

      <form action={saveSettings} className="space-y-8">

        <section className="border rounded-xl p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Génération automatique</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Articles générés par jour
              </label>
              <input
                type="number"
                name="articles_per_day"
                defaultValue={articlesPerDay}
                min={1}
                max={10}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Entre 1 et 10 articles par déclenchement du cron.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="auto_publish"
                id="auto_publish"
                defaultChecked={autoPublish === "true"}
                className="w-4 h-4 accent-green-600"
              />
              <label htmlFor="auto_publish" className="text-sm text-gray-700">
                Publier automatiquement les articles générés
              </label>
            </div>
            <p className="text-xs text-gray-400">
              Si décoché, les articles générés passent en brouillon et attendent ta validation.
            </p>
          </div>
        </section>

        <section className="border rounded-xl p-6">
          <h2 className="font-semibold text-gray-800 mb-1">Backlinks vers foxytable.com</h2>
          <p className="text-xs text-gray-400 mb-4">
            Ces 6 ancres sont utilisées en rotation dans chaque article généré.
          </p>

          <div className="space-y-2">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-4">{i + 1}.</span>
                <input
                  type="text"
                  name={`backlink_${i}`}
                  defaultValue={backlinks[i] ?? ""}
                  placeholder={`Ancre ${i + 1} (ex: FoxyTable)`}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            ))}
          </div>
        </section>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors text-sm"
        >
          Sauvegarder les paramètres
        </button>
      </form>
    </main>
  );
}