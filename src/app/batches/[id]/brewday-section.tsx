"use client";

import { useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { CollapsibleCard } from "./beer-sections";
import {
  type BrewdayData,
  type MaceradoData,
  type MashStepEntry,
  type LavadoData,
  type PreboilData,
  type LastRunData,
  type HervidoData,
  type WhirlpoolEnfriadoData,
  type FermentacionData,
  type EmbarriladoData,
  type BoilEntry,
} from "@/lib/brewday-types";

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
    <Input
      type="number"
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
  mashMode: "sparge" | "biab";
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
}

interface BrewdaySectionProps {
  brewday: BrewdayData;
  updateBrewday: <K extends keyof BrewdayData>(section: K, value: BrewdayData[K]) => void;
  recipeData: RecipeData;
  openPreparacion: boolean; onTogglePreparacion: () => void;
  openMolienda: boolean; onToggleMolienda: () => void;
  openMacerado: boolean; onToggleMacerado: () => void;
  openLavado: boolean; onToggleLavado: () => void;
  openHervido: boolean; onToggleHervido: () => void;
  openWhirlpool: boolean; onToggleWhirlpool: () => void;
  openFermentacion: boolean; onToggleFermentacion: () => void;
  openEmbarrilado: boolean; onToggleEmbarrilado: () => void;
}

