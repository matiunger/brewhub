"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Wrench, Wheat, Hop, FlaskConical, Droplets, Barrel, FileText, ChevronLeft, ChevronRight, Home, Beer, Search } from "lucide-react";

interface WikiPage {
  id: string;
  slug: string;
  folder: string;
  title: string;
}

const menuItems = [
  { href: "/", label: "Batches", icon: Home },
];

const inventoryItems = [
  { href: "/inventory/equipment", label: "Equipment", icon: Wrench },
  { href: "/inventory/fermentables", label: "Fermentables", icon: Wheat },
  { href: "/inventory/hops", label: "Hops", icon: Hop },
  { href: "/inventory/cultures", label: "Cultures", icon: FlaskConical },
  { href: "/inventory/water", label: "Water", icon: Droplets },
  { href: "/inventory/kegs", label: "Kegs", icon: Barrel },
];

export function Sidebar() {
  const pathname = usePathname();
  const [wikiPages, setWikiPages] = useState<WikiPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (folder: string) => {
    setCollapsedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folder)) next.delete(folder);
      else next.add(folder);
      return next;
    });
  };

  useEffect(() => {
    fetch("/api/wiki")
      .then((r) => r.ok ? r.json() : [])
      .then(setWikiPages)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Group wiki pages by folder
  const groups = new Map<string, WikiPage[]>();
  for (const page of wikiPages) {
    const f = page.folder || "";
    if (!groups.has(f)) groups.set(f, []);
    groups.get(f)!.push(page);
  }
  const sortedFolders = [...groups.keys()].sort((a, b) =>
    !a ? -1 : !b ? 1 : a.localeCompare(b)
  );

  return (
    <aside className={cn("border-r bg-card flex flex-col transition-all duration-200", collapsed ? "w-14" : "w-64")}>
      <div className={cn("h-14 flex items-center border-b gap-2", collapsed ? "justify-center px-3" : "px-3")}>
        <Beer className="w-6 h-6 shrink-0 cursor-pointer" onClick={() => collapsed && setCollapsed(false)} />
        {!collapsed && (
          <>
            <span className="text-lg font-semibold flex-1">BrewHub</span>
            <button
              onClick={() => setCollapsed(true)}
              className="text-muted-foreground hover:text-foreground shrink-0 ml-auto"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                collapsed && "justify-center px-2",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && item.label}
            </Link>
          ))}
        </div>

        <div className="mt-6">
          {!collapsed && (
            <div className="px-3 mb-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Inventory
              </h3>
            </div>
          )}
          {collapsed && <div className="border-t mx-2 mb-2" />}
          <div className="space-y-1">
            {inventoryItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                  collapsed && "justify-center px-2",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {!collapsed && (
            <div className="flex items-center justify-between px-3 mb-2">
              <Link
                href="/wiki"
                className="text-sm font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
              >
                Wiki
              </Link>
              <div className="flex items-center gap-2">
                <Link
                  href="/wiki"
                  title="Search wiki"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Search className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/wiki/new"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Page
                </Link>
              </div>
            </div>
          )}
          {collapsed && <div className="border-t mx-2 mb-2" />}

          {collapsed ? (
            <div className="space-y-1">
              <Link
                href="/wiki"
                title="Wiki"
                className={cn(
                  "flex justify-center px-2 py-2 text-sm rounded-md transition-colors",
                  pathname.startsWith("/wiki")
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <FileText className="w-4 h-4" />
              </Link>
            </div>
          ) : loading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Loading…</div>
          ) : wikiPages.length > 0 ? (
            <div className="space-y-3">
              {sortedFolders.map((folder) => (
                <div key={folder || "__root__"} className="space-y-0.5">
                  {folder && (
                    <button
                      onClick={() => toggleFolder(folder)}
                      className="w-full flex items-center gap-1 px-3 pb-0.5 pt-1 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                    >
                      <ChevronRight className={cn("w-3 h-3 shrink-0 transition-transform", !collapsedFolders.has(folder) && "rotate-90")} />
                      {folder.split("/").join(" / ")}
                    </button>
                  )}
                  {!collapsedFolders.has(folder) && groups.get(folder)!.map((page) => (
                    <Link
                      key={page.id}
                      href={`/wiki/${page.slug}`}
                      className={cn(
                        "flex items-center py-1.5 text-sm rounded-md transition-colors",
                        folder ? "px-6" : "px-3",
                        pathname === `/wiki/${page.slug}`
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {page.title}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">No pages yet</div>
          )}
        </div>
      </nav>
    </aside>
  );
}
