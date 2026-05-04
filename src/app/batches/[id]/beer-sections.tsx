"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Info, Pencil, Check, X, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BatchForm } from "./batch-form";
import stylesData from "../../../../styles.json";
import { srmToHex, srmIsLight } from "@/lib/olfarve";
import { calculateAcidAddition, calculateSpargeAcidDose, type AcidType } from "@/lib/calculations";

// ---------- Style range bar ----------

function StyleRangeBar({
  absoluteMin,
  absoluteMax,
  styleMin,
  styleMax,
  targetValue,
}: {
  absoluteMin: number;
  absoluteMax: number;
  styleMin: number | null;
  styleMax: number | null;
  targetValue: number | null;
}) {
  const toPercent = (v: number) =>
    Math.max(0, Math.min(100, ((v - absoluteMin) / (absoluteMax - absoluteMin)) * 100));

  const hasRange = styleMin != null && styleMax != null;
  const rangeLeft = hasRange ? toPercent(styleMin!) : 0;
  const rangeWidth = hasRange ? toPercent(styleMax!) - toPercent(styleMin!) : 0;
  const targetPct = targetValue != null ? toPercent(targetValue) : null;
  const inRange =
    hasRange && targetValue != null && targetValue >= styleMin! && targetValue <= styleMax!;

  return (
    <div className="relative h-3.5 rounded-full bg-muted overflow-hidden">
      {hasRange && (
        <div
          className={`absolute top-0 h-full ${inRange ? "bg-green-500/30" : "bg-amber-400/25"}`}
          style={{ left: `${rangeLeft}%`, width: `${rangeWidth}%` }}
        />
      )}
      {hasRange && (
        <>
          <div
            className={`absolute top-0 h-full w-px ${inRange ? "bg-green-500/60" : "bg-amber-400/50"}`}
            style={{ left: `${rangeLeft}%` }}
          />
          <div
            className={`absolute top-0 h-full w-px ${inRange ? "bg-green-500/60" : "bg-amber-400/50"}`}
            style={{ left: `${toPercent(styleMax!)}%` }}
          />
        </>
      )}
      {targetPct != null && (
        <div
          className="absolute top-0 h-full w-[3px] bg-foreground/80 rounded-sm"
          style={{ left: `${targetPct}%`, transform: "translateX(-50%)" }}
        />
      )}
    </div>
  );
}

// ---------- SRM helpers ----------

function buildSrmGradient(absMin: number, absMax: number): string {
  const stops: string[] = [];
  for (let srm = absMin; srm <= absMax; srm++) {
    const pct = (((srm - absMin) / (absMax - absMin)) * 100).toFixed(1);
    stops.push(`${srmToHex(srm)} ${pct}%`);
  }
  return `linear-gradient(to right, ${stops.join(", ")})`;
}

function SrmRangeBar({
  absoluteMin,
  absoluteMax,
  styleMin,
  styleMax,
  targetValue,
}: {
  absoluteMin: number;
  absoluteMax: number;
  styleMin: number | null;
  styleMax: number | null;
  targetValue: number | null;
}) {
  const toPercent = (v: number) =>
    Math.max(0, Math.min(100, ((v - absoluteMin) / (absoluteMax - absoluteMin)) * 100));

  const hasRange = styleMin != null && styleMax != null;
  const targetPct = targetValue != null ? toPercent(targetValue) : null;
  const gradient = buildSrmGradient(absoluteMin, absoluteMax);

  return (
    <div className="relative h-3.5 rounded-full overflow-hidden" style={{ background: gradient }}>
      {hasRange && (
        <>
          <div
            className="absolute top-0 h-full w-px bg-white/80"
            style={{ left: `${toPercent(styleMin!)}%` }}
          />
          <div
            className="absolute top-0 h-full w-px bg-white/80"
            style={{ left: `${toPercent(styleMax!)}%` }}
          />
        </>
      )}
      {targetPct != null && (
        <div
          className="absolute top-0 h-full w-[3px] bg-white/90 rounded-sm"
          style={{ left: `${targetPct}%`, transform: "translateX(-50%)" }}
        />
      )}
    </div>
  );
}

// ---------- Interfaces ----------

interface Grain {
  id: string;
  name: string;
  brand: string | null;
  colorL: number | null;
  maxYield: number | null;
  grainGroup: string | null;
}

interface Hop {
  id: string;
  name: string;
  alphaAcid: number;
}

interface Yeast {
  id: string;
  name: string;
  brand: string | null;
  attenuation: number | null;
}

interface BatchGrain {
  id: string;
  grams: number;
  grain: Grain;
}

interface BatchHop {
  id: string;
  grams: number;
  use: string;
  additionTime: number | null;
  hop: Hop;
}

interface BatchYeast {
  id: string;
  quantity: string;
  temp: number | null;
  yeast: Yeast;
}

interface Stats {
  og: number;
  fg: number;
  ibu: number;
  srm: number;
  abv: number;
}

