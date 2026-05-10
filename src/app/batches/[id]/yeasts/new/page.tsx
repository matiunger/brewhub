import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddYeastPageProps {
  params: Promise<{ id: string }>;
}

async function addYeast(batchId: string, formData: FormData) {
  "use server";

  const yeastId = formData.get("yeastId") as string;
  const yeast = await prisma.yeast.findUnique({ where: { id: yeastId } });
  if (!yeast) throw new Error("Yeast not found");

  await prisma.batchYeast.create({
    data: {
      batchId,
      yeastId,
      quantity: "",
      quantityAmount: formData.get("quantityAmount") ? parseFloat(formData.get("quantityAmount") as string) : null,
      quantityUnits: formData.get("quantityUnits") as string || "packet",
      temp: formData.get("temp") ? parseFloat(formData.get("temp") as string) : null,
      // Snapshot inventory values at time of adding
      name: yeast.name,
      brand: yeast.brand,
      attenuation: yeast.attenuation,
    },
  });

  redirect(`/batches/${batchId}`);
}

export default async function AddYeastPage({ params }: AddYeastPageProps) {
  const { id } = await params;
  const batch = await prisma.batch.findUnique({
    where: { id },
  });

  if (!batch) {
    notFound();
  }

  const yeasts = await prisma.yeast.findMany({
    orderBy: { name: "asc" },
  });

  const addWithId = addYeast.bind(null, id);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href={`/batches/${id}`} className="text-sm text-muted-foreground hover:text-foreground">
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

            <div className="flex gap-3">
              <div className="space-y-2 flex-1">
                <Label htmlFor="quantityAmount">Quantity *</Label>
                <NumberInput id="quantityAmount" name="quantityAmount" step="0.1" placeholder="1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantityUnits">Units *</Label>
                <Select name="quantityUnits" defaultValue="packet" required>
                  <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="packet">packet</SelectItem>
                    <SelectItem value="grams">grams</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="temp">Fermentation Temperature (°C)</Label>
              <NumberInput id="temp" name="temp" step="0.1" />
            </div>

            <div className="flex gap-2">
              <Button type="submit">Add Yeast</Button>
              <Link href={`/batches/${id}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
