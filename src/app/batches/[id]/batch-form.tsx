"use client";

import { useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownNotes } from "./markdown-notes";
import styles from "../../../../styles.json";

const styleNames = styles.map((s) => `${s.number} ${s.name}`);

interface BatchFormProps {
  batch: {
    id: string;
    name: string;
    style: string | null;
    notes: string | null;
    brewDate: Date | null;
    draft: boolean;
    type: string;
    equipmentId?: string | null;
  };
  equipment?: { id: string; name: string }[];
  updateAction: (formData: FormData) => Promise<void>;
  updateNotesAction: (notes: string) => Promise<void>;
  bare?: boolean;
}

export function BatchForm({ batch, equipment, updateAction, updateNotesAction, bare }: BatchFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [draft, setDraft] = useState(batch.draft);
  const [equipmentId, setEquipmentId] = useState<string>(batch.equipmentId ?? "");

  const save = useCallback(async () => {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    try {
      await updateAction(formData);
      router.refresh();
    } catch {
      toast.error("Failed to save");
    }
  }, [updateAction, router]);

  const scheduleAutoSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(save, 800);
  }, [save]);

  const isBeer = batch.type === "beer";

  const inner = (
    <>
      <form ref={formRef} className="space-y-4">
        {isBeer ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={batch.name} onChange={scheduleAutoSave} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Input
                  id="style"
                  name="style"
                  list="style-options"
                  defaultValue={batch.style || ""}
                  autoComplete="off"
                  onChange={scheduleAutoSave}
                />
                <datalist id="style-options">
                  {styleNames.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brewDate">Brew Date</Label>
                <Input
                  id="brewDate"
                  name="brewDate"
                  type="date"
                  defaultValue={batch.brewDate?.toISOString().split("T")[0]}
                  onChange={scheduleAutoSave}
                />
              </div>

              <div className="flex items-end pb-2">
                <div className="flex items-center space-x-2">
                  <input type="hidden" name="draft" value={draft ? "on" : "off"} />
                  <Switch
                    id="draft"
                    checked={draft}
                    onCheckedChange={(checked) => { setDraft(checked); scheduleAutoSave(); }}
                  />
                  <Label htmlFor="draft" className="text-sm font-normal">Draft</Label>
                </div>
              </div>
            </div>

            {equipment !== undefined && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="equipmentId">Equipment</Label>
                  <input type="hidden" name="equipmentId" value={equipmentId} />
                  <Select
                    value={equipmentId}
                    onValueChange={(val) => { setEquipmentId(val); scheduleAutoSave(); }}
                    disabled={equipment.length === 0}
                  >
                    <SelectTrigger id="equipmentId">
                      <SelectValue placeholder={equipment.length === 0 ? "No equipment configured" : "Select equipment…"} />
                    </SelectTrigger>
                    <SelectContent>
                      {equipment.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={batch.name} onChange={scheduleAutoSave} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Input id="style" name="style" defaultValue={batch.style || ""} onChange={scheduleAutoSave} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brewDate">Brew Date</Label>
                <Input
                  id="brewDate"
                  name="brewDate"
                  type="date"
                  defaultValue={batch.brewDate?.toISOString().split("T")[0]}
                  onChange={scheduleAutoSave}
                />
              </div>

              <div className="flex items-end pb-2">
                <div className="flex items-center space-x-2">
                  <input type="hidden" name="draft" value={draft ? "on" : "off"} />
                  <Switch
                    id="draft"
                    checked={draft}
                    onCheckedChange={(checked) => { setDraft(checked); scheduleAutoSave(); }}
                  />
                  <Label htmlFor="draft" className="text-sm font-normal">Draft</Label>
                </div>
              </div>
            </div>
          </>
        )}
      </form>

      <div className="mt-6">
        <h3 className="text-sm font-medium mb-3">Notes</h3>
        <MarkdownNotes notes={batch.notes} onSave={updateNotesAction} />
      </div>
    </>
  );

  if (bare) {
    return inner;
  }

  return (
    <Card className="w-full xl:max-w-[1000px]">
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent>{inner}</CardContent>
    </Card>
  );
}
