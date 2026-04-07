"use client";

import { useFormStatus } from "react-dom";

export default function TriggerButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`cursor-pointer w-full h-full flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl transition-all group text-left ${
        pending ? "opacity-70 cursor-not-allowed" : "hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
        pending ? "bg-gray-100 text-gray-400 animate-spin" : "bg-purple-50 text-purple-600 group-hover:bg-purple-100"
      }`}>
        {pending ? "⏳" : "▶"}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">
          {pending ? "Génération en cours..." : "Forcer la génération"}
        </p>
        <p className="text-xs text-gray-400">
          {pending ? "Veuillez patienter quelques secondes" : "Déclencher l'auto-génération"}
        </p>
      </div>
    </button>
  );
}