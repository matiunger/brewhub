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

  const page = await prisma.wikiPage.findUnique({ where: { slug: fullSlug } });
  if (!page) notFound();

  return (
    <WikiPageView
      page={{
        ...page,
        createdAt: page.createdAt.toISOString(),
        updatedAt: page.updatedAt.toISOString(),
      }}
    />
  );
}
