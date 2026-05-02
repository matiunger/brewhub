import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { ConfigPageClient } from "./config-page-client";

export default async function ConfigPage() {
  const [equipment, grains, hops, yeasts, waterProfiles, kegs] = await Promise.all([
    prisma.equipment.findMany(),
    prisma.grain.findMany(),
    prisma.hop.findMany(),
    prisma.yeast.findMany(),
    prisma.waterProfile.findMany(),
    prisma.keg.findMany(),
  ]);

  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ConfigPageClient
        initialData={{ equipment, grains, hops, yeasts, waterProfiles, kegs }}
      />
    </Suspense>
  );
}