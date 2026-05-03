import { prisma } from "@/lib/db";
import { WaterTable } from "@/components/inventory/tables";

export default async function WaterPage() {
  const waterProfiles = await prisma.waterProfile.findMany();

  return <WaterTable initialData={waterProfiles} />;
}
