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

async function updateBoilTimes(
  id: string,
  data: { heatUpTimeMin: number | null; boilTimeMin: number | null; whirpoolTimeMin: number | null }
) {
  "use server";
  await prisma.batch.update({ where: { id }, data });
}

async function updateMashParams(
  id: string,
  data: { grainTempC: number | null; targetPh: number | null; spargeTargetPh: number | null }
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

  const updateData: any = {};

  if (data.sourceWaterProfileId) {
    const profile = await prisma.waterProfile.findUnique({ where: { id: data.sourceWaterProfileId } });
    if (profile) {
      updateData.sourceWaterProfile = { connect: { id: data.sourceWaterProfileId } };
      updateData.sourceCaPpm = profile.caPpm;
      updateData.sourceMgPpm = profile.mgPpm;
      updateData.sourceNaPpm = profile.naPpm;
      updateData.sourceClPpm = profile.clPpm;
      updateData.sourceSo4Ppm = profile.so4Ppm;
      updateData.sourceZnPpm = profile.znPpm;
      updateData.sourceHco3Ppm = profile.hco3Ppm;
      updateData.sourceWaterPh = profile.pH;
    }
  } else {
    updateData.sourceWaterProfile = { disconnect: true };
    updateData.sourceCaPpm = null;
    updateData.sourceMgPpm = null;
    updateData.sourceNaPpm = null;
    updateData.sourceClPpm = null;
    updateData.sourceSo4Ppm = null;
    updateData.sourceZnPpm = null;
    updateData.sourceHco3Ppm = null;
    updateData.sourceWaterPh = null;
  }

  if (data.targetWaterProfileId) {
    const profile = await prisma.waterProfile.findUnique({ where: { id: data.targetWaterProfileId } });
    if (profile) {
      updateData.targetWaterProfile = { connect: { id: data.targetWaterProfileId } };
      updateData.targetCaPpm = profile.caPpm;
      updateData.targetMgPpm = profile.mgPpm;
      updateData.targetNaPpm = profile.naPpm;
      updateData.targetClPpm = profile.clPpm;
      updateData.targetSo4Ppm = profile.so4Ppm;
      updateData.targetZnPpm = profile.znPpm;
      updateData.targetHco3Ppm = profile.hco3Ppm;
      updateData.targetWaterPh = profile.pH;
    }
  } else {
    updateData.targetWaterProfile = { disconnect: true };
    updateData.targetCaPpm = null;
    updateData.targetMgPpm = null;
    updateData.targetNaPpm = null;
    updateData.targetClPpm = null;
    updateData.targetSo4Ppm = null;
    updateData.targetZnPpm = null;
    updateData.targetHco3Ppm = null;
    updateData.targetWaterPh = null;
  }

  await prisma.batch.update({ where: { id }, data: updateData });
}

async function updateBatchWaterSnapshot(
  id: string,
  type: "source" | "target",
  data: { caPpm: number; mgPpm: number; naPpm: number; clPpm: number; so4Ppm: number; znPpm: number | null; hco3Ppm: number | null; pH: number | null }
) {
  "use server";
  if (type === "source") {
    await prisma.batch.update({
      where: { id },
      data: {
        sourceCaPpm: data.caPpm,
        sourceMgPpm: data.mgPpm,
        sourceNaPpm: data.naPpm,
        sourceClPpm: data.clPpm,
        sourceSo4Ppm: data.so4Ppm,
        sourceZnPpm: data.znPpm,
        sourceHco3Ppm: data.hco3Ppm,
        sourceWaterPh: data.pH,
      },
    });
  } else {
    await prisma.batch.update({
      where: { id },
      data: {
        targetCaPpm: data.caPpm,
        targetMgPpm: data.mgPpm,
        targetNaPpm: data.naPpm,
        targetClPpm: data.clPpm,
        targetSo4Ppm: data.so4Ppm,
        targetZnPpm: data.znPpm,
        targetHco3Ppm: data.hco3Ppm,
        targetWaterPh: data.pH,
      },
    });
  }
}

async function updateSaltAdditions(
  id: string,
  data: { saltChalkGL: number | null; saltBakingSodaGL: number | null; saltGypsumGL: number | null; saltCaCl2GL: number | null; saltEpsomGL: number | null; saltNaClGL: number | null }
) {
  "use server";
  await prisma.batch.update({ where: { id }, data });
}