interface Equipment {
  id: string;
  name: string;
  fermenterLossL: number;
  trubLossL: number;
  systemLossPercent: number | null;
  mashTunDeadSpaceL: number | null;
  grainAbsorptionLKg: number | null;
  boilEvaporationRateLH: number | null;
  heatingEvaporationRateLH: number | null;
  tempContractionPercent: number | null;
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

interface MashStep {
  id: string;
  name: string;
  type: string;
  stepTemperatureC: number;
  stepTimeMin: number;
  amountL: number | null;
  rampTimeMin: number | null;
  endTemperatureC: number | null;
  description: string | null;
  infuseTemperatureC: number | null;
  sortOrder: number;
}

interface BeerSectionsProps {
  batchId: string;
  batch: {
    id: string;
    name: string;
    style: string | null;
    notes: string | null;
    brewDate: Date | null;
    draft: boolean;
    type: string;
    equipmentId: string | null;
    targetOg: number | null;
    targetFg: number | null;
    targetIbu: number | null;
    targetSrm: number | null;
    targetFermentarL: number | null;
    boilTimeMin: number | null;
    heatUpTimeMin: number | null;
    whirpoolTimeMin: number | null;
    grainTempC: number | null;
    targetPh: number | null;
    spargeTargetPh: number | null;
  };
  stats: Stats;
  equipment: Equipment[];
  grains: BatchGrain[];
  hops: BatchHop[];
  yeasts: BatchYeast[];
  updateAction: (formData: FormData) => Promise<void>;
  updateNotesAction: (notes: string) => Promise<void>;
  updateTargetStatsAction: (data: {
    targetOg: number | null;
    targetFg: number | null;
    targetIbu: number | null;
    targetSrm: number | null;
    targetFermentarL: number | null;
  }) => Promise<void>;
  updateGrainAction: (id: string, data: { grams: number }) => Promise<void>;
  deleteGrainAction: (id: string) => Promise<void>;
  updateHopAction: (id: string, data: { grams: number; use: string; additionTime: number | null }) => Promise<void>;
  deleteHopAction: (id: string) => Promise<void>;
  updateYeastAction: (id: string, data: { quantity: string; temp: number | null }) => Promise<void>;
  deleteYeastAction: (id: string) => Promise<void>;
  waterProfiles: WaterProfile[];
  sourceWaterProfile: WaterProfile | null;
  targetWaterProfile: WaterProfile | null;
  sourceWaterSnapshot: { caPpm: number; mgPpm: number; naPpm: number; clPpm: number; so4Ppm: number; znPpm: number | null; hco3Ppm: number | null; pH: number | null } | null;
  targetWaterSnapshot: { caPpm: number; mgPpm: number; naPpm: number; clPpm: number; so4Ppm: number; znPpm: number | null; hco3Ppm: number | null; pH: number | null } | null;
  updateBatchWaterAction: (data: { sourceWaterProfileId: string | null; targetWaterProfileId: string | null }) => Promise<void>;
  updateBatchWaterSnapshotAction: (type: "source" | "target", data: { caPpm: number; mgPpm: number; naPpm: number; clPpm: number; so4Ppm: number; znPpm: number | null; hco3Ppm: number | null; pH: number | null }) => Promise<void>;
  saltAdditions: { saltChalkGL: number | null; saltBakingSodaGL: number | null; saltGypsumGL: number | null; saltCaCl2GL: number | null; saltEpsomGL: number | null; saltNaClGL: number | null };
  updateSaltAdditionsAction: (data: { saltChalkGL: number | null; saltBakingSodaGL: number | null; saltGypsumGL: number | null; saltCaCl2GL: number | null; saltEpsomGL: number | null; saltNaClGL: number | null }) => Promise<void>;
  updateBoilTimesAction: (data: { heatUpTimeMin: number | null; boilTimeMin: number | null; whirpoolTimeMin: number | null }) => Promise<void>;
  updateMashParamsAction: (data: { grainTempC: number | null; targetPh: number | null; spargeTargetPh: number | null }) => Promise<void>;
  mashSteps: MashStep[];
  createMashStepAction: (data: {
    name: string; type: string; stepTemperatureC: number; stepTimeMin: number;
    amountL?: number | null; rampTimeMin?: number | null; endTemperatureC?: number | null;
    description?: string | null; infuseTemperatureC?: number | null; sortOrder?: number;
  }) => Promise<MashStep>;
  updateMashStepAction: (id: string, data: {
    name: string; type: string; stepTemperatureC: number; stepTimeMin: number;
    amountL?: number | null; rampTimeMin?: number | null; endTemperatureC?: number | null;
    description?: string | null; infuseTemperatureC?: number | null; sortOrder?: number;
  }) => Promise<void>;
  deleteMashStepAction: (id: string) => Promise<void>;
}

type SectionKey = "basicInfo" | "recipeOverview" | "boil" | "waterVolumes" | "mash" | "fermentables" | "hops" | "cultures" | "water";

const SECTION_DEFAULTS: Record<SectionKey, boolean> = {
  basicInfo: true,
  recipeOverview: true,
  boil: true,
  waterVolumes: true,
  mash: true,
  fermentables: true,
  hops: true,
  cultures: true,
  water: true,
};

// ---------- CollapsibleCard ----------

function CollapsibleCard({
  title,
  open,
  onToggle,
  actions,
  className,
  children,
}: {
  title: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={`p-4 px-0 ${open ? "pt-2" : "border-b"} ${className ?? ""}`}>
      <CardHeader className={`flex flex-row items-center justify-between px-4 ${open ? "py-3" : "py-1"}`}>
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2 text-left flex-1"
        >
          {open ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <CardTitle>{title}</CardTitle>
        </button>
        {open && actions && <div className="ml-2">{actions}</div>}
      </CardHeader>
      {open && <CardContent>{children}</CardContent>}
    </Card>
  );
}

// ---------- Stat config ----------

type TargetKey = "og" | "fg" | "ibu" | "srm";

interface StatConfig {
  key: TargetKey;
  label: string;
  absMin: number;
  absMax: number;
  sMinKey: string;
  sMaxKey: string;
  decimals: number;
  step: string;
  /** Multiply stats value and style range by this to get bar units (1000 for OG/FG) */
  scale: number;
}

const STAT_CONFIGS: StatConfig[] = [
  { key: "og",  label: "OG",  absMin: 1000, absMax: 1100, sMinKey: "ogmin",  sMaxKey: "ogmax",  decimals: 0, step: "1",   scale: 1000 },
  { key: "fg",  label: "FG",  absMin: 1000, absMax: 1040, sMinKey: "fgmin",  sMaxKey: "fgmax",  decimals: 0, step: "1",   scale: 1000 },
  { key: "ibu", label: "IBU", absMin: 0,    absMax: 80,   sMinKey: "ibumin", sMaxKey: "ibumax", decimals: 0, step: "1",   scale: 1 },
  { key: "srm", label: "SRM", absMin: 0,    absMax: 40,   sMinKey: "srmmin", sMaxKey: "srmmax", decimals: 1, step: "0.5", scale: 1 },
];

function getStyleRange(
  entry: Record<string, string> | null,
  minKey: string,
  maxKey: string
): { min: number | null; max: number | null } {
  if (!entry) return { min: null, max: null };
  const min = parseFloat(entry[minKey]);
  const max = parseFloat(entry[maxKey]);
  return { min: isNaN(min) ? null : min, max: isNaN(max) ? null : max };
}

// ---------- BeerSections ----------

export function BeerSections({
  batchId,
  batch,
  stats,
  equipment,
  grains,
  hops,
  yeasts,
  updateAction,
  updateNotesAction,
  updateTargetStatsAction,
  updateGrainAction,
  deleteGrainAction,
  updateHopAction,
  deleteHopAction,
  updateYeastAction,
  deleteYeastAction,
  waterProfiles,
  sourceWaterProfile,
  targetWaterProfile,
  sourceWaterSnapshot,
  targetWaterSnapshot,
  updateBatchWaterAction,
  updateBatchWaterSnapshotAction,
  saltAdditions,
  updateSaltAdditionsAction,
  updateBoilTimesAction,
  updateMashParamsAction,
  mashSteps,
  createMashStepAction,
  updateMashStepAction,
  deleteMashStepAction,
}: BeerSectionsProps) {
  const router = useRouter();
  const storageKey = `brewhub:batch:${batchId}:sections`;

  const [open, setOpen] = useState<Record<SectionKey, boolean>>(SECTION_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [mashMode, setMashMode] = useState<"sparge" | "biab">("sparge");
  const [mashRatioInput, setMashRatioInput] = useState(3.0);

  const [targets, setTargets] = useState<Record<TargetKey, number | null>>({
    og: batch.targetOg,
    fg: batch.targetFg,
    ibu: batch.targetIbu,
    srm: batch.targetSrm,
  });

  const [batchSize, setBatchSize] = useState<number | null>(batch.targetFermentarL);
  const [heatUpTimeMin, setHeatUpTimeMin] = useState<number | null>(batch.heatUpTimeMin);
  const [boilTimeMin, setBoilTimeMin] = useState<number | null>(batch.boilTimeMin);
  const [whirpoolTimeMin, setWhirpoolTimeMin] = useState<number | null>(batch.whirpoolTimeMin);
  const [grainTempC, setGrainTempC] = useState<number | null>(batch.grainTempC ?? 20);
  const [targetPh, setTargetPh] = useState<number | null>(batch.targetPh ?? 5.4);
  const [spargeTargetPh, setSpargeTargetPh] = useState<number | null>(batch.spargeTargetPh ?? 5.4);
  const [acidType, setAcidType] = useState<AcidType>("lactic");
  const [acidAmount, setAcidAmount] = useState("");

  const [grainRows, setGrainRows] = useState(grains);
  const [editingGrainId, setEditingGrainId] = useState<string | null>(null);
  const [editGrainDraft, setEditGrainDraft] = useState<{ grams: string }>({ grams: "" });
  const [grainSort, setGrainSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const [hopRows, setHopRows] = useState(hops);
  const [editingHopId, setEditingHopId] = useState<string | null>(null);
  const [editHopDraft, setEditHopDraft] = useState<{ grams: string; use: string; additionTime: string }>({ grams: "", use: "", additionTime: "" });
  const [hopSort, setHopSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const [yeastRows, setYeastRows] = useState(yeasts);
  const [editingYeastId, setEditingYeastId] = useState<string | null>(null);
  const [editYeastDraft, setEditYeastDraft] = useState<{ quantity: string; temp: string }>({ quantity: "", temp: "" });
  const [savingYeastId, setSavingYeastId] = useState<string | null>(null);

  const [mashStepRows, setMashStepRows] = useState<MashStep[]>(mashSteps);
  const [editingMashStepId, setEditingMashStepId] = useState<string | null>(null);
  const [editMashStepDraft, setEditMashStepDraft] = useState<{
    name: string; type: string; stepTemperatureC: string; stepTimeMin: string;
    amountL: string; rampTimeMin: string; endTemperatureC: string;
    description: string; infuseTemperatureC: string;
  }>({ name: "", type: "infusion", stepTemperatureC: "", stepTimeMin: "", amountL: "", rampTimeMin: "", endTemperatureC: "", description: "", infuseTemperatureC: "" });
  const [showAddMashStep, setShowAddMashStep] = useState(false);
  const [savingMashStepId, setSavingMashStepId] = useState<string | null>(null);

  const [sourceWaterId, setSourceWaterId] = useState<string>(sourceWaterProfile?.id ?? "");
  const [targetWaterId, setTargetWaterId] = useState<string>(targetWaterProfile?.id ?? "");
  const [editingWater, setEditingWater] = useState<"source" | "target" | null>(null);
  const [waterEditDraft, setWaterEditDraft] = useState<{
    caPpm: string; mgPpm: string; naPpm: string; clPpm: string;
    so4Ppm: string; znPpm: string; hco3Ppm: string; pH: string;
  }>({ caPpm: "", mgPpm: "", naPpm: "", clPpm: "", so4Ppm: "", znPpm: "", hco3Ppm: "", pH: "" });
  const [savingWater, setSavingWater] = useState(false);
  const [sourceEdited, setSourceEdited] = useState(false);
  const [targetEdited, setTargetEdited] = useState(false);

  const [sourceSnapshotLocal, setSourceSnapshotLocal] = useState(sourceWaterSnapshot);
  const [targetSnapshotLocal, setTargetSnapshotLocal] = useState(targetWaterSnapshot);

  useEffect(() => { setSourceSnapshotLocal(sourceWaterSnapshot); }, [sourceWaterSnapshot]);
  useEffect(() => { setTargetSnapshotLocal(targetWaterSnapshot); }, [targetWaterSnapshot]);

  const [salts, setSalts] = useState({
    saltChalkGL:      saltAdditions.saltChalkGL      ?? 0,
    saltBakingSodaGL: saltAdditions.saltBakingSodaGL ?? 0,
    saltGypsumGL:     saltAdditions.saltGypsumGL     ?? 0,
    saltCaCl2GL:      saltAdditions.saltCaCl2GL      ?? 0,
    saltEpsomGL:      saltAdditions.saltEpsomGL      ?? 0,
    saltNaClGL:       saltAdditions.saltNaClGL       ?? 0,
  });
  const [saltStrings, setSaltStrings] = useState<Record<string, string>>({
    saltChalkGL:      saltAdditions.saltChalkGL      != null ? String(saltAdditions.saltChalkGL)      : "",
    saltBakingSodaGL: saltAdditions.saltBakingSodaGL != null ? String(saltAdditions.saltBakingSodaGL) : "",
    saltGypsumGL:     saltAdditions.saltGypsumGL     != null ? String(saltAdditions.saltGypsumGL)     : "",
    saltCaCl2GL:      saltAdditions.saltCaCl2GL      != null ? String(saltAdditions.saltCaCl2GL)      : "",
    saltEpsomGL:      saltAdditions.saltEpsomGL      != null ? String(saltAdditions.saltEpsomGL)      : "",
    saltNaClGL:       saltAdditions.saltNaClGL       != null ? String(saltAdditions.saltNaClGL)       : "",
  });
  useEffect(() => {
    setSalts({
      saltChalkGL:      saltAdditions.saltChalkGL      ?? 0,
      saltBakingSodaGL: saltAdditions.saltBakingSodaGL ?? 0,
      saltGypsumGL:     saltAdditions.saltGypsumGL     ?? 0,
      saltCaCl2GL:      saltAdditions.saltCaCl2GL      ?? 0,
      saltEpsomGL:      saltAdditions.saltEpsomGL      ?? 0,
      saltNaClGL:       saltAdditions.saltNaClGL       ?? 0,
    });
    setSaltStrings({
      saltChalkGL:      saltAdditions.saltChalkGL      != null ? String(saltAdditions.saltChalkGL)      : "",
      saltBakingSodaGL: saltAdditions.saltBakingSodaGL != null ? String(saltAdditions.saltBakingSodaGL) : "",
      saltGypsumGL:     saltAdditions.saltGypsumGL     != null ? String(saltAdditions.saltGypsumGL)     : "",
      saltCaCl2GL:      saltAdditions.saltCaCl2GL      != null ? String(saltAdditions.saltCaCl2GL)      : "",
      saltEpsomGL:      saltAdditions.saltEpsomGL      != null ? String(saltAdditions.saltEpsomGL)      : "",
      saltNaClGL:       saltAdditions.saltNaClGL       != null ? String(saltAdditions.saltNaClGL)       : "",
    });
  }, [saltAdditions]);
  const saltsRef = useRef(salts);
  saltsRef.current = salts;
  const saltTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSaltSave = useCallback(() => {
    if (saltTimerRef.current) clearTimeout(saltTimerRef.current);
    saltTimerRef.current = setTimeout(async () => {
      try {
        const s = saltsRef.current;
        await updateSaltAdditionsAction({
          saltChalkGL:      s.saltChalkGL      || null,
          saltBakingSodaGL: s.saltBakingSodaGL || null,
          saltGypsumGL:     s.saltGypsumGL     || null,
          saltCaCl2GL:      s.saltCaCl2GL      || null,
          saltEpsomGL:      s.saltEpsomGL      || null,
          saltNaClGL:       s.saltNaClGL       || null,
        });
      } catch {
        toast.error("Failed to save salt additions");
      }
    }, 800);
  }, [updateSaltAdditionsAction]);

  const targetsRef = useRef(targets);
  targetsRef.current = targets;
  const batchSizeRef = useRef(batchSize);
  batchSizeRef.current = batchSize;
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await updateTargetStatsAction({
          targetOg: targetsRef.current.og,
          targetFg: targetsRef.current.fg,
          targetIbu: targetsRef.current.ibu,
          targetSrm: targetsRef.current.srm,
          targetFermentarL: batchSizeRef.current,
        });
      } catch {
        toast.error("Failed to save targets");
      }
    }, 800);
  }, [updateTargetStatsAction]);

  const boilTimesRef = useRef({ heatUpTimeMin, boilTimeMin, whirpoolTimeMin });
  boilTimesRef.current = { heatUpTimeMin, boilTimeMin, whirpoolTimeMin };
  const boilTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleBoilSave = useCallback(() => {
    if (boilTimerRef.current) clearTimeout(boilTimerRef.current);
    boilTimerRef.current = setTimeout(async () => {
      try {
        await updateBoilTimesAction(boilTimesRef.current);
      } catch {
        toast.error("Failed to save boil times");
      }
    }, 800);
  }, [updateBoilTimesAction]);

