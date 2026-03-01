import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

async function createYeast(formData: FormData) {
  "use server";
  
  await prisma.yeast.create({
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

export default function NewYeastPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/config" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Config
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Add Yeast</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createYeast} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" name="brand" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input id="type" name="type" placeholder="liquid or dry" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="temperatureRange">Temperature Range</Label>
              <Input id="temperatureRange" name="temperatureRange" placeholder="e.g., 18-22°C" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="attenuation">Attenuation (%)</Label>
              <Input id="attenuation" name="attenuation" type="number" step="0.1" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="profile">Profile</Label>
              <Textarea id="profile" name="profile" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="uses">Uses</Label>
              <Textarea id="uses" name="uses" />
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