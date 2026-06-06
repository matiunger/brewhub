"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, ClipboardList, Settings2, Layers, GlassWater, Flame, Snowflake, FlaskConical, Package, Filter, Barrel } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CollapsibleCard } from "./beer-sections";
import {
  type BrewdayData,
  type MashData,
  type MashStepEntry,
  type SpargeData,
  type PreboilData,
  type LastRunData,
  type BoilData,
  type WhirlpoolChillingData,
  type FermentationData,
  type FermentationStep,
  type KeggingData,
  type LageringData,
  type BottlingData,
  type KegEntry,
  type BoilEntry,
} from "@/lib/brewday-types";
import { type StepInfusionResult } from "@/lib/calculations";

// ---- carbonation ----

const CARB_PRESETS = [
  { label: "Very Low",    vols: 1.2 },
  { label: "Low",         vols: 1.5 },
  { label: "Low-Medium",  vols: 1.8 },
  { label: "Medium-Low",  vols: 2.1 },
  { label: "Medium",      vols: 2.4 },
  { label: "Medium-High", vols: 2.6 },
  { label: "High",        vols: 2.8 },
  { label: "Very High",   vols: 3.0 },
  { label: "Extra High",  vols: 3.3 },
  { label: "Maximum",     vols: 3.5 },
] as const;

/** Gauge pressure from carbonation — returns { psi, bar } */
function calcCarbPressure(vols: number, tempC: number): { psi: number; bar: number } {
  const T = tempC * 9 / 5 + 32; // °C → °F
  const V = vols;
  const psi = Math.max(0,
    -16.6999 - 0.0101059 * T + 0.00116512 * T * T + 0.173354 * T * V + 4.24267 * V - 0.0684226 * V * V
  );
  return { psi, bar: psi * 0.0689476 };
}

// ---- helpers ----

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs text-muted-foreground whitespace-nowrap">{children}</span>;
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

function NumInput({ value, onChange, placeholder, className }: { value: number | null; onChange: (v: number | null) => void; placeholder?: string; className?: string }) {
  return (
    <NumberInput
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      placeholder={placeholder ?? "—"}
      className={`h-7 text-sm w-full ${className ?? ""}`}
    />
  );
}

function TimeInput({ value, onChange, className }: { value: string | null; onChange: (v: string | null) => void; className?: string }) {
  return (
    <Input
      type="time"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className={`h-7 text-sm w-full ${className ?? ""}`}
    />
  );
}

