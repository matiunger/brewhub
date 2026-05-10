"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Wrench, Wheat, Hop as HopIcon, FlaskConical, Droplets, Barrel, ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
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
const KEG_TYPES = ["cornelius", "sanke", "sixth barrel", "quarter barrel", "half barrel", "mini keg", "other"];

// Types
interface Equipment {
  id: string;
  name: string;
  brewhouseEfficiency: number;
  mashEfficiency: number | null;
  mashTunVolumeL: number | null;
  mashTunDeadSpaceL: number | null;
  mashTunLossL: number | null;
  boilPotVolumeL: number | null;
  boilPotDiameter: number | null;
  boilEvaporationRateLH: number | null;
  heatingEvaporationRateLH: number | null;
  spargeWaterPotDiameter: number | null;
  grainAbsorptionLKg: number | null;
  fermenterVolumeL: number | null;
  fermenterWeightKg: number | null;
  fermenterLossL: number;
  trubLossL: number;
  systemLossPercent: number | null;
  tempContractionPercent: number | null;
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
  type: string | null;
  cultureType: string | null;
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
  type: string | null;
  label: string | null;
  capacity: number;
  tareWeight: number | null;
  notes: string | null;
}

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
    <Select value={value ?? "__none__"} onValueChange={(v) => onChange(v === "__none__" ? null : v)}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">— none —</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ---- Sortable Header Helper ----

type SortDir = "asc" | "desc";
type SortState<K extends string> = { key: K; dir: SortDir };

function SortableHead<K extends string>({
  label,
  sortKey,
  sort,
  onSort,
  className,
}: {
  label: string;
  sortKey: K;
  sort: SortState<K>;
  onSort: (key: K) => void;
  className?: string;
}) {
  const active = sort.key === sortKey;
  return (
    <TableHead className={`cursor-pointer select-none ${className || ""}`} onClick={() => onSort(sortKey)}>
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (
          sort.dir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
        ) : null}
      </span>
    </TableHead>
  );
}

function sortData<T>(data: T[], key: keyof T, dir: SortDir): T[] {
  return [...data].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "number" && typeof bv === "number") return dir === "asc" ? av - bv : bv - av;
    const as = String(av).toLowerCase();
    const bs = String(bv).toLowerCase();
    return dir === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
  });
}

// ---- Equipment Table ----

