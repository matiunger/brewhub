import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function createEquipment(formData: FormData) {
  "use server";
  
  await prisma.equipment.create({
    data: {
      name: formData.get("name") as string,
      brewhouseEfficiency: parseFloat(formData.get("brewhouseEfficiency") as string),
      mashEfficiency: formData.get("mashEfficiency") ? parseFloat(formData.get("mashEfficiency") as string) : null,
      evaporationRate: formData.get("evaporationRate") ? parseFloat(formData.get("evaporationRate") as string) : null,
      boilPotDiameter: formData.get("boilPotDiameter") ? parseFloat(formData.get("boilPotDiameter") as string) : null,
      fermenterLossL: parseFloat(formData.get("fermenterLossL") as string),
      trubLossL: parseFloat(formData.get("trubLossL") as string),
      systemLossPercent: formData.get("systemLossPercent") ? parseFloat(formData.get("systemLossPercent") as string) : null,
      bagasseLossL: formData.get("bagasseLossL") ? parseFloat(formData.get("bagasseLossL") as string) : null,
    },
  });
  
  redirect("/config");
}

export default function NewEquipmentPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/config" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Config
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Add Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createEquipment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brewhouseEfficiency">Brewhouse Efficiency (%) *</Label>
              <Input id="brewhouseEfficiency" name="brewhouseEfficiency" type="number" step="0.1" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mashEfficiency">Mash Efficiency (%)</Label>
              <Input id="mashEfficiency" name="mashEfficiency" type="number" step="0.1" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="evaporationRate">Evaporation Rate (%/h)</Label>
              <Input id="evaporationRate" name="evaporationRate" type="number" step="0.1" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="boilPotDiameter">Boil Pot Diameter (cm)</Label>
              <Input id="boilPotDiameter" name="boilPotDiameter" type="number" step="0.1" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fermenterLossL">Fermenter Loss (L) *</Label>
              <Input id="fermenterLossL" name="fermenterLossL" type="number" step="0.1" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="trubLossL">Trub Loss (L) *</Label>
              <Input id="trubLossL" name="trubLossL" type="number" step="0.1" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="systemLossPercent">System Loss (%)</Label>
              <Input id="systemLossPercent" name="systemLossPercent" type="number" step="0.1" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bagasseLossL">Bagasse Loss (L)</Label>
              <Input id="bagasseLossL" name="bagasseLossL" type="number" step="0.1" />
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