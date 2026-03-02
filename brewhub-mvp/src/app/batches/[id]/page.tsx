import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateBrewingStats } from "@/lib/calculations";
import { DeleteBatchDialog } from "./delete-dialog";
import { BatchForm } from "./batch-form";

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
        
        <DeleteBatchDialog batchName={batch.name} deleteAction={deleteWithId} />
      </div>

      {batch.type === "beer" ? (
        <div className="grid gap-6 md:grid-cols-2">
          <BatchForm batch={batch} updateAction={updateWithId} updateNotesAction={updateNotesWithId} />
          
          <Card>
            <CardHeader>
              <CardTitle>Recipe Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Target OG</p>
                  <p className="text-xl font-semibold">{stats.og.toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Target FG</p>
                  <p className="text-xl font-semibold">{stats.fg.toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IBU</p>
                  <p className="text-xl font-semibold">{stats.ibu.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SRM</p>
                  <p className="text-xl font-semibold">{stats.srm.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ABV</p>
                  <p className="text-xl font-semibold">{stats.abv.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Grain</p>
                  <p className="text-xl font-semibold">{stats.totalGrainWeight.toFixed(0)} g</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">Original Gravity Formula:</p>
                <p className="text-xs font-mono mt-1">
                  OG = 1 + (Total Extractable Sugar / Batch Volume) / 1000
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <BatchForm batch={batch} updateAction={updateWithId} updateNotesAction={updateNotesWithId} />
      )}

      {batch.type === "beer" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Grains ({batch.grains.length})</CardTitle>
              <Link href={`/batches/${batch.id}/grains/new`}>
                <Button size="sm">+ Add</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {batch.grains.length > 0 ? (
                <div className="space-y-2">
                  {batch.grains.map((bg) => (
                    <div key={bg.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">{bg.grain.name}</p>
                        {bg.grain.brand && <p className="text-sm text-muted-foreground">{bg.grain.brand}</p>}
                      </div>
                      <p className="font-semibold">{bg.grams} g</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No grains added yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Hops ({batch.hops.length})</CardTitle>
              <Link href={`/batches/${batch.id}/hops/new`}>
                <Button size="sm">+ Add</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {batch.hops.length > 0 ? (
                <div className="space-y-2">
                  {batch.hops.map((bh) => (
                    <div key={bh.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">{bh.hop.name}</p>
                        <p className="text-sm text-muted-foreground">{bh.use} @ {bh.additionTime} min</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{bh.grams} g</p>
                        <p className="text-sm text-muted-foreground">{bh.hop.alphaAcid}% AA</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No hops added yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Yeasts ({batch.yeasts.length})</CardTitle>
              <Link href={`/batches/${batch.id}/yeasts/new`}>
                <Button size="sm">+ Add</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {batch.yeasts.length > 0 ? (
                <div className="space-y-2">
                  {batch.yeasts.map((by) => (
                    <div key={by.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">{by.yeast.name}</p>
                        {by.yeast.brand && <p className="text-sm text-muted-foreground">{by.yeast.brand}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{by.quantity}</p>
                        {by.temp && <p className="text-sm text-muted-foreground">{by.temp}°C</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No yeast added yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}