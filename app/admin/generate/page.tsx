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
        <a href="/admin/dashboard">
          ← Retour au dashboard
        </a>
      </div>

      <h1 className="text-xl pb-2 font-bold">Générer un article</h1>
      <p className="pb-6">
        Remplis les informations ci dessous pour l'articles, Phi va rédiger l&apos;article en fonction des informations remplis.
      </p>

      {error && (
        <div>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="pb-5">
          <label className="block text-gray mb-1">
            Sujet de l&apos;article 
          </label>
          <input
            name="topic"
            required
            placeholder="Ex : Les emballages éco-responsables en restauration rapide"
          />
        </div>

        <div className="pb-5">
          <label className="block text-gray mb-1">
            Catégorie (filtre blog)
          </label>
          <select
            name="family"
            required
          >
            <option value="">Choisir une catégorie</option>
            {FAMILIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div className="pb-5">
          <label className="block text-gray mb-1">
            Mots-clés SEO (séparés par des virgules)
          </label>
          <input
            name="keywords"
            required
            placeholder="emballage compostable, CHR écolo, packaging restauration"
          />
        </div>

        <div>
          <label>
            Angle éditorial 
          </label>
          <select
            name="angle"
            required
          >
            <option value="">Choisir un angle...</option>
            {ANGLES.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-5">
          <label className="block text-gray mb-1">
            Longueur cible (mots)
          </label>
          <input
            name="length"
            type="number"
            defaultValue={1000}
            min={800}
            max={1400}
          />
        </div>

        <div className="pt-5">
          <label className="block text-gray mb-1">
            Ancre du backlink vers foxytable.com
          </label>
          <input
            name="anchor"
            placeholder="packaging éco-responsable CHR"
          />
        </div>

        <div className="pt-5">
          <label className="block text-gray mb-1">
            Notes complémentaires (optionnel)
          </label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Angles spécifiques, sources à mentionner, ton particulier..."
          />
        </div>

        <button
        className="font-bold text-xl mt-4 border-2 bg-green-500 p-2 text-white rounded-md"
          type="submit"
          disabled={loading}
        >
          {loading ? "Génération en cours... (3-5 minutes)" : "Générer l'article"}
        </button>
      </form>
    </main>
  );
}