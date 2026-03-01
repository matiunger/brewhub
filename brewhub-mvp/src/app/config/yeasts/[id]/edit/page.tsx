import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditYeastPageProps {
  params: { id: string };
}

async function updateYeast(formData: FormData, id: string) {
  "use server";
  
  await prisma.yeast.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      brand: formData.get("brand") as string || null,
      type: formData.get("type") as string || null,
      temperatureRange: formData.get("temperatureRange") as string || null,
      profile: formData.get("profile") as string || null,
      uses: formData.get("uses") as string || null,
      attenuation: formData.get("attenuation") ? parseFloat(formData.get("attenuation") as string) : null,
    },
  });
  
  redirect("/config");
}

async function deleteYeast(id: string) {
  "use server";
  
  await prisma.yeast.delete({
    where: { id },
  });
  
  redirect("/config");
}

export default async function EditYeastPage({ params }: EditYeastPageProps) {
  const yeast = await prisma.yeast.findUnique({
    where: { id: params.id },
  });

  if (!yeast) {
    notFound();
  }

  const updateWithId = updateYeast.bind(null, new FormData(), params.id);
  const deleteWithId = deleteYeast.bind(null, params.id);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/config" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Config
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Yeast</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateWithId} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" defaultValue={yeast.name} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" name="brand" defaultValue={yeast.brand || ""} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input id="type" name="type" placeholder="liquid or dry" defaultValue={yeast.type || ""} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="temperatureRange">Temperature Range</Label>
              <Input id="temperatureRange" name="temperatureRange" defaultValue={yeast.temperatureRange || ""} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="attenuation">Attenuation (%)</Label>
              <Input id="attenuation" name="attenuation" type="number" step="0.1" defaultValue={yeast.attenuation || ""} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="profile">Profile</Label>
              <Textarea id="profile" name="profile" defaultValue={yeast.profile || ""} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="uses">Uses</Label>
              <Textarea id="uses" name="uses" defaultValue={yeast.uses || ""} />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit">Save Changes</Button>
              <Link href="/config">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
          
          <form action={deleteWithId} className="mt-4">
            <Button type="submit" variant="destructive">Delete Yeast</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}