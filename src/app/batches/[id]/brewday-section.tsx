"use client";

import { useCallback } from "react";
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
}

interface BrewdaySectionProps {
  brewday: BrewdayData;
  updateBrewday: <K extends keyof BrewdayData>(section: K, value: BrewdayData[K]) => void;
  recipeData: RecipeData;
  openPreparacion: boolean; onTogglePreparacion: () => void;
  openMolienda: boolean; onToggleMolienda: () => void;
  openMacerado: boolean; onToggleMacerado: () => void;
  openLavado: boolean; onToggleLavado: () => void;
  openPreboil: boolean; onTogglePreboil: () => void;
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
  openPreboil, onTogglePreboil,
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

  const addBoilEntry = useCallback(() => {
    const newEntry: BoilEntry = { id: crypto.randomUUID(), hora: null, alturaCm: null, volumenL: null, volumenObjL: null };
    updateBrewday("hervido", { ...hervido, entries: [...hervido.entries, newEntry] });
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
          <CheckRow checked={preparacion.congelarBotellas} onCheckedChange={(v) => setPrep("congelarBotellas", v)} label="Congelar botellas agua" />
          <CheckRow checked={preparacion.prepararHeladera} onCheckedChange={(v) => setPrep("prepararHeladera", v)} label="Preparar heladera" />
          <CheckRow checked={preparacion.armarMolino} onCheckedChange={(v) => setPrep("armarMolino", v)} label="Armar molino" />
          <CheckRow checked={preparacion.armarSerpentinas} onCheckedChange={(v) => setPrep("armarSerpentinas", v)} label="Armar serpentinas" />
          <CheckRow checked={preparacion.lavarMacerador} onCheckedChange={(v) => setPrep("lavarMacerador", v)} label="Lavar/armar macerador" />
          <CheckRow checked={preparacion.prepararAlcohol} onCheckedChange={(v) => setPrep("prepararAlcohol", v)} label="Preparar alcohol 70%" />
          <CheckRow checked={preparacion.lavarFermentador} onCheckedChange={(v) => setPrep("lavarFermentador", v)} label="Lavar/armar fermentador" />
          <CheckRow checked={preparacion.cocinaLimpia} onCheckedChange={(v) => setPrep("cocinaLimpia", v)} label="Cocina limpia" />
          <CheckRow checked={preparacion.pesarMaltas} onCheckedChange={(v) => setPrep("pesarMaltas", v)} label="Pesar maltas" />
          <CheckRow checked={preparacion.prepararMesa} onCheckedChange={(v) => setPrep("prepararMesa", v)} label="Preparar mesa/elementos" />
          <CheckRow checked={preparacion.prepararAnafe} onCheckedChange={(v) => setPrep("prepararAnafe", v)} label="Preparar anafe" />
          <div className="flex items-center gap-2">
            <Checkbox checked={!!preparacion.cargaGarrafaKg || preparacion.cargaGarrafaKg === 0} onCheckedChange={() => {}} className="shrink-0" />
            <span className="text-sm whitespace-nowrap">Carga garrafa:</span>
            <NumInput value={preparacion.cargaGarrafaKg} onChange={(v) => setPrep("cargaGarrafaKg", v)} className="w-24" />
            <span className="text-xs text-muted-foreground">kg</span>
          </div>
          <CheckRow checked={preparacion.filtrarAgua} onCheckedChange={(v) => setPrep("filtrarAgua", v)} label="Filtrar agua (en fermentador)" />
          <CheckRow checked={preparacion.calibrarPhmetro} onCheckedChange={(v) => setPrep("calibrarPhmetro", v)} label="Calibrar Phmetro" />
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

      {/* ---- LAVADO ---- */}
      <CollapsibleCard title="Sparge" open={openLavado} onToggle={onToggleLavado}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border rounded-lg p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <FieldGroup label="Recirculation start">
                <TimeInput value={lavado.horaInicioRecirculado} onChange={(v) => setLavado("horaInicioRecirculado", v)} />
              </FieldGroup>
              <FieldGroup label="Recirculation end">
                <TimeInput value={lavado.horaFinRecirculado} onChange={(v) => setLavado("horaFinRecirculado", v)} />
              </FieldGroup>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FieldGroup label="Sparge start">
                <TimeInput value={lavado.horaInicioLavado} onChange={(v) => setLavado("horaInicioLavado", v)} />
              </FieldGroup>
              <FieldGroup label="Sparge end">
                <TimeInput value={lavado.horaFinLavado} onChange={(v) => setLavado("horaFinLavado", v)} />
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
          </div>
        </div>
      </CollapsibleCard>

      {/* ---- FIN LAVADO / PRE HEAT UP ---- */}
      <CollapsibleCard title="Post-Sparge / Pre Heat Up" open={openPreboil} onToggle={onTogglePreboil}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border rounded-lg p-3 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <FieldGroup label="Vol obj Lts">
                <NumInput value={preboil.volumenObjL} onChange={(v) => setPreboil("volumenObjL", v)} />
              </FieldGroup>
              <FieldGroup label="Altura cm">
                <NumInput value={preboil.alturaObjCm} onChange={(v) => setPreboil("alturaObjCm", v)} />
              </FieldGroup>
              <FieldGroup label="Densidad obj gr/L">
                <NumInput value={preboil.densidadObjGL} onChange={(v) => setPreboil("densidadObjGL", v)} />
              </FieldGroup>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <FieldGroup label="Volumen Lts">
                <NumInput value={preboil.volumenL} onChange={(v) => setPreboil("volumenL", v)} />
              </FieldGroup>
              <FieldGroup label="Altura cm">
                <NumInput value={preboil.alturaCm} onChange={(v) => setPreboil("alturaCm", v)} />
              </FieldGroup>
              <FieldGroup label="Densidad gr/L">
                <NumInput value={preboil.densidadGL} onChange={(v) => setPreboil("densidadGL", v)} />
              </FieldGroup>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FieldGroup label="Temp °C">
                <NumInput value={preboil.tempC} onChange={(v) => setPreboil("tempC", v)} />
              </FieldGroup>
              <FieldGroup label="Ph (Obj: 5.3)">
                <NumInput value={preboil.ph} onChange={(v) => setPreboil("ph", v)} />
              </FieldGroup>
            </div>
          </div>
          <div className="border rounded-lg p-3 space-y-2">
            <SubTitle>Last run</SubTitle>
            <FieldGroup label="Densidad gr/L">
              <NumInput value={lastRun.densidadGL} onChange={(v) => setLastRun("densidadGL", v)} />
            </FieldGroup>
            <FieldGroup label="Ph (Obj &lt;5.6)">
              <NumInput value={lastRun.ph} onChange={(v) => setLastRun("ph", v)} />
            </FieldGroup>
          </div>
        </div>
      </CollapsibleCard>

      {/* ---- HERVIDO ---- */}
      <CollapsibleCard title="Boil" open={openHervido} onToggle={onToggleHervido}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 border rounded-lg p-3 space-y-2">
            {hervido.entries.length === 0 && (
              <p className="text-xs text-muted-foreground italic">Sin entradas. Agrega con el botón +.</p>
            )}
            {hervido.entries.map((entry, idx) => (
              <div key={entry.id} className="flex items-end gap-2 flex-wrap">
                <FieldGroup label={idx === 0 ? "Hora inicio hervido" : idx === hervido.entries.length - 1 ? "Hora fin hervido" : `Hora hervido ${idx}`}>
                  <TimeInput value={entry.hora} onChange={(v) => setBoilEntry(entry.id, "hora", v)} />
                </FieldGroup>
                <FieldGroup label="A cm">
                  <NumInput value={entry.alturaCm} onChange={(v) => setBoilEntry(entry.id, "alturaCm", v)} className="w-16" />
                </FieldGroup>
                <FieldGroup label="V Lts">
                  <NumInput value={entry.volumenL} onChange={(v) => setBoilEntry(entry.id, "volumenL", v)} className="w-16" />
                </FieldGroup>
                {(idx === 0 || idx === hervido.entries.length - 1) && (
                  <FieldGroup label="V obj Lts">
                    <NumInput value={entry.volumenObjL} onChange={(v) => setBoilEntry(entry.id, "volumenObjL", v)} className="w-16" />
                  </FieldGroup>
                )}
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeBoilEntry(entry.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addBoilEntry} className="mt-1 h-7 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" /> Agregar entrada
            </Button>
          </div>
          <div className="border rounded-lg p-3 space-y-2">
            <SubTitle>Last 5 min</SubTitle>
            <div className="flex items-center gap-2">
              <Checkbox checked={hervido.irishMossCheck} onCheckedChange={(v) => setHervido("irishMossCheck", v === true)} />
              <span className="text-sm">Irish Moss</span>
              <NumInput value={hervido.irishMossGr} onChange={(v) => setHervido("irishMossGr", v)} className="w-16" />
              <span className="text-xs text-muted-foreground">gr</span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={hervido.nutrientesCheck} onCheckedChange={(v) => setHervido("nutrientesCheck", v === true)} />
              <span className="text-sm">Nutrientes</span>
              <NumInput value={hervido.nutrientesGr} onChange={(v) => setHervido("nutrientesGr", v)} className="w-16" />
              <span className="text-xs text-muted-foreground">gr</span>
            </div>
            <FieldGroup label="Evaporacion Lts">
              <NumInput value={hervido.evaporacionL} onChange={(v) => setHervido("evaporacionL", v)} />
            </FieldGroup>
          </div>
        </div>
      </CollapsibleCard>

      {/* ---- WHIRLPOOL Y ENFRIADO ---- */}
      <CollapsibleCard title="Whirlpool &amp; Chilling" open={openWhirlpool} onToggle={onToggleWhirlpool}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border rounded-lg p-3 space-y-2">
            <FieldGroup label="Hora inicio whirlpool">
              <TimeInput value={whirlpoolEnfriado.horaInicioWhirlpool} onChange={(v) => setWhirlpool("horaInicioWhirlpool", v)} />
            </FieldGroup>
            <div className="grid grid-cols-2 gap-2">
              <FieldGroup label="Hora inicio enfriado">
                <TimeInput value={whirlpoolEnfriado.horaInicioEnfriado} onChange={(v) => setWhirlpool("horaInicioEnfriado", v)} />
              </FieldGroup>
              <FieldGroup label="Temp °C">
                <NumInput value={whirlpoolEnfriado.tempInicioC} onChange={(v) => setWhirlpool("tempInicioC", v)} />
              </FieldGroup>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FieldGroup label="Hora fin enfriado">
                <TimeInput value={whirlpoolEnfriado.horaFinEnfriado} onChange={(v) => setWhirlpool("horaFinEnfriado", v)} />
              </FieldGroup>
              <FieldGroup label="Temp °C">
                <NumInput value={whirlpoolEnfriado.tempFinC} onChange={(v) => setWhirlpool("tempFinC", v)} />
              </FieldGroup>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FieldGroup label="Hora fin trasvase">
                <TimeInput value={whirlpoolEnfriado.horaFinTrasvase} onChange={(v) => setWhirlpool("horaFinTrasvase", v)} />
              </FieldGroup>
              <FieldGroup label="Temp °C">
                <NumInput value={whirlpoolEnfriado.tempTrasvaseC} onChange={(v) => setWhirlpool("tempTrasvaseC", v)} />
              </FieldGroup>
            </div>
          </div>
          <div className="border rounded-lg p-3 space-y-2">
            <CheckRow checked={whirlpoolEnfriado.muestraOg} onCheckedChange={(v) => setWhirlpool("muestraOg", v)} label="Muestra OG" />
            <FieldGroup label="Densidad gr/L">
              <NumInput value={whirlpoolEnfriado.muestraOgDensidad} onChange={(v) => setWhirlpool("muestraOgDensidad", v)} />
            </FieldGroup>
            <FieldGroup label="Densidad obj gr/L">
              <NumInput value={whirlpoolEnfriado.muestraOgDensidadObj} onChange={(v) => setWhirlpool("muestraOgDensidadObj", v)} />
            </FieldGroup>
            <FieldGroup label="Ph (5.2-5.6)">
              <NumInput value={whirlpoolEnfriado.muestraOgPh} onChange={(v) => setWhirlpool("muestraOgPh", v)} />
            </FieldGroup>
          </div>
        </div>
      </CollapsibleCard>

      {/* ---- FERMENTACION ---- */}
      <CollapsibleCard title="Fermentation" open={openFermentacion} onToggle={onToggleFermentacion}>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <FieldGroup label="Peso total kg">
              <NumInput value={fermentacion.pesoTotalKg} onChange={(v) => setFermentacion("pesoTotalKg", v)} />
            </FieldGroup>
            <FieldGroup label="Peso liquido kg">
              <NumInput value={fermentacion.pesoLiquidoKg} onChange={(v) => setFermentacion("pesoLiquidoKg", v)} />
            </FieldGroup>
            <FieldGroup label="Volumen Lts">
              <NumInput value={fermentacion.volumenL} onChange={(v) => setFermentacion("volumenL", v)} />
            </FieldGroup>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="Hora pitching">
              <TimeInput value={fermentacion.horaPitching} onChange={(v) => setFermentacion("horaPitching", v)} />
            </FieldGroup>
            <FieldGroup label="Temp °C">
              <NumInput value={fermentacion.tempPitchingC} onChange={(v) => setFermentacion("tempPitchingC", v)} />
            </FieldGroup>
          </div>
          <div className="flex items-center gap-4">
            <CheckRow checked={fermentacion.limpiezaCheck} onCheckedChange={(v) => setFermentacion("limpiezaCheck", v)} label="Limpieza" />
            <FieldGroup label="Peso garrafa final kg">
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
              <span className="text-sm whitespace-nowrap">Gelatina:</span>
              <TextInput value={embarrilado.gelatinaText} onChange={(v) => setEmbarrilado("gelatinaText", v)} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={embarrilado.smbCheck} onCheckedChange={(v) => setEmbarrilado("smbCheck", v === true)} />
              <span className="text-sm whitespace-nowrap">SMB:</span>
              <TextInput value={embarrilado.smbText} onChange={(v) => setEmbarrilado("smbText", v)} />
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <FieldGroup label="Embarrilado Fecha y hora">
              <Input
                type="datetime-local"
                value={embarrilado.fechaHora ?? ""}
                onChange={(e) => setEmbarrilado("fechaHora", e.target.value || null)}
                className="h-7 text-sm w-52"
              />
            </FieldGroup>
            <FieldGroup label="Volumen L">
              <NumInput value={embarrilado.volumenL} onChange={(v) => setEmbarrilado("volumenL", v)} />
            </FieldGroup>
          </div>
        </div>
      </CollapsibleCard>
    </>
  );
}
