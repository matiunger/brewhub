import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

async function createBatch(formData: FormData) {
  "use server";
  
  const type = formData.get("type") as string;
  
  await prisma.batch.create({
    data: {
      name: formData.get("name") as string,
      brewDate: new Date(formData.get("brewDate") as string),
      type,
      style: formData.get("style") as string || null,
      notes: formData.get("notes") as string || null,
      draft: formData.get("draft") === "true",
    },
  });
  
  redirect("/");
}

export default function NewBatchPage() {
  const today = new Date().toISOString().split("T")[0];
  
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Home
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Batch</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createBatch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Batch Name *</Label>
              <Input id="name" name="name" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brewDate">Brew Date *</Label>
              <Input id="brewDate" name="brewDate" type="date" defaultValue={today} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select name="type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beer">Beer</SelectItem>
                  <SelectItem value="cider">Cider</SelectItem>
                  <SelectItem value="hopwater">Hop Water</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <Input id="style" name="style" placeholder="e.g., IPA, Stout, Pale Ale" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="draft"
                name="draft"
                value="true"
                defaultChecked
                className="rounded border-gray-300"
              />
              <Label htmlFor="draft" className="text-sm font-normal">
                Draft (uncheck when batch is executed)
              </Label>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit">Create Batch</Button>
              <Link href="/">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}