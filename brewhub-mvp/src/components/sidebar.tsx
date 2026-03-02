"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface WikiPage {
  id: string;
  slug: string;
  title: string;
}

const menuItems = [
  { href: "/", label: "Home" },
  { href: "/config", label: "Config" },
  { href: "/batches/new", label: "+ New Batch" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [wikiPages, setWikiPages] = useState<WikiPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWikiPages();
  }, []);

  const fetchWikiPages = async () => {
    try {
      const response = await fetch("/api/wiki");
      if (response.ok) {
        const data = await response.json();
        setWikiPages(data);
      }
    } catch (error) {
      console.error("Failed to fetch wiki pages:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="w-64 border-r bg-card flex flex-col">
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Wiki
            </h3>
            <Link
              href="/wiki/new"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Page
            </Link>
          </div>
          <div className="space-y-1">
            {loading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Loading...
              </div>
            ) : wikiPages.length > 0 ? (
              wikiPages.map((page) => (
                <Link
                  key={page.id}
                  href={`/wiki/${page.slug}`}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                    pathname === `/wiki/${page.slug}`
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {page.title}
                </Link>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No pages yet
              </div>
            )}
          </div>
        </div>
      </nav>
    </aside>
  );
}
