import { prisma } from "@/lib/db";
import { WikiIndex } from "@/components/wiki/wiki-index";

export default async function WikiIndexPage() {
  const pages = await prisma.wikiPage.findMany({
    select: { id: true, slug: true, folder: true, title: true },
    orderBy: { title: "asc" },
  });

  return <WikiIndex pages={pages} />;
}
