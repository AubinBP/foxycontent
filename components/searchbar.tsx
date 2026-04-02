"use client";

import { useState } from "react";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  const handleChange = (value: string) => {
    const search = value.toLowerCase();
    setQuery(search);

    const titles = document.querySelectorAll("[data-title]");
    titles.forEach((el) => {
      const title = el.getAttribute("data-title") || "";
      const article = el.closest("article") as HTMLElement;
      if (!article) return;
      article.style.display = title.includes(search) ? "block" : "none";
    });
  };

  return (
    <div className="relative w-full md:w-80">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
        />
      </svg>
      <input
        type="text"
        placeholder="Rechercher un article..."
        className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm font-['DM_Sans',sans-serif] focus:outline-none focus:border-[#D4A853] focus:bg-white/15 transition-colors"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
}
