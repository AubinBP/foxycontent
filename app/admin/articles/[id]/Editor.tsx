"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useState } from "react";

interface Props {
  articleId: number;
  initialContent: string;
  initialTitle: string;
  initialMeta: string;
}

function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h2>(.*?)<\/h2>/gs, "## $1\n\n")
    .replace(/<h3>(.*?)<\/h3>/gs, "### $1\n\n")
    .replace(/<strong>(.*?)<\/strong>/gs, "**$1**")
    .replace(/<em>(.*?)<\/em>/gs, "*$1*")
    .replace(/<a href="(.*?)">(.*?)<\/a>/gs, "[$2]($1)")
    .replace(/<li><p>(.*?)<\/p><\/li>/gs, "- $1\n")
    .replace(/<li>(.*?)<\/li>/gs, "- $1\n")
    .replace(/<ul>(.*?)<\/ul>/gs, "$1\n")
    .replace(/<ol>(.*?)<\/ol>/gs, "$1\n")
    .replace(/<p>(.*?)<\/p>/gs, "$1\n\n")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function markdownToHtml(md: string): string {
  return md
    .split("\n")
    .map((line) => {
      if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`;
      if (line.startsWith("### ")) return `<h3>${line.slice(4)}</h3>`;
      if (line.startsWith("- ")) return `<li>${line.slice(2)}</li>`;
      if (line.trim()) return `<p>${line}</p>`;
      return "";
    })
    .join("");
}

export default function ArticleEditor({
  articleId,
  initialContent,
  initialTitle,
  initialMeta,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [meta, setMeta] = useState(initialMeta);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
    ],
    content: markdownToHtml(initialContent),
    immediatelyRender: false,
  });

  if (!editor) return null;

  async function handleSave() {
    if (!editor) return;
    setSaving(true);
    setError(null);

    const markdown = htmlToMarkdown(editor.getHTML());

    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          metaDescription: meta,
          content: markdown,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erreur ${res.status} : ${text}`);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  }

  function addLink() {
    const url = prompt("URL du lien :");
    if (!url || !editor) return;
    editor.chain().focus().setLink({ href: url }).run();
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          Titre
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
        />
        <p className="text-xs text-gray-400 mt-1">
          {title.length} car. — idéal : 30-60
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          Meta description
        </label>
        <textarea
          value={meta}
          onChange={(e) => setMeta(e.target.value)}
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">
          {meta.length} car. — idéal : 120-155
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          Contenu
        </label>
        <div className="border border-gray-200 rounded-t-lg bg-gray-50/50 px-3 py-2 flex gap-1 flex-wrap">
          {[
            {
              label: "G",
              action: () => editor.chain().focus().toggleBold().run(),
              title: "Gras",
            },
            {
              label: "I",
              action: () => editor.chain().focus().toggleItalic().run(),
              title: "Italique",
            },
            {
              label: "H2",
              action: () =>
                editor.chain().focus().toggleHeading({ level: 2 }).run(),
              title: "Titre H2",
            },
            {
              label: "H3",
              action: () =>
                editor.chain().focus().toggleHeading({ level: 3 }).run(),
              title: "Titre H3",
            },
            { label: "🔗", action: addLink, title: "Ajouter un lien" },
            {
              label: "✕",
              action: () => editor.chain().focus().unsetLink().run(),
              title: "Supprimer le lien",
            },
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={btn.action}
              title={btn.title}
              className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded transition-colors"
            >
              {btn.label}
            </button>
          ))}
        </div>
        <div className="border border-t-0 border-gray-200 rounded-b-lg">
          <EditorContent
            editor={editor}
            className="prose prose-sm max-w-none px-4 py-3 min-h-96 focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-80"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          {saving ? "Sauvegarde..." : "Sauvegarder les modifications"}
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">✓ Sauvegardé</span>
        )}
        {error && (
          <span className="text-sm text-red-500 font-medium">✗ {error}</span>
        )}
      </div>
    </div>
  );
}