import { prisma } from "@/lib/db";
import { HopsTable } from "@/components/inventory/tables";

export default async function HopsPage() {
  const hops = await prisma.hop.findMany();

  return <HopsTable initialData={hops} />;
}
