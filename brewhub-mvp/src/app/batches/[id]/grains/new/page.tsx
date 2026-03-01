import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddGrainPageProps {
  params: { id: string };
}

async function addGrain(formData: FormData, batchId: string) {
  "use server";
  
  await prisma.batchGrain.create({
    data: {
      batchId,
      grainId: formData.get("grainId") as string,
      grams: parseFloat(formData.get("grams") as string),
    },
  });
  
  redirect(`/batches/${batchId}`);
}

export default async function AddGrainPage({ params }: AddGrainPageProps) {
  const batch = await prisma.batch.findUnique({
    where: { id: params.id },
  });

  if (!batch) {
    notFound();
  }

  const grains = await prisma.grain.findMany({
    orderBy: { name: "asc" },
  });

  const addWithId = addGrain.bind(null, new FormData(), params.id);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href={`/batches/${params.id}`} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Batch
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Add Grain to {batch.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addWithId} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="grainId">Grain *</Label>
              <Select name="grainId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select grain" />
                </SelectTrigger>
                <SelectContent>
                  {grains.map((grain) => (
                    <SelectItem key={grain.id} value={grain.id}>
                      {grain.name} {grain.brand && `(${grain.brand})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grams">Amount (grams) *</Label>
              <Input id="grams" name="grams" type="number" step="1" required />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit">Add Grain</Button>
              <Link href={`/batches/${params.id}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}