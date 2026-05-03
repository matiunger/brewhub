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
  
  await prisma.batch.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      brewDate: brewDateValue ? new Date(brewDateValue) : null,
      style: formData.get("style") as string || null,
      draft: formData.get("draft") === "on",
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
  data: { targetOg: number | null; targetFg: number | null; targetIbu: number | null; targetSrm: number | null }
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
          grains={batch.grains}
          hops={batch.hops}
          yeasts={batch.yeasts}
          updateAction={updateWithId}
          updateNotesAction={updateNotesWithId}
          updateTargetStatsAction={updateTargetStatsWithId}
        />
      ) : (
        <BatchForm batch={batch} updateAction={updateWithId} updateNotesAction={updateNotesWithId} />
      )}
    </div>
  );
}