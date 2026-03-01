import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateBrewingStats } from "@/lib/calculations";

interface BatchPageProps {
  params: { id: string };
}

async function updateBatch(formData: FormData, id: string) {
  "use server";
  
  await prisma.batch.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      brewDate: new Date(formData.get("brewDate") as string),
      style: formData.get("style") as string || null,
      notes: formData.get("notes") as string || null,
      draft: formData.get("draft") === "on",
    },
  });
  
  redirect(`/batches/${id}`);
}

async function deleteBatch(id: string) {
  "use server";
  
  await prisma.batch.delete({
    where: { id },
  });
  
  redirect("/");
}

export default async function BatchPage({ params }: BatchPageProps) {
  const batch = await prisma.batch.findUnique({
    where: { id: params.id },
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
  
  const updateWithId = updateBatch.bind(null, new FormData(), params.id);
  const deleteWithId = deleteBatch.bind(null, params.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Home
          </Link>
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
        </div>
        
        <form action={deleteWithId}>
          <Button type="submit" variant="destructive" size="sm">Delete Batch</Button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateWithId} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={batch.name} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brewDate">Brew Date</Label>
                <Input 
                  id="brewDate" 
                  name="brewDate" 
                  type="date" 
                  defaultValue={batch.brewDate.toISOString().split("T")[0]} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Input id="style" name="style" defaultValue={batch.style || ""} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" defaultValue={batch.notes || ""} />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="draft"
                  name="draft"
                  defaultChecked={batch.draft}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="draft" className="text-sm font-normal">Draft</Label>
              </div>
              
              <Button type="submit" size="sm">Update Info</Button>
            </form>
          </CardContent>
        </Card>

        {batch.type === "beer" && (
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
        )}
      </div>

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