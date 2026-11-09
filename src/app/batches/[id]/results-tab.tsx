"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, ClipboardList, BarChart2, GlassWater } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "./collapsible-card";
import { sectionAnchorId, type SectionKey } from "./batch-sections-config";
import type { BatchGrain, BatchHop, EquipmentSnapshot } from "./batch-types";
import { srmToHex } from "@/lib/olfarve";
import { calculateIbuBreakdown, calculateSrm, estimateFg, abvFromGravity, measuredPostChillVolumeL } from "@/lib/calculations";
import { type BrewdayData } from "@/lib/brewday-types";
import { getStyleRange } from "@/lib/style-range";
import type { IbuBreakdown } from "@/lib/calculations";
import type { BeerSectionsProps } from "./beer-sections";

interface ResultsTabProps {
  batchId: string;
  brewday: BrewdayData;
  eqSnap: EquipmentSnapshot | null;
  estimatedOgSg: number | null;
  avgAttenuation: number | null;
  grainRows: BatchGrain[];
  hopRows: BatchHop[];
  grainExtractG: number;
  ibuBreakdown: IbuBreakdown;
  batchSize: number | null;
  boilTimeMin: number | null;
  whirpoolTimeMin: number | null;
  postChillL: number;
  fermenterVolL: number;
  fermenterLossL: number;
  styleEntry: Record<string, string> | null;
  tastings: BeerSectionsProps["tastings"];
  deleteTastingAction: BeerSectionsProps["deleteTastingAction"];
  importTastingAction: BeerSectionsProps["importTastingAction"];
  open: Record<SectionKey, boolean>;
  toggle: (key: SectionKey) => void;
}

