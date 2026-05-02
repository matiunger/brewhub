import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { WikiPageView } from "@/components/wiki/wiki-page-view";

interface WikiPageProps {
  params: Promise<{ slug: string }>;
}

export default async function WikiPage({ params }: WikiPageProps) {
  const { slug } = await params;
  const page = await prisma.wikiPage.findUnique({
    where: { slug },
  });

  if (!page) {
    notFound();
  }

  // Convert Date objects to strings
  const serializedPage = {
    ...page,
    createdAt: page.createdAt.toISOString(),
    updatedAt: page.updatedAt.toISOString(),
  };

  return <WikiPageView page={serializedPage} />;
}