import Link from "next/link";

const NAV = [
  { href: "/admin/dashboard", label: "Vue d'ensemble", icon: "⊞" },
  { href: "/admin/articles", label: "Articles", icon: "≡" },
  { href: "/admin/generate", label: "Générer à la main", icon: "✦" },
  { href: "/admin/settings", label: "Paramètres", icon: "⚙" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-full z-10">
        <div className="px-6 py-5 border-b border-gray-100">
          <span className="font-bold text-gray-900 text-base tracking-tight">
            FoxyContent
          </span>
          <span className="block text-xs text-gray-400 mt-0.5">Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
            >
              <span className="text-base w-5 text-center text-gray-400 group-hover:text-gray-600">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-gray-100">
          <Link
            href="/"
            target="_blank"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            ↗ Voir le blog
          </Link>
        </div>
      </aside>
      <main className="flex-1 ml-56 min-h-screen">
        {children}
      </main>
    </div>
  );
}