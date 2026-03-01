import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

async function createHop(formData: FormData) {
  "use server";
  
  await prisma.hop.create({
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

export default function NewHopPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/config" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Config
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Add Hop</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createHop} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alphaAcid">Alpha Acid (%) *</Label>
              <Input id="alphaAcid" name="alphaAcid" type="number" step="0.1" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="profile">Profile</Label>
              <Textarea id="profile" name="profile" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="styles">Styles</Label>
              <Input id="styles" name="styles" placeholder="e.g., IPA, Pale Ale, Stout" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alternatives">Alternatives</Label>
              <Input id="alternatives" name="alternatives" placeholder="e.g., Cascade, Centennial" />
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