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

interface AddYeastPageProps {
  params: { id: string };
}

async function addYeast(formData: FormData, batchId: string) {
  "use server";
  
  await prisma.batchYeast.create({
    data: {
      batchId,
      yeastId: formData.get("yeastId") as string,
      quantity: formData.get("quantity") as string,
      temp: formData.get("temp") ? parseFloat(formData.get("temp") as string) : null,
    },
  });
  
  redirect(`/batches/${batchId}`);
}

export default async function AddYeastPage({ params }: AddYeastPageProps) {
  const batch = await prisma.batch.findUnique({
    where: { id: params.id },
  });

  if (!batch) {
    notFound();
  }

  const yeasts = await prisma.yeast.findMany({
    orderBy: { name: "asc" },
  });

  const addWithId = addYeast.bind(null, new FormData(), params.id);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href={`/batches/${params.id}`} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Batch
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Add Yeast to {batch.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addWithId} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="yeastId">Yeast *</Label>
              <Select name="yeastId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select yeast" />
                </SelectTrigger>
                <SelectContent>
                  {yeasts.map((yeast) => (
                    <SelectItem key={yeast.id} value={yeast.id}>
                      {yeast.name} {yeast.brand && `(${yeast.brand})`}
                      {yeast.attenuation && ` - ${yeast.attenuation}% att`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input 
                id="quantity" 
                name="quantity" 
                placeholder="e.g., 1 packet, 200 billion cells, 11g"
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="temp">Fermentation Temperature (°C)</Label>
              <Input id="temp" name="temp" type="number" step="0.1" />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit">Add Yeast</Button>
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