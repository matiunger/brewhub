"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BatchForm } from "./batch-form";
import stylesData from "../../../../styles.json";

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

// ---------- Interfaces ----------

interface Grain {
  id: string;
  name: string;
  brand: string | null;
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
    targetOg: number | null;
    targetFg: number | null;
    targetIbu: number | null;
    targetSrm: number | null;
  };
  stats: Stats;
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
  }) => Promise<void>;
}

type SectionKey = "basicInfo" | "recipeOverview" | "fermentables" | "hops" | "cultures";

const SECTION_DEFAULTS: Record<SectionKey, boolean> = {
  basicInfo: true,
  recipeOverview: true,
  fermentables: true,
  hops: true,
  cultures: true,
};

// ---------- CollapsibleCard ----------

function CollapsibleCard({
  title,
  open,
  onToggle,
  actions,
  children,
}: {
  title: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className={`p-4 px-0 ${open ? "pt-2" : "border-b"}`}>
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
  grains,
  hops,
  yeasts,
  updateAction,
  updateNotesAction,
  updateTargetStatsAction,
}: BeerSectionsProps) {
  const storageKey = `brewhub:batch:${batchId}:sections`;

  const [open, setOpen] = useState<Record<SectionKey, boolean>>(SECTION_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  const [targets, setTargets] = useState<Record<TargetKey, number | null>>({
    og: batch.targetOg,
    fg: batch.targetFg,
    ibu: batch.targetIbu,
    srm: batch.targetSrm,
  });

  const targetsRef = useRef(targets);
  targetsRef.current = targets;
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
        });
      } catch {
        toast.error("Failed to save targets");
      }
    }, 800);
  }, [updateTargetStatsAction]);

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
    } catch {
      // ignore
    }
    setHydrated(true);
  }, [storageKey]);

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

  if (!hydrated) return null;

  return (
    <div className="space-y-4">
      {/* 1. Basic Information */}
      <CollapsibleCard
        title="Basic Information"
        open={open.basicInfo}
        onToggle={() => toggle("basicInfo")}
      >
        <BatchForm batch={batch} updateAction={updateAction} updateNotesAction={updateNotesAction} bare />
      </CollapsibleCard>

      {/* 2. Recipe Overview */}
      <CollapsibleCard
        title="Recipe Overview"
        open={open.recipeOverview}
        onToggle={() => toggle("recipeOverview")}
      >
        <div className="space-y-3">
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground pb-1">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-3.5 rounded-sm bg-foreground/70" />
              Target
            </span>
            {batch.style && (
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-4 h-3.5 rounded-sm bg-green-500/30 border border-green-500/50" />
                Style range
              </span>
            )}
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

            return (
              <div key={cfg.key} className="space-y-0">
                <div className="flex items-center gap-3">
                  <span className="w-8 text-sm font-medium shrink-0 flex items-center gap-0.5">
                    {cfg.label}
                    {cfg.key === "fg" && suggestedFg != null && (
                      <div className="relative group">
                        <Info className="h-3 w-3 text-muted-foreground/50 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-max bg-popover text-popover-foreground text-xs rounded-md border shadow-md px-2.5 py-1.5 whitespace-nowrap">
                          Suggested FG: <strong>{suggestedFg}</strong>
                          <span className="text-muted-foreground ml-1">
                            ({firstAttenuation}% attenuation)
                          </span>
                        </div>
                      </div>
                    )}
                  </span>
                  <div className="flex-1">
                    <StyleRangeBar
                      absoluteMin={cfg.absMin}
                      absoluteMax={cfg.absMax}
                      styleMin={sMin}
                      styleMax={sMax}
                      targetValue={targetVal}
                    />
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
                  <Input
                    type="number"
                    step={cfg.step}
                    value={targetVal ?? ""}
                    onChange={(e) => handleTargetChange(cfg.key, e.target.value)}
                    placeholder={calcVal.toFixed(cfg.decimals)}
                    className="w-24 h-7 text-sm shrink-0"
                  />
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
                  <div className="w-24 h-7 flex items-center shrink-0">
                    <span className="text-sm font-medium tabular-nums">
                      {(targetAbv ?? stats.abv).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </CollapsibleCard>

      {/* 3. Fermentables */}
      <CollapsibleCard
        title={`Fermentables (${grains.length})`}
        open={open.fermentables}
        onToggle={() => toggle("fermentables")}
        actions={
          <Link href={`/batches/${batchId}/grains/new`}>
            <Button size="sm">+ Add</Button>
          </Link>
        }
      >
        {grains.length > 0 ? (
          <div className="space-y-2">
            {grains.map((bg) => (
              <div key={bg.id} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <p className="font-medium">{bg.grain.name}</p>
                  {bg.grain.brand && <p className="text-sm text-muted-foreground">{bg.grain.brand}</p>}
                </div>
                <p className="font-semibold">{bg.grams} g</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No fermentables added yet</p>
        )}
      </CollapsibleCard>

      {/* 4. Hops */}
      <CollapsibleCard
        title={`Hops (${hops.length})`}
        open={open.hops}
        onToggle={() => toggle("hops")}
        actions={
          <Link href={`/batches/${batchId}/hops/new`}>
            <Button size="sm">+ Add</Button>
          </Link>
        }
      >
        {hops.length > 0 ? (
          <div className="space-y-2">
            {hops.map((bh) => (
              <div key={bh.id} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <p className="font-medium">{bh.hop.name}</p>
                  <p className="text-sm text-muted-foreground">{bh.use} @ {bh.additionTime} min</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{bh.grams} g</p>
                  <p className="text-sm text-muted-foreground">{bh.hop.alphaAcid}% AA</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No hops added yet</p>
        )}
      </CollapsibleCard>

      {/* 5. Cultures */}
      <CollapsibleCard
        title={`Cultures (${yeasts.length})`}
        open={open.cultures}
        onToggle={() => toggle("cultures")}
        actions={
          <Link href={`/batches/${batchId}/yeasts/new`}>
            <Button size="sm">+ Add</Button>
          </Link>
        }
      >
        {yeasts.length > 0 ? (
          <div className="space-y-2">
            {yeasts.map((by) => (
              <div key={by.id} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <p className="font-medium">{by.yeast.name}</p>
                  {by.yeast.brand && <p className="text-sm text-muted-foreground">{by.yeast.brand}</p>}
                </div>
                <div className="text-right">
                  <p className="font-semibold">{by.quantity}</p>
                  {by.temp && <p className="text-sm text-muted-foreground">{by.temp}°C</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No cultures added yet</p>
        )}
      </CollapsibleCard>
    </div>
  );
}
