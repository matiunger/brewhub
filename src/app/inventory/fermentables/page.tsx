import { prisma } from "@/lib/db";
import { GrainsTable } from "@/components/inventory/tables";

export default async function FermentablesPage() {
  const grains = await prisma.grain.findMany();

  return <GrainsTable initialData={grains} />;
}
