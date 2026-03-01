import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditKegPageProps {
  params: { id: string };
}

async function updateKeg(formData: FormData, id: string) {
  "use server";
  
  await prisma.keg.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      number: formData.get("number") as string || null,
      capacity: parseFloat(formData.get("capacity") as string),
      tareWeight: formData.get("tareWeight") ? parseFloat(formData.get("tareWeight") as string) : null,
      notes: formData.get("notes") as string || null,
    },
  });
  
  redirect("/config");
}

async function deleteKeg(id: string) {
  "use server";
  
  await prisma.keg.delete({
    where: { id },
  });
  
  redirect("/config");
}

export default async function EditKegPage({ params }: EditKegPageProps) {
  const keg = await prisma.keg.findUnique({
    where: { id: params.id },
  });

  if (!keg) {
    notFound();
  }

  const updateWithId = updateKeg.bind(null, new FormData(), params.id);
  const deleteWithId = deleteKeg.bind(null, params.id);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/config" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Config
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Keg</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateWithId} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" defaultValue={keg.name} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="number">Number</Label>
              <Input id="number" name="number" defaultValue={keg.number || ""} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (L) *</Label>
              <Input id="capacity" name="capacity" type="number" step="0.1" defaultValue={keg.capacity} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tareWeight">Tare Weight (kg)</Label>
              <Input id="tareWeight" name="tareWeight" type="number" step="0.1" defaultValue={keg.tareWeight || ""} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" defaultValue={keg.notes || ""} />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit">Save Changes</Button>
              <Link href="/config">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
          
          <form action={deleteWithId} className="mt-4">
            <Button type="submit" variant="destructive">Delete Keg</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}