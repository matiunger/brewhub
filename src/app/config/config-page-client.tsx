"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// BeerJSON enums
const FERMENTABLE_TYPES = ["grain", "dry extract", "extract", "sugar", "fruit", "juice", "honey", "other"];
const GRAIN_GROUPS = ["base", "caramel", "flaked", "roasted", "specialty", "smoked", "adjunct"];
const HOP_FORMS = ["pellet", "leaf", "leaf (wet)", "extract", "powder", "plug"];
const HOP_TYPES = ["aroma", "bittering", "flavor", "aroma/bittering", "bittering/flavor", "aroma/flavor", "aroma/bittering/flavor"];
const CULTURE_FORMS = ["liquid", "dry", "slant", "culture", "dregs"];
const CULTURE_TYPES = ["ale", "lager", "kveik", "brett", "bacteria", "champagne", "lacto", "malolactic", "mixed-culture", "pedio", "spontaneous", "wine", "other"];

// Types
interface Equipment {
  id: string;
  name: string;
  brewhouseEfficiency: number;
  mashEfficiency: number | null;
  evaporationRate: number | null;
  boilPotDiameter: number | null;
  fermenterLossL: number;
  trubLossL: number;
  systemLossPercent: number | null;
  bagasseLossL: number | null;
}

interface Grain {
  id: string;
  name: string;
  type: string | null;
  origin: string | null;
  grainGroup: string | null;
  brand: string | null;
  maxYield: number | null;
  colorL: number | null;
  profile: string | null;
  uses: string | null;
}

interface Hop {
  id: string;
  name: string;
  origin: string | null;
  form: string | null;
  hopType: string | null;
  alphaAcid: number;
  betaAcid: number | null;
  profile: string | null;
  styles: string | null;
  alternatives: string | null;
}

interface Yeast {
  id: string;
  name: string;
  brand: string | null;
  type: string | null;       // BeerJSON form: liquid/dry/etc
  cultureType: string | null; // BeerJSON type: ale/lager/etc
  temperatureRange: string | null;
  profile: string | null;
  uses: string | null;
  attenuation: number | null;
}

interface WaterProfile {
  id: string;
  name: string;
  caPpm: number;
  mgPpm: number;
  naPpm: number;
  clPpm: number;
  so4Ppm: number;
  znPpm: number | null;
  hco3Ppm: number | null;
  pH: number | null;
}

interface Keg {
  id: string;
  name: string;
  number: string | null;
  capacity: number;
  tareWeight: number | null;
  notes: string | null;
}

interface ConfigData {
  equipment: Equipment[];
  grains: Grain[];
  hops: Hop[];
  yeasts: Yeast[];
  waterProfiles: WaterProfile[];
  kegs: Keg[];
}

