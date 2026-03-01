import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditGrainPageProps {
  params: { id: string };
}

async function updateGrain(formData: FormData, id: string) {
  "use server";
  
  await prisma.grain.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      brand: formData.get("brand") as string || null,
      maxYield: formData.get("maxYield") ? parseFloat(formData.get("maxYield") as string) : null,
      colorL: formData.get("colorL") ? parseFloat(formData.get("colorL") as string) : null,
      profile: formData.get("profile") as string || null,
      uses: formData.get("uses") as string || null,
    },
  });
  
  redirect("/config");
}

async function deleteGrain(id: string) {
  "use server";
  
  await prisma.grain.delete({
    where: { id },
  });
  
  redirect("/config");
}

export default async function EditGrainPage({ params }: EditGrainPageProps) {
  const grain = await prisma.grain.findUnique({
    where: { id: params.id },
  });

  if (!grain) {
    notFound();
  }

  const updateWithId = updateGrain.bind(null, new FormData(), params.id);
  const deleteWithId = deleteGrain.bind(null, params.id);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/config" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Config
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Grain</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateWithId} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" defaultValue={grain.name} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" name="brand" defaultValue={grain.brand || ""} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxYield">Max Yield (%)</Label>
              <Input id="maxYield" name="maxYield" type="number" step="0.1" defaultValue={grain.maxYield || ""} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="colorL">Color (L)</Label>
              <Input id="colorL" name="colorL" type="number" step="0.1" defaultValue={grain.colorL || ""} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="profile">Profile</Label>
              <Textarea id="profile" name="profile" defaultValue={grain.profile || ""} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="uses">Uses</Label>
              <Textarea id="uses" name="uses" defaultValue={grain.uses || ""} />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit">Save Changes</Button>
              <Link href="/config">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
          
          <form action={deleteWithId} className="mt-4">
            <Button type="submit" variant="destructive">Delete Grain</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}