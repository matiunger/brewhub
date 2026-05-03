import { prisma } from "@/lib/db";
import { YeastsTable } from "@/components/inventory/tables";

export default async function CulturesPage() {
  const yeasts = await prisma.yeast.findMany();

  return <YeastsTable initialData={yeasts} />;
}
