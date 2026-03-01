import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditWaterProfilePageProps {
  params: { id: string };
}

async function updateWaterProfile(formData: FormData, id: string) {
  "use server";
  
  await prisma.waterProfile.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      caPpm: parseFloat(formData.get("caPpm") as string),
      mgPpm: parseFloat(formData.get("mgPpm") as string),
      naPpm: parseFloat(formData.get("naPpm") as string),
      clPpm: parseFloat(formData.get("clPpm") as string),
      so4Ppm: parseFloat(formData.get("so4Ppm") as string),
      znPpm: formData.get("znPpm") ? parseFloat(formData.get("znPpm") as string) : null,
      hco3Ppm: formData.get("hco3Ppm") ? parseFloat(formData.get("hco3Ppm") as string) : null,
    },
  });
  
  redirect("/config");
}

async function deleteWaterProfile(id: string) {
  "use server";
  
  await prisma.waterProfile.delete({
    where: { id },
  });
  
  redirect("/config");
}

export default async function EditWaterProfilePage({ params }: EditWaterProfilePageProps) {
  const profile = await prisma.waterProfile.findUnique({
    where: { id: params.id },
  });

  if (!profile) {
    notFound();
  }

  const updateWithId = updateWaterProfile.bind(null, new FormData(), params.id);
  const deleteWithId = deleteWaterProfile.bind(null, params.id);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/config" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Config
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Water Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateWithId} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" defaultValue={profile.name} required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="caPpm">Ca (ppm) *</Label>
                <Input id="caPpm" name="caPpm" type="number" step="0.1" defaultValue={profile.caPpm} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mgPpm">Mg (ppm) *</Label>
                <Input id="mgPpm" name="mgPpm" type="number" step="0.1" defaultValue={profile.mgPpm} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="naPpm">Na (ppm) *</Label>
                <Input id="naPpm" name="naPpm" type="number" step="0.1" defaultValue={profile.naPpm} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clPpm">Cl (ppm) *</Label>
                <Input id="clPpm" name="clPpm" type="number" step="0.1" defaultValue={profile.clPpm} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="so4Ppm">SO4 (ppm) *</Label>
                <Input id="so4Ppm" name="so4Ppm" type="number" step="0.1" defaultValue={profile.so4Ppm} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="znPpm">Zn (ppm)</Label>
                <Input id="znPpm" name="znPpm" type="number" step="0.1" defaultValue={profile.znPpm || ""} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hco3Ppm">HCO3 (ppm)</Label>
                <Input id="hco3Ppm" name="hco3Ppm" type="number" step="0.1" defaultValue={profile.hco3Ppm || ""} />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit">Save Changes</Button>
              <Link href="/config">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
          
          <form action={deleteWithId} className="mt-4">
            <Button type="submit" variant="destructive">Delete Water Profile</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}