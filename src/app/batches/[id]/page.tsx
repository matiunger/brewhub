import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { calculateBrewingStats } from "@/lib/calculations";
import { DeleteBatchDialog } from "./delete-dialog";
import { BatchForm } from "./batch-form";
import { BeerSections } from "./beer-sections";
import { ExportBeerJsonButton } from "@/components/export-beerjson-button";

interface BatchPageProps {
  params: Promise<{ id: string }>;
}

async function updateBatch(id: string, formData: FormData) {
  "use server";

  const brewDateValue = formData.get("brewDate") as string;
  const equipmentId = formData.get("equipmentId") as string || null;

  await prisma.batch.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      brewDate: brewDateValue ? new Date(brewDateValue) : null,
      style: formData.get("style") as string || null,
      draft: formData.get("draft") === "on",
      equipmentId,
    },
  });
}

async function updateNotes(id: string, notes: string) {
  "use server";
  
  await prisma.batch.update({
    where: { id },
    data: {
      notes: notes || null,
    },
  });
}

async function updateTargetStats(
  id: string,
  data: { targetOg: number | null; targetFg: number | null; targetIbu: number | null; targetSrm: number | null; targetFermentarL: number | null }
) {
  "use server";
  await prisma.batch.update({ where: { id }, data });
}

async function updateBatchGrain(batchGrainId: string, data: { grams: number }) {
  "use server";
  await prisma.batchGrain.update({ where: { id: batchGrainId }, data });
}

async function deleteBatchGrain(batchGrainId: string) {
  "use server";
  await prisma.batchGrain.delete({ where: { id: batchGrainId } });
}

async function updateBatchHop(batchHopId: string, data: { grams: number; use: string; additionTime: number | null }) {
  "use server";
  await prisma.batchHop.update({ where: { id: batchHopId }, data });
}

async function deleteBatchHop(batchHopId: string) {
  "use server";
  await prisma.batchHop.delete({ where: { id: batchHopId } });
}

async function updateBatchYeast(
  batchYeastId: string,
  data: { quantity: string; temp: number | null }
) {
  "use server";
  await prisma.batchYeast.update({ where: { id: batchYeastId }, data });
}

async function deleteBatchYeast(batchYeastId: string) {
  "use server";
  await prisma.batchYeast.delete({ where: { id: batchYeastId } });
}

async function updateBatchWaterProfiles(
  id: string,
  data: { sourceWaterProfileId: string | null; targetWaterProfileId: string | null }
) {
  "use server";
  await prisma.batch.update({ where: { id }, data });
}

async function updateWaterProfile(
  profileId: string,
  data: { caPpm: number; mgPpm: number; naPpm: number; clPpm: number; so4Ppm: number; znPpm: number | null; hco3Ppm: number | null; pH: number | null }
) {
  "use server";
  await prisma.waterProfile.update({ where: { id: profileId }, data });
}

async function updateSaltAdditions(
  id: string,
  data: { saltChalkGL: number | null; saltBakingSodaGL: number | null; saltGypsumGL: number | null; saltCaCl2GL: number | null; saltEpsomGL: number | null; saltNaClGL: number | null }
) {
  "use server";
  await prisma.batch.update({ where: { id }, data });
}

async function deleteBatch(id: string) {
  "use server";
  
  await prisma.batch.delete({
    where: { id },
  });
  
  redirect("/");
}

export default async function BatchPage({ params }: BatchPageProps) {
  const { id } = await params;
  
  const allEquipment = await prisma.equipment.findMany({ orderBy: { name: "asc" } });
  const allWaterProfiles = await prisma.waterProfile.findMany({ orderBy: { name: "asc" } });

  const batch = await prisma.batch.findUnique({
    where: { id },
    include: {
      equipment: true,
      sourceWaterProfile: true,
      targetWaterProfile: true,
      grains: {
        include: { grain: true },
      },
      hops: {
        include: { hop: true },
      },
      yeasts: {
        include: { yeast: true },
      },
    },
  });

  if (!batch) {
    notFound();
  }

  const stats = calculateBrewingStats(batch);
  
  const updateWithId = updateBatch.bind(null, id);
  const updateNotesWithId = updateNotes.bind(null, id);
  const updateTargetStatsWithId = updateTargetStats.bind(null, id);
  const deleteWithId = deleteBatch.bind(null, id);
  const updateGrainWithId = updateBatchGrain;
  const deleteGrainWithId = deleteBatchGrain;
  const updateHopWithId = updateBatchHop;
  const deleteHopWithId = deleteBatchHop;
  const updateYeastWithId = updateBatchYeast;
  const deleteYeastWithId = deleteBatchYeast;
  const updateBatchWaterWithId = updateBatchWaterProfiles.bind(null, id);
  const updateWaterProfileWithId = updateWaterProfile;
  const updateSaltAdditionsWithId = updateSaltAdditions.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{batch.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={batch.draft ? "secondary" : "default"}>
              {batch.draft ? "Draft" : "Executed"}
            </Badge>
            <Badge variant="outline">{batch.type}</Badge>
            {batch.style && <Badge variant="outline">{batch.style}</Badge>}
          </div>
        </div>
        
        <div className="flex gap-2">
          <ExportBeerJsonButton batchId={id} />
          <DeleteBatchDialog batchName={batch.name} deleteAction={deleteWithId} />
        </div>
      </div>

      {batch.type === "beer" ? (
        <BeerSections
          batchId={id}
          batch={batch}
          stats={stats}
          equipment={allEquipment}
          grains={batch.grains}
          hops={batch.hops}
          yeasts={batch.yeasts}
          updateAction={updateWithId}
          updateNotesAction={updateNotesWithId}
          updateTargetStatsAction={updateTargetStatsWithId}
          updateGrainAction={updateGrainWithId}
          deleteGrainAction={deleteGrainWithId}
          updateHopAction={updateHopWithId}
          deleteHopAction={deleteHopWithId}
          updateYeastAction={updateYeastWithId}
          deleteYeastAction={deleteYeastWithId}
          waterProfiles={allWaterProfiles}
          sourceWaterProfile={batch.sourceWaterProfile}
          targetWaterProfile={batch.targetWaterProfile}
          updateBatchWaterAction={updateBatchWaterWithId}
          updateWaterProfileAction={updateWaterProfileWithId}
          updateSaltAdditionsAction={updateSaltAdditionsWithId}
          saltAdditions={{
            saltChalkGL: batch.saltChalkGL,
            saltBakingSodaGL: batch.saltBakingSodaGL,
            saltGypsumGL: batch.saltGypsumGL,
            saltCaCl2GL: batch.saltCaCl2GL,
            saltEpsomGL: batch.saltEpsomGL,
            saltNaClGL: batch.saltNaClGL,
          }}
        />
      ) : (
        <BatchForm batch={batch} equipment={allEquipment} updateAction={updateWithId} updateNotesAction={updateNotesWithId} />
      )}
    </div>
  );
}