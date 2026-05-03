"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Wrench, Wheat, Hop, FlaskConical, Droplets, Barrel, FileText, ChevronLeft, ChevronRight, Home, Beer } from "lucide-react";

interface WikiPage {
  id: string;
  slug: string;
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
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
          )}
          {collapsed && <div className="border-t mx-2 mb-2" />}
          <div className="space-y-1">
            {collapsed ? (
              <Link
                href="/wiki/new"
                title="New Wiki Page"
                className="flex justify-center px-2 py-2 text-sm rounded-md transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <FileText className="w-4 h-4" />
              </Link>
            ) : loading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">Loading...</div>
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
              <div className="px-3 py-2 text-sm text-muted-foreground">No pages yet</div>
            )}
          </div>
        </div>
      </nav>
    </aside>
  );
}