// Helper: render a Select field or a plain input fallback
function EnumSelect({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string | null | undefined;
  options: string[];
  placeholder: string;
  onChange: (v: string | null) => void;
}) {
  return (
    <Select value={value ?? ""} onValueChange={(v) => onChange(v || null)}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">— none —</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ConfigPageClient({ initialData }: { initialData: ConfigData }) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "fermentables";
  const [data, setData] = useState(initialData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const refreshData = async () => {
    const response = await fetch("/api/config");
    const newData = await response.json();
    setData(newData);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} className="w-full">

        <TabsContent value="equipment" className="mt-6">
          <EquipmentTable
            data={data.equipment}
            editingId={editingId}
            setEditingId={setEditingId}
            onRefresh={refreshData}
            isAddDialogOpen={isAddDialogOpen}
            setIsAddDialogOpen={setIsAddDialogOpen}
          />
        </TabsContent>

        <TabsContent value="fermentables" className="mt-6">
          <GrainsTable
            data={data.grains}
            editingId={editingId}
            setEditingId={setEditingId}
            onRefresh={refreshData}
            isAddDialogOpen={isAddDialogOpen}
            setIsAddDialogOpen={setIsAddDialogOpen}
          />
        </TabsContent>

        <TabsContent value="hops" className="mt-6">
          <HopsTable
            data={data.hops}
            editingId={editingId}
            setEditingId={setEditingId}
            onRefresh={refreshData}
            isAddDialogOpen={isAddDialogOpen}
            setIsAddDialogOpen={setIsAddDialogOpen}
          />
        </TabsContent>

        <TabsContent value="cultures" className="mt-6">
          <YeastsTable
            data={data.yeasts}
            editingId={editingId}
            setEditingId={setEditingId}
            onRefresh={refreshData}
            isAddDialogOpen={isAddDialogOpen}
            setIsAddDialogOpen={setIsAddDialogOpen}
          />
        </TabsContent>

        <TabsContent value="water" className="mt-6">
          <WaterTable
            data={data.waterProfiles}
            editingId={editingId}
            setEditingId={setEditingId}
            onRefresh={refreshData}
            isAddDialogOpen={isAddDialogOpen}
            setIsAddDialogOpen={setIsAddDialogOpen}
          />
        </TabsContent>

        <TabsContent value="kegs" className="mt-6">
          <KegsTable
            data={data.kegs}
            editingId={editingId}
            setEditingId={setEditingId}
            onRefresh={refreshData}
            isAddDialogOpen={isAddDialogOpen}
            setIsAddDialogOpen={setIsAddDialogOpen}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---- Equipment Table ----

function EquipmentTable({
  data,
  editingId,
  setEditingId,
  onRefresh,
  isAddDialogOpen,
  setIsAddDialogOpen,
}: {
  data: Equipment[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onRefresh: () => void;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
}) {
  const [editForm, setEditForm] = useState<Partial<Equipment>>({});
  const [addForm, setAddForm] = useState<Partial<Equipment>>({
    name: "",
    brewhouseEfficiency: 75,
    fermenterLossL: 1,
    trubLossL: 1,
  });

  const startEdit = (item: Equipment) => { setEditingId(item.id); setEditForm(item); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async () => {
    await fetch(`/api/equipment/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    onRefresh();
  };

  const deleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this equipment?")) {
      await fetch(`/api/equipment/${id}`, { method: "DELETE" });
      onRefresh();
    }
  };

  const addItem = async () => {
    await fetch("/api/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    setIsAddDialogOpen(false);
    setAddForm({ name: "", brewhouseEfficiency: 75, fermenterLossL: 1, trubLossL: 1 });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>+ Add Equipment</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Equipment</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Brewhouse Efficiency (%) *</Label>
                <Input type="number" step="0.1" value={addForm.brewhouseEfficiency}
                  onChange={(e) => setAddForm({ ...addForm, brewhouseEfficiency: parseFloat(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Mash Efficiency (%)</Label>
                <Input type="number" step="0.1" value={addForm.mashEfficiency || ""}
                  onChange={(e) => setAddForm({ ...addForm, mashEfficiency: e.target.value ? parseFloat(e.target.value) : null })} />
              </div>
              <div className="space-y-2">
                <Label>Evaporation Rate (%/h)</Label>
                <Input type="number" step="0.1" value={addForm.evaporationRate || ""}
                  onChange={(e) => setAddForm({ ...addForm, evaporationRate: e.target.value ? parseFloat(e.target.value) : null })} />
              </div>
              <div className="space-y-2">
                <Label>Boil Pot Diameter (cm)</Label>
                <Input type="number" step="0.1" value={addForm.boilPotDiameter || ""}
                  onChange={(e) => setAddForm({ ...addForm, boilPotDiameter: e.target.value ? parseFloat(e.target.value) : null })} />
              </div>
              <div className="space-y-2">
                <Label>Fermenter Loss (L) *</Label>
                <Input type="number" step="0.1" value={addForm.fermenterLossL}
                  onChange={(e) => setAddForm({ ...addForm, fermenterLossL: parseFloat(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Trub Loss (L) *</Label>
                <Input type="number" step="0.1" value={addForm.trubLossL}
                  onChange={(e) => setAddForm({ ...addForm, trubLossL: parseFloat(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>System Loss (%)</Label>
                <Input type="number" step="0.1" value={addForm.systemLossPercent || ""}
                  onChange={(e) => setAddForm({ ...addForm, systemLossPercent: e.target.value ? parseFloat(e.target.value) : null })} />
              </div>
              <div className="space-y-2">
                <Label>Bagasse Loss (L)</Label>
                <Input type="number" step="0.1" value={addForm.bagasseLossL || ""}
                  onChange={(e) => setAddForm({ ...addForm, bagasseLossL: e.target.value ? parseFloat(e.target.value) : null })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={addItem}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Brewhouse Eff.</TableHead>
              <TableHead>Fermenter Loss</TableHead>
              <TableHead>Trub Loss</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                {editingId === item.id ? (
                  <>
                    <TableCell><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></TableCell>
                    <TableCell><Input type="number" step="0.1" value={editForm.brewhouseEfficiency}
                      onChange={(e) => setEditForm({ ...editForm, brewhouseEfficiency: parseFloat(e.target.value) })} /></TableCell>
                    <TableCell><Input type="number" step="0.1" value={editForm.fermenterLossL}
                      onChange={(e) => setEditForm({ ...editForm, fermenterLossL: parseFloat(e.target.value) })} /></TableCell>
                    <TableCell><Input type="number" step="0.1" value={editForm.trubLossL}
                      onChange={(e) => setEditForm({ ...editForm, trubLossL: parseFloat(e.target.value) })} /></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" onClick={saveEdit}>Save</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.brewhouseEfficiency}%</TableCell>
                    <TableCell>{item.fermenterLossL} L</TableCell>
                    <TableCell>{item.trubLossL} L</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => startEdit(item)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id)}>Delete</Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No equipment yet. Click "Add Equipment" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ---- Grains Table ----

function GrainsTable({
  data,
  editingId,
  setEditingId,
  onRefresh,
  isAddDialogOpen,
  setIsAddDialogOpen,
}: {
  data: Grain[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onRefresh: () => void;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
}) {
  const [editForm, setEditForm] = useState<Partial<Grain>>({});
  const [addForm, setAddForm] = useState<Partial<Grain>>({ name: "", type: "grain" });

  const startEdit = (item: Grain) => { setEditingId(item.id); setEditForm(item); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async () => {
    await fetch(`/api/grains/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    onRefresh();
  };

  const deleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this grain?")) {
      await fetch(`/api/grains/${id}`, { method: "DELETE" });
      onRefresh();
    }
  };

  const addItem = async () => {
    await fetch("/api/grains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    setIsAddDialogOpen(false);
    setAddForm({ name: "", type: "grain" });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>+ Add Fermentable</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Fermentable</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <EnumSelect value={addForm.type} options={FERMENTABLE_TYPES} placeholder="Select type"
                    onChange={(v) => setAddForm({ ...addForm, type: v })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Producer / Brand</Label>
                  <Input value={addForm.brand || ""} onChange={(e) => setAddForm({ ...addForm, brand: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Origin</Label>
                  <Input value={addForm.origin || ""} onChange={(e) => setAddForm({ ...addForm, origin: e.target.value })}
                    placeholder="e.g., Belgium, USA" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Grain Group</Label>
                <EnumSelect value={addForm.grainGroup} options={GRAIN_GROUPS} placeholder="Select grain group"
                  onChange={(v) => setAddForm({ ...addForm, grainGroup: v })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Yield / Fine Grind (%)</Label>
                  <Input type="number" step="0.1" value={addForm.maxYield || ""}
                    onChange={(e) => setAddForm({ ...addForm, maxYield: e.target.value ? parseFloat(e.target.value) : null })} />
                </div>
                <div className="space-y-2">
                  <Label>Color (Lovibond)</Label>
                  <Input type="number" step="0.1" value={addForm.colorL || ""}
                    onChange={(e) => setAddForm({ ...addForm, colorL: e.target.value ? parseFloat(e.target.value) : null })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes / Profile</Label>
                <Textarea value={addForm.profile || ""} onChange={(e) => setAddForm({ ...addForm, profile: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Best Uses</Label>
                <Textarea value={addForm.uses || ""} onChange={(e) => setAddForm({ ...addForm, uses: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={addItem}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Yield %</TableHead>
              <TableHead>Color (L)</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                {editingId === item.id ? (
                  <>
                    <TableCell><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></TableCell>
                    <TableCell>
                      <EnumSelect value={editForm.type} options={FERMENTABLE_TYPES} placeholder="Type"
                        onChange={(v) => setEditForm({ ...editForm, type: v })} />
                    </TableCell>
                    <TableCell>
                      <EnumSelect value={editForm.grainGroup} options={GRAIN_GROUPS} placeholder="Group"
                        onChange={(v) => setEditForm({ ...editForm, grainGroup: v })} />
                    </TableCell>
                    <TableCell>
                      <Input value={editForm.origin || ""} onChange={(e) => setEditForm({ ...editForm, origin: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.1" value={editForm.maxYield || ""}
                        onChange={(e) => setEditForm({ ...editForm, maxYield: e.target.value ? parseFloat(e.target.value) : null })} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.1" value={editForm.colorL || ""}
                        onChange={(e) => setEditForm({ ...editForm, colorL: e.target.value ? parseFloat(e.target.value) : null })} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" onClick={saveEdit}>Save</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.type || "-"}</TableCell>
                    <TableCell>{item.grainGroup || "-"}</TableCell>
                    <TableCell>{item.origin || "-"}</TableCell>
                    <TableCell>{item.maxYield ?? "-"}</TableCell>
                    <TableCell>{item.colorL ?? "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => startEdit(item)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id)}>Delete</Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No fermentables yet. Click "Add Fermentable" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ---- Hops Table ----

function HopsTable({
  data,
  editingId,
  setEditingId,
  onRefresh,
  isAddDialogOpen,
  setIsAddDialogOpen,
}: {
  data: Hop[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onRefresh: () => void;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
}) {
  const [editForm, setEditForm] = useState<Partial<Hop>>({});
  const [addForm, setAddForm] = useState<Partial<Hop>>({ name: "", alphaAcid: 5, form: "pellet" });

  const startEdit = (item: Hop) => { setEditingId(item.id); setEditForm(item); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async () => {
    await fetch(`/api/hops/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    onRefresh();
  };

  const deleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this hop?")) {
      await fetch(`/api/hops/${id}`, { method: "DELETE" });
      onRefresh();
    }
  };

  const addItem = async () => {
    await fetch("/api/hops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    setIsAddDialogOpen(false);
    setAddForm({ name: "", alphaAcid: 5, form: "pellet" });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>+ Add Hop</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Hop</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Origin</Label>
                  <Input value={addForm.origin || ""} onChange={(e) => setAddForm({ ...addForm, origin: e.target.value })}
                    placeholder="e.g., USA, Germany" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Form</Label>
                  <EnumSelect value={addForm.form} options={HOP_FORMS} placeholder="Select form"
                    onChange={(v) => setAddForm({ ...addForm, form: v })} />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <EnumSelect value={addForm.hopType} options={HOP_TYPES} placeholder="Select type"
                    onChange={(v) => setAddForm({ ...addForm, hopType: v })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Alpha Acid (%) *</Label>
                  <Input type="number" step="0.1" value={addForm.alphaAcid}
                    onChange={(e) => setAddForm({ ...addForm, alphaAcid: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Beta Acid (%)</Label>
                  <Input type="number" step="0.1" value={addForm.betaAcid || ""}
                    onChange={(e) => setAddForm({ ...addForm, betaAcid: e.target.value ? parseFloat(e.target.value) : null })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes / Profile</Label>
                <Textarea value={addForm.profile || ""} onChange={(e) => setAddForm({ ...addForm, profile: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Styles</Label>
                  <Input value={addForm.styles || ""} onChange={(e) => setAddForm({ ...addForm, styles: e.target.value })}
                    placeholder="e.g., IPA, Pale Ale" />
                </div>
                <div className="space-y-2">
                  <Label>Substitutes</Label>
                  <Input value={addForm.alternatives || ""} onChange={(e) => setAddForm({ ...addForm, alternatives: e.target.value })}
                    placeholder="e.g., Cascade, Centennial" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={addItem}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Form</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Alpha %</TableHead>
              <TableHead>Beta %</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                {editingId === item.id ? (
                  <>
                    <TableCell><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></TableCell>
                    <TableCell><Input value={editForm.origin || ""} onChange={(e) => setEditForm({ ...editForm, origin: e.target.value })} /></TableCell>
                    <TableCell>
                      <EnumSelect value={editForm.form} options={HOP_FORMS} placeholder="Form"
                        onChange={(v) => setEditForm({ ...editForm, form: v })} />
                    </TableCell>
                    <TableCell>
                      <EnumSelect value={editForm.hopType} options={HOP_TYPES} placeholder="Type"
                        onChange={(v) => setEditForm({ ...editForm, hopType: v })} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.1" value={editForm.alphaAcid}
                        onChange={(e) => setEditForm({ ...editForm, alphaAcid: parseFloat(e.target.value) })} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.1" value={editForm.betaAcid || ""}
                        onChange={(e) => setEditForm({ ...editForm, betaAcid: e.target.value ? parseFloat(e.target.value) : null })} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" onClick={saveEdit}>Save</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.origin || "-"}</TableCell>
                    <TableCell>{item.form || "-"}</TableCell>
                    <TableCell>{item.hopType || "-"}</TableCell>
                    <TableCell>{item.alphaAcid}%</TableCell>
                    <TableCell>{item.betaAcid != null ? `${item.betaAcid}%` : "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => startEdit(item)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id)}>Delete</Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No hops yet. Click "Add Hop" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ---- Yeasts Table ----

function YeastsTable({
  data,
  editingId,
  setEditingId,
  onRefresh,
  isAddDialogOpen,
  setIsAddDialogOpen,
}: {
  data: Yeast[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onRefresh: () => void;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
}) {
  const [editForm, setEditForm] = useState<Partial<Yeast>>({});
  const [addForm, setAddForm] = useState<Partial<Yeast>>({ name: "" });

  const startEdit = (item: Yeast) => { setEditingId(item.id); setEditForm(item); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async () => {
    await fetch(`/api/yeasts/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    onRefresh();
  };

  const deleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this yeast?")) {
      await fetch(`/api/yeasts/${id}`, { method: "DELETE" });
      onRefresh();
    }
  };

  const addItem = async () => {
    await fetch("/api/yeasts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    setIsAddDialogOpen(false);
    setAddForm({ name: "" });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>+ Add Culture</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Culture</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Producer / Brand</Label>
                  <Input value={addForm.brand || ""} onChange={(e) => setAddForm({ ...addForm, brand: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Culture Type</Label>
                  <EnumSelect value={addForm.cultureType} options={CULTURE_TYPES} placeholder="Select type"
                    onChange={(v) => setAddForm({ ...addForm, cultureType: v })} />
                </div>
                <div className="space-y-2">
                  <Label>Form</Label>
                  <EnumSelect value={addForm.type} options={CULTURE_FORMS} placeholder="Select form"
                    onChange={(v) => setAddForm({ ...addForm, type: v })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Temperature Range</Label>
                  <Input value={addForm.temperatureRange || ""} onChange={(e) => setAddForm({ ...addForm, temperatureRange: e.target.value })}
                    placeholder="e.g., 18-22°C" />
                </div>
                <div className="space-y-2">
                  <Label>Attenuation (%)</Label>
                  <Input type="number" step="0.1" value={addForm.attenuation || ""}
                    onChange={(e) => setAddForm({ ...addForm, attenuation: e.target.value ? parseFloat(e.target.value) : null })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes / Profile</Label>
                <Textarea value={addForm.profile || ""} onChange={(e) => setAddForm({ ...addForm, profile: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Best For</Label>
                <Textarea value={addForm.uses || ""} onChange={(e) => setAddForm({ ...addForm, uses: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={addItem}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Producer</TableHead>
              <TableHead>Culture Type</TableHead>
              <TableHead>Form</TableHead>
              <TableHead>Attenuation</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                {editingId === item.id ? (
                  <>
                    <TableCell><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></TableCell>
                    <TableCell><Input value={editForm.brand || ""} onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })} /></TableCell>
                    <TableCell>
                      <EnumSelect value={editForm.cultureType} options={CULTURE_TYPES} placeholder="Type"
                        onChange={(v) => setEditForm({ ...editForm, cultureType: v })} />
                    </TableCell>
                    <TableCell>
                      <EnumSelect value={editForm.type} options={CULTURE_FORMS} placeholder="Form"
                        onChange={(v) => setEditForm({ ...editForm, type: v })} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.1" value={editForm.attenuation || ""}
                        onChange={(e) => setEditForm({ ...editForm, attenuation: e.target.value ? parseFloat(e.target.value) : null })} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" onClick={saveEdit}>Save</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.brand || "-"}</TableCell>
                    <TableCell>{item.cultureType || "-"}</TableCell>
                    <TableCell>{item.type || "-"}</TableCell>
                    <TableCell>{item.attenuation != null ? `${item.attenuation}%` : "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => startEdit(item)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id)}>Delete</Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No cultures yet. Click "Add Culture" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ---- Water Table ----

function WaterTable({
  data,
  editingId,
  setEditingId,
  onRefresh,
  isAddDialogOpen,
  setIsAddDialogOpen,
}: {
  data: WaterProfile[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onRefresh: () => void;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
}) {
  const [editForm, setEditForm] = useState<Partial<WaterProfile>>({});
  const [addForm, setAddForm] = useState<Partial<WaterProfile>>({
    name: "", caPpm: 0, mgPpm: 0, naPpm: 0, clPpm: 0, so4Ppm: 0,
  });

  const startEdit = (item: WaterProfile) => { setEditingId(item.id); setEditForm(item); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async () => {
    await fetch(`/api/water-profiles/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    onRefresh();
  };

  const deleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this water profile?")) {
      await fetch(`/api/water-profiles/${id}`, { method: "DELETE" });
      onRefresh();
    }
  };

  const addItem = async () => {
    await fetch("/api/water-profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    setIsAddDialogOpen(false);
    setAddForm({ name: "", caPpm: 0, mgPpm: 0, naPpm: 0, clPpm: 0, so4Ppm: 0 });
    onRefresh();
  };

  const numField = (
    label: string,
    key: keyof WaterProfile,
    form: Partial<WaterProfile>,
    setForm: (f: Partial<WaterProfile>) => void,
    required = false,
    step = "0.1"
  ) => (
    <div className="space-y-2">
      <Label>{label}{required ? " *" : ""}</Label>
      <Input type="number" step={step} value={form[key] != null ? String(form[key]) : ""}
        onChange={(e) => setForm({ ...form, [key]: e.target.value ? parseFloat(e.target.value) : null })} />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>+ Add Water Profile</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Water Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>pH</Label>
                  <Input type="number" step="0.01" placeholder="e.g., 7.0" value={addForm.pH != null ? String(addForm.pH) : ""}
                    onChange={(e) => setAddForm({ ...addForm, pH: e.target.value ? parseFloat(e.target.value) : null })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {numField("Ca²⁺ (ppm) *", "caPpm", addForm, setAddForm, true)}
                {numField("Mg²⁺ (ppm) *", "mgPpm", addForm, setAddForm, true)}
                {numField("Na⁺ (ppm) *", "naPpm", addForm, setAddForm, true)}
                {numField("Cl⁻ (ppm) *", "clPpm", addForm, setAddForm, true)}
                {numField("SO₄²⁻ (ppm) *", "so4Ppm", addForm, setAddForm, true)}
                {numField("HCO₃⁻ (ppm)", "hco3Ppm", addForm, setAddForm)}
                {numField("Zn (ppm)", "znPpm", addForm, setAddForm)}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={addItem}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>pH</TableHead>
              <TableHead>Ca</TableHead>
              <TableHead>Mg</TableHead>
              <TableHead>Na</TableHead>
              <TableHead>Cl</TableHead>
              <TableHead>SO₄</TableHead>
              <TableHead>HCO₃</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                {editingId === item.id ? (
                  <>
                    <TableCell><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></TableCell>
                    <TableCell><Input type="number" step="0.01" value={editForm.pH != null ? String(editForm.pH) : ""}
                      onChange={(e) => setEditForm({ ...editForm, pH: e.target.value ? parseFloat(e.target.value) : null })} /></TableCell>
                    <TableCell><Input type="number" step="0.1" value={editForm.caPpm}
                      onChange={(e) => setEditForm({ ...editForm, caPpm: parseFloat(e.target.value) })} /></TableCell>
                    <TableCell><Input type="number" step="0.1" value={editForm.mgPpm}
                      onChange={(e) => setEditForm({ ...editForm, mgPpm: parseFloat(e.target.value) })} /></TableCell>
                    <TableCell><Input type="number" step="0.1" value={editForm.naPpm}
                      onChange={(e) => setEditForm({ ...editForm, naPpm: parseFloat(e.target.value) })} /></TableCell>
                    <TableCell><Input type="number" step="0.1" value={editForm.clPpm}
                      onChange={(e) => setEditForm({ ...editForm, clPpm: parseFloat(e.target.value) })} /></TableCell>
                    <TableCell><Input type="number" step="0.1" value={editForm.so4Ppm}
                      onChange={(e) => setEditForm({ ...editForm, so4Ppm: parseFloat(e.target.value) })} /></TableCell>
                    <TableCell><Input type="number" step="0.1" value={editForm.hco3Ppm != null ? String(editForm.hco3Ppm) : ""}
                      onChange={(e) => setEditForm({ ...editForm, hco3Ppm: e.target.value ? parseFloat(e.target.value) : null })} /></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" onClick={saveEdit}>Save</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.pH ?? "-"}</TableCell>
                    <TableCell>{item.caPpm}</TableCell>
                    <TableCell>{item.mgPpm}</TableCell>
                    <TableCell>{item.naPpm}</TableCell>
                    <TableCell>{item.clPpm}</TableCell>
                    <TableCell>{item.so4Ppm}</TableCell>
                    <TableCell>{item.hco3Ppm ?? "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => startEdit(item)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id)}>Delete</Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  No water profiles yet. Click "Add Water Profile" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ---- Kegs Table ----

function KegsTable({
  data,
  editingId,
  setEditingId,
  onRefresh,
  isAddDialogOpen,
  setIsAddDialogOpen,
}: {
  data: Keg[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onRefresh: () => void;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
}) {
  const [editForm, setEditForm] = useState<Partial<Keg>>({});
  const [addForm, setAddForm] = useState<Partial<Keg>>({ name: "", capacity: 19 });

  const startEdit = (item: Keg) => { setEditingId(item.id); setEditForm(item); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async () => {
    await fetch(`/api/kegs/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    onRefresh();
  };

  const deleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this keg?")) {
      await fetch(`/api/kegs/${id}`, { method: "DELETE" });
      onRefresh();
    }
  };

  const addItem = async () => {
    await fetch("/api/kegs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    setIsAddDialogOpen(false);
    setAddForm({ name: "", capacity: 19 });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>+ Add Keg</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Keg</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Number</Label>
                  <Input value={addForm.number || ""} onChange={(e) => setAddForm({ ...addForm, number: e.target.value })}
                    placeholder="e.g., K001" />
                </div>
                <div className="space-y-2">
                  <Label>Capacity (L) *</Label>
                  <Input type="number" step="0.1" value={addForm.capacity}
                    onChange={(e) => setAddForm({ ...addForm, capacity: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tare Weight (kg)</Label>
                <Input type="number" step="0.1" value={addForm.tareWeight || ""}
                  onChange={(e) => setAddForm({ ...addForm, tareWeight: e.target.value ? parseFloat(e.target.value) : null })} />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={addForm.notes || ""} onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={addItem}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Tare Weight</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                {editingId === item.id ? (
                  <>
                    <TableCell><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></TableCell>
                    <TableCell><Input value={editForm.number || ""} onChange={(e) => setEditForm({ ...editForm, number: e.target.value })} /></TableCell>
                    <TableCell><Input type="number" step="0.1" value={editForm.capacity}
                      onChange={(e) => setEditForm({ ...editForm, capacity: parseFloat(e.target.value) })} /></TableCell>
                    <TableCell><Input type="number" step="0.1" value={editForm.tareWeight || ""}
                      onChange={(e) => setEditForm({ ...editForm, tareWeight: e.target.value ? parseFloat(e.target.value) : null })} /></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" onClick={saveEdit}>Save</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.number || "-"}</TableCell>
                    <TableCell>{item.capacity} L</TableCell>
                    <TableCell>{item.tareWeight != null ? `${item.tareWeight} kg` : "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => startEdit(item)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id)}>Delete</Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No kegs yet. Click "Add Keg" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
