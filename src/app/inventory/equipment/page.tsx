import { prisma } from "@/lib/db";
import { EquipmentTable } from "@/components/inventory/tables";

export default async function EquipmentPage() {
  const equipment = await prisma.equipment.findMany();

  return <EquipmentTable initialData={equipment} />;
}