function EquipmentForm({
  form,
  setForm,
}: {
  form: Partial<Equipment>;
  setForm: (f: Partial<Equipment>) => void;
}) {
  const num = (val: number | null | undefined) => (val == null ? "" : val);
  const set = (field: keyof Equipment, val: string, required?: boolean) =>
    setForm({ ...form, [field]: val === "" ? (required ? 0 : null) : parseFloat(val) });

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div className="space-y-2 col-span-2">
        <Label>Name *</Label>
        <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Brewhouse Efficiency (%) *</Label>
        <NumberInput step="0.1" value={num(form.brewhouseEfficiency)}
          onChange={(e) => set("brewhouseEfficiency", e.target.value, true)} />
      </div>
      <div className="space-y-2">
        <Label>Mash Efficiency (%)</Label>
        <NumberInput step="0.1" value={num(form.mashEfficiency)}
          onChange={(e) => set("mashEfficiency", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Mash Tun Volume (L)</Label>
        <NumberInput step="0.1" value={num(form.mashTunVolumeL)}
          onChange={(e) => set("mashTunVolumeL", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Mash Tun Dead Space (L)</Label>
        <NumberInput step="0.1" value={num(form.mashTunDeadSpaceL)}
          onChange={(e) => set("mashTunDeadSpaceL", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Mash Tun Loss (L)</Label>
        <NumberInput step="0.1" value={num(form.mashTunLossL)}
          onChange={(e) => set("mashTunLossL", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Boil Pot Volume (L)</Label>
        <NumberInput step="0.1" value={num(form.boilPotVolumeL)}
          onChange={(e) => set("boilPotVolumeL", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Boil Pot Diameter (cm)</Label>
        <NumberInput step="0.1" value={num(form.boilPotDiameter)}
          onChange={(e) => set("boilPotDiameter", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Boil Evaporation Rate (L/h)</Label>
        <NumberInput step="0.1" value={num(form.boilEvaporationRateLH)}
          onChange={(e) => set("boilEvaporationRateLH", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Heating Evaporation Rate (L/h)</Label>
        <NumberInput step="0.1" value={num(form.heatingEvaporationRateLH)}
          onChange={(e) => set("heatingEvaporationRateLH", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Sparge Water Pot Diameter (cm)</Label>
        <NumberInput step="0.1" value={num(form.spargeWaterPotDiameter)}
          onChange={(e) => set("spargeWaterPotDiameter", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Grain Absorption (L/kg)</Label>
        <NumberInput step="0.01" value={num(form.grainAbsorptionLKg)}
          onChange={(e) => set("grainAbsorptionLKg", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Fermenter Volume (L)</Label>
        <NumberInput step="0.1" value={num(form.fermenterVolumeL)}
          onChange={(e) => set("fermenterVolumeL", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Fermenter Weight (kg)</Label>
        <NumberInput step="0.1" value={num(form.fermenterWeightKg)}
          onChange={(e) => set("fermenterWeightKg", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Fermenter Loss (L) *</Label>
        <NumberInput step="0.1" value={num(form.fermenterLossL)}
          onChange={(e) => set("fermenterLossL", e.target.value, true)} />
      </div>
      <div className="space-y-2">
        <Label>Trub Loss (L) *</Label>
        <NumberInput step="0.1" value={num(form.trubLossL)}
          onChange={(e) => set("trubLossL", e.target.value, true)} />
      </div>
      <div className="space-y-2">
        <Label>System Loss (%)</Label>
        <NumberInput step="0.1" value={num(form.systemLossPercent)}
          onChange={(e) => set("systemLossPercent", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Temp Contraction (%)</Label>
        <NumberInput step="0.1" value={num(form.tempContractionPercent)}
          onChange={(e) => set("tempContractionPercent", e.target.value)} />
      </div>
    </div>
  );
}

export function EquipmentTable({ initialData }: { initialData: Equipment[] }) {
  const [data, setData] = useState(initialData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Equipment>>({});
  const [addForm, setAddForm] = useState<Partial<Equipment>>({
    name: "",
    brewhouseEfficiency: 75,
    fermenterLossL: 1,
    trubLossL: 1,
    tempContractionPercent: 4,
  });

  const refresh = async () => {
    const r = await fetch("/api/equipment");
    setData(await r.json());
  };

  const startEdit = (item: Equipment) => {
    setEditingId(item.id);
    setEditForm(item);
    setIsEditDialogOpen(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setIsEditDialogOpen(false);
  };

  const saveEdit = async () => {
    const r = await fetch(`/api/equipment/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (!r.ok) { toast.error("Failed to save equipment"); return; }
    cancelEdit();
    refresh();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return;
    const r = await fetch(`/api/equipment/${id}`, { method: "DELETE" });
    if (r.ok) { refresh(); } else { toast.error("Failed to delete equipment"); }
  };

  const addItem = async () => {
    const r = await fetch("/api/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    if (!r.ok) { toast.error("Failed to add equipment"); return; }
    setIsAddDialogOpen(false);
    setAddForm({ name: "", brewhouseEfficiency: 75, fermenterLossL: 1, trubLossL: 1, tempContractionPercent: 4 });
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wrench className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Equipment</h1>
        </div>
        <Button className="bg-gray-200 hover:bg-gray-300 text-gray-800" onClick={() => setIsAddDialogOpen(true)}>
          + Add Equipment
        </Button>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Equipment</DialogTitle>
          </DialogHeader>
          <EquipmentForm form={addForm} setForm={setAddForm} />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={addItem}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { if (!open) cancelEdit(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Equipment</DialogTitle>
          </DialogHeader>
          <EquipmentForm form={editForm} setForm={setEditForm} />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-100">
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
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.brewhouseEfficiency}%</TableCell>
                <TableCell>{item.fermenterLossL} L</TableCell>
                <TableCell>{item.trubLossL} L</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteItem(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No equipment yet. Click &quot;Add Equipment&quot; to create one.
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

export function GrainsTable({ initialData }: { initialData: Grain[] }) {
  const [data, setData] = useState(initialData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Grain>>({});
  const [addForm, setAddForm] = useState<Partial<Grain>>({ name: "", type: "grain" });
  const [sort, setSort] = useState<SortState<keyof Grain>>({ key: "colorL", dir: "asc" });

  const sorted = useMemo(() => sortData(data, sort.key, sort.dir), [data, sort]);
  const toggleSort = (key: keyof Grain) => setSort(s => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });

  const refresh = async () => {
    const r = await fetch("/api/grains");
    setData(await r.json());
  };

  const startEdit = (item: Grain) => { setEditingId(item.id); setEditForm(item); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async () => {
    const r = await fetch(`/api/grains/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (!r.ok) { toast.error("Failed to save fermentable"); return; }
    setEditingId(null);
    refresh();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fermentable?")) return;
    const r = await fetch(`/api/grains/${id}`, { method: "DELETE" });
    if (r.ok) { refresh(); } else { toast.error("Failed to delete fermentable"); }
  };

  const addItem = async () => {
    const r = await fetch("/api/grains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    if (!r.ok) { toast.error("Failed to add fermentable"); return; }
    setIsAddDialogOpen(false);
    setAddForm({ name: "", type: "grain" });
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wheat className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Fermentables</h1>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-200 hover:bg-orange-300 text-orange-900">+ Add Fermentable</Button>
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
                  <NumberInput step="0.1" value={addForm.maxYield || ""}
                    onChange={(e) => setAddForm({ ...addForm, maxYield: e.target.value ? parseFloat(e.target.value) : null })} />
                </div>
                <div className="space-y-2">
                  <Label>Color (Lovibond)</Label>
                  <NumberInput step="0.1" value={addForm.colorL || ""}
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
            <TableRow className="bg-orange-100 hover:bg-orange-100">
              <SortableHead label="Name" sortKey="name" sort={sort} onSort={toggleSort} />
              <SortableHead label="Type" sortKey="type" sort={sort} onSort={toggleSort} />
              <SortableHead label="Group" sortKey="grainGroup" sort={sort} onSort={toggleSort} />
              <SortableHead label="Brand" sortKey="brand" sort={sort} onSort={toggleSort} />
              <SortableHead label="Origin" sortKey="origin" sort={sort} onSort={toggleSort} />
              <SortableHead label="Yield %" sortKey="maxYield" sort={sort} onSort={toggleSort} />
              <SortableHead label="Color (L)" sortKey="colorL" sort={sort} onSort={toggleSort} />
              <SortableHead label="Profile" sortKey="profile" sort={sort} onSort={toggleSort} />
              <SortableHead label="Uses" sortKey="uses" sort={sort} onSort={toggleSort} />
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((item) => (
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
                      <Input value={editForm.brand || ""} onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <Input value={editForm.origin || ""} onChange={(e) => setEditForm({ ...editForm, origin: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <NumberInput step="0.1" value={editForm.maxYield || ""}
                        onChange={(e) => setEditForm({ ...editForm, maxYield: e.target.value ? parseFloat(e.target.value) : null })} />
                    </TableCell>
                    <TableCell>
                      <NumberInput step="0.1" value={editForm.colorL || ""}
                        onChange={(e) => setEditForm({ ...editForm, colorL: e.target.value ? parseFloat(e.target.value) : null })} />
                    </TableCell>
                    <TableCell>
                      <Input value={editForm.profile || ""} onChange={(e) => setEditForm({ ...editForm, profile: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <Input value={editForm.uses || ""} onChange={(e) => setEditForm({ ...editForm, uses: e.target.value })} />
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
                    <TableCell>{item.brand || "-"}</TableCell>
                    <TableCell>{item.origin || "-"}</TableCell>
                    <TableCell>{item.maxYield ?? "-"}</TableCell>
                    <TableCell>{item.colorL ?? "-"}</TableCell>
                    <TableCell>{item.profile || "-"}</TableCell>
                    <TableCell>{item.uses || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteItem(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  No fermentables yet. Click &quot;Add Fermentable&quot; to create one.
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


export function HopsTable({ initialData }: { initialData: Hop[] }) {
  const [data, setData] = useState(initialData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Hop>>({});
  const [addForm, setAddForm] = useState<Partial<Hop>>({ name: "", alphaAcid: 5, form: "pellet" });
  const [sort, setSort] = useState<SortState<keyof Hop>>({ key: "alphaAcid", dir: "asc" });

  const sorted = useMemo(() => sortData(data, sort.key, sort.dir), [data, sort]);
  const toggleSort = (key: keyof Hop) => setSort(s => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });

  const refresh = async () => {
    const r = await fetch("/api/hops");
    setData(await r.json());
  };

  const startEdit = (item: Hop) => { setEditingId(item.id); setEditForm(item); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async () => {
    const r = await fetch(`/api/hops/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (!r.ok) { toast.error("Failed to save hop"); return; }
    setEditingId(null);
    refresh();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hop?")) return;
    const r = await fetch(`/api/hops/${id}`, { method: "DELETE" });
    if (r.ok) { refresh(); } else { toast.error("Failed to delete hop"); }
  };

  const addItem = async () => {
    const r = await fetch("/api/hops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    if (!r.ok) { toast.error("Failed to add hop"); return; }
    setIsAddDialogOpen(false);
    setAddForm({ name: "", alphaAcid: 5, form: "pellet" });
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HopIcon className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Hops</h1>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-lime-200 hover:bg-lime-300 text-lime-900">+ Add Hop</Button>
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
                  <NumberInput step="0.1" value={addForm.alphaAcid}
                    onChange={(e) => setAddForm({ ...addForm, alphaAcid: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Beta Acid (%)</Label>
                  <NumberInput step="0.1" value={addForm.betaAcid || ""}
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
            <TableRow className="bg-lime-100 hover:bg-lime-100">
              <SortableHead label="Name" sortKey="name" sort={sort} onSort={toggleSort} />
              <SortableHead label="Origin" sortKey="origin" sort={sort} onSort={toggleSort} />
              <SortableHead label="Form" sortKey="form" sort={sort} onSort={toggleSort} />
              <SortableHead label="Type" sortKey="hopType" sort={sort} onSort={toggleSort} />
              <SortableHead label="Alpha %" sortKey="alphaAcid" sort={sort} onSort={toggleSort} />
              <SortableHead label="Beta %" sortKey="betaAcid" sort={sort} onSort={toggleSort} />
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((item) => (
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
                      <NumberInput step="0.1" value={editForm.alphaAcid}
                        onChange={(e) => setEditForm({ ...editForm, alphaAcid: parseFloat(e.target.value) })} />
                    </TableCell>
                    <TableCell>
                      <NumberInput step="0.1" value={editForm.betaAcid || ""}
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
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteItem(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No hops yet. Click &quot;Add Hop&quot; to create one.
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

export function YeastsTable({ initialData }: { initialData: Yeast[] }) {
  const [data, setData] = useState(initialData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Yeast>>({});
  const [addForm, setAddForm] = useState<Partial<Yeast>>({ name: "" });
  const [sort, setSort] = useState<SortState<keyof Yeast>>({ key: "cultureType", dir: "asc" });

  const sorted = useMemo(() => sortData(data, sort.key, sort.dir), [data, sort]);
  const toggleSort = (key: keyof Yeast) => setSort(s => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });

  const refresh = async () => {
    const r = await fetch("/api/yeasts");
    setData(await r.json());
  };

  const startEdit = (item: Yeast) => { setEditingId(item.id); setEditForm(item); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async () => {
    const r = await fetch(`/api/yeasts/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (!r.ok) { toast.error("Failed to save culture"); return; }
    setEditingId(null);
    refresh();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this culture?")) return;
    const r = await fetch(`/api/yeasts/${id}`, { method: "DELETE" });
    if (r.ok) { refresh(); } else { toast.error("Failed to delete culture"); }
  };

  const addItem = async () => {
    const r = await fetch("/api/yeasts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    if (!r.ok) { toast.error("Failed to add culture"); return; }
    setIsAddDialogOpen(false);
    setAddForm({ name: "" });
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FlaskConical className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Cultures</h1>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-200 hover:bg-purple-300 text-purple-900">+ Add Culture</Button>
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
                  <NumberInput step="0.1" value={addForm.attenuation || ""}
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
            <TableRow className="bg-purple-100 hover:bg-purple-100">
              <SortableHead label="Name" sortKey="name" sort={sort} onSort={toggleSort} />
              <SortableHead label="Producer" sortKey="brand" sort={sort} onSort={toggleSort} />
              <SortableHead label="Culture Type" sortKey="cultureType" sort={sort} onSort={toggleSort} />
              <SortableHead label="Form" sortKey="type" sort={sort} onSort={toggleSort} />
              <SortableHead label="Attenuation" sortKey="attenuation" sort={sort} onSort={toggleSort} />
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((item) => (
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
                      <NumberInput step="0.1" value={editForm.attenuation || ""}
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
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteItem(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No cultures yet. Click &quot;Add Culture&quot; to create one.
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

export function WaterTable({ initialData }: { initialData: WaterProfile[] }) {
  const [data, setData] = useState(initialData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<WaterProfile>>({});
  const [addForm, setAddForm] = useState<Partial<WaterProfile>>({
    name: "", caPpm: 0, mgPpm: 0, naPpm: 0, clPpm: 0, so4Ppm: 0,
  });

  const refresh = async () => {
    const r = await fetch("/api/water-profiles");
    setData(await r.json());
  };

  const startEdit = (item: WaterProfile) => { setEditingId(item.id); setEditForm(item); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async () => {
    const r = await fetch(`/api/water-profiles/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (!r.ok) { toast.error("Failed to save water profile"); return; }
    setEditingId(null);
    refresh();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this water profile?")) return;
    const r = await fetch(`/api/water-profiles/${id}`, { method: "DELETE" });
    if (r.ok) { refresh(); } else { toast.error("Failed to delete water profile"); }
  };

  const addItem = async () => {
    const r = await fetch("/api/water-profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    if (!r.ok) { toast.error("Failed to add water profile"); return; }
    setIsAddDialogOpen(false);
    setAddForm({ name: "", caPpm: 0, mgPpm: 0, naPpm: 0, clPpm: 0, so4Ppm: 0 });
    refresh();
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
      <NumberInput step={step} value={form[key] != null ? String(form[key]) : ""}
        onChange={(e) => setForm({ ...form, [key]: e.target.value ? parseFloat(e.target.value) : null })} />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Droplets className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Water Profiles</h1>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-200 hover:bg-blue-300 text-blue-900">+ Add Water Profile</Button>
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
                  <NumberInput step="0.01" placeholder="e.g., 7.0" value={addForm.pH != null ? String(addForm.pH) : ""}
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
            <TableRow className="bg-blue-100 hover:bg-blue-100">
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
                    <TableCell><NumberInput step="0.01" value={editForm.pH != null ? String(editForm.pH) : ""}
                      onChange={(e) => setEditForm({ ...editForm, pH: e.target.value ? parseFloat(e.target.value) : null })} /></TableCell>
                    <TableCell><NumberInput step="0.1" value={editForm.caPpm}
                      onChange={(e) => setEditForm({ ...editForm, caPpm: parseFloat(e.target.value) })} /></TableCell>
                    <TableCell><NumberInput step="0.1" value={editForm.mgPpm}
                      onChange={(e) => setEditForm({ ...editForm, mgPpm: parseFloat(e.target.value) })} /></TableCell>
                    <TableCell><NumberInput step="0.1" value={editForm.naPpm}
                      onChange={(e) => setEditForm({ ...editForm, naPpm: parseFloat(e.target.value) })} /></TableCell>
                    <TableCell><NumberInput step="0.1" value={editForm.clPpm}
                      onChange={(e) => setEditForm({ ...editForm, clPpm: parseFloat(e.target.value) })} /></TableCell>
                    <TableCell><NumberInput step="0.1" value={editForm.so4Ppm}
                      onChange={(e) => setEditForm({ ...editForm, so4Ppm: parseFloat(e.target.value) })} /></TableCell>
                    <TableCell><NumberInput step="0.1" value={editForm.hco3Ppm != null ? String(editForm.hco3Ppm) : ""}
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
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteItem(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  No water profiles yet. Click &quot;Add Water Profile&quot; to create one.
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

export function KegsTable({ initialData }: { initialData: Keg[] }) {
  const [data, setData] = useState(initialData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Keg>>({});
  const [addForm, setAddForm] = useState<Partial<Keg>>({ name: "", capacity: 19, type: null, label: null });

  const refresh = async () => {
    const r = await fetch("/api/kegs");
    setData(await r.json());
  };

  const startEdit = (item: Keg) => { setEditingId(item.id); setEditForm(item); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async () => {
    const r = await fetch(`/api/kegs/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (!r.ok) { toast.error("Failed to save keg"); return; }
    setEditingId(null);
    refresh();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this keg?")) return;
    const r = await fetch(`/api/kegs/${id}`, { method: "DELETE" });
    if (r.ok) { refresh(); } else { toast.error("Failed to delete keg"); }
  };

  const addItem = async () => {
    const r = await fetch("/api/kegs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    if (!r.ok) { toast.error("Failed to add keg"); return; }
    setIsAddDialogOpen(false);
    setAddForm({ name: "", capacity: 19, type: null, label: null });
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Barrel className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Kegs</h1>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-200 hover:bg-amber-300 text-amber-900">+ Add Keg</Button>
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
                  <Label>Type</Label>
                  <EnumSelect
                    value={addForm.type || ""}
                    onChange={(v) => setAddForm({ ...addForm, type: v || null })}
                    options={KEG_TYPES}
                    placeholder="Select type"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input value={addForm.label || ""} onChange={(e) => setAddForm({ ...addForm, label: e.target.value })}
                    placeholder="e.g., K001" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Capacity (L) *</Label>
                  <NumberInput step="0.1" value={addForm.capacity}
                    onChange={(e) => setAddForm({ ...addForm, capacity: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Tare Weight (g)</Label>
                  <NumberInput step="1" value={addForm.tareWeight || ""}
                    onChange={(e) => setAddForm({ ...addForm, tareWeight: e.target.value ? parseFloat(e.target.value) : null })} />
                </div>
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
            <TableRow className="bg-amber-100 hover:bg-amber-100">
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Label</TableHead>
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
                    <TableCell>
                      <EnumSelect
                        value={editForm.type || ""}
                        onChange={(v) => setEditForm({ ...editForm, type: v || null })}
                        options={KEG_TYPES}
                        placeholder="Select type"
                      />
                    </TableCell>
                    <TableCell><Input value={editForm.label || ""} onChange={(e) => setEditForm({ ...editForm, label: e.target.value })} /></TableCell>
                    <TableCell><NumberInput step="0.1" value={editForm.capacity}
                      onChange={(e) => setEditForm({ ...editForm, capacity: parseFloat(e.target.value) })} /></TableCell>
                    <TableCell><NumberInput step="1" value={editForm.tareWeight || ""}
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
                    <TableCell>{item.type || "-"}</TableCell>
                    <TableCell>{item.label || "-"}</TableCell>
                    <TableCell>{item.capacity} L</TableCell>
                    <TableCell>{item.tareWeight != null ? `${item.tareWeight} g` : "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteItem(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No kegs yet. Click &quot;Add Keg&quot; to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
