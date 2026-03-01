"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/", label: "Home" },
  { href: "/config", label: "Config" },
  { href: "/batches/new", label: "+ New Batch" },
];

const wikiPages = [
  { href: "/wiki/cleaning", label: "Cleaning & Sanitization" },
  { href: "/wiki/kegging", label: "Kegging" },
  { href: "/wiki/salts", label: "Salts" },
  { href: "/wiki/tips", label: "Tips" },
];

export function Sidebar() {
  const pathname = usePathname();

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
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Wiki
          </h3>
          <div className="space-y-1">
            {wikiPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                  pathname === page.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {page.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}