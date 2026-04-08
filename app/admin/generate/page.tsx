"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const FAMILIES = [
  { value: "emballages-chr", label: "Emballages CHR" },
  { value: "boissons-bar", label: "Boissons & Bar" },
  { value: "actualite-resto", label: "Actualité Resto" },
  { value: "guides-pratiques", label: "Guides pratiques" },
  { value: "data-chiffres", label: "Data & Chiffres" },
];

const ANGLES = [
  { value: "guide", label: "Guide pratique" },
  { value: "comparatif", label: "Comparatif" },
  { value: "tendances", label: "Tendances" },
  { value: "revue", label: "Revue produit" },
  { value: "actualite", label: "Article d'actualité" },
];

interface GenerateResult {
  success: boolean;
  usedNews: boolean;
  validationOk: boolean;
  validationIssues: string[];
}

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [withNews, setWithNews] = useState(true);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const form = new FormData(e.currentTarget);
    form.set("withNews", withNews ? "true" : "false");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error("Erreur lors de la génération");

      const data: GenerateResult = await res.json();
      setResult(data);

      // Redirige après 2s si tout est ok, sinon reste sur la page avec le rapport
      if (data.validationOk) {
        setTimeout(() => router.push("/admin/articles"), 2000);
      }
    } catch {
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
        Remplis le brief ci-dessous. Phi-4 va rédiger l&apos;article en s&apos;appuyant sur les flux
        d&apos;actualité CHR récents si l&apos;option est activée.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div
          className={`mb-6 px-4 py-4 rounded-lg border text-sm space-y-1 ${
            result.validationOk
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-orange-50 border-orange-200 text-orange-800"
          }`}
        >
          <p className="font-semibold">
            {result.validationOk
              ? "✓ Article généré et conforme aux critères SEO — redirection dans 2s…"
              : "⚠ Article généré avec des écarts SEO (sauvegardé en brouillon)"}
          </p>
          {result.usedNews && (
            <p className="text-xs opacity-75">✦ Actualité CHR intégrée dans la génération</p>
          )}
          {result.validationIssues.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-xs">
              {result.validationIssues.map((issue, i) => (
                <li key={i}>· {issue}</li>
              ))}
            </ul>
          )}
          {!result.validationOk && (
            <Link
              href="/admin/articles"
              className="inline-block mt-2 text-xs underline font-medium"
            >
              Voir l&apos;article et le corriger →
            </Link>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Toggle actualité */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-700">Enrichir avec l&apos;actualité CHR</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Récupère les titres récents des flux RSS CHR pour contextualiser l&apos;article
            </p>
          </div>
          <button
            type="button"
            onClick={() => setWithNews((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              withNews ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                withNews ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

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
            <option value="">Choisir une catégorie…</option>
            {FAMILIES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
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
            <option value="">Choisir un angle…</option>
            {ANGLES.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
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
            Ancre du backlink vers foxytable.com
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
            placeholder="Angles spécifiques, sources à mentionner, ton particulier…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-3 rounded-lg transition-colors text-sm"
        >
          {loading
            ? `Génération en cours…${withNews ? " (actualité + rédaction, 2-5 min)" : " (3-5 min)"}`
            : "Générer l'article"}
        </button>
      </form>
    </main>
  );
}
