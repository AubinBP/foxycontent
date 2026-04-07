"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FAMILIES = [
  { value: "emballages-chr", label: "Emballages CHR" },
  { value: "boissons-bar", label: "Boissons & Bar" },
  { value: "actualite-resto", label: "Actualité Resto" },
  { value: "guides-pratiques", label: "Guides pratiques" },
  { value: "data-chiffres", label: "Data & Chiffres" },
];

const ANGLES = [
  { value: "guide ", label: "Guide " },
  { value: "comparatif", label: "Comparatif" },
  { value: "tendances", label: "Tendances" },
  { value: "revue", label: "Revue produit" },
];

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error("Erreur lors de la génération");

      router.push("/admin/dashboard");
    } catch (err) {
      setError("Une erreur est survenue. Vérifie qu'Ollama est bien lancé.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-10">
      <div className="mb-8">
        <a href="/admin/dashboard" className="text-sm text-gray-400 hover:text-gray-600">
          ← Retour au dashboard
        </a>
      </div>

      <h1 className="text-2xl font-bold mb-2">Générer un article</h1>
      <p className="text-gray-500 text-sm mb-8">
        Remplis le brief ci-dessous, Phi va rédiger l&apos;article complet.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sujet de l&apos;article *
          </label>
          <input
            name="topic"
            required
            placeholder="Ex : Les emballages compostables en restauration rapide"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Catégorie *
          </label>
          <select
            name="family"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">Choisir une catégorie...</option>
            {FAMILIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            La catégorie détermine dans quel filtre l&apos;article apparaît sur le blog.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mots-clés SEO *
          </label>
          <input
            name="keywords"
            required
            placeholder="emballage compostable, CHR écolo, packaging restauration"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-xs text-gray-400 mt-1">Séparés par des virgules.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Angle éditorial *
          </label>
          <select
            name="angle"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">Choisir un angle...</option>
            {ANGLES.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longueur cible (mots)
          </label>
          <input
            name="length"
            type="number"
            defaultValue={1000}
            min={800}
            max={1400}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ancre du backlink vers foxtable.com
          </label>
          <input
            name="anchor"
            placeholder="packaging éco-responsable CHR"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes complémentaires (optionnel)
          </label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Angles spécifiques, sources à mentionner, ton particulier..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-3 rounded-lg transition-colors text-sm"
        >
          {loading ? "Génération en cours... (3-5 minutes)" : "Générer l'article"}
        </button>
      </form>
    </main>
  );
}