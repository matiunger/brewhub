import { prisma } from "@/lib/db";
import { KegsTable } from "@/components/inventory/tables";

export default async function KegsPage() {
  const kegs = await prisma.keg.findMany();

  return <KegsTable initialData={kegs} />;
}