export function BrewdaySection({
  brewday, updateBrewday, recipeData,
  openPreparacion, onTogglePreparacion,
  openMolienda, onToggleMolienda,
  openMacerado, onToggleMacerado,
  openLavado, onToggleLavado,
  openHervido, onToggleHervido,
  openWhirlpool, onToggleWhirlpool,
  openFermentacion, onToggleFermentacion,
  openEmbarrilado, onToggleEmbarrilado,
}: BrewdaySectionProps) {
  const { preparacion, molienda, macerado, lavado, preboil, lastRun, hervido, whirlpoolEnfriado, fermentacion, embarrilado } = brewday;

  const setPrep = useCallback(
    (key: keyof typeof preparacion, val: boolean | number | null) => {
      updateBrewday("preparacion", { ...preparacion, [key]: val });
    },
    [preparacion, updateBrewday]
  );

  const setAguaMacerado = useCallback(
    (key: keyof MaceradoData["aguaMacerado"], val: string | number | null) => {
      updateBrewday("macerado", { ...macerado, aguaMacerado: { ...macerado.aguaMacerado, [key]: val } });
    },
    [macerado, updateBrewday]
  );

  const setAguaLavado = useCallback(
    (key: keyof MaceradoData["aguaLavado"], val: number | null) => {
      updateBrewday("macerado", { ...macerado, aguaLavado: { ...macerado.aguaLavado, [key]: val } });
    },
    [macerado, updateBrewday]
  );

  const setAguaLavadoOlla = useCallback(
    (val: string | null) => {
      updateBrewday("macerado", { ...macerado, aguaLavado: { ...macerado.aguaLavado, olla: val } });
    },
    [macerado, updateBrewday]
  );

  const setMaceradoGeneral = useCallback(
    (key: keyof MaceradoData["general"], val: string | number | boolean | null) => {
      updateBrewday("macerado", { ...macerado, general: { ...macerado.general, [key]: val } });
    },
    [macerado, updateBrewday]
  );

  const addMashStep = useCallback(() => {
    const now = new Date();
    const hora = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newStep: MashStepEntry = { id: crypto.randomUUID(), hora, tempC: null, ph: null, recirculado: false, revolver: false };
    updateBrewday("macerado", { ...macerado, timeline: [...macerado.timeline, newStep] });
  }, [macerado, updateBrewday]);

  const removeMashStep = useCallback((id: string) => {
    updateBrewday("macerado", { ...macerado, timeline: macerado.timeline.filter((s) => s.id !== id) });
  }, [macerado, updateBrewday]);

  const setMashStep = useCallback(
    (id: string, key: keyof MashStepEntry, val: string | number | boolean | null) => {
      updateBrewday("macerado", {
        ...macerado,
        timeline: macerado.timeline.map((s) => (s.id === id ? { ...s, [key]: val } : s)),
      });
    },
    [macerado, updateBrewday]
  );

  const setLavado = useCallback(
    (key: keyof LavadoData, val: string | number | null) => {
      updateBrewday("lavado", { ...lavado, [key]: val });
    },
    [lavado, updateBrewday]
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

  const setHervido = useCallback(
    (key: keyof Omit<HervidoData, "entries">, val: boolean | number | null) => {
      updateBrewday("hervido", { ...hervido, [key]: val });
    },
    [hervido, updateBrewday]
  );

  // Ensure boil always has at least start + end entries
  useEffect(() => {
    if (hervido.entries.length < 2) {
      const start: BoilEntry = hervido.entries[0] ?? { id: crypto.randomUUID(), hora: null, alturaCm: null, volumenL: null, volumenObjL: null };
      const end: BoilEntry = { id: crypto.randomUUID(), hora: null, alturaCm: null, volumenL: null, volumenObjL: null };
      updateBrewday("hervido", { ...hervido, entries: [start, end] });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addBoilEntry = useCallback(() => {
    const newEntry: BoilEntry = { id: crypto.randomUUID(), hora: null, alturaCm: null, volumenL: null, volumenObjL: null };
    const entries = [...hervido.entries];
    // Insert before last entry (end)
    entries.splice(Math.max(entries.length - 1, 1), 0, newEntry);
    updateBrewday("hervido", { ...hervido, entries });
  }, [hervido, updateBrewday]);

  const removeBoilEntry = useCallback(
    (id: string) => {
      updateBrewday("hervido", { ...hervido, entries: hervido.entries.filter((e) => e.id !== id) });
    },
    [hervido, updateBrewday]
  );

  const setBoilEntry = useCallback(
    (id: string, key: keyof BoilEntry, val: string | number | null) => {
      updateBrewday("hervido", {
        ...hervido,
        entries: hervido.entries.map((e) => (e.id === id ? { ...e, [key]: val } : e)),
      });
    },
    [hervido, updateBrewday]
  );

  const setWhirlpool = useCallback(
    (key: keyof WhirlpoolEnfriadoData, val: string | number | boolean | null) => {
      updateBrewday("whirlpoolEnfriado", { ...whirlpoolEnfriado, [key]: val });
    },
    [whirlpoolEnfriado, updateBrewday]
  );

  const setFermentacion = useCallback(
    (key: keyof FermentacionData, val: string | number | boolean | null) => {
      updateBrewday("fermentacion", { ...fermentacion, [key]: val });
    },
    [fermentacion, updateBrewday]
  );

  const setEmbarrilado = useCallback(
    (key: keyof EmbarriladoData, val: string | number | boolean | null) => {
      updateBrewday("embarrilado", { ...embarrilado, [key]: val });
    },
    [embarrilado, updateBrewday]
  );

  return (
    <>
      {/* Brewday title separator */}
      <div className="flex items-center gap-3 pt-2">
        <h2 className="text-lg font-bold tracking-tight whitespace-nowrap">Brewday</h2>
        <div className="flex-1 border-t" />
      </div>

      {/* ---- PREPARACION ---- */}
      <CollapsibleCard title="Preparation" open={openPreparacion} onToggle={onTogglePreparacion}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <CheckRow checked={preparacion.congelarBotellas} onCheckedChange={(v) => setPrep("congelarBotellas", v)} label="Freeze water bottles" />
          <CheckRow checked={preparacion.prepararHeladera} onCheckedChange={(v) => setPrep("prepararHeladera", v)} label="Prepare cooler" />
          <CheckRow checked={preparacion.armarMolino} onCheckedChange={(v) => setPrep("armarMolino", v)} label="Set up mill" />
          <CheckRow checked={preparacion.armarSerpentinas} onCheckedChange={(v) => setPrep("armarSerpentinas", v)} label="Set up chiller coils" />
          <CheckRow checked={preparacion.lavarMacerador} onCheckedChange={(v) => setPrep("lavarMacerador", v)} label="Clean/set up mash tun" />
          <CheckRow checked={preparacion.prepararAlcohol} onCheckedChange={(v) => setPrep("prepararAlcohol", v)} label="Prepare 70% alcohol" />
          <CheckRow checked={preparacion.lavarFermentador} onCheckedChange={(v) => setPrep("lavarFermentador", v)} label="Clean/set up fermenter" />
          <CheckRow checked={preparacion.cocinaLimpia} onCheckedChange={(v) => setPrep("cocinaLimpia", v)} label="Clean kitchen" />
          <CheckRow checked={preparacion.pesarMaltas} onCheckedChange={(v) => setPrep("pesarMaltas", v)} label="Weigh grains" />
          <CheckRow checked={preparacion.prepararMesa} onCheckedChange={(v) => setPrep("prepararMesa", v)} label="Set up workspace" />
          <CheckRow checked={preparacion.prepararAnafe} onCheckedChange={(v) => setPrep("prepararAnafe", v)} label="Prepare burner" />
          <div className="flex items-center gap-2">
            <Checkbox checked={!!preparacion.cargaGarrafaKg || preparacion.cargaGarrafaKg === 0} onCheckedChange={() => {}} className="shrink-0" />
            <span className="text-sm whitespace-nowrap">Gas tank:</span>
            <NumInput value={preparacion.cargaGarrafaKg} onChange={(v) => setPrep("cargaGarrafaKg", v)} className="w-24" />
            <span className="text-xs text-muted-foreground">kg</span>
          </div>
          <CheckRow checked={preparacion.filtrarAgua} onCheckedChange={(v) => setPrep("filtrarAgua", v)} label="Filter water (in fermenter)" />
          <CheckRow checked={preparacion.calibrarPhmetro} onCheckedChange={(v) => setPrep("calibrarPhmetro", v)} label="Calibrate pH meter" />
        </div>
      </CollapsibleCard>

      {/* ---- MOLIENDA ---- */}
      <CollapsibleCard title="Milling" open={openMolienda} onToggle={onToggleMolienda}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <FieldLabel>Date &amp; time</FieldLabel>
            <Input
              type="datetime-local"
              value={molienda.fechaHora ?? ""}
              onChange={(e) => updateBrewday("molienda", { fechaHora: e.target.value || null })}
              className="h-7 text-sm w-52"
            />
          </div>
          <div className="flex items-center gap-3">
            <FieldLabel>Roller gap (mm)</FieldLabel>
            <Input
              type="number"
              step="0.05"
              min="0"
              value={molienda.gapMm ?? ""}
              onChange={(e) => updateBrewday("molienda", { gapMm: e.target.value === "" ? null : parseFloat(e.target.value) })}
              placeholder="0.8"
              className="h-7 text-sm w-24"
            />
            {molienda.gapMm != null && (() => {
              const gap = molienda.gapMm;
              const [label, color] =
                gap < 0.5  ? ["Very fine",  "text-red-500"] :
                gap < 0.7  ? ["Fine",       "text-orange-500"] :
                gap < 0.9  ? ["Standard",   "text-green-600"] :
                gap < 1.1  ? ["Coarse",     "text-amber-500"] :
                             ["Very coarse","text-red-500"];
              return <span className={`text-xs font-medium ${color}`}>{label}</span>;
            })()}
          </div>
        </div>
      </CollapsibleCard>

      {/* ---- MACERADO ---- */}
      <CollapsibleCard
        title="Mash"
        open={openMacerado}
        onToggle={onToggleMacerado}
        badge={(() => {
          const heatTime = macerado.general.horaCalentarAgua;
          const lastStep = macerado.timeline[macerado.timeline.length - 1];
          const lastTime = lastStep?.hora;
          if (!heatTime || !lastTime) return null;
          const [ah, am] = heatTime.split(":").map(Number);
          const [bh, bm] = lastTime.split(":").map(Number);
          const diff = (bh * 60 + bm) - (ah * 60 + am);
          if (diff <= 0) return null;
          const hh = String(Math.floor(diff / 60)).padStart(2, "0");
          const mm = String(diff % 60).padStart(2, "0");
          return <span className="text-xs text-muted-foreground tabular-nums">{hh}:{mm}</span>;
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
                      <RecipeRef label="Volume:" value={`${recipeData.mashWaterL.toFixed(1)} L`} />
                      {mashH != null && <RecipeRef label="Height:" value={`${mashH} cm`} />}
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
                    checked={macerado.general.checkGustoAgua}
                    onCheckedChange={(v) => setMaceradoGeneral("checkGustoAgua", v)}
                    label="Check water taste"
                  />
                  <FieldGroup label="Notes">
                    <Textarea
                      value={macerado.aguaMacerado.notes ?? ""}
                      onChange={(e) => setAguaMacerado("notes", e.target.value || null)}
                      placeholder="—"
                      className="text-sm min-h-[60px] resize-none"
                    />
                  </FieldGroup>
                </div>
              );
            })()}

            {/* Sparge Water — hidden in BIAB mode */}
            {recipeData.mashMode !== "biab" && (() => {
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
                      <NumInput value={macerado.aguaLavado.ph} onChange={(v) => setAguaLavado("ph", v)} />
                    </FieldGroup>
                    <FieldGroup label="Notes">
                      <Textarea
                        value={macerado.aguaLavado.notes ?? ""}
                        onChange={(e) => setAguaLavado("notes", e.target.value || null)}
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
                <TimeInput value={macerado.general.horaCalentarAgua} onChange={(v) => setMaceradoGeneral("horaCalentarAgua", v)} />
              </FieldGroup>
              <FieldGroup label="Mash in time">
                <TimeInput value={macerado.general.horaInicioEmpaste} onChange={(v) => setMaceradoGeneral("horaInicioEmpaste", v)} />
              </FieldGroup>
              <div className="flex flex-col gap-1">
                <FieldLabel>Heat duration</FieldLabel>
                <span className="text-sm font-semibold tabular-nums h-7 flex items-center">
                  {(() => {
                    const a = macerado.general.horaCalentarAgua;
                    const b = macerado.general.horaInicioEmpaste;
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
                {macerado.timeline.map((step, idx) => {
                  const firstHora = macerado.timeline[0]?.hora;
                  const minVal = idx === 0 ? 0 : calcStepMin(firstHora, step.hora);
                  return (
                    <tr key={step.id} className="border-b last:border-0">
                      <td className="py-1 pr-2">
                        <TimeInput value={step.hora} onChange={(v) => setMashStep(step.id, "hora", v)} className="w-44" />
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
                        <Checkbox checked={step.recirculado} onCheckedChange={(v) => setMashStep(step.id, "recirculado", v === true)} className="mx-auto" />
                      </td>
                      <td className="py-1 px-2 text-center">
                        <Checkbox checked={step.revolver} onCheckedChange={(v) => setMashStep(step.id, "revolver", v === true)} className="mx-auto" />
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

      {/* ---- LAVADO / POST-SPARGE ---- */}
      <CollapsibleCard
        title="Sparge"
        open={openLavado}
        onToggle={onToggleLavado}
        badge={(() => {
          const start = lavado.horaInicioLavado;
          const end = lavado.horaFinLavado;
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
                <TimeInput value={lavado.horaInicioLavado} onChange={(v) => setLavado("horaInicioLavado", v)} />
              </FieldGroup>
              <FieldGroup label="Sparge end">
                <TimeInput value={lavado.horaFinLavado} onChange={(v) => setLavado("horaFinLavado", v)} />
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
              const computedVol = d != null && d > 0 && preboil.alturaCm != null
                ? (Math.PI * Math.pow(d / 2, 2) * preboil.alturaCm / 1000).toFixed(1)
                : null;
              return (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <FieldGroup label="Height cm">
                      <NumInput value={preboil.alturaCm} onChange={(v) => setPreboil("alturaCm", v)} />
                    </FieldGroup>
                    {computedVol != null && (
                      <RecipeRef label="→ Vol:" value={`${computedVol} L`} />
                    )}
                  </div>
                  <FieldGroup label="Density g/L">
                    <NumInput value={preboil.densidadGL} onChange={(v) => setPreboil("densidadGL", v)} />
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
                <NumInput value={lavado.primerMostoDensidad} onChange={(v) => setLavado("primerMostoDensidad", v)} />
              </FieldGroup>
              <FieldGroup label="pH">
                <NumInput value={lavado.primerMostoPh} onChange={(v) => setLavado("primerMostoPh", v)} />
              </FieldGroup>
            </div>
            {recipeData.mashMode !== "biab" && (
              <div className="mt-6">
                <SubTitle>Last run</SubTitle>
                <div className="grid grid-cols-2 gap-2">
                  <FieldGroup label="Density g/L">
                    <NumInput value={lastRun.densidadGL} onChange={(v) => setLastRun("densidadGL", v)} />
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

      {/* ---- HERVIDO ---- */}
      <CollapsibleCard title="Boil" open={openHervido} onToggle={onToggleHervido}>
        <div className="space-y-4">
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
                    <th className="text-left py-1 px-2 font-medium text-muted-foreground">Target L</th>
                    <th className="text-left py-1 px-2 font-medium text-muted-foreground">Evaporation</th>
                    <th className="w-6" />
                  </tr>
                </thead>
                <tbody>
                  {hervido.entries.map((entry, idx) => {
                    const isStart = idx === 0;
                    const isEnd = idx === hervido.entries.length - 1;
                    const isBeforeEnd = idx === hervido.entries.length - 2;
                    const label = isStart ? "Boil start" : isEnd ? "Boil end" : `Step ${idx}`;
                    const d = recipeData.mashPotDiameterCm;
                    const computedVol = d != null && d > 0 && entry.alturaCm != null
                      ? (Math.PI * Math.pow(d / 2, 2) * entry.alturaCm / 1000).toFixed(2)
                      : null;
                    const targetVol = isStart ? recipeData.preBoilL.toFixed(1) : isEnd ? recipeData.endOfBoilL.toFixed(1) : null;

                    // Evaporation (not applicable to start step)
                    const startEntry = hervido.entries[0];
                    const startVolNum = d != null && d > 0 && startEntry.alturaCm != null
                      ? Math.PI * Math.pow(d / 2, 2) * startEntry.alturaCm / 1000
                      : null;
                    const currentVolNum = d != null && d > 0 && entry.alturaCm != null
                      ? Math.PI * Math.pow(d / 2, 2) * entry.alturaCm / 1000
                      : null;
                    const evapL = !isStart && startVolNum != null && currentVolNum != null
                      ? startVolNum - currentVolNum
                      : null;
                    const evapLH = (() => {
                      if (isStart || evapL == null || !startEntry.hora || !entry.hora) return null;
                      const [sh, sm] = startEntry.hora.split(":").map(Number);
                      const [eh, em] = entry.hora.split(":").map(Number);
                      const diffMin = (eh * 60 + em) - (sh * 60 + sm);
                      if (diffMin <= 0) return null;
                      return evapL / (diffMin / 60);
                    })();

                    const stepMin = calcStepMin(startEntry.hora, entry.hora);

                    return (
                      <tr key={entry.id} className="border-b last:border-0">
                        <td className="py-1 pr-2 text-muted-foreground whitespace-nowrap">{label}</td>
                        <td className="py-1 px-2">
                          <TimeInput value={entry.hora} onChange={(v) => setBoilEntry(entry.id, "hora", v)} className="w-36" />
                        </td>
                        <td className="py-1 px-2 tabular-nums text-muted-foreground">
                          {!isStart && stepMin != null ? stepMin : ""}
                        </td>
                        <td className="py-1 px-2">
                          <NumInput value={entry.alturaCm} onChange={(v) => setBoilEntry(entry.id, "alturaCm", v)} className="w-20" />
                        </td>
                        <td className="py-1 px-2 tabular-nums">
                          {computedVol != null ? computedVol : "—"}
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
                              <Plus className="h-3 w-3 mr-1" /> Step
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
                              className={`absolute -translate-x-1/2 flex gap-0.5 ${isAbove ? "flex-col-reverse" : "flex-col"}`}
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
      <CollapsibleCard title="Whirlpool &amp; Chilling" open={openWhirlpool} onToggle={onToggleWhirlpool}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border rounded-lg p-3 space-y-2">
            <FieldGroup label="Whirlpool start">
              <TimeInput value={whirlpoolEnfriado.horaInicioWhirlpool} onChange={(v) => setWhirlpool("horaInicioWhirlpool", v)} />
            </FieldGroup>
            <div className="grid grid-cols-2 gap-2">
              <FieldGroup label="Chilling start">
                <TimeInput value={whirlpoolEnfriado.horaInicioEnfriado} onChange={(v) => setWhirlpool("horaInicioEnfriado", v)} />
              </FieldGroup>
              <FieldGroup label="Temp °C">
                <NumInput value={whirlpoolEnfriado.tempInicioC} onChange={(v) => setWhirlpool("tempInicioC", v)} />
              </FieldGroup>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FieldGroup label="Chilling end">
                <TimeInput value={whirlpoolEnfriado.horaFinEnfriado} onChange={(v) => setWhirlpool("horaFinEnfriado", v)} />
              </FieldGroup>
              <FieldGroup label="Temp °C">
                <NumInput value={whirlpoolEnfriado.tempFinC} onChange={(v) => setWhirlpool("tempFinC", v)} />
              </FieldGroup>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FieldGroup label="Transfer end">
                <TimeInput value={whirlpoolEnfriado.horaFinTrasvase} onChange={(v) => setWhirlpool("horaFinTrasvase", v)} />
              </FieldGroup>
              <FieldGroup label="Temp °C">
                <NumInput value={whirlpoolEnfriado.tempTrasvaseC} onChange={(v) => setWhirlpool("tempTrasvaseC", v)} />
              </FieldGroup>
            </div>
          </div>
          <div className="border rounded-lg p-3 space-y-2">
            <CheckRow checked={whirlpoolEnfriado.muestraOg} onCheckedChange={(v) => setWhirlpool("muestraOg", v)} label="OG sample" />
            <FieldGroup label="Density g/L">
              <NumInput value={whirlpoolEnfriado.muestraOgDensidad} onChange={(v) => setWhirlpool("muestraOgDensidad", v)} />
            </FieldGroup>
            <FieldGroup label="Target density g/L">
              <NumInput value={whirlpoolEnfriado.muestraOgDensidadObj} onChange={(v) => setWhirlpool("muestraOgDensidadObj", v)} />
            </FieldGroup>
            <FieldGroup label="pH (5.2–5.6)">
              <NumInput value={whirlpoolEnfriado.muestraOgPh} onChange={(v) => setWhirlpool("muestraOgPh", v)} />
            </FieldGroup>
          </div>
        </div>
      </CollapsibleCard>

      {/* ---- FERMENTACION ---- */}
      <CollapsibleCard title="Fermentation" open={openFermentacion} onToggle={onToggleFermentacion}>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <FieldGroup label="Total weight kg">
              <NumInput value={fermentacion.pesoTotalKg} onChange={(v) => setFermentacion("pesoTotalKg", v)} />
            </FieldGroup>
            <FieldGroup label="Liquid weight kg">
              <NumInput value={fermentacion.pesoLiquidoKg} onChange={(v) => setFermentacion("pesoLiquidoKg", v)} />
            </FieldGroup>
            <FieldGroup label="Volume L">
              <NumInput value={fermentacion.volumenL} onChange={(v) => setFermentacion("volumenL", v)} />
            </FieldGroup>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="Pitching time">
              <TimeInput value={fermentacion.horaPitching} onChange={(v) => setFermentacion("horaPitching", v)} />
            </FieldGroup>
            <FieldGroup label="Temp °C">
              <NumInput value={fermentacion.tempPitchingC} onChange={(v) => setFermentacion("tempPitchingC", v)} />
            </FieldGroup>
          </div>
          <div className="flex items-center gap-4">
            <CheckRow checked={fermentacion.limpiezaCheck} onCheckedChange={(v) => setFermentacion("limpiezaCheck", v)} label="Cleanup" />
            <FieldGroup label="Final tank weight kg">
              <NumInput value={fermentacion.pesoGarrafaFinalKg} onChange={(v) => setFermentacion("pesoGarrafaFinalKg", v)} />
            </FieldGroup>
          </div>
        </div>
      </CollapsibleCard>

      {/* ---- EMBARRILADO ---- */}
      <CollapsibleCard title="Kegging" open={openEmbarrilado} onToggle={onToggleEmbarrilado}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Checkbox checked={embarrilado.gelatinaCheck} onCheckedChange={(v) => setEmbarrilado("gelatinaCheck", v === true)} />
              <span className="text-sm whitespace-nowrap">Gelatin:</span>
              <TextInput value={embarrilado.gelatinaText} onChange={(v) => setEmbarrilado("gelatinaText", v)} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={embarrilado.smbCheck} onCheckedChange={(v) => setEmbarrilado("smbCheck", v === true)} />
              <span className="text-sm whitespace-nowrap">SMB:</span>
              <TextInput value={embarrilado.smbText} onChange={(v) => setEmbarrilado("smbText", v)} />
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <FieldGroup label="Kegging date &amp; time">
              <Input
                type="datetime-local"
                value={embarrilado.fechaHora ?? ""}
                onChange={(e) => setEmbarrilado("fechaHora", e.target.value || null)}
                className="h-7 text-sm w-52"
              />
            </FieldGroup>
            <FieldGroup label="Volume L">
              <NumInput value={embarrilado.volumenL} onChange={(v) => setEmbarrilado("volumenL", v)} />
            </FieldGroup>
          </div>
        </div>
      </CollapsibleCard>
    </>
  );
}
