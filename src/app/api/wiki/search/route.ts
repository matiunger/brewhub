import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q) return NextResponse.json([]);

  const pages = await prisma.wikiPage.findMany({
    select: { id: true, slug: true, folder: true, title: true, content: true },
    orderBy: { title: "asc" },
  });

  const lower = q.toLowerCase();
  const results = pages
    .filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        p.content.toLowerCase().includes(lower)
    )
    .map((p) => {
      const idx = p.content.toLowerCase().indexOf(lower);
      const snippet =
        idx >= 0
          ? "…" + p.content.slice(Math.max(0, idx - 60), idx + 120) + "…"
          : p.content.slice(0, 180) + "…";
      return { id: p.id, slug: p.slug, folder: p.folder, title: p.title, snippet };
    });

  return NextResponse.json(results);
}
