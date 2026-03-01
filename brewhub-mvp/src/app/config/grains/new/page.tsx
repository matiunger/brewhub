import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

async function createGrain(formData: FormData) {
  "use server";
  
  await prisma.grain.create({
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

export default function NewGrainPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/config" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Config
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Add Grain</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createGrain} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" name="brand" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxYield">Max Yield (%)</Label>
              <Input id="maxYield" name="maxYield" type="number" step="0.1" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="colorL">Color (L)</Label>
              <Input id="colorL" name="colorL" type="number" step="0.1" />
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