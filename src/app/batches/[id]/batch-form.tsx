"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownNotes } from "./markdown-notes";

interface BatchFormProps {
  batch: {
    id: string;
    name: string;
    style: string | null;
    notes: string | null;
    brewDate: Date | null;
    draft: boolean;
    type: string;
  };
  updateAction: (formData: FormData) => Promise<void>;
  updateNotesAction: (notes: string) => Promise<void>;
}

export function BatchForm({ batch, updateAction, updateNotesAction }: BatchFormProps) {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    try {
      await updateAction(formData);
      toast.success("Batch updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update batch");
    }
  };

  const isBeer = batch.type === "beer";

  return (
    <Card className="w-full xl:max-w-[1000px]">
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {isBeer ? (
            // Beer layout - stacked
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={batch.name} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brewDate">Brew Date</Label>
                <Input 
                  id="brewDate" 
                  name="brewDate" 
                  type="date" 
                  defaultValue={batch.brewDate?.toISOString().split("T")[0]} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Input id="style" name="style" defaultValue={batch.style || ""} />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="draft"
                  name="draft"
                  defaultChecked={batch.draft}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="draft" className="text-sm font-normal">Draft</Label>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" size="sm">Update Info</Button>
              </div>
            </>
          ) : (
            // Non-beer layout - name/style row, brewDate/draft row
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={batch.name} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="style">Style</Label>
                  <Input id="style" name="style" defaultValue={batch.style || ""} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brewDate">Brew Date</Label>
                  <Input 
                    id="brewDate" 
                    name="brewDate" 
                    type="date" 
                    defaultValue={batch.brewDate?.toISOString().split("T")[0]} 
                  />
                </div>
                
                <div className="flex items-end pb-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="draft"
                      name="draft"
                      defaultChecked={batch.draft}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="draft" className="text-sm font-normal">Draft</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" size="sm">Update Info</Button>
              </div>
            </>
          )}
        </form>
        
        {/* Notes Section */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-sm font-medium mb-3">Notes</h3>
          <MarkdownNotes notes={batch.notes} onSave={updateNotesAction} />
        </div>
      </CardContent>
    </Card>
  );
}