function TextInput({ value, onChange, placeholder, className }: { value: string | null; onChange: (v: string | null) => void; placeholder?: string; className?: string }) {
  return (
    <Input
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      placeholder={placeholder ?? "—"}
      className={`h-7 text-sm w-full ${className ?? ""}`}
    />
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{children}</h4>;
}

function CheckRow({ checked, onCheckedChange, label }: { checked: boolean; onCheckedChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={(v) => onCheckedChange(v === true)} />
      {label}
    </label>
  );
}

function calcStepMin(firstHora: string | null, hora: string | null): number | null {
  if (!firstHora || !hora) return null;
  const [fh, fm] = firstHora.split(":").map(Number);
  const [h, m] = hora.split(":").map(Number);
  const diff = (h * 60 + m) - (fh * 60 + fm);
  return diff >= 0 ? diff : null;
}

function RecipeRef({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function SaltRef({ label, grams }: { label: string; grams: number }) {
  if (grams <= 0) return null;
  return (
    <div className="flex items-baseline gap-1 text-xs">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium tabular-nums">{grams.toFixed(1)} g</span>
    </div>
  );
}

// ---- Main component ----

export interface RecipeData {
  mashMode: "sparge" | "biab" | "step_infusion";
  mashWaterL: number;
  spargeWaterL: number;
  saltMash: { cacl2: number; gypsum: number; epsom: number; nacl: number; chalk: number; bakingSoda: number };
  saltSparge: { cacl2: number; gypsum: number; epsom: number; nacl: number; chalk: number; bakingSoda: number };
  acidType: string;
  spargeAcid: { doseMl: number | null; doseG: number | null; needed: boolean } | null;
  grainTempC: number;
  firstMashTempC: number | null;
  mashRatio: number;
  mashPotDiameterCm: number | null;
  mashPotVolumeL: number | null;
  spargePotDiameterCm: number | null;
  mashAcidDose: number | null;
  mashAcidUnit: string;
  mashAcidLabel: string;
  spargeTargetPh: number | null;
  targetPh: number | null;
  preHeatUpL: number;
  preHeatUpHeightCm: number | null;
  preBoilDensityGL: number | null;
  preBoilL: number;
  endOfBoilL: number;
  boilTimeMin: number;
  boilHops: Array<{ name: string; grams: number; additionTime: number }>;
  targetOg: number | null;
  fermenterWeightKg: number | null;
  brewDate: Date | null;
  stepInfusionSchedule: StepInfusionResult[] | null;
  mashStepNames: string[];
}

function FermentationSection({
  fermentation,
  setFermentation,
  addStep,
  removeStep,
  setStep,
  og,
  fermenterWeightKg,
  startingGasTankKg,
  brewDate,
  open,
  onToggle,
}: {
  fermentation: FermentationData;
  setFermentation: (key: keyof FermentationData, val: string | number | boolean | null) => void;
  addStep: () => void;
  removeStep: (id: string) => void;
  setStep: (id: string, key: keyof FermentationStep, val: string | number | null) => void;
  og: number | null;
  fermenterWeightKg: number | null;
  startingGasTankKg: number | null;
  brewDate: Date | null;
  open: boolean;
  onToggle: () => void;
}) {
  const [mode, setMode] = useState<"direct" | "weight">("direct");
  const [notesModalId, setNotesModalId] = useState<string | null>(null);
  const [curves, setCurves] = useState(new Set<"gravity" | "activity" | "temp" | "pressure">(["gravity", "activity"]));

  const brewDateDefault = brewDate
    ? brewDate.toISOString().slice(0, 16)
    : null;

  const computedLiquidKg =
    mode === "weight" &&
    fermentation.totalWeightKg != null &&
    fermenterWeightKg != null
      ? Math.max(0, fermentation.totalWeightKg - fermenterWeightKg)
      : null;

  const computedVolumenL =
    computedLiquidKg != null && og != null && og > 0
      ? computedLiquidKg / og
      : null;

  return (
    <CollapsibleCard title="Fermentation" icon={<FlaskConical className="h-4 w-4" />} open={open} onToggle={onToggle}>
      <div className="space-y-3">
        {/* Mode toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("direct")}
            className={`px-3 py-1 text-xs rounded border transition-colors ${
              mode === "direct"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Volume
          </button>
          <button
            type="button"
            onClick={() => setMode("weight")}
            className={`px-3 py-1 text-xs rounded border transition-colors ${
              mode === "weight"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Weight-based
          </button>
        </div>

        {mode === "direct" ? (
          <FieldGroup label="Volume L">
            <NumInput value={fermentation.volumeL} onChange={(v) => setFermentation("volumeL", v)} />
          </FieldGroup>
        ) : (
          <div className="space-y-3">
            <FieldGroup label="Total fermenter weight kg">
              <NumInput value={fermentation.totalWeightKg} onChange={(v) => setFermentation("totalWeightKg", v)} />
            </FieldGroup>
            {fermenterWeightKg != null && (
              <div className="text-xs text-muted-foreground">
                Fermenter empty weight: <span className="font-medium text-foreground">{fermenterWeightKg} kg</span> (from equipment)
              </div>
            )}
            {fermenterWeightKg == null && (
              <div className="text-xs text-amber-500">No fermenter empty weight set in equipment.</div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="Liquid weight kg">
                <div className="h-7 flex items-center px-2 bg-muted rounded text-sm font-medium text-foreground">
                  {computedLiquidKg != null ? computedLiquidKg.toFixed(2) : "—"}
                </div>
              </FieldGroup>
              <FieldGroup label={`Volume L${og != null ? ` (OG ${og.toFixed(3)})` : " (no OG)"}`}>
                <div className="h-7 flex items-center px-2 bg-muted rounded text-sm font-medium text-foreground">
                  {computedVolumenL != null ? computedVolumenL.toFixed(2) : "—"}
                </div>
              </FieldGroup>
            </div>
          </div>
        )}

        <div className="flex items-end gap-3">
          <FieldGroup label="End gas weight kg">
            <NumInput value={fermentation.endGasTankKg} onChange={(v) => setFermentation("endGasTankKg", v)} />
          </FieldGroup>
          {fermentation.endGasTankKg != null && startingGasTankKg != null && (
            <span className="h-7 flex items-center text-sm text-muted-foreground tabular-nums">
              {(startingGasTankKg - fermentation.endGasTankKg) >= 0 ? "−" : "+"}{Math.abs(startingGasTankKg - fermentation.endGasTankKg).toFixed(2)} kg
            </span>
          )}
        </div>

        {/* Starter notes */}
        <div className="space-y-1">
          <SubTitle>Starter notes</SubTitle>
          <Textarea
            value={fermentation.starterNotes ?? ""}
            onChange={(e) => setFermentation("starterNotes", e.target.value || null)}
            placeholder="Describe how the starter was prepared…"
            className="text-sm min-h-[72px]"
          />
        </div>

        {/* Follow-up table */}
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left py-1 px-2 font-medium text-muted-foreground whitespace-nowrap">Step</th>
                <th className="text-left py-1 px-2 font-medium text-muted-foreground whitespace-nowrap">Date &amp; time</th>
                <th className="text-left py-1 px-2 font-medium text-muted-foreground whitespace-nowrap">Hs</th>
                <th className="text-left py-1 px-2 font-medium text-muted-foreground whitespace-nowrap">Days</th>
                <th className="text-left py-1 px-2 font-medium text-muted-foreground whitespace-nowrap">Vol L</th>
                <th className="text-left py-1 px-2 font-medium text-muted-foreground whitespace-nowrap">Density</th>
                <th className="text-left py-1 px-2 font-medium text-muted-foreground whitespace-nowrap">pH</th>
                <th className="text-left py-1 px-2 font-medium text-muted-foreground whitespace-nowrap">Temp °C</th>
                <th className="text-left py-1 px-2 font-medium text-muted-foreground whitespace-nowrap">Pressure</th>
                <th className="text-left py-1 px-2 font-medium text-muted-foreground whitespace-nowrap">Bubble s</th>
                <th className="text-left py-1 px-2 font-medium text-muted-foreground whitespace-nowrap">Notes</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {fermentation.steps.map((step, idx) => {
                const isPitching = step.id === "pitching";
                const pitchingStep = fermentation.steps.find(s => s.id === "pitching");
                const pitchingDt = pitchingStep?.dateTime ? new Date(pitchingStep.dateTime) : null;
                const stepDt = step.dateTime ? new Date(step.dateTime) : null;
                const diffMs = pitchingDt && stepDt && !isPitching ? stepDt.getTime() - pitchingDt.getTime() : null;
                const diffHs = diffMs != null ? diffMs / 1000 / 3600 : null;
                const diffDays = diffHs != null ? diffHs / 24 : null;

                return (
                  <tr key={step.id} className="border-b last:border-0">
                    <td className="py-1 px-2 text-muted-foreground whitespace-nowrap">
                      {isPitching ? "Pitching" : `Day ${idx}`}
                    </td>
                    <td className="py-1 px-2">
                      <Input
                        type="datetime-local"
                        value={step.dateTime ?? (isPitching ? (brewDateDefault ?? "") : "")}
                        onChange={(e) => setStep(step.id, "dateTime", e.target.value || null)}
                        className="h-7 text-xs w-52"
                      />
                    </td>
                    <td className="py-1 px-2 tabular-nums text-muted-foreground whitespace-nowrap">
                      {diffHs != null ? diffHs.toFixed(1) : ""}
                    </td>
                    <td className="py-1 px-2 tabular-nums text-muted-foreground whitespace-nowrap">
                      {diffDays != null ? diffDays.toFixed(1) : ""}
                    </td>
                    <td className="py-1 px-2">
                      <NumInput value={step.volumeL} onChange={(v) => setStep(step.id, "volumeL", v)} className="w-16" />
                    </td>
                    <td className="py-1 px-2">
                      <NumInput value={step.densityGL} onChange={(v) => setStep(step.id, "densityGL", v)} className="w-16" />
                    </td>
                    <td className="py-1 px-2">
                      <NumInput value={step.ph} onChange={(v) => setStep(step.id, "ph", v)} className="w-14" />
                    </td>
                    <td className="py-1 px-2">
                      <NumInput value={step.tempC} onChange={(v) => setStep(step.id, "tempC", v)} className="w-14" />
                    </td>
                    <td className="py-1 px-2">
                      <NumInput value={step.pressureBar} onChange={(v) => setStep(step.id, "pressureBar", v)} className="w-14" />
                    </td>
                    <td className="py-1 px-2">
                      <NumInput value={step.bubbleIntervalSec} onChange={(v) => setStep(step.id, "bubbleIntervalSec", v)} className="w-14" />
                    </td>
                    <td className="py-1 px-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 ${step.notes ? "text-foreground" : "text-muted-foreground"}`}
                        onClick={() => setNotesModalId(step.id)}
                      >
                        <FileText className="h-3 w-3" />
                      </Button>
                    </td>
                    <td className="py-1 px-1">
                      {!isPitching && (
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeStep(step.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-2 py-1 border-t">
            <Button type="button" variant="outline" size="sm" onClick={addStep} className="h-6 text-xs px-2">
              <Plus className="h-3 w-3 mr-1" /> Add step
            </Button>
          </div>
        </div>

        {/* Fermentation chart */}
        {(() => {
          const allSteps = fermentation.steps;
          const rawPoints = allSteps
            .filter(s => s.densityGL != null && s.densityGL >= 950 && s.densityGL <= 1300)
            .map(s => ({
              stepIdx: allSteps.indexOf(s),
              t: s.dateTime != null ? new Date(s.dateTime).getTime() : null,
              d: s.densityGL!,
              b: s.bubbleIntervalSec,
            }));

          if (rawPoints.length < 2) return null;

          const hasTime = rawPoints.every(p => p.t != null);
          const points = rawPoints.map(p => ({ x: hasTime ? p.t! : p.stepIdx, d: p.d, b: p.b }));
          if (hasTime) points.sort((a, b) => a.x - b.x);

          // Temp and pressure points across all steps
          const tempPts = allSteps
            .filter(s => s.tempC != null && (!hasTime || s.dateTime != null))
            .map(s => ({ x: hasTime ? new Date(s.dateTime!).getTime() : allSteps.indexOf(s), v: s.tempC! }))
            .sort((a, b) => a.x - b.x);
          const pressPts = allSteps
            .filter(s => s.pressureBar != null && s.pressureBar >= 0 && (!hasTime || s.dateTime != null))
            .map(s => ({ x: hasTime ? new Date(s.dateTime!).getTime() : allSteps.indexOf(s), v: s.pressureBar! }))
            .sort((a, b) => a.x - b.x);

          const W = 600, padL = 48, padR = 16, padT = 40, padB = 28;

          // X range covers all visible curve data
          const bubbleXs: number[] = hasTime
            ? allSteps.filter(s => s.bubbleIntervalSec != null && s.bubbleIntervalSec > 0 && s.dateTime != null)
                .map(s => new Date(s.dateTime!).getTime())
            : [];
          const allXVals = [
            ...points.map(p => p.x),
            ...bubbleXs,
            ...(curves.has("temp") ? tempPts.map(p => p.x) : []),
            ...(curves.has("pressure") ? pressPts.map(p => p.x) : []),
          ];
          const minX = Math.min(...allXVals);
          const maxX = Math.max(...allXVals);

          // H adapts to day span: taller chart for longer fermentations
          const totalDays = hasTime ? (maxX - minX) / 86400000 : points.length - 1;
          const innerH = Math.max(140, Math.min(220, Math.round(140 + totalDays * 4)));
          const H = padT + padB + innerH;
          const innerW = W - padL - padR;
          const rawMaxD = Math.max(...points.map(p => p.d));
          const rawMinD = Math.min(...points.map(p => p.d));
          const minD = Math.floor((rawMinD - 5) / 10) * 10;
          const maxD = Math.ceil((rawMaxD + 5) / 10) * 10;
          const dRange = maxD - minD || 1;

          const xScale = (x: number) => minX === maxX ? innerW / 2 : ((x - minX) / (maxX - minX)) * innerW;
          const yScale = (d: number) => innerH - ((d - minD) / dRange) * innerH;
          const screenX = (x: number) => padL + xScale(x);

          const coords = points.map(p => ({ x: screenX(p.x), y: padT + yScale(p.d) }));

          // Activity (bubble) curve
          let bubbleActivityPts: { x: number; b: number }[];
          if (hasTime) {
            bubbleActivityPts = allSteps
              .filter(s => s.bubbleIntervalSec != null && s.bubbleIntervalSec > 0 && s.dateTime != null)
              .map(s => ({ x: new Date(s.dateTime!).getTime(), b: s.bubbleIntervalSec! }))
              .sort((a, b) => a.x - b.x)
              .map(p => ({ x: screenX(p.x), b: p.b }));
          } else {
            bubbleActivityPts = points
              .map((p, i) => ({ x: coords[i].x, b: p.b }))
              .filter((p): p is { x: number; b: number } => p.b != null && p.b > 0);
          }
          let speedPathD = "";
          if (bubbleActivityPts.length >= 2) {
            const activities = bubbleActivityPts.map(p => 1 / p.b);
            const bxs = bubbleActivityPts.map(p => p.x);
            const lagrange = (x: number) => {
              let result = 0;
              for (let i = 0; i < bxs.length; i++) {
                let term = activities[i];
                for (let j = 0; j < bxs.length; j++) {
                  if (j !== i) term *= (x - bxs[j]) / (bxs[i] - bxs[j]);
                }
                result += term;
              }
              return result;
            };
            const samples = 80;
            const bx0 = bxs[0], bx1 = bxs[bxs.length - 1];
            const sampled = Array.from({ length: samples }, (_, i) => ({
              x: bx0 + (i / (samples - 1)) * (bx1 - bx0),
              v: lagrange(bx0 + (i / (samples - 1)) * (bx1 - bx0)),
            }));
            const actMin = Math.min(0, ...sampled.map(s => s.v));
            const actMax = Math.max(...sampled.map(s => s.v));
            const actRange = actMax - actMin || 1;
            speedPathD = sampled.map((s, i) => {
              const y = (s.v - actMin) / actRange;
              const cy = padT + innerH - y * innerH;
              return i === 0 ? `M ${s.x.toFixed(1)} ${cy.toFixed(1)}` : `L ${s.x.toFixed(1)} ${cy.toFixed(1)}`;
            }).join(" ");
          }

          // Helper: normalized monotone cubic spline (each curve fills chart height)
          const normalizedCurve = (pts: { x: number; v: number }[]): { path: string; screenPts: { x: number; y: number; v: number }[] } => {
            if (pts.length < 2) return { path: "", screenPts: [] };
            const minV = Math.min(...pts.map(p => p.v));
            const maxV = Math.max(...pts.map(p => p.v));
            const vRange = maxV - minV || 1;
            const sxs = pts.map(p => screenX(p.x));
            const sys = pts.map(p => padT + innerH - ((p.v - minV) / vRange) * innerH);
            const cn = sxs.length;
            const cdelta = Array.from({ length: cn - 1 }, (_, i) => (sys[i + 1] - sys[i]) / (sxs[i + 1] - sxs[i]));
            const cm = new Array<number>(cn);
            cm[0] = cdelta[0]; cm[cn - 1] = cdelta[cn - 2];
            for (let i = 1; i < cn - 1; i++) cm[i] = (cdelta[i - 1] + cdelta[i]) / 2;
            for (let i = 0; i < cn - 1; i++) {
              if (Math.abs(cdelta[i]) < 1e-10) { cm[i] = 0; cm[i + 1] = 0; }
              else {
                const ca = cm[i] / cdelta[i], cb = cm[i + 1] / cdelta[i];
                const ch = Math.hypot(ca, cb);
                if (ch > 3) { cm[i] = 3 * cdelta[i] / ch * ca; cm[i + 1] = 3 * cdelta[i] / ch * cb; }
              }
            }
            const cspline = (x: number) => {
              let lo = 0, hi = cn - 1;
              while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (sxs[mid] <= x) lo = mid; else hi = mid; }
              if (x <= sxs[lo]) return sys[lo];
              if (x >= sxs[hi]) return sys[hi];
              const hx = sxs[hi] - sxs[lo], t = (x - sxs[lo]) / hx;
              return (2*t*t*t - 3*t*t + 1)*sys[lo] + (t*t*t - 2*t*t + t)*hx*cm[lo]
                + (-2*t*t*t + 3*t*t)*sys[hi] + (t*t*t - t*t)*hx*cm[hi];
            };
            const path = Array.from({ length: 80 }, (_, i) => {
              const sx = sxs[0] + (i / 79) * (sxs[cn - 1] - sxs[0]);
              return i === 0 ? `M ${sx.toFixed(1)} ${cspline(sx).toFixed(1)}` : `L ${sx.toFixed(1)} ${cspline(sx).toFixed(1)}`;
            }).join(" ");
            return { path, screenPts: pts.map((p, i) => ({ x: sxs[i], y: sys[i], v: p.v })) };
          };

          const { path: tempPathD, screenPts: tempScreenPts } = curves.has("temp") && tempPts.length >= 2
            ? normalizedCurve(tempPts) : { path: "", screenPts: [] };
          const { path: pressPathD, screenPts: pressScreenPts } = curves.has("pressure") && pressPts.length >= 2
            ? normalizedCurve(pressPts) : { path: "", screenPts: [] };

          // Gravity spline (Fritsch-Carlson monotone cubic)
          const dxs = coords.map(c => c.x);
          const dys = points.map(p => p.d);
          const n = dxs.length;
          const delta = Array.from({ length: n - 1 }, (_, i) => (dys[i + 1] - dys[i]) / (dxs[i + 1] - dxs[i]));
          const m = new Array<number>(n);
          m[0] = delta[0];
          m[n - 1] = delta[n - 2];
          for (let i = 1; i < n - 1; i++) m[i] = (delta[i - 1] + delta[i]) / 2;
          for (let i = 0; i < n - 1; i++) {
            if (Math.abs(delta[i]) < 1e-10) { m[i] = 0; m[i + 1] = 0; }
            else {
              const a = m[i] / delta[i], b = m[i + 1] / delta[i];
              const h = Math.hypot(a, b);
              if (h > 3) { m[i] = 3 * delta[i] / h * a; m[i + 1] = 3 * delta[i] / h * b; }
            }
          }
          const spline = (x: number) => {
            let lo = 0, hi = n - 1;
            while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (dxs[mid] <= x) lo = mid; else hi = mid; }
            if (x <= dxs[lo]) return dys[lo];
            if (x >= dxs[hi]) return dys[hi];
            const hx = dxs[hi] - dxs[lo], t = (x - dxs[lo]) / hx;
            return (2*t*t*t - 3*t*t + 1)*dys[lo] + (t*t*t - 2*t*t + t)*hx*m[lo]
              + (-2*t*t*t + 3*t*t)*dys[hi] + (t*t*t - t*t)*hx*m[hi];
          };
          const pathD = Array.from({ length: 80 }, (_, i) => {
            const x = dxs[0] + (i / 79) * (dxs[n - 1] - dxs[0]);
            const cy = padT + yScale(spline(x));
            return i === 0 ? `M ${x.toFixed(1)} ${cy.toFixed(1)}` : `L ${x.toFixed(1)} ${cy.toFixed(1)}`;
          }).join(" ");

          // Y-axis: major ticks every 10, minor ticks every 2
          const majorTicks: number[] = [];
          for (let v = minD; v <= maxD; v += 10) majorTicks.push(v);
          const minorTicks: number[] = [];
          for (let v = minD + 2; v < maxD; v += 2) if (v % 10 !== 0) minorTicks.push(v);

          // X-axis ticks: every 1 day when hasTime, else by step index
          const pitchingX = points[0].x;
          const dayMs = 86400000;
          const xTicks: { x: number; label: string }[] = hasTime
            ? Array.from(
                { length: Math.floor((maxX - pitchingX) / dayMs) + 1 },
                (_, i) => {
                  const t = pitchingX + i * dayMs;
                  return { x: t, label: i === 0 ? "0d" : `${i}d` };
                }
              ).filter(t => t.x <= maxX)
            : points.map((p, i) => ({ x: p.x, label: `S${i + 1}` }));

          const curveConfig = [
            { key: "gravity" as const, label: "Gravity", color: "#3b82f6" },
            { key: "activity" as const, label: "Activity", color: "#22c55e" },
            { key: "temp" as const, label: "Temp", color: "#f97316" },
            { key: "pressure" as const, label: "Pressure", color: "#a855f7" },
          ];

          return (
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                {curveConfig.map(({ key, label, color }) => (
                  <button
                    key={key}
                    onClick={() => setCurves(prev => {
                      const next = new Set(prev);
                      if (next.has(key)) next.delete(key); else next.add(key);
                      return next;
                    })}
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors"
                    style={curves.has(key)
                      ? { backgroundColor: color, borderColor: color, color: "#fff" }
                      : { backgroundColor: "transparent", borderColor: "currentColor", opacity: 0.35 }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
                {/* Minor grid lines every 2 */}
                {minorTicks.map((v, i) => (
                  <line key={i} x1={padL} y1={padT + yScale(v)} x2={padL + innerW} y2={padT + yScale(v)}
                    stroke="currentColor" strokeOpacity={0.04} strokeWidth={1} />
                ))}
                {/* Major grid lines every 10 */}
                {majorTicks.map((v, i) => (
                  <line key={i} x1={padL} y1={padT + yScale(v)} x2={padL + innerW} y2={padT + yScale(v)}
                    stroke="currentColor" strokeOpacity={0.12} strokeWidth={1} />
                ))}
                {/* Y axis labels every 10 */}
                {majorTicks.map((v, i) => (
                  <text key={i} x={padL - 4} y={padT + yScale(v) + 4}
                    textAnchor="end" fontSize={9} fill="currentColor" opacity={0.5}>
                    {v.toFixed(0)}
                  </text>
                ))}
                {/* X axis labels */}
                {xTicks.map((t, i) => (
                  <text key={i} x={padL + xScale(t.x)} y={H - 4}
                    textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.5}>
                    {t.label}
                  </text>
                ))}
                {/* Activity curve */}
                {curves.has("activity") && speedPathD && (
                  <path d={speedPathD} fill="none" stroke="#22c55e" strokeWidth={1.5}
                    strokeDasharray="4 4" strokeLinecap="round" opacity={0.35} />
                )}
                {/* Temperature curve */}
                {curves.has("temp") && tempPathD && (
                  <>
                    <path d={tempPathD} fill="none" stroke="#f97316" strokeWidth={1.5}
                      strokeDasharray="5 3" strokeLinecap="round" opacity={0.7} />
                    {tempScreenPts.map((pt, i) => (
                      <g key={`temp-${i}`}>
                        <circle cx={pt.x} cy={pt.y} r={2.5} fill="#f97316" opacity={0.8} />
                        <text x={pt.x} y={pt.y - 6} textAnchor="middle" fontSize={8} fill="#f97316" opacity={0.9}>
                          {pt.v.toFixed(1)}°
                        </text>
                      </g>
                    ))}
                  </>
                )}
                {/* Pressure curve */}
                {curves.has("pressure") && pressPathD && (
                  <>
                    <path d={pressPathD} fill="none" stroke="#a855f7" strokeWidth={1.5}
                      strokeDasharray="5 3" strokeLinecap="round" opacity={0.7} />
                    {pressScreenPts.map((pt, i) => (
                      <g key={`press-${i}`}>
                        <circle cx={pt.x} cy={pt.y} r={2.5} fill="#a855f7" opacity={0.8} />
                        <text x={pt.x} y={pt.y - 6} textAnchor="middle" fontSize={8} fill="#a855f7" opacity={0.9}>
                          {pt.v.toFixed(2)}b
                        </text>
                      </g>
                    ))}
                  </>
                )}
                {/* Gravity curve */}
                {curves.has("gravity") && (
                  <>
                    <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
                    {coords.map((pt, i) => (
                      <circle key={i} cx={pt.x} cy={pt.y} r={3.5} fill="#3b82f6" />
                    ))}
                    {coords.map((pt, i) => {
                      if (i === 0) return null;
                      const og = points[0].d;
                      const att = og > 1000 ? ((og - points[i].d) / (og - 1000)) * 100 : 0;
                      return (
                        <g key={`lbl-${i}`}>
                          <text x={pt.x} y={pt.y - 18} textAnchor="middle" fontSize={8.5} fill="currentColor" opacity={0.75} fontWeight="500">
                            {points[i].d.toFixed(0)}
                          </text>
                          <text x={pt.x} y={pt.y - 8} textAnchor="middle" fontSize={8} fill="#3b82f6" opacity={0.9}>
                            {att.toFixed(0)}%
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}
              </svg>
            </div>
          );
        })()}

        {/* Notes modal */}
        {(() => {
          const step = fermentation.steps.find(s => s.id === notesModalId);
          return (
            <Dialog open={notesModalId != null} onOpenChange={(open) => { if (!open) setNotesModalId(null); }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Notes — {step?.id === "pitching" ? "Pitching" : step ? `Step ${fermentation.steps.indexOf(step)}` : ""}</DialogTitle>
                </DialogHeader>
                <Textarea
                  value={step?.notes ?? ""}
                  onChange={(e) => step && setStep(step.id, "notes", e.target.value || null)}
                  placeholder="Enter notes..."
                  className="min-h-32"
                />
              </DialogContent>
            </Dialog>
          );
        })()}
      </div>
    </CollapsibleCard>
  );
}

interface BrewdaySectionProps {
  brewday: BrewdayData;
  updateBrewday: <K extends keyof BrewdayData>(section: K, value: BrewdayData[K]) => void;
  recipeData: RecipeData;
  kegInventory: { id: string; name: string; capacity: number; tareWeight: number | null }[];
  openBrewday: boolean; onToggleBrewday: () => void;
  openPreparation: boolean; onTogglePreparation: () => void;
  openMilling: boolean; onToggleMilling: () => void;
  openMash: boolean; onToggleMash: () => void;
  openSparge: boolean; onToggleSparge: () => void;
  openBoil: boolean; onToggleBoil: () => void;
  openWhirlpool: boolean; onToggleWhirlpool: () => void;
  openFermentation: boolean; onToggleFermentation: () => void;
  openKegging: boolean; onToggleKegging: () => void;
  openLagering: boolean; onToggleLagering: () => void;
  openBottling: boolean; onToggleBottling: () => void;
}

export function BrewdaySection({
  brewday, updateBrewday, recipeData, kegInventory,
  openBrewday, onToggleBrewday,
  openPreparation, onTogglePreparation,
  openMilling, onToggleMilling,
  openMash, onToggleMash,
  openSparge, onToggleSparge,
  openBoil, onToggleBoil,
  openWhirlpool, onToggleWhirlpool,
  openFermentation, onToggleFermentation,
  openKegging, onToggleKegging,
  openLagering, onToggleLagering,
  openBottling, onToggleBottling,
}: BrewdaySectionProps) {
  const { preparation, milling, mash, sparge, preboil, lastRun, boil, whirlpoolChilling, fermentation, kegging, lagering, bottling } = brewday;

  const setPrep = useCallback(
    (key: keyof typeof preparation, val: boolean | number | null) => {
      updateBrewday("preparation", { ...preparation, [key]: val });
    },
    [preparation, updateBrewday]
  );

  const setMashWater = useCallback(
    (key: keyof MashData["mashWater"], val: string | number | null) => {
      updateBrewday("mash", { ...mash, mashWater: { ...mash.mashWater, [key]: val } });
    },
    [mash, updateBrewday]
  );

  const setSpargeWater = useCallback(
    (key: keyof MashData["spargeWater"], val: string | number | null) => {
      updateBrewday("mash", { ...mash, spargeWater: { ...mash.spargeWater, [key]: val } });
    },
    [mash, updateBrewday]
  );

  const setSpargeWaterPot = useCallback(
    (val: string | null) => {
      updateBrewday("mash", { ...mash, spargeWater: { ...mash.spargeWater, pot: val } });
    },
    [mash, updateBrewday]
  );

  const setMashGeneral = useCallback(
    (key: keyof MashData["general"], val: string | number | boolean | null) => {
      updateBrewday("mash", { ...mash, general: { ...mash.general, [key]: val } });
    },
    [mash, updateBrewday]
  );

  const addMashStep = useCallback(() => {
    const now = new Date();
    const hora = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newStep: MashStepEntry = { id: crypto.randomUUID(), time: hora, tempC: null, ph: null, recirculated: false, stir: false };
    updateBrewday("mash", { ...mash, timeline: [...mash.timeline, newStep] });
  }, [mash, updateBrewday]);

  const removeMashStep = useCallback((id: string) => {
    updateBrewday("mash", { ...mash, timeline: mash.timeline.filter((s) => s.id !== id) });
  }, [mash, updateBrewday]);

  const setMashStep = useCallback(
    (id: string, key: keyof MashStepEntry, val: string | number | boolean | null) => {
      updateBrewday("mash", {
        ...mash,
        timeline: mash.timeline.map((s) => (s.id === id ? { ...s, [key]: val } : s)),
      });
    },
    [mash, updateBrewday]
  );

  const setSparge = useCallback(
    (key: keyof SpargeData, val: string | number | null) => {
      updateBrewday("sparge", { ...sparge, [key]: val });
    },
    [sparge, updateBrewday]
  );

  const setPreboil = useCallback(
    (key: keyof PreboilData, val: number | null) => {
      updateBrewday("preboil", { ...preboil, [key]: val });
    },
    [preboil, updateBrewday]
  );

  const setLastRun = useCallback(
    (key: keyof LastRunData, val: number | null) => {
      updateBrewday("lastRun", { ...lastRun, [key]: val });
    },
    [lastRun, updateBrewday]
  );

  const setBoil = useCallback(
    (key: keyof Omit<BoilData, "entries">, val: boolean | number | null) => {
      updateBrewday("boil", { ...boil, [key]: val });
    },
    [boil, updateBrewday]
  );

  // Ensure boil always has at least start + end entries
  useEffect(() => {
    if (boil.entries.length < 2) {
      const start: BoilEntry = boil.entries[0] ?? { id: crypto.randomUUID(), time: null, heightCm: null, volumeL: null, targetVolumeL: null };
      const end: BoilEntry = { id: crypto.randomUUID(), time: null, heightCm: null, volumeL: null, targetVolumeL: null };
      updateBrewday("boil", { ...boil, entries: [start, end] });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addBoilEntry = useCallback(() => {
    const newEntry: BoilEntry = { id: crypto.randomUUID(), time: null, heightCm: null, volumeL: null, targetVolumeL: null };
    const entries = [...boil.entries];
    // Insert before last entry (end)
    entries.splice(Math.max(entries.length - 1, 1), 0, newEntry);
    updateBrewday("boil", { ...boil, entries });
  }, [boil, updateBrewday]);

  const removeBoilEntry = useCallback(
    (id: string) => {
      updateBrewday("boil", { ...boil, entries: boil.entries.filter((e) => e.id !== id) });
    },
    [boil, updateBrewday]
  );

  const setBoilEntry = useCallback(
    (id: string, key: keyof BoilEntry, val: string | number | null) => {
      updateBrewday("boil", {
        ...boil,
        entries: boil.entries.map((e) => (e.id === id ? { ...e, [key]: val } : e)),
      });
    },
    [boil, updateBrewday]
  );

  const setWhirlpool = useCallback(
    (key: keyof WhirlpoolChillingData, val: string | number | boolean | null) => {
      updateBrewday("whirlpoolChilling", { ...whirlpoolChilling, [key]: val });
    },
    [whirlpoolChilling, updateBrewday]
  );

  const setFermentation = useCallback(
    (key: keyof FermentationData, val: string | number | boolean | null) => {
      updateBrewday("fermentation", { ...fermentation, [key]: val });
    },
    [fermentation, updateBrewday]
  );

  const addFermentationStep = useCallback(() => {
    const newStep: FermentationStep = { id: crypto.randomUUID(), dateTime: null, volumeL: null, densityGL: null, ph: null, tempC: null, pressureBar: null, bubbleIntervalSec: null, notes: null };
    updateBrewday("fermentation", { ...fermentation, steps: [...fermentation.steps, newStep] });
  }, [fermentation, updateBrewday]);

  const removeFermentationStep = useCallback((id: string) => {
    updateBrewday("fermentation", { ...fermentation, steps: fermentation.steps.filter(s => s.id !== id) });
  }, [fermentation, updateBrewday]);

  const setFermentationStep = useCallback(
    (id: string, key: keyof FermentationStep, val: string | number | null) => {
      updateBrewday("fermentation", {
        ...fermentation,
        steps: fermentation.steps.map(s => s.id === id ? { ...s, [key]: val } : s),
      });
    },
    [fermentation, updateBrewday]
  );

  const setKegging = useCallback(
    (key: keyof KeggingData, val: string | number | boolean | null) => {
      updateBrewday("kegging", { ...kegging, [key]: val });
    },
    [kegging, updateBrewday]
  );

  const setLagering = useCallback(
    (key: keyof LageringData, val: string | number | boolean | null) => {
      updateBrewday("lagering", { ...lagering, [key]: val });
    },
    [lagering, updateBrewday]
  );

  const setBottling = useCallback(
    (key: keyof BottlingData, val: string | number | null) => {
      updateBrewday("bottling", { ...bottling, [key]: val });
    },
    [bottling, updateBrewday]
  );

  const [gelatinaVolL, setGelatinaVolL] = useState<number | null>(null);
  const [smbVolL, setSmbVolL] = useState<number | null>(null);

  const addKeg = useCallback(
    (kegId: string) => {
      const inv = kegInventory.find(k => k.id === kegId);
      if (!inv) return;
      const existing = (kegging.kegs ?? []);
      if (existing.some(k => k.kegId === kegId)) return;
      const entry: KegEntry = {
        id: `${kegId}-${Date.now()}`,
        kegId,
        kegName: inv.name,
        tareWeightKg: inv.tareWeight != null ? inv.tareWeight / 1000 : null,
        totalWeightKg: null,
      };
      updateBrewday("kegging", { ...kegging, kegs: [...existing, entry] });
    },
    [kegging, kegInventory, updateBrewday]
  );

  const removeKeg = useCallback(
    (id: string) => {
      updateBrewday("kegging", { ...kegging, kegs: (kegging.kegs ?? []).filter(k => k.id !== id) });
    },
    [kegging, updateBrewday]
  );

  const setKegWeight = useCallback(
    (id: string, totalWeightKg: number | null) => {
      updateBrewday("kegging", {
        ...kegging,
        kegs: (kegging.kegs ?? []).map(k => k.id === id ? { ...k, totalWeightKg } : k),
      });
    },
    [kegging, updateBrewday]
  );

  return (
    <>
      {/* Brewday title separator */}
      <button
        type="button"
        onClick={onToggleBrewday}
        className="flex items-center gap-3 pt-2 w-full text-left"
      >
        {openBrewday ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <h2 className="text-lg font-bold tracking-tight whitespace-nowrap">Brewday</h2>
        <div className="flex-1 border-t" />
      </button>

      {openBrewday && <>

      {/* ---- PREPARATION ---- */}
      <CollapsibleCard title="Preparation" icon={<ClipboardList className="h-4 w-4" />} open={openPreparation} onToggle={onTogglePreparation}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <CheckRow checked={preparation.freezeBottles} onCheckedChange={(v) => setPrep("freezeBottles", v)} label="Freeze water bottles" />
          <CheckRow checked={preparation.prepareCooler} onCheckedChange={(v) => setPrep("prepareCooler", v)} label="Prepare cooler" />
          <CheckRow checked={preparation.setupMill} onCheckedChange={(v) => setPrep("setupMill", v)} label="Set up mill" />
          <CheckRow checked={preparation.setupChillerCoils} onCheckedChange={(v) => setPrep("setupChillerCoils", v)} label="Set up chiller coils" />
          <CheckRow checked={preparation.cleanMashTun} onCheckedChange={(v) => setPrep("cleanMashTun", v)} label="Clean/set up mash tun" />
          <CheckRow checked={preparation.prepareAlcohol} onCheckedChange={(v) => setPrep("prepareAlcohol", v)} label="Prepare 70% alcohol" />
          <CheckRow checked={preparation.cleanFermenter} onCheckedChange={(v) => setPrep("cleanFermenter", v)} label="Clean/set up fermenter" />
          <CheckRow checked={preparation.cleanKitchen} onCheckedChange={(v) => setPrep("cleanKitchen", v)} label="Clean kitchen" />
          <CheckRow checked={preparation.weighGrains} onCheckedChange={(v) => setPrep("weighGrains", v)} label="Weigh grains" />
          <CheckRow checked={preparation.setupWorkspace} onCheckedChange={(v) => setPrep("setupWorkspace", v)} label="Set up workspace" />
          <CheckRow checked={preparation.prepareBurner} onCheckedChange={(v) => setPrep("prepareBurner", v)} label="Prepare burner" />
          <div className="flex items-center gap-2">
            <Checkbox checked={!!preparation.gasTankKg || preparation.gasTankKg === 0} onCheckedChange={() => {}} className="shrink-0" />
            <span className="text-sm whitespace-nowrap">Gas tank:</span>
            <NumInput value={preparation.gasTankKg} onChange={(v) => setPrep("gasTankKg", v)} className="w-24" />
            <span className="text-xs text-muted-foreground">kg</span>
          </div>
          <CheckRow checked={preparation.filterWater} onCheckedChange={(v) => setPrep("filterWater", v)} label="Filter water (in fermenter)" />
          <CheckRow checked={preparation.calibratePhMeter} onCheckedChange={(v) => setPrep("calibratePhMeter", v)} label="Calibrate pH meter" />
          <CheckRow checked={preparation.prepareStarter} onCheckedChange={(v) => setPrep("prepareStarter", v)} label="Prepare starter" />
        </div>
      </CollapsibleCard>

      {/* ---- MILLING ---- */}
      <CollapsibleCard title="Milling" icon={<Settings2 className="h-4 w-4" />} open={openMilling} onToggle={onToggleMilling}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <FieldLabel>Date &amp; time</FieldLabel>
            <Input
              type="datetime-local"
              value={milling.dateTime ?? ""}
              onChange={(e) => updateBrewday("milling", { ...milling, dateTime: e.target.value || null })}
              className="h-7 text-sm w-52"
            />
          </div>
          <div className="flex items-center gap-3">
            <FieldLabel>Roller gap (mm)</FieldLabel>
            <NumberInput
              step="0.05"
              min="0"
              value={milling.gapMm ?? ""}
              onChange={(e) => updateBrewday("milling", { ...milling, gapMm: e.target.value === "" ? null : parseFloat(e.target.value) })}
              placeholder="0.8"
              className="h-7 text-sm w-24"
            />
            {milling.gapMm != null && (() => {
              const gap = milling.gapMm;
              const [label, color] =
                gap < 0.5  ? ["Very fine",  "text-red-500"] :
                gap < 0.7  ? ["Fine",       "text-orange-500"] :
                gap < 0.9  ? ["Standard",   "text-green-600"] :
                gap < 1.1  ? ["Coarse",     "text-amber-500"] :
                             ["Very coarse","text-red-500"];
              return (
                <span className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{(gap / 25.4).toFixed(4)}"</span>
                  <span className={`text-xs font-medium ${color}`}>{label}</span>
                </span>
              );
            })()}
          </div>
        </div>
      </CollapsibleCard>

      {/* ---- MASH ---- */}
      <CollapsibleCard
        title="Mash"
        icon={<Layers className="h-4 w-4" />}
        open={openMash}
        onToggle={onToggleMash}
        badge={(() => {
          const toMins = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
          const fmt = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
          const heatStart = mash.general.heatWaterTime;
          const mashStart = mash.general.mashInTime;
          const lastStep = mash.timeline[mash.timeline.length - 1];
          const mashEnd = lastStep?.time;
          if (!heatStart || !mashStart || !mashEnd) return null;
          const heatMins = toMins(mashStart) - toMins(heatStart);
          const mashMins = toMins(mashEnd) - toMins(mashStart);
          if (heatMins <= 0 || mashMins <= 0) return null;
          const totalMins = heatMins + mashMins;
          return (
            <span className="text-xs text-muted-foreground tabular-nums">
              {fmt(heatMins)} + {fmt(mashMins)} = {fmt(totalMins)}
            </span>
          );
        })()}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mash Water */}
            {(() => {
              const C = 0.41;
              const strikeCalc =
                recipeData.firstMashTempC != null
                  ? (C / recipeData.mashRatio) * (recipeData.firstMashTempC - recipeData.grainTempC) + recipeData.firstMashTempC
                  : null;
              const mashH =
                recipeData.mashPotDiameterCm != null && recipeData.mashPotDiameterCm > 0
                  ? ((recipeData.mashWaterL * 1000) / (Math.PI * Math.pow(recipeData.mashPotDiameterCm / 2, 2))).toFixed(1)
                  : null;
              const { cacl2, gypsum, epsom, nacl, chalk, bakingSoda } = recipeData.saltMash;
              const hasSalts = cacl2 > 0 || gypsum > 0 || epsom > 0 || nacl > 0 || chalk > 0 || bakingSoda > 0;
              return (
                <div className="border rounded-lg p-3 space-y-3">
                  <SubTitle>Mash Water</SubTitle>

                  {/* Recipe reference */}
                  <div className="bg-muted/40 rounded-md p-2 space-y-1">
                    {/* Line 1: Pot vol + Pot ⌀ */}
                    <div className="flex gap-x-4">
                      {recipeData.mashPotVolumeL != null && <RecipeRef label="Pot vol:" value={`${recipeData.mashPotVolumeL} L`} />}
                      {recipeData.mashPotDiameterCm != null && <RecipeRef label="Pot ⌀:" value={`${recipeData.mashPotDiameterCm} cm`} />}
                    </div>
                    {/* Line 2: Volume + Height */}
                    <div className="flex gap-x-4">
                      <RecipeRef
                        label="Volume:"
                        value={
                          (recipeData.mashMode === "biab" || recipeData.mashMode === "step_infusion") && mashH != null
                            ? `${recipeData.mashWaterL.toFixed(1)} L (${mashH} cm, ⌀${recipeData.mashPotDiameterCm})`
                            : `${recipeData.mashWaterL.toFixed(1)} L`
                        }
                      />
                      {recipeData.mashMode === "sparge" && mashH != null && <RecipeRef label="Height:" value={`${mashH} cm`} />}
                    </div>
                    {/* Line 3: Strike temp */}
                    {strikeCalc != null && (
                      <div><RecipeRef label="Strike temp:" value={`${strikeCalc.toFixed(1)} °C`} /></div>
                    )}
                    {/* Line 4: Salt additions */}
                    {hasSalts && (
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 pt-1 border-t border-border/40">
                        <SaltRef label="CaCl₂" grams={cacl2} />
                        <SaltRef label="CaSO₄" grams={gypsum} />
                        <SaltRef label="MgSO₄" grams={epsom} />
                        <SaltRef label="NaCl" grams={nacl} />
                        <SaltRef label="Chalk" grams={chalk} />
                        <SaltRef label="NaHCO₃" grams={bakingSoda} />
                      </div>
                    )}
                    {/* Line 5: Acid additions */}
                    {recipeData.mashAcidDose != null && (
                      <div className="flex items-baseline gap-1 pt-1 border-t border-border/40">
                        <span className="text-xs text-muted-foreground">{recipeData.mashAcidLabel}:</span>
                        <span className="text-xs font-semibold tabular-nums">{recipeData.mashAcidDose.toFixed(1)} {recipeData.mashAcidUnit}</span>
                      </div>
                    )}
                  </div>

                  <CheckRow
                    checked={mash.general.checkWaterTaste}
                    onCheckedChange={(v) => setMashGeneral("checkWaterTaste", v)}
                    label="Check water taste"
                  />
                  <FieldGroup label="Notes">
                    <Textarea
                      value={mash.mashWater.notes ?? ""}
                      onChange={(e) => setMashWater("notes", e.target.value || null)}
                      placeholder="—"
                      className="text-sm min-h-[60px] resize-none"
                    />
                  </FieldGroup>
                </div>
              );
            })()}

            {/* Infusion Steps — step infusion mode */}
            {recipeData.mashMode === "step_infusion" && recipeData.stepInfusionSchedule != null && recipeData.stepInfusionSchedule.length > 1 && (
              <div className="border rounded-lg p-3 space-y-2">
                <SubTitle>Infusion Steps</SubTitle>
                <div className="space-y-1.5">
                  {recipeData.stepInfusionSchedule.slice(1).map((step, i) => {
                    const stepName = recipeData.mashStepNames[step.stepIndex] || `Step ${step.stepIndex + 1}`;
                    if (step.waterAddedL === 0) return null;
                    const d = recipeData.spargePotDiameterCm;
                    const heightCm = d != null && d > 0 && isFinite(step.waterAddedL)
                      ? ((step.waterAddedL * 1000) / (Math.PI * Math.pow(d / 2, 2))).toFixed(1)
                      : null;
                    return (
                      <div key={i} className="bg-muted/40 rounded-md p-2 space-y-0.5">
                        <div className="text-xs font-medium">{stepName}</div>
                        <div className="flex gap-x-4">
                          <RecipeRef
                            label="Add:"
                            value={isFinite(step.waterAddedL)
                              ? `${step.waterAddedL.toFixed(1)} L${heightCm != null ? ` (${heightCm} cm, ⌀${d})` : ""}`
                              : "—"}
                          />
                          <RecipeRef label="at" value={`${step.infuseTemperatureC.toFixed(1)} °C`} />
                        </div>
                        <div className="text-xs text-muted-foreground">Cumulative: {step.cumulativeWaterL.toFixed(1)} L</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sparge Water — only in sparge mode */}
            {recipeData.mashMode === "sparge" && (() => {
              const spargeH =
                recipeData.spargePotDiameterCm != null && recipeData.spargePotDiameterCm > 0
                  ? ((recipeData.spargeWaterL * 1000) / (Math.PI * Math.pow(recipeData.spargePotDiameterCm / 2, 2))).toFixed(1)
                  : null;
              const { cacl2, gypsum, epsom, nacl, chalk, bakingSoda } = recipeData.saltSparge;
              const hasSalts = cacl2 > 0 || gypsum > 0 || epsom > 0 || nacl > 0 || chalk > 0 || bakingSoda > 0;
              const acid = recipeData.spargeAcid;
              const acidLabel = recipeData.acidType === "lactic" ? "Lactic 88%" : recipeData.acidType === "phosphoric" ? "Phosphoric 10%" : "Citric";
              return (
                <div className="border rounded-lg p-3 space-y-3">
                  <SubTitle>Sparge Water</SubTitle>

                  {/* Recipe reference */}
                  <div className="bg-muted/40 rounded-md p-2 space-y-1">
                    {/* Line 1: Pot ⌀ */}
                    {recipeData.spargePotDiameterCm != null && (
                      <div><RecipeRef label="Pot ⌀:" value={`${recipeData.spargePotDiameterCm} cm`} /></div>
                    )}
                    {/* Line 2: Volume + Height */}
                    <div className="flex gap-x-4">
                      <RecipeRef label="Volume:" value={`${recipeData.spargeWaterL.toFixed(1)} L`} />
                      {spargeH != null && <RecipeRef label="Height:" value={`${spargeH} cm`} />}
                    </div>
                    {/* Line 3: Recommended temp */}
                    <div><RecipeRef label="Temp:" value="75–82 °C" /></div>
                    {/* Line 4: Salt additions */}
                    {hasSalts && (
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 pt-1 border-t border-border/40">
                        <SaltRef label="CaCl₂" grams={cacl2} />
                        <SaltRef label="CaSO₄" grams={gypsum} />
                        <SaltRef label="MgSO₄" grams={epsom} />
                        <SaltRef label="NaCl" grams={nacl} />
                        <SaltRef label="Chalk" grams={chalk} />
                        <SaltRef label="NaHCO₃" grams={bakingSoda} />
                      </div>
                    )}
                    {/* Line 5: Acid additions */}
                    {acid?.needed && (
                      <div className="flex items-baseline gap-1 pt-1 border-t border-border/40">
                        <span className="text-xs text-muted-foreground">{acidLabel}:</span>
                        <span className="text-xs font-semibold tabular-nums">
                          {acid.doseMl != null ? `${acid.doseMl.toFixed(1)} mL` : acid.doseG != null ? `${acid.doseG.toFixed(1)} g` : "—"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actuals */}
                  <div className="grid grid-cols-1 gap-2">
                    <FieldGroup label={`pH${recipeData.spargeTargetPh != null ? ` (target: ${recipeData.spargeTargetPh})` : ""}`}>
                      <NumInput value={mash.spargeWater.ph} onChange={(v) => setSpargeWater("ph", v)} />
                    </FieldGroup>
                    <FieldGroup label="Notes">
                      <Textarea
                        value={mash.spargeWater.notes ?? ""}
                        onChange={(e) => setSpargeWater("notes", e.target.value || null)}
                        placeholder="—"
                        className="text-sm min-h-[60px] resize-none"
                      />
                    </FieldGroup>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* General */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <FieldGroup label="Heat water time">
                <TimeInput value={mash.general.heatWaterTime} onChange={(v) => setMashGeneral("heatWaterTime", v)} />
              </FieldGroup>
              <FieldGroup label="Mash in time">
                <TimeInput value={mash.general.mashInTime} onChange={(v) => setMashGeneral("mashInTime", v)} />
              </FieldGroup>
              <div className="flex flex-col gap-1">
                <FieldLabel>Heat duration</FieldLabel>
                <span className="text-sm font-semibold tabular-nums h-7 flex items-center">
                  {(() => {
                    const a = mash.general.heatWaterTime;
                    const b = mash.general.mashInTime;
                    if (!a || !b) return "—";
                    const [ah, am] = a.split(":").map(Number);
                    const [bh, bm] = b.split(":").map(Number);
                    const diff = (bh * 60 + bm) - (ah * 60 + am);
                    return diff > 0 ? `${diff} min` : "—";
                  })()}
                </span>
              </div>
            </div>
            {recipeData.firstMashTempC != null && (
              <RecipeRef label="Target temp:" value={`${recipeData.firstMashTempC} °C`} />
            )}
          </div>

          {/* Mash steps */}
          <div className="space-y-2">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1 pr-2 font-medium text-muted-foreground">Time</th>
                  <th className="text-left py-1 px-2 font-medium text-muted-foreground">Min</th>
                  <th className="text-left py-1 px-2 font-medium text-muted-foreground">
                    Temp °C{recipeData.firstMashTempC != null && <span className="text-[10px] font-normal ml-1">({recipeData.firstMashTempC})</span>}
                  </th>
                  <th className="text-left py-1 px-2 font-medium text-muted-foreground">
                    pH{recipeData.targetPh != null && <span className="text-[10px] font-normal ml-1">({recipeData.targetPh})</span>}
                  </th>
                  <th className="text-center py-1 px-2 font-medium text-muted-foreground">Recirc</th>
                  <th className="text-center py-1 px-2 font-medium text-muted-foreground">Stir</th>
                  <th className="w-6" />
                </tr>
              </thead>
              <tbody>
                {mash.timeline.map((step, idx) => {
                  const firstHora = mash.timeline[0]?.time;
                  const minVal = idx === 0 ? 0 : calcStepMin(firstHora, step.time);
                  return (
                    <tr key={step.id} className="border-b last:border-0">
                      <td className="py-1 pr-2">
                        <TimeInput value={step.time} onChange={(v) => setMashStep(step.id, "time", v)} className="w-44" />
                      </td>
                      <td className="py-1 px-2 tabular-nums text-muted-foreground">
                        {minVal != null ? minVal : "—"}
                      </td>
                      <td className="py-1 px-2">
                        <NumInput value={step.tempC} onChange={(v) => setMashStep(step.id, "tempC", v)} className="w-20" />
                      </td>
                      <td className="py-1 px-2">
                        <NumInput value={step.ph} onChange={(v) => setMashStep(step.id, "ph", v)} className="w-20" />
                      </td>
                      <td className="py-1 px-2 text-center">
                        <Checkbox checked={step.recirculated} onCheckedChange={(v) => setMashStep(step.id, "recirculated", v === true)} className="mx-auto" />
                      </td>
                      <td className="py-1 px-2 text-center">
                        <Checkbox checked={step.stir} onCheckedChange={(v) => setMashStep(step.id, "stir", v === true)} className="mx-auto" />
                      </td>
                      <td className="py-1 pl-1">
                        {idx > 0 && (
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeMashStep(step.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Button type="button" variant="outline" size="sm" onClick={addMashStep} className="h-7 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" /> Add step
            </Button>
          </div>
        </div>
      </CollapsibleCard>

      {/* ---- SPARGE ---- */}
      <CollapsibleCard
        title="Lauter & Sparge"
        icon={<Filter className="h-4 w-4" />}
        open={openSparge}
        onToggle={onToggleSparge}
        badge={(() => {
          const start = sparge.spargeStartTime;
          const end = sparge.spargeEndTime;
          if (!start || !end) return null;
          const [sh, sm] = start.split(":").map(Number);
          const [eh, em] = end.split(":").map(Number);
          const diff = (eh * 60 + em) - (sh * 60 + sm);
          if (diff <= 0) return null;
          const hh = String(Math.floor(diff / 60)).padStart(2, "0");
          const mm = String(diff % 60).padStart(2, "0");
          return <span className="text-xs text-muted-foreground tabular-nums">{hh}:{mm}</span>;
        })()}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border rounded-lg p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <FieldGroup label="Sparge start">
                <TimeInput value={sparge.spargeStartTime} onChange={(v) => setSparge("spargeStartTime", v)} />
              </FieldGroup>
              <FieldGroup label="Sparge end">
                <TimeInput value={sparge.spargeEndTime} onChange={(v) => setSparge("spargeEndTime", v)} />
              </FieldGroup>
            </div>
            <div className="bg-muted/40 rounded-md p-2 space-y-1">
              <div className="flex gap-x-4">
                {recipeData.mashPotVolumeL != null && <RecipeRef label="Pot vol:" value={`${recipeData.mashPotVolumeL} L`} />}
                {recipeData.mashPotDiameterCm != null && <RecipeRef label="Pot ⌀:" value={`${recipeData.mashPotDiameterCm} cm`} />}
              </div>
              <div className="flex gap-x-4">
                <RecipeRef label="Target vol:" value={`${recipeData.preHeatUpL.toFixed(1)} L`} />
                {recipeData.preHeatUpHeightCm != null && <RecipeRef label="Target height:" value={`${recipeData.preHeatUpHeightCm} cm`} />}
              </div>
              {recipeData.preBoilDensityGL != null && (
                <div><RecipeRef label="Target density:" value={`${recipeData.preBoilDensityGL} g/L`} /></div>
              )}
            </div>
            {(() => {
              const d = recipeData.mashPotDiameterCm;
              const computedVol = d != null && d > 0 && preboil.heightCm != null
                ? (Math.PI * Math.pow(d / 2, 2) * preboil.heightCm / 1000).toFixed(1)
                : null;
              return (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <FieldGroup label="Height cm">
                      <NumInput value={preboil.heightCm} onChange={(v) => setPreboil("heightCm", v)} />
                    </FieldGroup>
                    {computedVol != null && (
                      <RecipeRef label="→ Vol:" value={`${computedVol} L`} />
                    )}
                  </div>
                  <FieldGroup label="Density g/L">
                    <NumInput value={preboil.densityGL} onChange={(v) => setPreboil("densityGL", v)} />
                  </FieldGroup>
                </div>
              );
            })()}
            <div className="grid grid-cols-2 gap-2">
              <FieldGroup label="Temp °C">
                <NumInput value={preboil.tempC} onChange={(v) => setPreboil("tempC", v)} />
              </FieldGroup>
              <FieldGroup label="pH (target: 5.3)">
                <NumInput value={preboil.ph} onChange={(v) => setPreboil("ph", v)} />
              </FieldGroup>
            </div>
          </div>
          <div className="border rounded-lg p-3 space-y-2">
            <SubTitle>First Runnings</SubTitle>
            <div className="grid grid-cols-2 gap-2">
              <FieldGroup label="Density g/L">
                <NumInput value={sparge.firstRunningsDensity} onChange={(v) => setSparge("firstRunningsDensity", v)} />
              </FieldGroup>
              <FieldGroup label="pH">
                <NumInput value={sparge.firstRunningsPh} onChange={(v) => setSparge("firstRunningsPh", v)} />
              </FieldGroup>
            </div>
            {recipeData.mashMode === "sparge" && (
              <div className="mt-6">
                <SubTitle>Last run</SubTitle>
                <div className="grid grid-cols-2 gap-2">
                  <FieldGroup label="Density g/L">
                    <NumInput value={lastRun.densityGL} onChange={(v) => setLastRun("densityGL", v)} />
                  </FieldGroup>
                  <FieldGroup label="pH (target: &lt;5.6)">
                    <NumInput value={lastRun.ph} onChange={(v) => setLastRun("ph", v)} />
                  </FieldGroup>
                </div>
              </div>
            )}
          </div>
        </div>
      </CollapsibleCard>

      {/* ---- BOIL ---- */}
      <CollapsibleCard
        title="Boil"
        icon={<Flame className="h-4 w-4" />}
        open={openBoil}
        onToggle={onToggleBoil}
        badge={(() => {
          const toMins = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
          const fmt = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
          const spargeEnd = sparge.spargeEndTime;
          const boilStart = boil.entries[0]?.time;
          const boilEnd = boil.entries[boil.entries.length - 1]?.time;
          if (!spargeEnd || !boilStart || !boilEnd || boilStart === boilEnd) return null;
          const heatMins = toMins(boilStart) - toMins(spargeEnd);
          const boilMins = toMins(boilEnd) - toMins(boilStart);
          if (heatMins <= 0 || boilMins <= 0) return null;
          return (
            <span className="text-xs text-muted-foreground tabular-nums">
              {fmt(heatMins)} + {fmt(boilMins)} = {fmt(heatMins + boilMins)}
            </span>
          );
        })()}
      >
        <div className="space-y-4">
          {/* Heat-up / Evaporation stats */}
          {(() => {
            const toMins = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
            const fmt = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
            const spargeEnd = sparge.spargeEndTime;
            const startEntry = boil.entries[0];
            const d = recipeData.mashPotDiameterCm;

            const heatUpMins = spargeEnd && startEntry?.time ? toMins(startEntry.time) - toMins(spargeEnd) : null;

            // Evaporation during heat-up: preboil measurement → boil start
            const preboilVol = d != null && d > 0 && preboil.heightCm != null
              ? Math.PI * Math.pow(d / 2, 2) * preboil.heightCm / 1000
              : null;
            const boilStartVol = d != null && d > 0 && startEntry?.heightCm != null
              ? Math.PI * Math.pow(d / 2, 2) * startEntry.heightCm / 1000
              : null;
            const evapL = preboilVol != null && boilStartVol != null ? preboilVol - boilStartVol : null;
            const evapLH = evapL != null && heatUpMins != null && heatUpMins > 0 ? evapL / (heatUpMins / 60) : null;

            const stats: Array<{ label: string; value: string }> = [];
            if (heatUpMins != null && heatUpMins > 0) stats.push({ label: "Heat-up", value: fmt(heatUpMins) });
            if (evapL != null) stats.push({ label: "Evaporation", value: `${evapL.toFixed(2)} L` });
            if (evapLH != null) stats.push({ label: "Evap. rate", value: `${evapLH.toFixed(2)} L/h` });

            if (stats.length === 0) return null;
            return (
              <div className="flex gap-4 text-xs text-muted-foreground">
                {stats.map(s => (
                  <span key={s.label}><span className="font-medium text-foreground">{s.label}:</span> {s.value}</span>
                ))}
              </div>
            );
          })()}

          <div>
            <div className="border rounded-lg p-3 space-y-2">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-1 pr-2 font-medium text-muted-foreground">Step</th>
                    <th className="text-left py-1 px-2 font-medium text-muted-foreground">Time</th>
                    <th className="text-left py-1 px-2 font-medium text-muted-foreground">Min</th>
                    <th className="text-left py-1 px-2 font-medium text-muted-foreground">Height cm</th>
                    <th className="text-left py-1 px-2 font-medium text-muted-foreground">Vol L</th>
                    <th className="text-left py-1 px-2 font-medium text-muted-foreground">Density g/L</th>
                    <th className="text-left py-1 px-2 font-medium text-muted-foreground">Target L</th>
                    <th className="text-left py-1 px-2 font-medium text-muted-foreground">Evaporation</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {boil.entries.map((entry, idx) => {
                    const isStart = idx === 0;
                    const isEnd = idx === boil.entries.length - 1;
                    const isBeforeEnd = idx === boil.entries.length - 2;
                    const label = isStart ? "Boil start" : isEnd ? "Boil end" : `Step ${idx}`;
                    const d = recipeData.mashPotDiameterCm;
                    const computedVol = d != null && d > 0 && entry.heightCm != null
                      ? (Math.PI * Math.pow(d / 2, 2) * entry.heightCm / 1000).toFixed(2)
                      : null;
                    const targetVol = isStart ? recipeData.preBoilL.toFixed(1) : isEnd ? recipeData.endOfBoilL.toFixed(1) : null;

                    // Evaporation (not applicable to start step)
                    const startEntry = boil.entries[0];
                    const startVolNum = d != null && d > 0 && startEntry.heightCm != null
                      ? Math.PI * Math.pow(d / 2, 2) * startEntry.heightCm / 1000
                      : null;
                    const currentVolNum = d != null && d > 0 && entry.heightCm != null
                      ? Math.PI * Math.pow(d / 2, 2) * entry.heightCm / 1000
                      : null;
                    const evapL = !isStart && startVolNum != null && currentVolNum != null
                      ? startVolNum - currentVolNum
                      : null;
                    const evapLH = (() => {
                      if (isStart || evapL == null || !startEntry.time || !entry.time) return null;
                      const [sh, sm] = startEntry.time.split(":").map(Number);
                      const [eh, em] = entry.time.split(":").map(Number);
                      const diffMin = (eh * 60 + em) - (sh * 60 + sm);
                      if (diffMin <= 0) return null;
                      return evapL / (diffMin / 60);
                    })();

                    const stepMin = calcStepMin(startEntry.time, entry.time);

                    return (
                      <tr key={entry.id} className="border-b last:border-0">
                        <td className="py-1 pr-2 text-muted-foreground whitespace-nowrap">{label}</td>
                        <td className="py-1 px-2">
                          <TimeInput value={entry.time} onChange={(v) => setBoilEntry(entry.id, "time", v)} className="w-36" />
                        </td>
                        <td className="py-1 px-2 tabular-nums text-muted-foreground">
                          {!isStart && stepMin != null ? stepMin : ""}
                        </td>
                        <td className="py-1 px-2">
                          <NumInput value={entry.heightCm} onChange={(v) => setBoilEntry(entry.id, "heightCm", v)} className="w-20" />
                        </td>
                        <td className="py-1 px-2 tabular-nums">
                          {computedVol != null ? computedVol : "—"}
                        </td>
                        <td className="py-1 px-2 tabular-nums">
                          {(() => {
                            if (currentVolNum == null || currentVolNum <= 0) return "—";
                            const refDensity = preboil.densityGL ?? recipeData.preBoilDensityGL;
                            if (refDensity == null) return "—";
                            const refVolumeL = (() => {
                              if (preboil.densityGL != null && preboil.heightCm != null && d != null && d > 0)
                                return Math.PI * Math.pow(d / 2, 2) * preboil.heightCm / 1000;
                              return recipeData.preBoilL;
                            })();
                            return (1000 + (refDensity - 1000) * refVolumeL / currentVolNum).toFixed(1);
                          })()}
                        </td>
                        <td className="py-1 px-2 tabular-nums text-muted-foreground">
                          {targetVol ?? ""}
                        </td>
                        <td className="py-1 px-2">
                          {!isStart && (evapL != null || evapLH != null) ? (
                            <div className="text-xs tabular-nums">
                              {evapL != null && (
                                <span>
                                  {evapL.toFixed(2)} L
                                  {evapLH != null && <span className="text-muted-foreground"> · {evapLH.toFixed(2)} L/h</span>}
                                </span>
                              )}
                            </div>
                          ) : null}
                        </td>
                        <td className="py-1 pl-1 flex items-center gap-1">
                          {!isStart && !isEnd && (
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeBoilEntry(entry.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                          {isBeforeEnd && (
                            <Button type="button" variant="outline" size="sm" onClick={addBoilEntry} className="h-6 text-xs px-2">
                              <Plus className="h-3 w-3" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Boil Timeline */}
          {(() => {
            const totalMin = recipeData.boilTimeMin;
            const irishMossG = (recipeData.endOfBoilL / 20 * 2).toFixed(1);
            const nutrientsG = (recipeData.endOfBoilL / 100).toFixed(2);

            type TimelineGroup = { timeRemaining: number; items: Array<{ label: string; amount: string }> };
            const groups: TimelineGroup[] = [];

            const addItem = (label: string, amount: string, timeRemaining: number) => {
              const g = groups.find(g => g.timeRemaining === timeRemaining);
              if (g) g.items.push({ label, amount });
              else groups.push({ timeRemaining, items: [{ label, amount }] });
            };

            [...recipeData.boilHops]
              .sort((a, b) => b.additionTime - a.additionTime)
              .forEach(h => addItem(h.name, `${h.grams}g`, h.additionTime));
            addItem("Irish Moss", `${irishMossG}g`, 5);
            addItem("Nutrients", `${nutrientsG}g`, 5);

            groups.sort((a, b) => b.timeRemaining - a.timeRemaining);

            return (
              <div className="border rounded-lg p-3 space-y-3">
                <SubTitle>Boil Timeline ({totalMin} min)</SubTitle>
                {/* Bar with alternating labels above/below */}
                {(() => {
                  const barTop = "2.5rem";
                  const barH = "2rem";
                  const totalH = "8rem";
                  const shortName = (name: string) => name.length > 5 ? name.slice(0, 5) + "." : name;
                  return (
                    <div className="relative" style={{ height: totalH }}>
                      {/* Bar */}
                      <div className="absolute inset-x-0 rounded-lg bg-lime-200 dark:bg-lime-900/40" style={{ top: barTop, height: barH }} />
                      {groups.map((group, i) => {
                        const pct = ((totalMin - group.timeRemaining) / totalMin) * 100;
                        const isAbove = i % 2 === 0;
                        const isStart = pct === 0;
                        return (
                          <div key={group.timeRemaining} className="absolute inset-y-0" style={{ left: `${pct}%` }}>
                            {/* Tick */}
                            <div className="absolute w-px bg-lime-500" style={{ top: barTop, height: barH }} />
                            {/* Minute label inside bar */}
                            <span className="absolute ml-1 text-[10px] font-medium tabular-nums text-lime-600 dark:text-lime-400" style={{ top: "2.65rem" }}>
                              {group.timeRemaining}
                            </span>
                            {/* Items stacked above or below */}
                            <div
                              className={`absolute flex gap-0.5 ${isStart ? "" : "-translate-x-1/2"} ${isAbove ? "flex-col-reverse" : "flex-col"}`}
                              style={isAbove ? { bottom: "6rem" } : { top: "5rem" }}
                            >
                              {group.items.map(it => (
                                <span key={it.label} className="text-[11px] font-bold whitespace-nowrap text-muted-foreground leading-tight">
                                  {it.amount} {shortName(it.label)}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            );
          })()}
        </div>
      </CollapsibleCard>

      {/* ---- WHIRLPOOL Y ENFRIADO ---- */}
      <CollapsibleCard
        title="Whirlpool &amp; Chilling"
        icon={<Snowflake className="h-4 w-4" />}
        open={openWhirlpool}
        onToggle={onToggleWhirlpool}
        badge={(() => {
          const toMins = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
          const fmt = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
          const wpStart = whirlpoolChilling.whirlpoolStartTime;
          const chillStart = whirlpoolChilling.chillingStartTime;
          const chillEnd = whirlpoolChilling.chillingEndTime;
          if (!wpStart || !chillStart || !chillEnd) return null;
          const wpMins = toMins(chillStart) - toMins(wpStart);
          const chillMins = toMins(chillEnd) - toMins(chillStart);
          if (wpMins <= 0 || chillMins <= 0) return null;
          return (
            <span className="text-xs text-muted-foreground tabular-nums">
              {fmt(wpMins)} + {fmt(chillMins)} = {fmt(wpMins + chillMins)}
            </span>
          );
        })()}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border rounded-lg p-3 space-y-2">
            <FieldGroup label="Whirlpool start">
              <TimeInput value={whirlpoolChilling.whirlpoolStartTime} onChange={(v) => setWhirlpool("whirlpoolStartTime", v)} />
            </FieldGroup>
            <div className="grid grid-cols-2 gap-2">
              <FieldGroup label="Chilling start">
                <TimeInput value={whirlpoolChilling.chillingStartTime} onChange={(v) => setWhirlpool("chillingStartTime", v)} />
              </FieldGroup>
              <FieldGroup label="Temp °C">
                <NumInput value={whirlpoolChilling.startTempC} onChange={(v) => setWhirlpool("startTempC", v)} />
              </FieldGroup>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FieldGroup label="Chilling end">
                <TimeInput value={whirlpoolChilling.chillingEndTime} onChange={(v) => setWhirlpool("chillingEndTime", v)} />
              </FieldGroup>
              <FieldGroup label="Temp °C">
                <NumInput value={whirlpoolChilling.endTempC} onChange={(v) => setWhirlpool("endTempC", v)} />
              </FieldGroup>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FieldGroup label="Transfer end">
                <TimeInput value={whirlpoolChilling.transferEndTime} onChange={(v) => setWhirlpool("transferEndTime", v)} />
              </FieldGroup>
              <FieldGroup label="Temp °C">
                <NumInput value={whirlpoolChilling.transferTempC} onChange={(v) => setWhirlpool("transferTempC", v)} />
              </FieldGroup>
            </div>
          </div>
          <div className="border rounded-lg p-3 space-y-2">
            <CheckRow checked={whirlpoolChilling.ogSample} onCheckedChange={(v) => setWhirlpool("ogSample", v)} label="OG sample" />
            <FieldGroup label="Density g/L">
              <NumInput value={whirlpoolChilling.ogSampleDensity} onChange={(v) => setWhirlpool("ogSampleDensity", v)} />
            </FieldGroup>
            <FieldGroup label="Target density g/L">
              <span className="text-sm font-medium">{recipeData.targetOg ?? "—"}</span>
            </FieldGroup>
            <FieldGroup label="pH (5.2–5.6)">
              <NumInput value={whirlpoolChilling.ogSamplePh} onChange={(v) => setWhirlpool("ogSamplePh", v)} />
            </FieldGroup>
          </div>
        </div>
      </CollapsibleCard>

      {/* ---- FERMENTATION ---- */}
      <FermentationSection
        fermentation={fermentation}
        setFermentation={setFermentation}
        addStep={addFermentationStep}
        removeStep={removeFermentationStep}
        setStep={setFermentationStep}
        og={whirlpoolChilling.ogSampleDensity != null ? whirlpoolChilling.ogSampleDensity / 1000 : recipeData.targetOg}
        fermenterWeightKg={recipeData.fermenterWeightKg}
        startingGasTankKg={preparation.gasTankKg}
        brewDate={recipeData.brewDate}
        open={openFermentation}
        onToggle={onToggleFermentation}
      />

      {/* ---- KEGGING ---- */}
      <CollapsibleCard title="Kegging & Carbonation" icon={<Package className="h-4 w-4" />} open={openKegging} onToggle={onToggleKegging}>
        {(() => {
          const kegList = kegging.kegs ?? [];
          const usedKegIds = new Set(kegList.map(k => k.kegId));
          const availableKegs = kegInventory.filter(k => !usedKegIds.has(k.id));
          // FG: last fermentation step with a density reading
          const stepsWithDensity = fermentation.steps.filter(s => s.densityGL != null);
          const fg = stepsWithDensity.length > 0 ? stepsWithDensity[stepsWithDensity.length - 1].densityGL! / 1000 : null;
          const totalKegVolume = kegList.reduce((sum, k) => {
            if (k.totalWeightKg == null || k.tareWeightKg == null || fg == null) return sum;
            return sum + (k.totalWeightKg - k.tareWeightKg) / fg;
          }, 0);
          return (
            <div className="space-y-3">
              <div className="flex items-center gap-4 flex-wrap">
                <FieldGroup label="Kegging date &amp; time">
                  <Input
                    type="datetime-local"
                    value={kegging.dateTime ?? ""}
                    onChange={(e) => setKegging("dateTime", e.target.value || null)}
                    className="h-7 text-sm w-52"
                  />
                </FieldGroup>
                <FieldGroup label="Final gravity">
                  <span className="text-sm font-medium">
                    {stepsWithDensity.length > 0
                      ? stepsWithDensity[stepsWithDensity.length - 1].densityGL
                      : <span className="text-muted-foreground italic">—</span>}
                  </span>
                </FieldGroup>
              </div>

              {/* Keg list */}
              {kegList.length > 0 && (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="text-left px-3 py-1.5 text-xs font-medium text-muted-foreground">Keg</th>
                        <th className="text-left px-3 py-1.5 text-xs font-medium text-muted-foreground">Tare (kg)</th>
                        <th className="text-left px-3 py-1.5 text-xs font-medium text-muted-foreground">Total (kg)</th>
                        <th className="text-left px-3 py-1.5 text-xs font-medium text-muted-foreground">Volume (L)</th>
                        <th className="px-2 py-1.5" />
                      </tr>
                    </thead>
                    <tbody>
                      {kegList.map((k) => {
                        const vol = k.totalWeightKg != null && k.tareWeightKg != null && fg != null
                          ? ((k.totalWeightKg - k.tareWeightKg) / fg).toFixed(2)
                          : null;
                        return (
                          <tr key={k.id} className="border-b last:border-0">
                            <td className="px-3 py-1.5">{k.kegName}</td>
                            <td className="px-3 py-1.5 text-muted-foreground">
                              {k.tareWeightKg != null ? k.tareWeightKg.toFixed(2) : <span className="text-xs italic">—</span>}
                            </td>
                            <td className="px-2 py-1">
                              <NumInput
                                value={k.totalWeightKg}
                                onChange={(v) => setKegWeight(k.id, v)}
                                className="w-20"
                              />
                            </td>
                            <td className="px-3 py-1.5 font-medium">
                              {vol != null ? vol : fg == null ? <span className="text-xs text-muted-foreground italic">no FG</span> : <span className="text-muted-foreground">—</span>}
                            </td>
                            <td className="px-2 py-1.5">
                              <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeKeg(k.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {kegList.length > 1 && (
                      <tfoot>
                        <tr className="border-t bg-muted/20">
                          <td colSpan={3} className="px-3 py-1.5 text-xs text-muted-foreground">Total</td>
                          <td className="px-3 py-1.5 font-medium text-sm">{totalKegVolume > 0 ? totalKegVolume.toFixed(2) : "—"}</td>
                          <td />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}

              {/* Add keg */}
              {availableKegs.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    className="h-7 text-sm border rounded px-2 bg-background flex-1 max-w-xs"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        addKeg(e.target.value);
                        e.target.value = "";
                      }
                    }}
                  >
                    <option value="" disabled>Add keg from inventory…</option>
                    {availableKegs.map(k => (
                      <option key={k.id} value={k.id}>
                        {k.name}{k.tareWeight != null ? ` (tare: ${k.tareWeight} kg)` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Carbonation */}
              <div className="flex items-end gap-4 flex-wrap">
                <FieldGroup label="Carbonation">
                  <select
                    className="h-7 text-sm border rounded px-2 bg-background"
                    value={kegging.carbonationVols ?? ""}
                    onChange={(e) => setKegging("carbonationVols", e.target.value ? parseFloat(e.target.value) : null)}
                  >
                    <option value="">Select…</option>
                    {CARB_PRESETS.map(p => (
                      <option key={p.vols} value={p.vols}>
                        {p.label} — {p.vols} vol
                      </option>
                    ))}
                  </select>
                </FieldGroup>
                <FieldGroup label="Temp (°C)">
                  <NumInput
                    value={kegging.carbonationTempC}
                    onChange={(v) => setKegging("carbonationTempC", v)}
                    placeholder="°C"
                    className="w-16"
                  />
                </FieldGroup>
                {kegging.carbonationVols != null && kegging.carbonationTempC != null && (() => {
                  const p = calcCarbPressure(kegging.carbonationVols, kegging.carbonationTempC);
                  return (
                    <FieldGroup label="Pressure">
                      <span className="text-sm font-medium h-7 flex items-center gap-2">
                        {p.psi.toFixed(2)} PSI
                        <span className="text-muted-foreground font-normal">/ {p.bar.toFixed(2)} bar</span>
                      </span>
                    </FieldGroup>
                  );
                })()}
              </div>

            </div>
          );
        })()}
      </CollapsibleCard>

      {/* ---- LAGERING ---- */}
      <CollapsibleCard title="Lagering" icon={<Barrel className="h-4 w-4" />} open={openLagering} onToggle={onToggleLagering}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Checkbox checked={lagering.gelatinCheck} onCheckedChange={(v) => setLagering("gelatinCheck", v === true)} />
              <span className="text-sm whitespace-nowrap">Gelatin:</span>
              <NumInput value={gelatinaVolL} onChange={setGelatinaVolL} placeholder="L" className="w-16" />
              <span className="text-xs text-muted-foreground">L →</span>
              <span className="text-xs font-medium">
                {gelatinaVolL != null ? `${(gelatinaVolL * 3 / 20).toFixed(1)} g` : "—"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={lagering.smbCheck} onCheckedChange={(v) => setLagering("smbCheck", v === true)} />
              <span className="text-sm whitespace-nowrap">SMB:</span>
              <NumInput value={smbVolL} onChange={setSmbVolL} placeholder="L" className="w-16" />
              <span className="text-xs text-muted-foreground">L →</span>
              <span className="text-xs font-medium">
                {smbVolL != null ? `${(smbVolL * 0.3 / 20).toFixed(2)} g` : "—"}
              </span>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
            <Textarea
              value={lagering.notes ?? ""}
              onChange={(e) => setLagering("notes", e.target.value || null)}
              placeholder="Lagering notes…"
              className="text-sm min-h-[80px]"
            />
          </div>
        </div>
      </CollapsibleCard>

      {/* ---- BOTTLING ---- */}
      <CollapsibleCard title="Bottling" icon={<GlassWater className="h-4 w-4" />} open={openBottling} onToggle={onToggleBottling}>
        <div className="space-y-3">
          <div className="flex items-center gap-4 flex-wrap">
            <FieldGroup label="Bottling date &amp; time">
              <Input
                type="datetime-local"
                value={bottling.dateTime ?? ""}
                onChange={(e) => setBottling("dateTime", e.target.value || null)}
                className="h-7 text-sm w-52"
              />
            </FieldGroup>
            <FieldGroup label="Volume bottled (L)">
              <NumInput
                value={bottling.volumeL}
                onChange={(v) => setBottling("volumeL", v)}
                placeholder="L"
                className="w-20"
              />
            </FieldGroup>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
            <Textarea
              value={bottling.notes ?? ""}
              onChange={(e) => setBottling("notes", e.target.value || null)}
              placeholder="Bottling notes…"
              className="text-sm min-h-[80px]"
            />
          </div>
        </div>
      </CollapsibleCard>

      </>}
    </>
  );
}
