import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { WikiPageView } from "@/components/wiki/wiki-page-view";

export default async function WikiPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const fullSlug = slug.map(decodeURIComponent).join("/");

  const [page, allPages] = await Promise.all([
    prisma.wikiPage.findUnique({ where: { slug: fullSlug } }),
    prisma.wikiPage.findMany({ select: { slug: true } }),
  ]);
  if (!page) notFound();

  // Map last-segment name → full slug for wikilink resolution
  const slugMap: Record<string, string> = {};
  for (const { slug } of allPages) {
    const name = slug.split("/").pop()!;
    if (!(name in slugMap)) slugMap[name] = slug;
  }

  return (
    <WikiPageView
      page={{
        ...page,
        createdAt: page.createdAt.toISOString(),
        updatedAt: page.updatedAt.toISOString(),
      }}
      slugMap={slugMap}
    />
  );
}
