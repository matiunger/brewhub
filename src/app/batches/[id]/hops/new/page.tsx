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

interface AddHopPageProps {
  params: { id: string };
}

async function addHop(formData: FormData, batchId: string) {
  "use server";
  
  await prisma.batchHop.create({
    data: {
      batchId,
      hopId: formData.get("hopId") as string,
      grams: parseFloat(formData.get("grams") as string),
      additionTime: parseFloat(formData.get("additionTime") as string),
      use: formData.get("use") as string,
    },
  });
  
  redirect(`/batches/${batchId}`);
}

export default async function AddHopPage({ params }: AddHopPageProps) {
  const batch = await prisma.batch.findUnique({
    where: { id: params.id },
  });

  if (!batch) {
    notFound();
  }

  const hops = await prisma.hop.findMany({
    orderBy: { name: "asc" },
  });

  const addWithId = addHop.bind(null, new FormData(), params.id);

  const hopUses = [
    { value: "fwh", label: "First Wort Hop (FWH)" },
    { value: "boil", label: "Boil" },
    { value: "whirlpool", label: "Whirlpool" },
    { value: "hop_stand", label: "Hop Stand" },
    { value: "dry_hop", label: "Dry Hop" },
  ];

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href={`/batches/${params.id}`} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Batch
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Add Hop to {batch.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addWithId} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hopId">Hop *</Label>
              <Select name="hopId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select hop" />
                </SelectTrigger>
                <SelectContent>
                  {hops.map((hop) => (
                    <SelectItem key={hop.id} value={hop.id}>
                      {hop.name} ({hop.alphaAcid}% AA)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grams">Amount (grams) *</Label>
              <Input id="grams" name="grams" type="number" step="0.1" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additionTime">Addition Time (minutes) *</Label>
              <Input 
                id="additionTime" 
                name="additionTime" 
                type="number" 
                step="1" 
                placeholder="e.g., 60 for 60 minutes left in boil"
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="use">Use *</Label>
              <Select name="use" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select use" />
                </SelectTrigger>
                <SelectContent>
                  {hopUses.map((use) => (
                    <SelectItem key={use.value} value={use.value}>
                      {use.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit">Add Hop</Button>
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