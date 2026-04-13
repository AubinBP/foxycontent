"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type Article = {
  title: string;
  slug: string;
};

export default function SearchBar({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (value: string) => {
    const search = value.toLowerCase();
    setQuery(search);

    if (!search) {
      setResults([]);
      return;
    }

    const filtered = articles
      .filter((a) => a.title.toLowerCase().includes(search))
      .slice(0, 5);

    setResults(filtered);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        placeholder="Rechercher un article..."
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm font-['DM_Sans',sans-serif] focus:outline-none focus:border-[#D4A853] focus:bg-white/15 transition-colors"
      />

      {results.length > 0 && (
        <div className="absolute mt-2 w-full bg-white text-black shadow-xl border border-gray-200 z-50 rounded-sm overflow-hidden">
          {results.map((article) => (
            <Link
              key={article.slug}
              href={`/${article.slug}`}
              onClick={() => setResults([])}
              className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
            >
              {article.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}