/** Results tab: recipe vs. measured stats, brew day timing, and tastings. */
export function ResultsTab({
  batchId, brewday, eqSnap, estimatedOgSg, avgAttenuation, grainRows, hopRows, grainExtractG,
  ibuBreakdown, batchSize, boilTimeMin, whirpoolTimeMin, postChillL, fermenterVolL, fermenterLossL,
  styleEntry, tastings, deleteTastingAction, importTastingAction, open, toggle,
}: ResultsTabProps) {
  const router = useRouter();
  // Estimated values (from recipe)
  const firstAttenuation = avgAttenuation;
  const estOg = estimatedOgSg ?? null;
  const estOgInt = estOg != null ? Math.round(estOg * 1000) : null;
  const estFgInt = estOg != null && firstAttenuation != null
    ? Math.round(estimateFg(estOg, firstAttenuation) * 1000)
    : null;
  const estFg = estFgInt != null ? estFgInt / 1000 : null;
  const estAbv = estOg != null && estFg != null ? abvFromGravity(estOg, estFg) : null;
  // Same formula as fermentables: MCU over theoretical post-chill volume
  const estSrm = calculateSrm(grainRows, postChillL);
  const estIbu = ibuBreakdown.totalCalculatedIbu > 0 ? ibuBreakdown.totalCalculatedIbu : null;
  const estVol = batchSize;

  // Final values (from brewday fermentation steps)
  const stepsWithDensity = brewday.fermentation.steps.filter(s => s.densityGL != null);
  const finalOgInt = stepsWithDensity.length > 0 ? stepsWithDensity[0].densityGL! : null;
  const finalFgInt = stepsWithDensity.length > 1 ? stepsWithDensity[stepsWithDensity.length - 1].densityGL! : null;
  const finalAbv = finalOgInt != null && finalFgInt != null
    ? ((finalOgInt - finalFgInt) / 1000) * 131.25
    : null;
  const finalVol = brewday.fermentation.steps[0]?.volumeL ?? null;
  const estVolKegged = Math.max(0, fermenterVolL - fermenterLossL);
  const fgForKeg = stepsWithDensity.length > 0
    ? stepsWithDensity[stepsWithDensity.length - 1].densityGL! / 1000
    : null;
  const kegList = brewday.kegging.kegs ?? [];
  const rawVolKegged = fgForKeg != null
    ? kegList.reduce((sum, k) => {
        if (k.totalWeightKg == null || k.tareWeightKg == null) return sum;
        return sum + (k.totalWeightKg - k.tareWeightKg) / fgForKeg;
      }, 0)
    : 0;
  const finalVolKegged = rawVolKegged > 0 ? rawVolKegged : null;
  const finalIbu = finalOgInt != null
    ? (() => {
        const finalOgSg = finalOgInt / 1000;
        const actualVolumeL = finalVol ?? batchSize ?? 20;
        const result = calculateIbuBreakdown(hopRows, finalOgSg, actualVolumeL, boilTimeMin ?? 60, whirpoolTimeMin);
        return result.totalCalculatedIbu > 0 ? result.totalCalculatedIbu : null;
      })()
    : null;

  // Final SRM: grain bill over actual post-chill volume
  // = last boil entry volume (from heightCm + pot diameter, or stored volumeL) × thermal contraction
  // fallback: fermenter volume + trub loss
  const finalPostChillL = measuredPostChillVolumeL({
    boilEntries: brewday.boil.entries,
    potDiameterCm: eqSnap?.boilPotDiameter ?? null,
    tempContractionPct: eqSnap?.tempContractionPct,
    trubLossL: eqSnap?.trubLossL,
    fermenterVolumeL: finalVol,
  });
  const finalSrm = finalPostChillL != null ? calculateSrm(grainRows, finalPostChillL) : null;

  // Style ranges
  const styleOg  = getStyleRange(styleEntry, "ogmin",  "ogmax");
  const styleFg  = getStyleRange(styleEntry, "fgmin",  "fgmax");
  const styleIbu = getStyleRange(styleEntry, "ibumin", "ibumax");
  const styleSrm = getStyleRange(styleEntry, "srmmin", "srmmax");
  const styleAbv = getStyleRange(styleEntry, "abvmin", "abvmax");

  const inRange = (val: number | null, min: number | null, max: number | null): boolean | null => {
    if (val == null || min == null || max == null) return null;
    return val >= min && val <= max;
  };

  type OverviewRow = {
    label: string;
    styleMin: number | null;
    styleMax: number | null;
    estVal: number | null;
    finalVal: number | null;
    format: (v: number) => string;
    srmColor?: string | null;
    finalSrmColor?: string | null;
  };

  const rows: OverviewRow[] = [
    {
      label: "Vol Fermenter",
      styleMin: null, styleMax: null,
      estVal: estVol, finalVal: finalVol,
      format: (v) => `${v.toFixed(1)} L`,
    },
    {
      label: "Vol Kegged",
      styleMin: null, styleMax: null,
      estVal: estVolKegged, finalVal: finalVolKegged,
      format: (v) => `${v.toFixed(1)} L`,
    },
    {
      label: "OG",
      styleMin: styleOg.min != null ? Math.round(styleOg.min * 1000) : null,
      styleMax: styleOg.max != null ? Math.round(styleOg.max * 1000) : null,
      estVal: estOgInt, finalVal: finalOgInt,
      format: (v) => v.toFixed(0),
    },
    {
      label: "FG",
      styleMin: styleFg.min != null ? Math.round(styleFg.min * 1000) : null,
      styleMax: styleFg.max != null ? Math.round(styleFg.max * 1000) : null,
      estVal: estFgInt, finalVal: finalFgInt,
      format: (v) => v.toFixed(0),
    },
    {
      label: "Attenuation",
      styleMin: null, styleMax: null,
      estVal: firstAttenuation,
      finalVal: finalOgInt != null && finalFgInt != null && finalOgInt > 1000
        ? ((finalOgInt - finalFgInt) / (finalOgInt - 1000)) * 100
        : null,
      format: (v) => `${v.toFixed(1)}%`,
    },
    {
      label: "IBU",
      styleMin: styleIbu.min, styleMax: styleIbu.max,
      estVal: estIbu, finalVal: finalIbu,
      format: (v) => v.toFixed(1),
    },
    {
      label: "SRM",
      styleMin: styleSrm.min, styleMax: styleSrm.max,
      estVal: estSrm, finalVal: finalSrm,
      format: (v) => v.toFixed(1),
      srmColor: estSrm != null ? srmToHex(estSrm) : null,
      finalSrmColor: finalSrm != null ? srmToHex(finalSrm) : null,
    },
    {
      label: "ABV",
      styleMin: styleAbv.min, styleMax: styleAbv.max,
      estVal: estAbv, finalVal: finalAbv,
      format: (v) => `${v.toFixed(1)}%`,
    },
    {
      label: "BU:GU",
      styleMin: null, styleMax: null,
      estVal: estIbu != null && estOgInt != null && estOgInt > 1000 ? estIbu / (estOgInt - 1000) : null,
      finalVal: finalIbu != null && finalOgInt != null && finalOgInt > 1000 ? finalIbu / (finalOgInt - 1000) : null,
      format: (v) => {
        const lbl = v < 0.38 ? "Very Malty" : v < 0.45 ? "Malty" : v < 0.54 ? "Balanced" : v < 0.67 ? "Slightly Hoppy" : "Very Hoppy";
        return `${v.toFixed(2)} ${lbl}`;
      },
    },
  ];

  // Efficiency rows
  const sgToPlato = (sg: number) => {
    const k = 227.1 / 258.2;
    return (sg - 1) * 258.6 / (1 + k * (sg - 1));
  };
  const preboilData = brewday.preboil;
  const boilPotDiam = eqSnap?.boilPotDiameter ?? null;
  const preboilVolumeL = boilPotDiam != null && boilPotDiam > 0 && preboilData.heightCm != null
    ? Math.PI * Math.pow(boilPotDiam / 2, 2) * preboilData.heightCm / 1000
    : preboilData.volumeL ?? null;
  const realMashEff = preboilData.densityGL != null && preboilVolumeL != null && preboilVolumeL > 0 && grainExtractG > 0
    ? sgToPlato(preboilData.densityGL / 1000) * 1000 * preboilVolumeL / grainExtractG
    : null;
  const realBrewhouseEff = finalOgInt != null && finalVol != null && finalVol > 0 && grainExtractG > 0
    ? sgToPlato(finalOgInt / 1000) * 1000 * finalVol / grainExtractG
    : null;
  const effRows: OverviewRow[] = [
    {
      label: "Mash Eff",
      styleMin: null, styleMax: null,
      estVal: eqSnap?.mashEff ?? null,
      finalVal: realMashEff,
      format: (v) => `${v.toFixed(1)}%`,
    },
    {
      label: "Brew Eff",
      styleMin: null, styleMax: null,
      estVal: eqSnap?.brewhouseEff ?? null,
      finalVal: realBrewhouseEff,
      format: (v) => `${v.toFixed(1)}%`,
    },
  ];

  const parseHHMM = (s: string | null): Date | null => {
    if (!s) return null;
    const m = s.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const d = new Date(0);
    d.setHours(Number(m[1]), Number(m[2]), 0, 0);
    return d;
  };
  const diffMin = (a: Date | null, b: Date | null): number | null => {
    if (!a || !b) return null;
    let delta = (b.getTime() - a.getTime()) / 60000;
    if (delta < 0) delta += 24 * 60;
    return Math.round(delta);
  };
  const fmtHHMM = (t: Date | null) =>
    t != null ? `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}` : null;
  const fmtDur = (min: number | null): string | null => {
    if (min == null) return null;
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h > 0 && m > 0) return `${h} hs ${m} min`;
    if (h > 0) return `${h} hs`;
    return `${m} min`;
  };

  const boilEntries = brewday.boil.entries;
  const timingSteps = [
    { label: "Mash",      start: parseHHMM(brewday.mash.general.heatWaterTime ?? brewday.mash.general.mashStartTime), end: parseHHMM(brewday.sparge.recirculationStartTime ?? brewday.sparge.spargeStartTime) },
    { label: "Lautering", start: parseHHMM(brewday.sparge.recirculationStartTime ?? brewday.sparge.spargeStartTime),  end: parseHHMM(brewday.sparge.spargeEndTime) },
    { label: "Boil",      start: parseHHMM(boilEntries[0]?.time ?? null),                                             end: parseHHMM(boilEntries[boilEntries.length - 1]?.time ?? null) },
    { label: "Whirlpool", start: parseHHMM(brewday.whirlpoolChilling.whirlpoolStartTime),                             end: parseHHMM(brewday.whirlpoolChilling.chillingStartTime) },
    { label: "Chilling",  start: parseHHMM(brewday.whirlpoolChilling.chillingStartTime),                              end: parseHHMM(brewday.whirlpoolChilling.chillingEndTime) },
    { label: "Transfer",  start: parseHHMM(brewday.whirlpoolChilling.chillingEndTime),                                end: parseHHMM(brewday.whirlpoolChilling.transferEndTime) },
  ];
  const totalStart = timingSteps.find(s => s.start != null)?.start ?? null;
  const totalEnd = [...timingSteps].reverse().find(s => s.end != null)?.end ?? null;
  const totalMin = diffMin(totalStart, totalEnd);

  return (
    <>
      <CollapsibleCard
        id={sectionAnchorId("finalStatsOverview")}
        title="Overview"
        icon={<BarChart2 className="h-4 w-4" />}
        open={open.finalStatsOverview}
        onToggle={() => toggle("finalStatsOverview")}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground border-b">
              <th className="text-left pb-2 font-medium w-12">Stat</th>
              <th className="text-right pb-2 font-medium">Style</th>
              <th className="text-right pb-2 font-medium">Recipe</th>
              <th className="text-right pb-2 font-medium">Final</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ label, styleMin, styleMax, estVal, finalVal, format, srmColor, finalSrmColor }) => {
              const estInRange  = inRange(estVal,   styleMin, styleMax);
              const finalInRange = inRange(finalVal, styleMin, styleMax);
              const valClass = (ok: boolean | null) =>
                ok == null ? "text-foreground" : ok ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400";
              return (
                <tr key={label} className="border-b last:border-0">
                  <td className="py-1.5 font-medium text-muted-foreground text-xs">{label}</td>
                  <td className="text-right py-1.5 tabular-nums text-xs text-muted-foreground">
                    {styleMin != null || styleMax != null
                      ? `${styleMin ?? "?"} – ${styleMax ?? "?"}`
                      : "—"}
                  </td>
                  <td className="text-right py-1.5 tabular-nums font-medium">
                    {estVal != null ? (
                      <span className={`flex items-center justify-end gap-1.5 ${valClass(estInRange)}`}>
                        {srmColor && (
                          <span
                            className="inline-block w-3 h-3 rounded-sm shrink-0 border border-black/10"
                            style={{ background: srmColor }}
                          />
                        )}
                        {format(estVal)}
                      </span>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="text-right py-1.5 tabular-nums font-medium">
                    {finalVal != null ? (
                      <span className={`flex items-center justify-end gap-1.5 ${valClass(finalInRange)}`}>
                        {finalSrmColor && (
                          <span
                            className="inline-block w-3 h-3 rounded-sm shrink-0 border border-black/10"
                            style={{ background: finalSrmColor }}
                          />
                        )}
                        {format(finalVal)}
                      </span>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                </tr>
              );
            })}
            {effRows.map(({ label, estVal, finalVal, format }) => (
              <tr key={label} className="border-b last:border-0">
                <td className="py-1.5 font-medium text-muted-foreground text-xs">{label}</td>
                <td className="text-right py-1.5 tabular-nums text-xs text-muted-foreground">—</td>
                <td className="text-right py-1.5 tabular-nums font-medium">
                  {estVal != null ? format(estVal) : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="text-right py-1.5 tabular-nums font-medium">
                  {finalVal != null ? format(finalVal) : <span className="text-muted-foreground">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CollapsibleCard>
      <CollapsibleCard
        id={sectionAnchorId("finalStatsTiming")}
        title="Timing"
        icon={<ClipboardList className="h-4 w-4" />}
        open={open.finalStatsTiming}
        onToggle={() => toggle("finalStatsTiming")}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground border-b">
              <th className="text-left pb-2 font-medium">Step</th>
              <th className="text-right pb-2 font-medium">Start</th>
              <th className="text-right pb-2 font-medium">End</th>
              <th className="text-right pb-2 font-medium">Duration</th>
            </tr>
          </thead>
          <tbody>
            {timingSteps.map(({ label, start, end }) => {
              const dur = diffMin(start, end);
              return (
                <tr key={label} className="border-b last:border-0">
                  <td className="py-1.5 text-xs text-muted-foreground font-medium">{label}</td>
                  <td className="text-right py-1.5 tabular-nums text-xs">{fmtHHMM(start) ?? <span className="text-muted-foreground">—</span>}</td>
                  <td className="text-right py-1.5 tabular-nums text-xs">{fmtHHMM(end) ?? <span className="text-muted-foreground">—</span>}</td>
                  <td className="text-right py-1.5 tabular-nums font-medium">{fmtDur(dur) ?? <span className="text-muted-foreground">—</span>}</td>
                </tr>
              );
            })}
          </tbody>
          {totalMin != null && (
            <tfoot>
              <tr className="border-t">
                <td colSpan={3} className="pt-2 text-xs font-medium">Total</td>
                <td className="text-right pt-2 tabular-nums font-bold">{fmtDur(totalMin)}</td>
              </tr>
            </tfoot>
          )}
        </table>

        {(() => {
          const parseDateTime = (s: string | null): Date | null => {
            if (!s) return null;
            const d = new Date(s);
            return isNaN(d.getTime()) ? null : d;
          };
          const fmtDT = (d: Date | null) =>
            d != null
              ? `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
              : null;
          const fmtFermDur = (ms: number): string => {
            const totalMin = Math.round(ms / 60000);
            const days = Math.floor(totalMin / (60 * 24));
            const hrs = Math.floor((totalMin % (60 * 24)) / 60);
            if (days > 0 && hrs > 0) return `${days} days ${hrs} hs`;
            if (days > 0) return `${days} days`;
            return `${hrs} hs`;
          };

          const fermSteps = brewday.fermentation.steps;
          const startDate = parseDateTime(fermSteps[0]?.dateTime ?? null);
          const endDate = parseDateTime(brewday.kegging.dateTime ?? fermSteps[fermSteps.length - 1]?.dateTime ?? null);
          const diffMs = startDate != null && endDate != null && endDate !== startDate ? endDate.getTime() - startDate.getTime() : null;

          if (startDate == null && endDate == null) return null;

          return (
            <table className="w-full text-sm mt-4">
              <thead>
                <tr className="text-xs text-muted-foreground border-b">
                  <th className="text-left pb-2 font-medium">Period</th>
                  <th className="text-right pb-2 font-medium">Start</th>
                  <th className="text-right pb-2 font-medium">End</th>
                  <th className="text-right pb-2 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-1.5 text-xs text-muted-foreground font-medium">Fermentation</td>
                  <td className="text-right py-1.5 tabular-nums text-xs">{fmtDT(startDate) ?? <span className="text-muted-foreground">—</span>}</td>
                  <td className="text-right py-1.5 tabular-nums text-xs">{fmtDT(endDate) ?? <span className="text-muted-foreground">—</span>}</td>
                  <td className="text-right py-1.5 tabular-nums font-medium">{diffMs != null ? fmtFermDur(diffMs) : <span className="text-muted-foreground">—</span>}</td>
                </tr>
              </tbody>
            </table>
          );
        })()}
      </CollapsibleCard>

      {/* ── Tastings ── */}
      <CollapsibleCard
        id={sectionAnchorId("finalStatsTastings")}
        title="Tastings"
        icon={<GlassWater className="h-4 w-4" />}
        open={open.finalStatsTastings}
        onToggle={() => toggle("finalStatsTastings")}
        actions={
          <div className="flex items-center gap-1.5">
            <label
              className="cursor-pointer inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border border-border hover:bg-muted transition-colors font-medium"
              title="Import from Brewtaste JSON"
            >
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const text = await file.text();
                  try {
                    JSON.parse(text); // validate JSON
                    await importTastingAction(text);
                    router.refresh();
                    toast.success("Tasting imported");
                  } catch {
                    toast.error("Invalid Brewtaste JSON file");
                  }
                  e.target.value = '';
                }}
              />
              Import
            </label>
            <Link href={`/batches/${batchId}/tastings/new`}>
              <Button size="sm" variant="outline">Add Tasting</Button>
            </Link>
          </div>
        }
      >
        {tastings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No tastings logged yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b">
                <th className="text-left pb-2 font-medium">Date</th>
                <th className="text-left pb-2 font-medium">Serving</th>
                <th className="text-right pb-2 font-medium">Age</th>
                <th className="text-right pb-2 font-medium">Score</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {tastings.map((t) => {
                const packagingDateStr = brewday.kegging.dateTime ?? brewday.bottling.dateTime;
                const packagingDate = packagingDateStr ? (() => { const d = new Date(packagingDateStr); return isNaN(d.getTime()) ? null : d; })() : null;
                const tastingDate = new Date(t.date);
                const ageMs = packagingDate ? tastingDate.getTime() - packagingDate.getTime() : null;
                const ageDays = ageMs != null ? Math.round(ageMs / (1000 * 60 * 60 * 24)) : null;
                return (
                  <tr
                    key={t.id}
                    className="border-b last:border-0 hover:bg-muted/40 cursor-pointer"
                    onClick={() => router.push(`/batches/${batchId}/tastings/${t.id}`)}
                  >
                    <td className="py-1.5 text-xs">{tastingDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td className="py-1.5 text-xs capitalize">{t.servingType}</td>
                    <td className="py-1.5 text-right text-xs tabular-nums">{ageDays != null ? `${ageDays}d` : <span className="text-muted-foreground">—</span>}</td>
                    <td className="py-1.5 text-right text-xs tabular-nums font-medium">{t.totalScore != null ? `${t.totalScore}/50` : <span className="text-muted-foreground">—</span>}</td>
                    <td className="py-1.5 text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!confirm("Delete this tasting?")) return;
                          try {
                            await deleteTastingAction(t.id);
                            toast.success("Tasting deleted");
                            router.refresh();
                          } catch {
                            toast.error("Failed to delete tasting");
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </CollapsibleCard>
    </>
  );
}
