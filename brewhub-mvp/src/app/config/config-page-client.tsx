"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  brand: string | null;
  maxYield: number | null;
  colorL: number | null;
  profile: string | null;
  uses: string | null;
}

interface Hop {
  id: string;
  name: string;
  alphaAcid: number;
  profile: string | null;
  styles: string | null;
  alternatives: string | null;
}

interface Yeast {
  id: string;
  name: string;
  brand: string | null;
  type: string | null;
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

export function ConfigPageClient({ initialData }: { initialData: ConfigData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "equipment";
  const [data, setData] = useState(initialData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);

  const refreshData = async () => {
    const response = await fetch("/api/config");
    const newData = await response.json();
    setData(newData);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setEditingId(null);
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.push(`/config?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configuration</h1>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="equipment">Equipment ({data.equipment.length})</TabsTrigger>
          <TabsTrigger value="grains">Grains ({data.grains.length})</TabsTrigger>
          <TabsTrigger value="hops">Hops ({data.hops.length})</TabsTrigger>
          <TabsTrigger value="yeasts">Yeasts ({data.yeasts.length})</TabsTrigger>
          <TabsTrigger value="water">Water ({data.waterProfiles.length})</TabsTrigger>
          <TabsTrigger value="kegs">Kegs ({data.kegs.length})</TabsTrigger>
        </TabsList>

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

        <TabsContent value="grains" className="mt-6">
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

        <TabsContent value="yeasts" className="mt-6">
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

// Equipment Table Component
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

  const startEdit = (item: Equipment) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

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
                <Input
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Brewhouse Efficiency (%) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={addForm.brewhouseEfficiency}
                  onChange={(e) => setAddForm({ ...addForm, brewhouseEfficiency: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Mash Efficiency (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={addForm.mashEfficiency || ""}
                  onChange={(e) => setAddForm({ ...addForm, mashEfficiency: e.target.value ? parseFloat(e.target.value) : null })}
                />
              </div>
              <div className="space-y-2">
                <Label>Evaporation Rate (%/h)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={addForm.evaporationRate || ""}
                  onChange={(e) => setAddForm({ ...addForm, evaporationRate: e.target.value ? parseFloat(e.target.value) : null })}
                />
              </div>
              <div className="space-y-2">
                <Label>Boil Pot Diameter (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={addForm.boilPotDiameter || ""}
                  onChange={(e) => setAddForm({ ...addForm, boilPotDiameter: e.target.value ? parseFloat(e.target.value) : null })}
                />
              </div>
              <div className="space-y-2">
                <Label>Fermenter Loss (L) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={addForm.fermenterLossL}
                  onChange={(e) => setAddForm({ ...addForm, fermenterLossL: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Trub Loss (L) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={addForm.trubLossL}
                  onChange={(e) => setAddForm({ ...addForm, trubLossL: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>System Loss (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={addForm.systemLossPercent || ""}
                  onChange={(e) => setAddForm({ ...addForm, systemLossPercent: e.target.value ? parseFloat(e.target.value) : null })}
                />
              </div>
              <div className="space-y-2">
                <Label>Bagasse Loss (L)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={addForm.bagasseLossL || ""}
                  onChange={(e) => setAddForm({ ...addForm, bagasseLossL: e.target.value ? parseFloat(e.target.value) : null })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
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
                    <TableCell>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={editForm.brewhouseEfficiency}
                        onChange={(e) => setEditForm({ ...editForm, brewhouseEfficiency: parseFloat(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={editForm.fermenterLossL}
                        onChange={(e) => setEditForm({ ...editForm, fermenterLossL: parseFloat(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={editForm.trubLossL}
                        onChange={(e) => setEditForm({ ...editForm, trubLossL: parseFloat(e.target.value) })}
                      />
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
                    <TableCell>{item.brewhouseEfficiency}%</TableCell>
                    <TableCell>{item.fermenterLossL} L</TableCell>
                    <TableCell>{item.trubLossL} L</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id)}>
                          Delete
                        </Button>
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

// Grains Table Component
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
  const [addForm, setAddForm] = useState<Partial<Grain>>({
    name: "",
  });

  const startEdit = (item: Grain) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

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
    setAddForm({ name: "" });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>+ Add Grain</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Grain</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Brand</Label>
                <Input
                  value={addForm.brand || ""}
                  onChange={(e) => setAddForm({ ...addForm, brand: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Yield (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={addForm.maxYield || ""}
                    onChange={(e) => setAddForm({ ...addForm, maxYield: e.target.value ? parseFloat(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color (L)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={addForm.colorL || ""}
                    onChange={(e) => setAddForm({ ...addForm, colorL: e.target.value ? parseFloat(e.target.value) : null })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Profile</Label>
                <Textarea
                  value={addForm.profile || ""}
                  onChange={(e) => setAddForm({ ...addForm, profile: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Uses</Label>
                <Textarea
                  value={addForm.uses || ""}
                  onChange={(e) => setAddForm({ ...addForm, uses: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
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
              <TableHead>Brand</TableHead>
              <TableHead>Max Yield</TableHead>
              <TableHead>Color (L)</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                {editingId === item.id ? (
                  <>
                    <TableCell>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editForm.brand || ""}
                        onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={editForm.maxYield || ""}
                        onChange={(e) => setEditForm({ ...editForm, maxYield: e.target.value ? parseFloat(e.target.value) : null })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={editForm.colorL || ""}
                        onChange={(e) => setEditForm({ ...editForm, colorL: e.target.value ? parseFloat(e.target.value) : null })}
                      />
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
                    <TableCell>{item.maxYield || "-"}</TableCell>
                    <TableCell>{item.colorL || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No grains yet. Click "Add Grain" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Hops Table Component
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
  const [addForm, setAddForm] = useState<Partial<Hop>>({
    name: "",
    alphaAcid: 5,
  });

  const startEdit = (item: Hop) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

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
    setAddForm({ name: "", alphaAcid: 5 });
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
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Alpha Acid (%) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={addForm.alphaAcid}
                  onChange={(e) => setAddForm({ ...addForm, alphaAcid: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Profile</Label>
                <Textarea
                  value={addForm.profile || ""}
                  onChange={(e) => setAddForm({ ...addForm, profile: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Styles</Label>
                <Input
                  value={addForm.styles || ""}
                  onChange={(e) => setAddForm({ ...addForm, styles: e.target.value })}
                  placeholder="e.g., IPA, Pale Ale, Stout"
                />
              </div>
              <div className="space-y-2">
                <Label>Alternatives</Label>
                <Input
                  value={addForm.alternatives || ""}
                  onChange={(e) => setAddForm({ ...addForm, alternatives: e.target.value })}
                  placeholder="e.g., Cascade, Centennial"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
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
              <TableHead>Alpha Acid</TableHead>
              <TableHead>Profile</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                {editingId === item.id ? (
                  <>
                    <TableCell>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={editForm.alphaAcid}
                        onChange={(e) => setEditForm({ ...editForm, alphaAcid: parseFloat(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={editForm.profile || ""}
                        onChange={(e) => setEditForm({ ...editForm, profile: e.target.value })}
                        rows={2}
                      />
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
                    <TableCell>{item.alphaAcid}%</TableCell>
                    <TableCell className="max-w-xs truncate">{item.profile || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
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

// Yeasts Table Component
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
  const [addForm, setAddForm] = useState<Partial<Yeast>>({
    name: "",
  });

  const startEdit = (item: Yeast) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

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
            <Button>+ Add Yeast</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Yeast</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Input
                    value={addForm.brand || ""}
                    onChange={(e) => setAddForm({ ...addForm, brand: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input
                    value={addForm.type || ""}
                    onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
                    placeholder="liquid or dry"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Temperature Range</Label>
                  <Input
                    value={addForm.temperatureRange || ""}
                    onChange={(e) => setAddForm({ ...addForm, temperatureRange: e.target.value })}
                    placeholder="e.g., 18-22°C"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Attenuation (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={addForm.attenuation || ""}
                    onChange={(e) => setAddForm({ ...addForm, attenuation: e.target.value ? parseFloat(e.target.value) : null })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Profile</Label>
                <Textarea
                  value={addForm.profile || ""}
                  onChange={(e) => setAddForm({ ...addForm, profile: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Uses</Label>
                <Textarea
                  value={addForm.uses || ""}
                  onChange={(e) => setAddForm({ ...addForm, uses: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
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
              <TableHead>Brand</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Attenuation</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                {editingId === item.id ? (
                  <>
                    <TableCell>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editForm.brand || ""}
                        onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editForm.type || ""}
                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={editForm.attenuation || ""}
                        onChange={(e) => setEditForm({ ...editForm, attenuation: e.target.value ? parseFloat(e.target.value) : null })}
                      />
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
                    <TableCell>{item.type || "-"}</TableCell>
                    <TableCell>{item.attenuation ? `${item.attenuation}%` : "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No yeasts yet. Click "Add Yeast" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Water Table Component
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
    name: "",
    caPpm: 0,
    mgPpm: 0,
    naPpm: 0,
    clPpm: 0,
    so4Ppm: 0,
  });

  const startEdit = (item: WaterProfile) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

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
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Ca (ppm) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={addForm.caPpm}
                    onChange={(e) => setAddForm({ ...addForm, caPpm: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mg (ppm) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={addForm.mgPpm}
                    onChange={(e) => setAddForm({ ...addForm, mgPpm: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Na (ppm) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={addForm.naPpm}
                    onChange={(e) => setAddForm({ ...addForm, naPpm: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cl (ppm) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={addForm.clPpm}
                    onChange={(e) => setAddForm({ ...addForm, clPpm: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>SO4 (ppm) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={addForm.so4Ppm}
                    onChange={(e) => setAddForm({ ...addForm, so4Ppm: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Zn (ppm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={addForm.znPpm || ""}
                    onChange={(e) => setAddForm({ ...addForm, znPpm: e.target.value ? parseFloat(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>HCO3 (ppm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={addForm.hco3Ppm || ""}
                    onChange={(e) => setAddForm({ ...addForm, hco3Ppm: e.target.value ? parseFloat(e.target.value) : null })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
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
              <TableHead>Ca</TableHead>
              <TableHead>Mg</TableHead>
              <TableHead>Na</TableHead>
              <TableHead>Cl</TableHead>
              <TableHead>SO4</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                {editingId === item.id ? (
                  <>
                    <TableCell>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={editForm.caPpm}
                        onChange={(e) => setEditForm({ ...editForm, caPpm: parseFloat(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={editForm.mgPpm}
                        onChange={(e) => setEditForm({ ...editForm, mgPpm: parseFloat(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={editForm.naPpm}
                        onChange={(e) => setEditForm({ ...editForm, naPpm: parseFloat(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={editForm.clPpm}
                        onChange={(e) => setEditForm({ ...editForm, clPpm: parseFloat(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={editForm.so4Ppm}
                        onChange={(e) => setEditForm({ ...editForm, so4Ppm: parseFloat(e.target.value) })}
                      />
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
                    <TableCell>{item.caPpm}</TableCell>
                    <TableCell>{item.mgPpm}</TableCell>
                    <TableCell>{item.naPpm}</TableCell>
                    <TableCell>{item.clPpm}</TableCell>
                    <TableCell>{item.so4Ppm}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
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

// Kegs Table Component
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
  const [addForm, setAddForm] = useState<Partial<Keg>>({
    name: "",
    capacity: 19,
  });

  const startEdit = (item: Keg) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

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
                <Input
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Number</Label>
                  <Input
                    value={addForm.number || ""}
                    onChange={(e) => setAddForm({ ...addForm, number: e.target.value })}
                    placeholder="e.g., K001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Capacity (L) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={addForm.capacity}
                    onChange={(e) => setAddForm({ ...addForm, capacity: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tare Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={addForm.tareWeight || ""}
                  onChange={(e) => setAddForm({ ...addForm, tareWeight: e.target.value ? parseFloat(e.target.value) : null })}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={addForm.notes || ""}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
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
                    <TableCell>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editForm.number || ""}
                        onChange={(e) => setEditForm({ ...editForm, number: e.target.value })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={editForm.capacity}
                        onChange={(e) => setEditForm({ ...editForm, capacity: parseFloat(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={editForm.tareWeight || ""}
                        onChange={(e) => setEditForm({ ...editForm, tareWeight: e.target.value ? parseFloat(e.target.value) : null })}
                      />
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
                    <TableCell>{item.number || "-"}</TableCell>
                    <TableCell>{item.capacity} L</TableCell>
                    <TableCell>{item.tareWeight ? `${item.tareWeight} kg` : "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id)}>
                          Delete
                        </Button>
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