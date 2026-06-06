"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WikiPage {
  id: string;
  slug: string;
  folder: string;
  title: string;
  snippet?: string;
}

interface WikiIndexProps {
  pages: WikiPage[];
}

export function WikiIndex({ pages }: WikiIndexProps) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<WikiPage[] | null>(null);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/wiki/search?q=${encodeURIComponent(query)}`);
        if (res.ok) setSearchResults(await res.json());
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [query]);

  // Build folder tree from pages
  const groups = new Map<string, WikiPage[]>();
  for (const page of pages) {
    const f = page.folder || "";
    if (!groups.has(f)) groups.set(f, []);
    groups.get(f)!.push(page);
  }
  const sortedFolders = [...groups.keys()].sort((a, b) =>
    !a ? -1 : !b ? 1 : a.localeCompare(b)
  );

  const isSearching = query.trim().length > 0;
  const displayResults = searchResults ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Wiki</h1>
        <Link href="/wiki/new">
          <Button>+ New Page</Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Input
          placeholder="Search wiki…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-8"
        />
        {searching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            …
          </span>
        )}
      </div>

      {isSearching ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {displayResults.length} result{displayResults.length !== 1 ? "s" : ""} for &quot;{query}&quot;
          </p>
          {displayResults.length > 0 ? (
            <div className="rounded-lg border divide-y">
              {displayResults.map((page) => (
                <Link
                  key={page.id}
                  href={`/wiki/${page.slug}`}
                  className="block px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="font-medium text-sm">{page.title}</div>
                  {page.folder && (
                    <div className="text-xs text-muted-foreground">{page.folder}</div>
                  )}
                  {page.snippet && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {page.snippet}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            !searching && (
              <p className="text-sm text-muted-foreground">No pages found.</p>
            )
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {sortedFolders.map((folder) => (
            <div key={folder || "__root__"} className="space-y-1">
              {folder && (
                <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {folder.split("/").join(" / ")}
                </h2>
              )}
              <div className="rounded-lg border divide-y">
                {groups.get(folder)!.map((page) => (
                  <Link
                    key={page.id}
                    href={`/wiki/${page.slug}`}
                    className="flex items-center px-4 py-2.5 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm font-medium">{page.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          {pages.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No pages yet.{" "}
              <Link href="/wiki/new" className="underline">
                Create one
              </Link>{" "}
              or run <code className="text-xs">/sync-wiki</code> to import from the{" "}
              <code className="text-xs">wiki/</code> folder.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