async function createMashStep(
  batchId: string,
  data: {
    name: string;
    type: string;
    stepTemperatureC: number;
    stepTimeMin: number;
    amountL?: number | null;
    rampTimeMin?: number | null;
    endTemperatureC?: number | null;
    description?: string | null;
    infuseTemperatureC?: number | null;
    sortOrder?: number;
  }
) {
  "use server";
  const step = await prisma.mashStep.create({
    data: {
      batchId,
      name: data.name,
      type: data.type,
      stepTemperatureC: data.stepTemperatureC,
      stepTimeMin: data.stepTimeMin,
      amountL: data.amountL ?? null,
      rampTimeMin: data.rampTimeMin ?? null,
      endTemperatureC: data.endTemperatureC ?? null,
      description: data.description ?? null,
      infuseTemperatureC: data.infuseTemperatureC ?? null,
      sortOrder: data.sortOrder ?? 0,
    },
  });
  return step;
}

async function updateMashStep(
  id: string,
  data: {
    name: string;
    type: string;
    stepTemperatureC: number;
    stepTimeMin: number;
    amountL?: number | null;
    rampTimeMin?: number | null;
    endTemperatureC?: number | null;
    description?: string | null;
    infuseTemperatureC?: number | null;
    sortOrder?: number;
  }
) {
  "use server";
  await prisma.mashStep.update({
    where: { id },
    data: {
      name: data.name,
      type: data.type,
      stepTemperatureC: data.stepTemperatureC,
      stepTimeMin: data.stepTimeMin,
      amountL: data.amountL ?? null,
      rampTimeMin: data.rampTimeMin ?? null,
      endTemperatureC: data.endTemperatureC ?? null,
      description: data.description ?? null,
      infuseTemperatureC: data.infuseTemperatureC ?? null,
      sortOrder: data.sortOrder ?? 0,
    },
  });
}

async function deleteMashStep(id: string) {
  "use server";
  await prisma.mashStep.delete({ where: { id } });
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
      mashSteps: {
        orderBy: { sortOrder: "asc" },
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
  const updateBatchWaterSnapshotWithId = updateBatchWaterSnapshot.bind(null, id);
  const updateSaltAdditionsWithId = updateSaltAdditions.bind(null, id);
  const updateBoilTimesWithId = updateBoilTimes.bind(null, id);
  const updateMashParamsWithId = updateMashParams.bind(null, id);
  const createMashStepWithId = createMashStep.bind(null, id);

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
          sourceWaterSnapshot={batch.sourceWaterProfile ? {
            caPpm:   batch.sourceCaPpm   ?? batch.sourceWaterProfile.caPpm   ?? 0,
            mgPpm:   batch.sourceMgPpm   ?? batch.sourceWaterProfile.mgPpm   ?? 0,
            naPpm:   batch.sourceNaPpm   ?? batch.sourceWaterProfile.naPpm   ?? 0,
            clPpm:   batch.sourceClPpm   ?? batch.sourceWaterProfile.clPpm   ?? 0,
            so4Ppm:  batch.sourceSo4Ppm  ?? batch.sourceWaterProfile.so4Ppm  ?? 0,
            znPpm:   batch.sourceZnPpm   ?? batch.sourceWaterProfile.znPpm   ?? null,
            hco3Ppm: batch.sourceHco3Ppm ?? batch.sourceWaterProfile.hco3Ppm ?? null,
            pH:      batch.sourceWaterPh ?? batch.sourceWaterProfile.pH      ?? null,
          } : null}
          targetWaterSnapshot={batch.targetWaterProfile ? {
            caPpm:   batch.targetCaPpm   ?? batch.targetWaterProfile.caPpm   ?? 0,
            mgPpm:   batch.targetMgPpm   ?? batch.targetWaterProfile.mgPpm   ?? 0,
            naPpm:   batch.targetNaPpm   ?? batch.targetWaterProfile.naPpm   ?? 0,
            clPpm:   batch.targetClPpm   ?? batch.targetWaterProfile.clPpm   ?? 0,
            so4Ppm:  batch.targetSo4Ppm  ?? batch.targetWaterProfile.so4Ppm  ?? 0,
            znPpm:   batch.targetZnPpm   ?? batch.targetWaterProfile.znPpm   ?? null,
            hco3Ppm: batch.targetHco3Ppm ?? batch.targetWaterProfile.hco3Ppm ?? null,
            pH:      batch.targetWaterPh ?? batch.targetWaterProfile.pH      ?? null,
          } : null}
          updateBatchWaterAction={updateBatchWaterWithId}
          updateBatchWaterSnapshotAction={updateBatchWaterSnapshotWithId}
          updateSaltAdditionsAction={updateSaltAdditionsWithId}
          updateBoilTimesAction={updateBoilTimesWithId}
          updateMashParamsAction={updateMashParamsWithId}
          mashSteps={batch.mashSteps}
          createMashStepAction={createMashStepWithId}
          updateMashStepAction={updateMashStep}
          deleteMashStepAction={deleteMashStep}
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