  const mashParamsRef = useRef({ grainTempC, targetPh, spargeTargetPh });
  mashParamsRef.current = { grainTempC, targetPh, spargeTargetPh };
  const mashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleMashSave = useCallback(() => {
    if (mashTimerRef.current) clearTimeout(mashTimerRef.current);
    mashTimerRef.current = setTimeout(async () => {
      try {
        await updateMashParamsAction(mashParamsRef.current);
      } catch {
        toast.error("Failed to save mash parameters");
      }
    }, 800);
  }, [updateMashParamsAction]);

  const handleTargetChange = useCallback(
    (key: TargetKey, raw: string) => {
      const num = raw === "" ? null : parseFloat(raw);
      setTargets((prev) => ({ ...prev, [key]: num != null && isNaN(num) ? null : num }));
      scheduleSave();
    },
    [scheduleSave]
  );

  const styleEntry = useMemo(() => {
    if (!batch.style) return null;
    return (
      (stylesData as Record<string, string>[]).find(
        (s) => `${s.number} ${s.name}` === batch.style
      ) ?? null
    );
  }, [batch.style]);

  // Target ABV derived from OG/FG targets (stored as integer gravity points e.g. 1048)
  const targetAbv =
    targets.og != null && targets.fg != null
      ? ((targets.og - targets.fg) / 1000) * 131.25
      : null;

