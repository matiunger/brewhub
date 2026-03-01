import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditHopPageProps {
  params: { id: string };
}

async function updateHop(formData: FormData, id: string) {
  "use server";
  
  await prisma.hop.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      alphaAcid: parseFloat(formData.get("alphaAcid") as string),
      profile: formData.get("profile") as string || null,
      styles: formData.get("styles") as string || null,
      alternatives: formData.get("alternatives") as string || null,
    },
  });
  
  redirect("/config");
}

async function deleteHop(id: string) {
  "use server";
  
  await prisma.hop.delete({
    where: { id },
  });
  
  redirect("/config");
}

export default async function EditHopPage({ params }: EditHopPageProps) {
  const hop = await prisma.hop.findUnique({
    where: { id: params.id },
  });

  if (!hop) {
    notFound();
  }

  const updateWithId = updateHop.bind(null, new FormData(), params.id);
  const deleteWithId = deleteHop.bind(null, params.id);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/config" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Config
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Hop</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateWithId} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" defaultValue={hop.name} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alphaAcid">Alpha Acid (%) *</Label>
              <Input id="alphaAcid" name="alphaAcid" type="number" step="0.1" defaultValue={hop.alphaAcid} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="profile">Profile</Label>
              <Textarea id="profile" name="profile" defaultValue={hop.profile || ""} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="styles">Styles</Label>
              <Input id="styles" name="styles" defaultValue={hop.styles || ""} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alternatives">Alternatives</Label>
              <Input id="alternatives" name="alternatives" defaultValue={hop.alternatives || ""} />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit">Save Changes</Button>
              <Link href="/config">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
          
          <form action={deleteWithId} className="mt-4">
            <Button type="submit" variant="destructive">Delete Hop</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}