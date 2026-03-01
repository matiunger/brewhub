import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

async function createKeg(formData: FormData) {
  "use server";
  
  await prisma.keg.create({
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

export default function NewKegPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/config" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Config
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Add Keg</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createKeg} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="number">Number</Label>
              <Input id="number" name="number" placeholder="e.g., K001" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (L) *</Label>
              <Input id="capacity" name="capacity" type="number" step="0.1" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tareWeight">Tare Weight (kg)</Label>
              <Input id="tareWeight" name="tareWeight" type="number" step="0.1" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" />
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