  const abvRange = getStyleRange(styleEntry, "abvmin", "abvmax");
  const abvInRange =
    abvRange.min != null &&
    abvRange.max != null &&
    targetAbv != null &&
    targetAbv >= abvRange.min &&
    targetAbv <= abvRange.max;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setOpen({ ...SECTION_DEFAULTS, ...JSON.parse(stored) });
      const storedMashMode = localStorage.getItem(`brewhub:batch:${batchId}:mashMode`);
      if (storedMashMode === "biab" || storedMashMode === "sparge") setMashMode(storedMashMode);
      const storedRatio = parseFloat(localStorage.getItem(`brewhub:batch:${batchId}:mashRatio`) ?? "");
      if (!isNaN(storedRatio) && storedRatio > 0) setMashRatioInput(storedRatio);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, [storageKey, batchId]);

  const toggle = (key: SectionKey) => {
    setOpen((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  function sortRows<T>(rows: T[], sort: { key: string; dir: "asc" | "desc" } | null, getter: (row: T, key: string) => string | number | null): T[] {
    if (!sort) return rows;
    return [...rows].sort((a, b) => {
      const av = getter(a, sort.key) ?? "";
      const bv = getter(b, sort.key) ?? "";
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }

  function toggleSort(current: { key: string; dir: "asc" | "desc" } | null, key: string, set: (s: { key: string; dir: "asc" | "desc" } | null) => void) {
    if (current?.key === key) {
      set(current.dir === "asc" ? { key, dir: "desc" } : null);
    } else {
      set({ key, dir: "asc" });
    }
  }

  function SortIcon({ col, sort }: { col: string; sort: { key: string; dir: "asc" | "desc" } | null }) {
    if (sort?.key !== col) return <ArrowUpDown className="inline h-3 w-3 ml-0.5 opacity-30" />;
    return sort.dir === "asc" ? <ArrowUp className="inline h-3 w-3 ml-0.5" /> : <ArrowDown className="inline h-3 w-3 ml-0.5" />;
  }

  const batchVolumeL = batchSize ?? 20;
  const batchVolumeGal = batchVolumeL * 0.264172;
  const totalGrainGrams = grainRows.reduce((s, r) => s + r.grams, 0);

  // Water volumes calculation
  const selectedEquipment = equipment.find((e) => e.id === batch.equipmentId) ?? null;
  const wv = (() => {
    const fermenterLossL = selectedEquipment?.fermenterLossL ?? 1.0;
    const trubLossL = selectedEquipment?.trubLossL ?? 1.0;
    const systemLossPct = selectedEquipment?.systemLossPercent ?? 3.0;
    const mashTunDeadSpaceL = selectedEquipment?.mashTunDeadSpaceL ?? 0;
    const boilEvapRateLH = selectedEquipment?.boilEvaporationRateLH ?? 3.0;
    const heatEvapRateLH = selectedEquipment?.heatingEvaporationRateLH ?? boilEvapRateLH * 0.4;
    const boilTimeHr = (boilTimeMin ?? 60) / 60;
    const heatUpTimeHr = (heatUpTimeMin ?? 30) / 60;
    const tempContractionPct = selectedEquipment?.tempContractionPercent ?? 4.0;
    const grainAbsLpKg = selectedEquipment?.grainAbsorptionLKg ?? 1.0;
    const fermenterVol = batchVolumeL;
    const postChill = fermenterVol + trubLossL;
    const tempContractionL = postChill * (tempContractionPct / 100);
    const endOfBoil = postChill / (1 - tempContractionPct / 100);
    const boilEvapL = boilEvapRateLH * boilTimeHr;
    const preBoil = endOfBoil + boilEvapL;
    const heatUpEvapL = heatEvapRateLH * heatUpTimeHr;
    const preHeatUp = preBoil + heatUpEvapL;
    const systemLossL = preHeatUp * (systemLossPct / 100);
    const totalGrainKg = totalGrainGrams / 1000;
    const grainAbsL = totalGrainKg * grainAbsLpKg;
    const totalWater = preHeatUp + systemLossL + mashTunDeadSpaceL + grainAbsL;
    const strikeRatioWater = totalGrainKg * mashRatioInput;
    const mashWater = mashMode === "biab"
      ? totalWater
      : strikeRatioWater + mashTunDeadSpaceL;
    const spargeWater = mashMode === "biab" ? 0 : totalWater - mashWater;
    const mashRatioActual = totalGrainKg > 0 ? mashWater / totalGrainKg : 0;

    return {
      fermenterVol, fermenterLossL,
      trubLossL, postChill, tempContractionPct, tempContractionL, endOfBoil,
      boilEvapL, preBoil, heatUpEvapL, preHeatUp,
      systemLossPct, systemLossL, mashTunDeadSpaceL, grainAbsL,
      totalWater, mashWater, strikeRatioWater, spargeWater, mashRatioActual,
    };
  })();

  const acidCalc = useMemo(() => {
    if (targetPh == null || grainRows.length === 0) return null;
    const common = {
      grains: grainRows.map((r) => ({ grams: r.grams, grain: { colorL: r.grain.colorL, grainGroup: r.grain.grainGroup } })),
      sourceHco3Ppm: sourceSnapshotLocal?.hco3Ppm ?? 0,
      sourceCaPpm:   sourceSnapshotLocal?.caPpm   ?? 0,
      sourceMgPpm:   sourceSnapshotLocal?.mgPpm   ?? 0,
      saltGypsumGL:     salts.saltGypsumGL,
      saltCaCl2GL:      salts.saltCaCl2GL,
      saltChalkGL:      salts.saltChalkGL,
      saltEpsomGL:      salts.saltEpsomGL,
      saltBakingSodaGL: salts.saltBakingSodaGL,
      acidType,
    };
    const mash = calculateAcidAddition({ ...common, mashWaterL: wv.mashWater, targetPh, acidDose: parseFloat(acidAmount) || 0 });
    const sparge = wv.spargeWater > 0 && spargeTargetPh != null
      ? calculateSpargeAcidDose({
          sourceHco3Ppm: sourceSnapshotLocal?.hco3Ppm ?? 0,
          saltChalkGL:      salts.saltChalkGL,
          saltBakingSodaGL: salts.saltBakingSodaGL,
          phStart:   sourceSnapshotLocal?.pH ?? 7.0,
          phTarget:  spargeTargetPh,
          volumeL:   wv.spargeWater,
          acidType,
        })
      : null;
    return { mash, sparge };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetPh, spargeTargetPh, grainRows, wv.mashWater, wv.spargeWater, sourceSnapshotLocal, salts, acidType, acidAmount]);

  const grainCalc = (r: typeof grainRows[0]) => {
    const extract = r.grams * ((r.grain.maxYield ?? 75) / 100);
    const mcu = r.grain.colorL != null
      ? (r.grams * 0.00220462 * r.grain.colorL) / (wv.postChill * 0.264172)
      : 0;
    const pct = totalGrainGrams > 0 ? (r.grams / totalGrainGrams) * 100 : 0;
    return { extract, mcu, pct };
  };

  const grainTotals = grainRows.reduce(
    (acc, r) => { const { extract, mcu } = grainCalc(r); return { grams: acc.grams + r.grams, extract: acc.extract + extract, mcu: acc.mcu + mcu }; },
    { grams: 0, extract: 0, mcu: 0 }
  );

  const grainCols = [
    { key: "name",    label: "Name" },
    { key: "grams",   label: "Grams" },
    { key: "pct",     label: "%" },
    { key: "extract", label: "Extract (g)" },
    { key: "colorL",  label: "Color (°L)" },
    { key: "mcu",     label: "MCU" },
  ] as const;

  const sortedGrainRows = sortRows(grainRows, grainSort, (r, k) => {
    if (k === "name") return r.grain.name;
    if (k === "grams") return r.grams;
    if (k === "colorL") return r.grain.colorL ?? -1;
    if (k === "pct") return grainCalc(r).pct;
    if (k === "extract") return grainCalc(r).extract;
    if (k === "mcu") return grainCalc(r).mcu;
    return "";
  });

  const sortedHopRows = sortRows(hopRows, hopSort, (r, k) => {
    if (k === "name") return r.hop.name;
    if (k === "alphaAcid") return r.hop.alphaAcid;
    if (k === "use") return r.use;
    if (k === "additionTime") return r.additionTime ?? -1;
    if (k === "grams") return r.grams;
    return "";
  });

  const HOP_USES = [
    { value: "fwh",       label: "First Wort Hop" },
    { value: "boil",      label: "Boil" },
    { value: "whirlpool", label: "Whirlpool" },
    { value: "hop_stand", label: "Hop Stand" },
    { value: "dry_hop",   label: "Dry Hop" },
  ];

  if (!hydrated) return null;

  return (
    <div className="space-y-4">
      {/* 1. Basic Information */}
      <CollapsibleCard
        title="Basic Information"
        open={open.basicInfo}
        onToggle={() => toggle("basicInfo")}
      >
        <BatchForm batch={batch} equipment={equipment} updateAction={updateAction} updateNotesAction={updateNotesAction} bare />
      </CollapsibleCard>

      {/* 2. Recipe Overview */}
      <CollapsibleCard
        title="Recipe Overview"
        open={open.recipeOverview}
        onToggle={() => toggle("recipeOverview")}
      >
        <div className="space-y-3">
          {/* Batch Size */}
          <div className="flex items-center gap-3">
            <span className="w-8 text-sm font-medium shrink-0">Vol</span>
            <Input
              type="number"
              step="0.5"
              min="0"
              value={batchSize ?? ""}
              onChange={(e) => {
                const num = e.target.value === "" ? null : parseFloat(e.target.value);
                setBatchSize(num != null && isNaN(num) ? null : num);
                scheduleSave();
              }}
              placeholder="20"
              className="w-24 h-7 text-sm shrink-0"
            />
            <span className="text-sm text-muted-foreground">liters in fermenter</span>
          </div>

          {/* OG, FG, IBU, SRM */}
          {(() => {
            const firstAttenuation = yeasts[0]?.yeast.attenuation ?? null;
            const suggestedFg =
              targets.og != null && firstAttenuation != null
                ? Math.round(1000 + (targets.og - 1000) * (1 - firstAttenuation / 100))
                : null;

            return STAT_CONFIGS.map((cfg) => {
            const raw = getStyleRange(styleEntry, cfg.sMinKey, cfg.sMaxKey);
            const sMin = raw.min != null ? raw.min * cfg.scale : null;
            const sMax = raw.max != null ? raw.max * cfg.scale : null;
            const calcVal = (stats[cfg.key as keyof Stats] as number) * cfg.scale;
            const targetVal = targets[cfg.key];

            const toBarPct = (v: number) =>
              Math.max(0, Math.min(100, ((v - cfg.absMin) / (cfg.absMax - cfg.absMin)) * 100));
            const rangeLeftPct = sMin != null ? toBarPct(sMin) : null;
            const rangeRightPct = sMax != null ? toBarPct(sMax) : null;

            const isSrm = cfg.key === "srm";
            const srmVal = targetVal ?? calcVal;
            const srmHex = isSrm ? srmToHex(srmVal) : null;
            const srmLight = isSrm ? srmIsLight(srmVal) : false;

            return (
              <div key={cfg.key} className="space-y-0">
                <div className="flex items-center gap-3">
                  <span className="w-8 text-sm font-medium shrink-0 flex items-center gap-0.5">
                    {cfg.label}
                    {cfg.key === "fg" && suggestedFg != null && (
                      <div className="relative group">
                        <Info className="h-3 w-3 text-muted-foreground/50 cursor-help" />
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block z-[9999] w-max bg-popover text-popover-foreground text-xs rounded-md border shadow-md px-2.5 py-1.5 whitespace-nowrap">
                          Suggested FG: <strong>{suggestedFg}</strong>
                          <span className="text-muted-foreground ml-1">
                            ({firstAttenuation}% attenuation)
                          </span>
                        </div>
                      </div>
                    )}
                  </span>
                  <Input
                    type="number"
                    step={cfg.step}
                    value={targetVal ?? ""}
                    onChange={(e) => handleTargetChange(cfg.key, e.target.value)}
                    placeholder={calcVal.toFixed(cfg.decimals)}
                    className="w-24 h-7 text-sm shrink-0"
                    style={srmHex ? {
                      backgroundColor: srmHex,
                      color: srmLight ? "#1a1a1a" : "#f0f0f0",
                      borderColor: srmHex,
                    } : undefined}
                  />
                  <div className="flex-1">
                    {isSrm ? (
                      <SrmRangeBar
                        absoluteMin={cfg.absMin}
                        absoluteMax={cfg.absMax}
                        styleMin={sMin}
                        styleMax={sMax}
                        targetValue={targetVal}
                      />
                    ) : (
                      <StyleRangeBar
                        absoluteMin={cfg.absMin}
                        absoluteMax={cfg.absMax}
                        styleMin={sMin}
                        styleMax={sMax}
                        targetValue={targetVal}
                      />
                    )}
                    {/* Labels row */}
                    <div className="relative h-3.5 mt-0.5">
                      {/* Absolute bar max — very small */}
                      <span className="absolute right-0 text-[9px] leading-none text-muted-foreground/40">
                        {cfg.absMax}
                      </span>
                      {/* Style range edges — slightly bigger, positioned along bar */}
                      {rangeLeftPct != null && sMin != null && (
                        <span
                          className="absolute text-[10px] leading-none text-muted-foreground/70 -translate-x-full"
                          style={{ left: `${rangeLeftPct}%` }}
                        >
                          {sMin.toFixed(cfg.decimals)}
                        </span>
                      )}
                      {rangeRightPct != null && sMax != null && (
                        <span
                          className="absolute text-[10px] leading-none text-muted-foreground/70"
                          style={{ left: `${rangeRightPct}%` }}
                        >
                          {sMax.toFixed(cfg.decimals)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          });
          })()}

          {/* ABV (derived, no input) */}
          {(() => {
            const absMin = 0;
            const absMax = 12;
            const toPercent = (v: number) =>
              Math.max(0, Math.min(100, ((v - absMin) / (absMax - absMin)) * 100));
            const targetPct = targetAbv != null ? toPercent(targetAbv) : null;
            const rangeLeft = abvRange.min != null ? toPercent(abvRange.min) : 0;
            const rangeRight = abvRange.max != null ? toPercent(abvRange.max) : 0;
            const rangeWidth = rangeRight - rangeLeft;
            const hasRange = abvRange.min != null && abvRange.max != null;

            return (
              <div className="space-y-0.5">
                <div className="flex items-center gap-3">
                  <span className="w-8 text-sm font-medium shrink-0">ABV</span>
                  <div className="w-24 h-7 flex items-center shrink-0">
                    <span className="text-sm font-medium tabular-nums">
                      {(targetAbv ?? stats.abv).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="relative h-3.5 rounded-full bg-muted overflow-hidden">
                      {hasRange && (
                        <div
                          className={`absolute top-0 h-full ${abvInRange ? "bg-green-500/30" : "bg-amber-400/25"}`}
                          style={{ left: `${rangeLeft}%`, width: `${rangeWidth}%` }}
                        />
                      )}
                      {hasRange && (
                        <>
                          <div
                            className={`absolute top-0 h-full w-px ${abvInRange ? "bg-green-500/60" : "bg-amber-400/50"}`}
                            style={{ left: `${rangeLeft}%` }}
                          />
                          <div
                            className={`absolute top-0 h-full w-px ${abvInRange ? "bg-green-500/60" : "bg-amber-400/50"}`}
                            style={{ left: `${rangeRight}%` }}
                          />
                        </>
                      )}
                      {targetPct != null && (
                        <div
                          className="absolute top-0 h-full w-[3px] bg-foreground/80 rounded-sm"
                          style={{ left: `${targetPct}%`, transform: "translateX(-50%)" }}
                        />
                      )}
                    </div>
                    {/* ABV labels row */}
                    <div className="relative h-3.5 mt-0.5">
                      <span className="absolute right-0 text-[9px] leading-none text-muted-foreground/40">12%</span>
                      {hasRange && abvRange.min != null && (
                        <span
                          className="absolute text-[10px] leading-none text-muted-foreground/70 -translate-x-full"
                          style={{ left: `${rangeLeft}%` }}
                        >
                          {abvRange.min.toFixed(1)}%
                        </span>
                      )}
                      {hasRange && abvRange.max != null && (
                        <span
                          className="absolute text-[10px] leading-none text-muted-foreground/70"
                          style={{ left: `${rangeRight}%` }}
                        >
                          {abvRange.max.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </CollapsibleCard>

      {/* 3. Boil */}
      <CollapsibleCard
        title="Boil"
        open={open.boil}
        onToggle={() => toggle("boil")}
      >
        <div className="space-y-3">
          {[
            { label: "Heating time", value: heatUpTimeMin, set: setHeatUpTimeMin, placeholder: "30" },
            { label: "Boil time",    value: boilTimeMin,   set: setBoilTimeMin,   placeholder: "60" },
            { label: "Whirlpool time", value: whirpoolTimeMin, set: setWhirpoolTimeMin, placeholder: "10" },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-32 text-sm shrink-0">{label}</span>
              <Input
                type="number"
                step="5"
                min="0"
                value={value ?? ""}
                onChange={(e) => {
                  const num = e.target.value === "" ? null : parseFloat(e.target.value);
                  set(num != null && isNaN(num) ? null : num);
                  scheduleBoilSave();
                }}
                placeholder={placeholder}
                className="w-24 h-7 text-sm"
              />
              <span className="text-sm text-muted-foreground">min</span>
            </div>
          ))}
        </div>
      </CollapsibleCard>

      {/* 5. Mash */}
      <CollapsibleCard
        title="Mash"
        open={open.mash}
        onToggle={() => toggle("mash")}
      >
        {/* Mode toggle */}
        <div className="flex gap-1 mb-4 p-1 bg-muted rounded-lg w-fit">
          {(["sparge", "biab"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setMashMode(mode);
                try { localStorage.setItem(`brewhub:batch:${batchId}:mashMode`, mode); } catch { /* ignore */ }
              }}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                mashMode === mode
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode === "sparge" ? "Sparge" : "Full Volume Mash"}
            </button>
          ))}
        </div>

        {mashMode === "sparge" && (
          <div className="flex items-center gap-3 mb-4">
            <span className="w-32 text-sm shrink-0">Mash ratio</span>
            <Input
              type="number"
              min="1"
              max="10"
              step="0.1"
              value={mashRatioInput}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v) && v > 0) {
                  setMashRatioInput(v);
                  try { localStorage.setItem(`brewhub:batch:${batchId}:mashRatio`, String(v)); } catch { /* ignore */ }
                }
              }}
              className="w-24 h-7 text-sm"
            />
            <span className="text-sm text-muted-foreground">L/kg</span>
          </div>
        )}

        <div className="rounded-lg overflow-hidden border text-sm">
          {/* Strike / mash water */}
          <div className="flex items-center justify-between px-3 py-2.5 bg-blue-50 dark:bg-blue-950/30 font-semibold text-blue-900 dark:text-blue-100">
            <span>{mashMode === "biab" ? "Mash water (full volume)" : "Strike water"}</span>
            <div className="flex items-center gap-1.5 tabular-nums">
              <span>{wv.mashWater.toFixed(1)}</span>
              <span className="text-blue-500 dark:text-blue-400 font-normal">L</span>
            </div>
          </div>

          {mashMode === "sparge" && (
            <>
              <div className="flex items-center justify-between px-3 py-1.5 pl-6 text-xs text-muted-foreground">
                <span>Grain × ratio</span>
                <div className="flex items-center gap-1.5 tabular-nums">
                  <span>{wv.strikeRatioWater.toFixed(2)}</span>
                  <span>L</span>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 pl-6 text-xs text-muted-foreground">
                <span>Dead space</span>
                <div className="flex items-center gap-1.5 tabular-nums">
                  <span>{wv.mashTunDeadSpaceL.toFixed(2)}</span>
                  <span>L</span>
                </div>
              </div>
            </>
          )}

          {/* Real mash ratio */}
          <div className="flex items-center justify-between px-3 py-2 text-muted-foreground">
            <span>Real mash ratio</span>
            <span className="tabular-nums font-medium text-foreground">
              {wv.mashRatioActual.toFixed(2)} L/kg
            </span>
          </div>

          {mashMode === "sparge" && (
            <>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between px-3 py-2.5 bg-sky-50 dark:bg-sky-950/30 font-semibold text-sky-900 dark:text-sky-100">
                <span>Sparge water</span>
                <div className="flex items-center gap-1.5 tabular-nums">
                  <span>{wv.spargeWater.toFixed(1)}</span>
                  <span className="text-sky-500 dark:text-sky-400 font-normal">L</span>
                </div>
              </div>
            </>
          )}

          <div className="h-px bg-border" />

          {/* Total water */}
          <div className="flex items-center justify-between px-3 py-2.5 font-bold">
            <span>Total water</span>
            <div className="flex items-center gap-1.5 tabular-nums">
              <span>{wv.totalWater.toFixed(1)}</span>
              <span className="font-normal text-muted-foreground">L</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mt-4">
          <div className="flex items-center gap-3">
            <span className="w-32 text-sm shrink-0">Grain temperature</span>
            <Input
              type="number"
              step="0.1"
              value={grainTempC ?? ""}
              onChange={(e) => {
                const v = e.target.value === "" ? null : parseFloat(e.target.value);
                setGrainTempC(v);
                scheduleMashSave();
              }}
              className="w-24 h-7 text-sm"
            />
            <span className="text-sm text-muted-foreground">°C</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-32 text-sm shrink-0">Mash Target pH</span>
            <Input
              type="number"
              step="0.01"
              min="4"
              max="8"
              value={targetPh ?? ""}
              onChange={(e) => {
                const v = e.target.value === "" ? null : parseFloat(e.target.value);
                setTargetPh(v);
                scheduleMashSave();
              }}
              className="w-24 h-7 text-sm"
            />
          </div>
          {mashMode === "sparge" && (
            <div className="flex items-center gap-3">
              <span className="w-32 text-sm shrink-0">Sparge Target pH</span>
              <Input
                type="number"
                step="0.01"
                min="4"
                max="8"
                value={spargeTargetPh ?? ""}
                onChange={(e) => {
                  const v = e.target.value === "" ? null : parseFloat(e.target.value);
                  setSpargeTargetPh(v);
                  scheduleMashSave();
                }}
                className="w-24 h-7 text-sm"
              />
            </div>
          )}
        </div>

        {/* Mash steps */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold">Mash steps</h4>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => {
                setEditMashStepDraft({ name: "", type: "infusion", stepTemperatureC: "", stepTimeMin: "", amountL: "", rampTimeMin: "", endTemperatureC: "", description: "", infuseTemperatureC: "" });
                setShowAddMashStep(true);
                setEditingMashStepId(null);
              }}
            >
              + Add step
            </Button>
          </div>

          {mashStepRows.length === 0 && !showAddMashStep && (
            <p className="text-sm text-muted-foreground italic">No mash steps yet.</p>
          )}

          {mashStepRows.length > 0 && (
            <div className="space-y-2">
              {mashStepRows.map((step, idx) => {
                const isEditing = editingMashStepId === step.id;
                if (isEditing) {
                  return (
                    <div key={step.id} className="rounded-lg border p-3 space-y-2 bg-muted/30">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">Name</label>
                          <Input value={editMashStepDraft.name} onChange={(e) => setEditMashStepDraft((d) => ({ ...d, name: e.target.value }))} className="h-7 text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Type</label>
                          <Select value={editMashStepDraft.type} onValueChange={(v) => setEditMashStepDraft((d) => ({ ...d, type: v }))}>
                            <SelectTrigger className="h-7 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["infusion", "temperature", "decoction", "souring mash", "souring wort", "drain mash tun", "sparge"].map((t) => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Temp (°C)</label>
                          <Input type="number" step="0.1" value={editMashStepDraft.stepTemperatureC} onChange={(e) => setEditMashStepDraft((d) => ({ ...d, stepTemperatureC: e.target.value }))} className="h-7 text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Time (min)</label>
                          <Input type="number" step="1" value={editMashStepDraft.stepTimeMin} onChange={(e) => setEditMashStepDraft((d) => ({ ...d, stepTimeMin: e.target.value }))} className="h-7 text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Amount (L)</label>
                          <Input type="number" step="0.1" value={editMashStepDraft.amountL} onChange={(e) => setEditMashStepDraft((d) => ({ ...d, amountL: e.target.value }))} className="h-7 text-sm" placeholder="Optional" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Ramp time (min)</label>
                          <Input type="number" step="1" value={editMashStepDraft.rampTimeMin} onChange={(e) => setEditMashStepDraft((d) => ({ ...d, rampTimeMin: e.target.value }))} className="h-7 text-sm" placeholder="Optional" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">End temp (°C)</label>
                          <Input type="number" step="0.1" value={editMashStepDraft.endTemperatureC} onChange={(e) => setEditMashStepDraft((d) => ({ ...d, endTemperatureC: e.target.value }))} className="h-7 text-sm" placeholder="Optional" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Infuse temp (°C)</label>
                          <Input type="number" step="0.1" value={editMashStepDraft.infuseTemperatureC} onChange={(e) => setEditMashStepDraft((d) => ({ ...d, infuseTemperatureC: e.target.value }))} className="h-7 text-sm" placeholder="Optional" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Description</label>
                        <Input value={editMashStepDraft.description} onChange={(e) => setEditMashStepDraft((d) => ({ ...d, description: e.target.value }))} className="h-7 text-sm" placeholder="Optional" />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingMashStepId(null)}>Cancel</Button>
                        <Button size="sm" className="h-7 text-xs" disabled={savingMashStepId === step.id} onClick={async () => {
                          const temp = parseFloat(editMashStepDraft.stepTemperatureC);
                          const time = parseFloat(editMashStepDraft.stepTimeMin);
                          if (!editMashStepDraft.name || isNaN(temp) || isNaN(time)) {
                            toast.error("Name, temperature and time are required");
                            return;
                          }
                          setSavingMashStepId(step.id);
                          try {
                            await updateMashStepAction(step.id, {
                              name: editMashStepDraft.name,
                              type: editMashStepDraft.type,
                              stepTemperatureC: temp,
                              stepTimeMin: time,
                              amountL: editMashStepDraft.amountL ? parseFloat(editMashStepDraft.amountL) : null,
                              rampTimeMin: editMashStepDraft.rampTimeMin ? parseFloat(editMashStepDraft.rampTimeMin) : null,
                              endTemperatureC: editMashStepDraft.endTemperatureC ? parseFloat(editMashStepDraft.endTemperatureC) : null,
                              description: editMashStepDraft.description || null,
                              infuseTemperatureC: editMashStepDraft.infuseTemperatureC ? parseFloat(editMashStepDraft.infuseTemperatureC) : null,
                              sortOrder: idx,
                            });
                            setMashStepRows((rows) => rows.map((r) => r.id === step.id ? {
                              ...r,
                              name: editMashStepDraft.name,
                              type: editMashStepDraft.type,
                              stepTemperatureC: temp,
                              stepTimeMin: time,
                              amountL: editMashStepDraft.amountL ? parseFloat(editMashStepDraft.amountL) : null,
                              rampTimeMin: editMashStepDraft.rampTimeMin ? parseFloat(editMashStepDraft.rampTimeMin) : null,
                              endTemperatureC: editMashStepDraft.endTemperatureC ? parseFloat(editMashStepDraft.endTemperatureC) : null,
                              description: editMashStepDraft.description || null,
                              infuseTemperatureC: editMashStepDraft.infuseTemperatureC ? parseFloat(editMashStepDraft.infuseTemperatureC) : null,
                            } : r));
                            setEditingMashStepId(null);
                            toast.success("Mash step updated");
                          } catch {
                            toast.error("Failed to update mash step");
                          } finally {
                            setSavingMashStepId(null);
                          }
                        }}>Save</Button>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={step.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-5">{idx + 1}.</span>
                      <div>
                        <span className="font-medium">{step.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">({step.type})</span>
                      </div>
                      <div className="text-sm font-semibold text-foreground tabular-nums">
                        {step.stepTemperatureC.toFixed(1)}°C
                        <span className="mx-1 text-muted-foreground font-normal">/</span>
                        {step.stepTimeMin.toFixed(0)} min
                      </div>
                      {step.amountL != null && (
                        <span className="text-xs text-muted-foreground">{step.amountL.toFixed(1)} L</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                        setEditMashStepDraft({
                          name: step.name,
                          type: step.type,
                          stepTemperatureC: String(step.stepTemperatureC),
                          stepTimeMin: String(step.stepTimeMin),
                          amountL: step.amountL != null ? String(step.amountL) : "",
                          rampTimeMin: step.rampTimeMin != null ? String(step.rampTimeMin) : "",
                          endTemperatureC: step.endTemperatureC != null ? String(step.endTemperatureC) : "",
                          description: step.description ?? "",
                          infuseTemperatureC: step.infuseTemperatureC != null ? String(step.infuseTemperatureC) : "",
                        });
                        setEditingMashStepId(step.id);
                        setShowAddMashStep(false);
                      }}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={async () => {
                        if (!confirm("Delete this mash step?")) return;
                        try {
                          await deleteMashStepAction(step.id);
                          setMashStepRows((rows) => rows.filter((r) => r.id !== step.id));
                          toast.success("Mash step deleted");
                        } catch {
                          toast.error("Failed to delete mash step");
                        }
                      }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {showAddMashStep && (
            <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Name *</label>
                  <Input value={editMashStepDraft.name} onChange={(e) => setEditMashStepDraft((d) => ({ ...d, name: e.target.value }))} className="h-7 text-sm" placeholder="e.g. Saccharification" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Type *</label>
                  <Select value={editMashStepDraft.type} onValueChange={(v) => setEditMashStepDraft((d) => ({ ...d, type: v }))}>
                    <SelectTrigger className="h-7 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["infusion", "temperature", "decoction", "souring mash", "souring wort", "drain mash tun", "sparge"].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Temp (°C) *</label>
                  <Input type="number" step="0.1" value={editMashStepDraft.stepTemperatureC} onChange={(e) => setEditMashStepDraft((d) => ({ ...d, stepTemperatureC: e.target.value }))} className="h-7 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Time (min) *</label>
                  <Input type="number" step="1" value={editMashStepDraft.stepTimeMin} onChange={(e) => setEditMashStepDraft((d) => ({ ...d, stepTimeMin: e.target.value }))} className="h-7 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Amount (L)</label>
                  <Input type="number" step="0.1" value={editMashStepDraft.amountL} onChange={(e) => setEditMashStepDraft((d) => ({ ...d, amountL: e.target.value }))} className="h-7 text-sm" placeholder="Optional" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Ramp time (min)</label>
                  <Input type="number" step="1" value={editMashStepDraft.rampTimeMin} onChange={(e) => setEditMashStepDraft((d) => ({ ...d, rampTimeMin: e.target.value }))} className="h-7 text-sm" placeholder="Optional" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">End temp (°C)</label>
                  <Input type="number" step="0.1" value={editMashStepDraft.endTemperatureC} onChange={(e) => setEditMashStepDraft((d) => ({ ...d, endTemperatureC: e.target.value }))} className="h-7 text-sm" placeholder="Optional" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Infuse temp (°C)</label>
                  <Input type="number" step="0.1" value={editMashStepDraft.infuseTemperatureC} onChange={(e) => setEditMashStepDraft((d) => ({ ...d, infuseTemperatureC: e.target.value }))} className="h-7 text-sm" placeholder="Optional" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Description</label>
                <Input value={editMashStepDraft.description} onChange={(e) => setEditMashStepDraft((d) => ({ ...d, description: e.target.value }))} className="h-7 text-sm" placeholder="Optional" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowAddMashStep(false)}>Cancel</Button>
                <Button size="sm" className="h-7 text-xs" onClick={async () => {
                  const temp = parseFloat(editMashStepDraft.stepTemperatureC);
                  const time = parseFloat(editMashStepDraft.stepTimeMin);
                  if (!editMashStepDraft.name || isNaN(temp) || isNaN(time)) {
                    toast.error("Name, temperature and time are required");
                    return;
                  }
                  try {
                    const newStep = await createMashStepAction({
                      name: editMashStepDraft.name,
                      type: editMashStepDraft.type,
                      stepTemperatureC: temp,
                      stepTimeMin: time,
                      amountL: editMashStepDraft.amountL ? parseFloat(editMashStepDraft.amountL) : null,
                      rampTimeMin: editMashStepDraft.rampTimeMin ? parseFloat(editMashStepDraft.rampTimeMin) : null,
                      endTemperatureC: editMashStepDraft.endTemperatureC ? parseFloat(editMashStepDraft.endTemperatureC) : null,
                      description: editMashStepDraft.description || null,
                      infuseTemperatureC: editMashStepDraft.infuseTemperatureC ? parseFloat(editMashStepDraft.infuseTemperatureC) : null,
                      sortOrder: mashStepRows.length,
                    });
                    setMashStepRows((rows) => [...rows, newStep]);
                    setShowAddMashStep(false);
                    toast.success("Mash step added");
                  } catch {
                    toast.error("Failed to add mash step");
                  }
                }}>Add</Button>
              </div>
            </div>
          )}
        </div>
      </CollapsibleCard>

      {/* 6. Fermentables */}
      <CollapsibleCard
        title={`Fermentables (${grainRows.length})`}
        open={open.fermentables}
        onToggle={() => toggle("fermentables")}
        className="bg-orange-50"
        actions={
          <Link href={`/batches/${batchId}/grains/new`}>
            <Button size="sm" className="bg-orange-200 hover:bg-orange-300 text-orange-900">+ Add</Button>
          </Link>
        }
      >
        {grainRows.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-xs">
                  {grainCols.map(({ key, label }) => (
                    <th key={key} className="text-left font-medium pb-2 pr-3">
                      <button type="button" className="flex items-center gap-0.5 hover:text-foreground" onClick={() => toggleSort(grainSort, key, setGrainSort)}>
                        {label}<SortIcon col={key} sort={grainSort} />
                      </button>
                    </th>
                  ))}
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {sortedGrainRows.map((bg) => {
                  const isEditing = editingGrainId === bg.id;
                  const { extract, mcu, pct } = grainCalc(bg);
                  return (
                    <tr key={bg.id} className="border-b last:border-0">
                      <td className="py-2 pr-3">
                        <span className="font-medium">{bg.grain.name}</span>
                        {bg.grain.brand && <div className="text-[10px] text-muted-foreground leading-tight">{bg.grain.brand}</div>}
                      </td>
                      <td className="py-2 pr-3">
                        {isEditing ? (
                          <Input type="number" step="1" value={editGrainDraft.grams} onChange={(e) => setEditGrainDraft({ grams: e.target.value })} className="h-7 text-sm w-24" />
                        ) : `${bg.grams} g`}
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground">{pct.toFixed(1)}%</td>
                      <td className="py-2 pr-3 text-muted-foreground">{extract.toFixed(0)} g</td>
                      <td className="py-2 pr-3 text-muted-foreground">{bg.grain.colorL ?? "—"}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{mcu.toFixed(2)}</td>
                      <td className="py-2 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-6 w-6"
                              onClick={async () => {
                                try {
                                  const grams = parseFloat(editGrainDraft.grams);
                                  await updateGrainAction(bg.id, { grams });
                                  setGrainRows((rows) => rows.map((r) => r.id === bg.id ? { ...r, grams } : r));
                                } catch { toast.error("Failed to save"); }
                                finally { setEditingGrainId(null); }
                              }}
                            ><Check className="h-3.5 w-3.5" /></Button>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingGrainId(null)}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-6 w-6"
                              onClick={() => { setEditGrainDraft({ grams: String(bg.grams) }); setEditingGrainId(bg.id); }}
                            ><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={async () => {
                                try {
                                  await deleteGrainAction(bg.id);
                                  setGrainRows((rows) => rows.filter((r) => r.id !== bg.id));
                                } catch { toast.error("Failed to delete"); }
                              }}
                            ><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                <tr className="border-t font-bold text-xs">
                  <td className="pt-2 pr-3">Total</td>
                  <td className="pt-2 pr-3">{grainTotals.grams} g</td>
                  <td className="pt-2 pr-3">100%</td>
                  <td className="pt-2 pr-3">{grainTotals.extract.toFixed(0)} g</td>
                  <td className="pt-2 pr-3" />
                  <td className="pt-2 pr-3">
                    {(() => {
                      const calcSrm = grainTotals.mcu > 0 ? 1.4922 * Math.pow(grainTotals.mcu, 0.6859) : 0;
                      const hex = srmToHex(calcSrm);
                      const light = srmIsLight(calcSrm);
                      const diff = targets.srm != null ? calcSrm - targets.srm : null;
                      return (
                        <span className="inline-flex flex-col items-start gap-0.5">
                          <span
                            className="px-1.5 py-0.5 rounded font-bold"
                            style={{ backgroundColor: hex, color: light ? "#1a1a1a" : "#f0f0f0" }}
                          >
                            {grainTotals.mcu.toFixed(2)}
                          </span>
                          {diff != null && (
                            <span className="text-[10px] text-muted-foreground leading-none">
                              {diff > 0 ? "+" : ""}{diff.toFixed(1)} SRM
                            </span>
                          )}
                        </span>
                      );
                    })()}
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
        ) : (
          <p className="text-muted-foreground text-center py-4">No fermentables added yet</p>
        )}
      </CollapsibleCard>

      {/* 5. Hops */}
      <CollapsibleCard
        title={`Hops (${hopRows.length})`}
        open={open.hops}
        onToggle={() => toggle("hops")}
        className="bg-lime-50"
        actions={
          <Link href={`/batches/${batchId}/hops/new`}>
            <Button size="sm" className="bg-lime-200 hover:bg-lime-300 text-lime-900">+ Add</Button>
          </Link>
        }
      >
        {hopRows.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-xs">
                {([
                  { key: "name", label: "Name" },
                  { key: "alphaAcid", label: "AA%" },
                  { key: "use", label: "Use" },
                  { key: "additionTime", label: "Time (min)" },
                  { key: "grams", label: "Grams" },
                ] as const).map(({ key, label }) => (
                  <th key={key} className="text-left font-medium pb-2 pr-3">
                    <button type="button" className="flex items-center gap-0.5 hover:text-foreground" onClick={() => toggleSort(hopSort, key, setHopSort)}>
                      {label}<SortIcon col={key} sort={hopSort} />
                    </button>
                  </th>
                ))}
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {sortedHopRows.map((bh) => {
                const isEditing = editingHopId === bh.id;
                const useLabel = HOP_USES.find((u) => u.value === bh.use)?.label ?? bh.use;
                return (
                  <tr key={bh.id} className="border-b last:border-0">
                    <td className="py-2 pr-3 font-medium">{bh.hop.name}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{bh.hop.alphaAcid}%</td>
                    <td className="py-2 pr-3">
                      {isEditing ? (
                        <Select value={editHopDraft.use} onValueChange={(v) => setEditHopDraft((d) => ({ ...d, use: v }))}>
                          <SelectTrigger className="h-7 text-sm w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {HOP_USES.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : useLabel}
                    </td>
                    <td className="py-2 pr-3">
                      {isEditing ? (
                        <Input
                          type="number" step="1"
                          value={editHopDraft.additionTime}
                          onChange={(e) => setEditHopDraft((d) => ({ ...d, additionTime: e.target.value }))}
                          className="h-7 text-sm w-20"
                        />
                      ) : (bh.additionTime != null ? `${bh.additionTime}` : "—")}
                    </td>
                    <td className="py-2 pr-3">
                      {isEditing ? (
                        <Input
                          type="number" step="0.1"
                          value={editHopDraft.grams}
                          onChange={(e) => setEditHopDraft((d) => ({ ...d, grams: e.target.value }))}
                          className="h-7 text-sm w-24"
                        />
                      ) : `${bh.grams} g`}
                    </td>
                    <td className="py-2 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon" variant="ghost" className="h-6 w-6"
                            onClick={async () => {
                              try {
                                const grams = parseFloat(editHopDraft.grams);
                                const additionTime = editHopDraft.additionTime !== "" ? parseFloat(editHopDraft.additionTime) : null;
                                await updateHopAction(bh.id, { grams, use: editHopDraft.use, additionTime });
                                setHopRows((rows) => rows.map((r) => r.id === bh.id ? { ...r, grams, use: editHopDraft.use, additionTime } : r));
                              } catch { toast.error("Failed to save"); }
                              finally { setEditingHopId(null); }
                            }}
                          ><Check className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingHopId(null)}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon" variant="ghost" className="h-6 w-6"
                            onClick={() => {
                              setEditHopDraft({ grams: String(bh.grams), use: bh.use, additionTime: bh.additionTime != null ? String(bh.additionTime) : "" });
                              setEditingHopId(bh.id);
                            }}
                          ><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button
                            size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={async () => {
                              try {
                                await deleteHopAction(bh.id);
                                setHopRows((rows) => rows.filter((r) => r.id !== bh.id));
                              } catch { toast.error("Failed to delete"); }
                            }}
                          ><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-muted-foreground text-center py-4">No hops added yet</p>
        )}
      </CollapsibleCard>

      {/* 6. Cultures */}
      <CollapsibleCard
        title={`Cultures (${yeastRows.length})`}
        open={open.cultures}
        onToggle={() => toggle("cultures")}
        className="bg-purple-50"
        actions={
          <Link href={`/batches/${batchId}/yeasts/new`}>
            <Button size="sm" className="bg-purple-200 hover:bg-purple-300 text-purple-900">+ Add</Button>
          </Link>
        }
      >
        {yeasts.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-xs">
                <th className="text-left font-medium pb-2 pr-3">Name</th>
                <th className="text-left font-medium pb-2 pr-3">Brand</th>
                <th className="text-left font-medium pb-2 pr-3">Attenuation</th>
                <th className="text-left font-medium pb-2 pr-3">Quantity</th>
                <th className="text-left font-medium pb-2 pr-3">Temp (°C)</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {yeastRows.map((by) => {
                const isEditing = editingYeastId === by.id;
                const isSaving = savingYeastId === by.id;
                return (
                  <tr key={by.id} className="border-b last:border-0">
                    <td className="py-2 pr-3 font-medium">{by.yeast.name}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{by.yeast.brand ?? "—"}</td>
                    <td className="py-2 pr-3 text-muted-foreground">
                      {by.yeast.attenuation != null ? `${by.yeast.attenuation}%` : "—"}
                    </td>
                    <td className="py-2 pr-3">
                      {isEditing ? (
                        <Input
                          value={editYeastDraft.quantity}
                          onChange={(e) => setEditYeastDraft((d) => ({ ...d, quantity: e.target.value }))}
                          className="h-7 text-sm w-32"
                        />
                      ) : (
                        by.quantity
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.1"
                          value={editYeastDraft.temp}
                          onChange={(e) => setEditYeastDraft((d) => ({ ...d, temp: e.target.value }))}
                          className="h-7 text-sm w-20"
                        />
                      ) : (
                        by.temp != null ? `${by.temp}` : "—"
                      )}
                    </td>
                    <td className="py-2 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            disabled={isSaving}
                            onClick={async () => {
                              setSavingYeastId(by.id);
                              try {
                                const newTemp = editYeastDraft.temp !== "" ? parseFloat(editYeastDraft.temp) : null;
                                await updateYeastAction(by.id, { quantity: editYeastDraft.quantity, temp: newTemp });
                                setYeastRows((rows) =>
                                  rows.map((r) =>
                                    r.id === by.id ? { ...r, quantity: editYeastDraft.quantity, temp: newTemp } : r
                                  )
                                );
                              } catch {
                                toast.error("Failed to save");
                              } finally {
                                setSavingYeastId(null);
                                setEditingYeastId(null);
                              }
                            }}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => setEditingYeastId(null)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => {
                              setEditYeastDraft({ quantity: by.quantity, temp: by.temp != null ? String(by.temp) : "" });
                              setEditingYeastId(by.id);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={async () => {
                              try {
                                await deleteYeastAction(by.id);
                                setYeastRows((rows) => rows.filter((r) => r.id !== by.id));
                              } catch {
                                toast.error("Failed to delete");
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-muted-foreground text-center py-4">No cultures added yet</p>
        )}
      </CollapsibleCard>

      {/* 4. Volumes */}
      <CollapsibleCard
        title="Volumes"
        open={open.waterVolumes}
        onToggle={() => toggle("waterVolumes")}
      >
        {!selectedEquipment && (
          <p className="text-sm text-muted-foreground italic mb-3">
            Select equipment in Basic Information to use actual losses. Showing defaults.
          </p>
        )}
        <div className="rounded-lg overflow-hidden border text-sm">
          {/* Helper sub-components rendered inline */}
          {(() => {
            const maxVol = wv.totalWater;
            const barPct = (v: number) => Math.max(2, Math.min(100, (v / maxVol) * 100));

            const volumeRow = (label: string, value: number) => (
              <div className="flex items-center gap-3 px-3 py-2 bg-blue-100 dark:bg-blue-900/40 font-semibold text-blue-900 dark:text-blue-100">
                <span className="flex-1">{label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 rounded-full bg-blue-200 dark:bg-blue-800 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${barPct(value)}%` }} />
                  </div>
                  <span className="tabular-nums w-10 text-right">{value.toFixed(1)}</span>
                  <span className="text-blue-600 dark:text-blue-300 w-4">L</span>
                </div>
              </div>
            );

            const lossRow = (label: string, value: number) => (
              <div className="flex items-center gap-3 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 text-muted-foreground pl-8 text-xs">
                <span className="flex-1">{label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${barPct(value)}%` }} />
                  </div>
                  <span className="tabular-nums w-10 text-right">{value.toFixed(2)}</span>
                  <span className="w-4">L</span>
                </div>
              </div>
            );

            const divider = () => <div className="h-px bg-border" />;

            const bottledVol = Math.max(0, wv.fermenterVol - wv.fermenterLossL);

            return (
              <div>
                {volumeRow("Bottled volume", bottledVol)}
                {lossRow("+ Fermenter losses", wv.fermenterLossL)}
                {divider()}
                {volumeRow("Fermenter volume", wv.fermenterVol)}
                {lossRow("+ Kettle/chiller losses", wv.trubLossL)}
                {divider()}
                {volumeRow("Post-chill volume", wv.postChill)}
                {lossRow(`Temperature shrinkage (${wv.tempContractionPct}%)`, wv.tempContractionL)}
                {divider()}
                {volumeRow("End of boil volume", wv.endOfBoil)}
                {lossRow("+ Boil evaporation", wv.boilEvapL)}
                {divider()}
                {volumeRow("Pre-boil volume", wv.preBoil)}
                {lossRow("+ Heat-up evaporation", wv.heatUpEvapL)}
                {divider()}
                {volumeRow("Pre-heat-up volume", wv.preHeatUp)}
                <div className="h-px bg-border border-t-2" />
                {lossRow(`System losses (${wv.systemLossPct.toFixed(1)}%)`, wv.systemLossL)}
                {wv.mashTunDeadSpaceL > 0 && lossRow("Mash tun dead space", wv.mashTunDeadSpaceL)}
                {lossRow("Grain absorption", wv.grainAbsL)}
                {/* Total water */}
                <div className="flex items-center gap-3 px-3 py-2 bg-blue-600 dark:bg-blue-700 text-white font-bold">
                  <span className="flex-1">Total water</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-blue-400/40 overflow-hidden">
                      <div className="h-full rounded-full bg-white/70" style={{ width: "100%" }} />
                    </div>
                    <span className="tabular-nums w-10 text-right">{wv.totalWater.toFixed(1)}</span>
                    <span className="opacity-70 w-4">L</span>
                  </div>
                </div>
                {divider()}
                <div className="flex items-center gap-3 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 font-medium text-blue-800 dark:text-blue-200">
                  <span className="flex-1">Mash water (strike)</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-blue-400" style={{ width: `${barPct(wv.mashWater)}%` }} />
                    </div>
                    <span className="tabular-nums w-10 text-right">{wv.mashWater.toFixed(1)}</span>
                    <span className="text-muted-foreground w-4">L</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3 py-1.5 bg-sky-50 dark:bg-sky-950/30 font-medium text-sky-800 dark:text-sky-200">
                  <span className="flex-1">Sparge water</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-sky-400" style={{ width: `${barPct(wv.spargeWater)}%` }} />
                    </div>
                    <span className="tabular-nums w-10 text-right">{wv.spargeWater.toFixed(1)}</span>
                    <span className="text-muted-foreground w-4">L</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </CollapsibleCard>

      {/* 7. Water */}
      <CollapsibleCard
        title="Water"
        open={open.water}
        onToggle={() => toggle("water")}
        className="bg-sky-50"
      >
        {(() => {
          const WATER_FIELDS: { key: keyof typeof waterEditDraft; label: string; unit?: string }[] = [
            { key: "caPpm",   label: "Ca²⁺",   unit: "ppm" },
            { key: "mgPpm",   label: "Mg²⁺",   unit: "ppm" },
            { key: "naPpm",   label: "Na⁺",    unit: "ppm" },
            { key: "clPpm",   label: "Cl⁻",    unit: "ppm" },
            { key: "so4Ppm",  label: "SO₄²⁻",  unit: "ppm" },
            { key: "znPpm",   label: "Zn²⁺",   unit: "ppm" },
            { key: "hco3Ppm", label: "HCO₃⁻",  unit: "ppm" },
            { key: "pH",      label: "pH" },
          ];

          function openWaterEdit(which: "source" | "target") {
            const snapshot = which === "source" ? sourceSnapshotLocal : targetSnapshotLocal;
            if (!snapshot) return;
            setWaterEditDraft({
              caPpm:   String(snapshot.caPpm),
              mgPpm:   String(snapshot.mgPpm),
              naPpm:   String(snapshot.naPpm),
              clPpm:   String(snapshot.clPpm),
              so4Ppm:  String(snapshot.so4Ppm),
              znPpm:   snapshot.znPpm   != null ? String(snapshot.znPpm)   : "",
              hco3Ppm: snapshot.hco3Ppm != null ? String(snapshot.hco3Ppm) : "",
              pH:      snapshot.pH      != null ? String(snapshot.pH)      : "",
            });
            setEditingWater(which);
          }

          async function saveWaterProfile() {
            if (!editingWater) return;
            setSavingWater(true);
            try {
              const pf = (v: string) => v === "" ? null : parseFloat(v);
              const data = {
                caPpm:   parseFloat(waterEditDraft.caPpm)   || 0,
                mgPpm:   parseFloat(waterEditDraft.mgPpm)   || 0,
                naPpm:   parseFloat(waterEditDraft.naPpm)   || 0,
                clPpm:   parseFloat(waterEditDraft.clPpm)   || 0,
                so4Ppm:  parseFloat(waterEditDraft.so4Ppm)  || 0,
                znPpm:   pf(waterEditDraft.znPpm),
                hco3Ppm: pf(waterEditDraft.hco3Ppm),
                pH:      pf(waterEditDraft.pH),
              };
              await updateBatchWaterSnapshotAction(editingWater, data);
              if (editingWater === "source") {
                setSourceSnapshotLocal(data);
                setSourceEdited(true);
              } else {
                setTargetSnapshotLocal(data);
                setTargetEdited(true);
              }
              toast.success("Water profile saved");
              setEditingWater(null);
            } catch {
              toast.error("Failed to save water profile");
            } finally {
              setSavingWater(false);
            }
          }

          async function handleWaterSelect(which: "source" | "target", id: string) {
            const val = id === "__none__" ? "" : id;
            if (which === "source") {
              setSourceWaterId(val);
              setSourceEdited(false);
              if (editingWater === "source") setEditingWater(null);
            } else {
              setTargetWaterId(val);
              setTargetEdited(false);
              if (editingWater === "target") setEditingWater(null);
            }

            // Optimistically update local snapshot so UI reflects the selected profile immediately
            if (val) {
              const profile = waterProfiles.find((p) => p.id === val);
              if (profile) {
                const snapshot = {
                  caPpm:   profile.caPpm   ?? 0,
                  mgPpm:   profile.mgPpm   ?? 0,
                  naPpm:   profile.naPpm   ?? 0,
                  clPpm:   profile.clPpm   ?? 0,
                  so4Ppm:  profile.so4Ppm  ?? 0,
                  znPpm:   profile.znPpm   ?? null,
                  hco3Ppm: profile.hco3Ppm ?? null,
                  pH:      profile.pH      ?? null,
                };
                if (which === "source") setSourceSnapshotLocal(snapshot);
                else setTargetSnapshotLocal(snapshot);
              }
            } else {
              if (which === "source") setSourceSnapshotLocal(null);
              else setTargetSnapshotLocal(null);
            }

            const newSourceId = which === "source" ? (val || null) : (sourceWaterId || null);
            const newTargetId = which === "target" ? (val || null) : (targetWaterId || null);
            try {
              await updateBatchWaterAction({ sourceWaterProfileId: newSourceId, targetWaterProfileId: newTargetId });
              router.refresh();
            } catch {
              toast.error("Failed to save water selection");
            }
          }

          function renderWaterSelector(which: "source" | "target", profileId: string) {
            const label = which === "source" ? "Source" : "Target";
            const profile = waterProfiles.find((p) => p.id === profileId);
            const isEdited = which === "source" ? sourceEdited : targetEdited;
            const isActiveEdit = editingWater === which;
            return (
              <div key={which} className="flex-1 min-w-0 space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
                <div className="flex items-center gap-2">
                  <Select value={profileId || "__none__"} onValueChange={(v) => handleWaterSelect(which, v)}>
                    <SelectTrigger className="h-8 text-sm w-full">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {waterProfiles.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {profile && (
                    <Button
                      size="icon"
                      variant={isActiveEdit ? "secondary" : "ghost"}
                      className="h-8 w-8 shrink-0"
                      onClick={() => isActiveEdit ? setEditingWater(null) : openWaterEdit(which)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                {isEdited && (
                  <span className="text-xs text-amber-600 font-medium">Edited for this batch</span>
                )}
              </div>
            );
          }

          return (
            <div className="space-y-4">
              {waterProfiles.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-2">
                  No water profiles configured yet. Add some in the inventory.
                </p>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {renderWaterSelector("source", sourceWaterId)}
                  {renderWaterSelector("target", targetWaterId)}
                </div>
              )}

              {/* Full-width edit panel */}
              {editingWater && (
                <div className="border rounded-md p-4 bg-background space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      Editing {editingWater === "source" ? "Source" : "Target"} Profile
                    </span>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingWater(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                    {WATER_FIELDS.map(({ key, label: fieldLabel, unit }) => (
                      <div key={key} className="space-y-1">
                        <label className="text-xs text-muted-foreground">{fieldLabel}{unit ? ` (${unit})` : ""}</label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={waterEditDraft[key]}
                          onChange={(e) => setWaterEditDraft((d) => ({ ...d, [key]: e.target.value }))}
                          className="h-7 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7" disabled={savingWater} onClick={saveWaterProfile}>
                      <Check className="h-3.5 w-3.5 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditingWater(null)}>
                      <X className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Salt additions subsection */}
        {(() => {
          type SaltKey = keyof typeof salts;

          const SALT_DEFS: {
            key: SaltKey;
            name: string;
            formula: string;
            minerals: Partial<Record<"caPpm" | "mgPpm" | "naPpm" | "clPpm" | "so4Ppm" | "hco3Ppm", number>>;
          }[] = [
            { key: "saltCaCl2GL",      name: "Calcium Chloride", formula: "CaCl₂",   minerals: { caPpm: 272.0, clPpm: 482.3 } },
            { key: "saltGypsumGL",     name: "Gypsum",           formula: "CaSO₄",   minerals: { caPpm: 232.8, so4Ppm: 557.4 } },
            { key: "saltEpsomGL",      name: "Epsom Salt",       formula: "MgSO₄",   minerals: { mgPpm: 98.6,  so4Ppm: 389.8 } },
            { key: "saltNaClGL",       name: "Canning Salt",     formula: "NaCl",    minerals: { naPpm: 393.4, clPpm: 606.6 } },
            { key: "saltChalkGL",      name: "Chalk",            formula: "CaCO₃",   minerals: { caPpm: 400.4, hco3Ppm: 1219.2 } },
            { key: "saltBakingSodaGL", name: "Baking Soda",      formula: "NaHCO₃",  minerals: { naPpm: 273.6, hco3Ppm: 726.3 } },
          ];

          const MINERAL_LABELS: Record<string, string> = {
            caPpm: "Ca²⁺", mgPpm: "Mg²⁺", naPpm: "Na⁺", clPpm: "Cl⁻", so4Ppm: "SO₄²⁻", hco3Ppm: "HCO₃⁻",
          };

          // Total ppm contribution from all salts
          const totals: Record<string, number> = {};
          for (const def of SALT_DEFS) {
            const gl = salts[def.key] || 0;
            for (const [mineral, factor] of Object.entries(def.minerals)) {
              totals[mineral] = (totals[mineral] ?? 0) + gl * (factor as number);
            }
          }

          const PROFILE_MINERALS: { key: "caPpm" | "mgPpm" | "naPpm" | "clPpm" | "so4Ppm" | "hco3Ppm"; label: string }[] = [
            { key: "caPpm", label: "Ca²⁺" },
            { key: "clPpm", label: "Cl⁻" },
            { key: "so4Ppm", label: "SO₄²⁻" },
            { key: "mgPpm", label: "Mg²⁺" },
            { key: "naPpm", label: "Na⁺" },
            { key: "hco3Ppm", label: "HCO₃⁻" },
          ];

          return (
            <div className="mt-4 pt-4 border-t space-y-4">
              {sourceSnapshotLocal && targetSnapshotLocal && (
                <div className="space-y-2">
                  <div className="grid grid-cols-6 gap-x-2 gap-y-1 text-sm">
                    <div className="font-medium text-muted-foreground">Mineral</div>
                    <div className="font-medium text-muted-foreground text-right">Source</div>
                    <div className="font-medium text-muted-foreground text-right">+ Salts</div>
                    <div className="font-medium text-muted-foreground text-right">Final</div>
                    <div className="font-medium text-muted-foreground text-right">Target</div>
                    <div className="font-medium text-muted-foreground text-right">Diff</div>

                    {PROFILE_MINERALS.map(({ key, label }) => {
                      const source = (sourceSnapshotLocal as any)[key] ?? 0;
                      const added = totals[key] ?? 0;
                      const final = source + added;
                      const target = (targetSnapshotLocal as any)[key] ?? 0;
                      const diffAbs = final - target;
                      const diffPct = target > 0 ? Math.abs(diffAbs / target) * 100 : 0;
                      const isClose = diffPct <= 10;
                      const diffText = target > 0 ? `${diffAbs > 0 ? "+" : ""}${diffAbs.toFixed(0)}` : "—";

                      return (
                        <div key={key} className="contents">
                          <div className="text-muted-foreground">{label}</div>
                          <div className="text-right">{source.toFixed(0)}</div>
                          <div className="text-right text-muted-foreground">+{added.toFixed(0)}</div>
                          <div className="text-right font-medium">{final.toFixed(0)}</div>
                          <div className="text-right">{target.toFixed(0)}</div>
                          <div className={`text-right font-medium ${isClose ? "text-green-600" : "text-red-600"}`}>
                            {diffText}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {(() => {
                    const finalSo4 = (sourceSnapshotLocal?.so4Ppm ?? 0) + (totals.so4Ppm ?? 0);
                    const finalCl = (sourceSnapshotLocal?.clPpm ?? 0) + (totals.clPpm ?? 0);
                    const ratio = finalCl > 0 ? finalSo4 / finalCl : 0;
                    const pos = Math.max(0, Math.min(100, ((ratio - 0.4) / 3.6) * 100));
                    const label =
                      ratio < 0.75 ? "Very Round" :
                      ratio < 1.5  ? "Balanced" :
                      ratio < 2.5  ? "Slightly Crisp" :
                      ratio < 3.5  ? "Crisp" : "Very Crisp";
                    return (
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">SO₄²⁻ / Cl⁻</span>
                          <span className="font-medium">{ratio.toFixed(2)} — {label}</span>
                        </div>
                        <div
                          className="relative h-3 rounded-full overflow-hidden"
                          style={{ background: "linear-gradient(to right, #fbbf24, #84cc16)" }}
                        >
                          <div className="absolute top-0 h-full w-px bg-black/30" style={{ left: "0%" }} />
                          <div className="absolute top-0 h-full w-px bg-black/30" style={{ left: "100%" }} />
                          <div
                            className="absolute top-0 h-full w-[3px] bg-white/90 rounded-sm shadow-sm"
                            style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                          <span>0.4</span>
                          <span>4</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <p className="text-sm font-medium text-muted-foreground">Salt Additions</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="w-44 shrink-0" />
                  <div className="w-24 shrink-0" />
                  <span className="shrink-0">g/L</span>
                  <div className="flex gap-4 min-w-0">
                    <span className="w-20 text-right font-medium">Mash</span>
                    {wv.spargeWater > 0 && (
                      <span className="w-20 text-right font-medium">Sparge</span>
                    )}
                  </div>
                </div>
                {SALT_DEFS.map(({ key, name, formula }) => {
                  const gl = salts[key];
                  const mashGrams = gl * wv.mashWater;
                  const spargeGrams = gl * wv.spargeWater;

                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className="w-44 shrink-0">
                        <span className="text-sm font-medium">{name}</span>
                        <span className="text-xs text-muted-foreground ml-1.5">{formula}</span>
                      </div>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={saltStrings[key]}
                        placeholder="0"
                        onChange={(e) => {
                          const raw = e.target.value.replace(",", ".");
                          setSaltStrings((prev) => ({ ...prev, [key]: raw }));
                          const val = raw === "" ? 0 : parseFloat(raw) || 0;
                          setSalts((prev) => ({ ...prev, [key]: val }));
                          scheduleSaltSave();
                        }}
                        className="w-24 h-7 text-sm shrink-0"
                      />
                      <span className="text-xs text-muted-foreground shrink-0">g/L</span>
                      <div className="flex gap-4 text-xs text-muted-foreground min-w-0">
                        <span className="w-20 text-right">{mashGrams > 0 ? `${mashGrams.toFixed(1)} g` : ""}</span>
                        {wv.spargeWater > 0 && (
                          <span className="w-20 text-right">{spargeGrams > 0 ? `${spargeGrams.toFixed(1)} g` : ""}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {acidCalc != null && (
                <div className="pt-4 border-t space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Acid Addition</p>
                  <div className="flex items-center gap-3">
                    <span className="w-44 text-sm shrink-0">Acid type</span>
                    <Select value={acidType} onValueChange={(v) => { setAcidType(v as AcidType); setAcidAmount(""); }}>
                      <SelectTrigger className="w-40 h-7 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lactic">Lactic 88%</SelectItem>
                        <SelectItem value="phosphoric">Phosphoric 10%</SelectItem>
                        <SelectItem value="citric">Citric</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-44 text-sm shrink-0">Amount</span>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={acidAmount}
                        onChange={(e) => setAcidAmount(e.target.value)}
                        className="w-24 h-7 text-sm"
                        placeholder="0"
                      />
                      <span className="text-sm text-muted-foreground">{acidType === "citric" ? "g" : "mL"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-44 text-sm shrink-0 text-muted-foreground">Est. mash pH</span>
                    <span className="text-sm tabular-nums font-medium">{acidCalc.mash.estimatedMashPh.toFixed(2)}</span>
                  </div>
                  {parseFloat(acidAmount) > 0 && (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="w-44 text-sm shrink-0 text-muted-foreground">Est. final mash pH</span>
                        <span className="text-sm tabular-nums font-medium">{acidCalc.mash.finalMashPh.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-44 text-sm shrink-0 text-muted-foreground">Diff to target</span>
                        <span className={`text-sm tabular-nums font-medium ${Math.abs(acidCalc.mash.phDiff) < 0.05 ? "text-green-600" : acidCalc.mash.phDiff > 0 ? "text-amber-600" : "text-blue-600"}`}>
                          {acidCalc.mash.phDiff > 0 ? "+" : ""}{acidCalc.mash.phDiff.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                  {acidCalc.sparge != null && (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="w-44 text-sm shrink-0 text-muted-foreground">Sparge acid needed</span>
                        {acidCalc.sparge.startingAlkalinityPpm < 25 ? (
                          <span className="text-sm text-muted-foreground italic">none needed</span>
                        ) : (
                          <span className="text-sm tabular-nums font-medium">
                            {acidCalc.sparge.doseMl != null
                              ? `${acidCalc.sparge.doseMl.toFixed(1)} mL`
                              : `${acidCalc.sparge.doseG!.toFixed(1)} g`}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })()}
      </CollapsibleCard>
    </div>
  );
}
