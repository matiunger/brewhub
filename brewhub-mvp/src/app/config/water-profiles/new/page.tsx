import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function createWaterProfile(formData: FormData) {
  "use server";
  
  await prisma.waterProfile.create({
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

export default function NewWaterProfilePage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/config" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Config
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Add Water Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createWaterProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="caPpm">Ca (ppm) *</Label>
                <Input id="caPpm" name="caPpm" type="number" step="0.1" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mgPpm">Mg (ppm) *</Label>
                <Input id="mgPpm" name="mgPpm" type="number" step="0.1" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="naPpm">Na (ppm) *</Label>
                <Input id="naPpm" name="naPpm" type="number" step="0.1" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clPpm">Cl (ppm) *</Label>
                <Input id="clPpm" name="clPpm" type="number" step="0.1" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="so4Ppm">SO4 (ppm) *</Label>
                <Input id="so4Ppm" name="so4Ppm" type="number" step="0.1" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="znPpm">Zn (ppm)</Label>
                <Input id="znPpm" name="znPpm" type="number" step="0.1" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hco3Ppm">HCO3 (ppm)</Label>
                <Input id="hco3Ppm" name="hco3Ppm" type="number" step="0.1" />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Link href="/config">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}