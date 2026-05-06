"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { CollapsibleCard } from "./beer-sections";
import {
  type BrewdayData,
  type MaceradoData,
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

const MASH_MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 45, 50, 55, 60];

// ---- Main component ----

interface BrewdaySectionProps {
  brewday: BrewdayData;
  updateBrewday: <K extends keyof BrewdayData>(section: K, value: BrewdayData[K]) => void;
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
  brewday, updateBrewday,
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
    (key: keyof MaceradoData["aguaLavado"], val: string | number | null) => {
      updateBrewday("macerado", { ...macerado, aguaLavado: { ...macerado.aguaLavado, [key]: val } });
    },
    [macerado, updateBrewday]
  );

  const setMaceradoGeneral = useCallback(
    (key: keyof MaceradoData["general"], val: string | number | boolean | null) => {
      updateBrewday("macerado", { ...macerado, general: { ...macerado.general, [key]: val } });
    },
    [macerado, updateBrewday]
  );

  const setTimeline = useCallback(
    (minute: number, key: "recirculado" | "revolver" | "tempC" | "hora", val: boolean | number | string | null) => {
      const timeline = macerado.timeline.map((entry) =>
        entry.minute === minute ? { ...entry, [key]: val } : entry
      );
      updateBrewday("macerado", { ...macerado, timeline });
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
      <CollapsibleCard title="Preparacion" open={openPreparacion} onToggle={onTogglePreparacion}>
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
      <CollapsibleCard title="Molienda" open={openMolienda} onToggle={onToggleMolienda}>
        <div className="flex items-center gap-3">
          <FieldLabel>Fecha y hora</FieldLabel>
          <Input
            type="datetime-local"
            value={molienda.fechaHora ?? ""}
            onChange={(e) => updateBrewday("molienda", { fechaHora: e.target.value || null })}
            className="h-7 text-sm w-52"
          />
        </div>
      </CollapsibleCard>

      {/* ---- MACERADO ---- */}
      <CollapsibleCard title="Macerado" open={openMacerado} onToggle={onToggleMacerado}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Agua macerado */}
            <div className="border rounded-lg p-3 space-y-2">
              <SubTitle>Agua macerado</SubTitle>
              <div className="grid grid-cols-3 gap-2">
                <FieldGroup label="Lts">
                  <NumInput value={macerado.aguaMacerado.lts} onChange={(v) => setAguaMacerado("lts", v)} />
                </FieldGroup>
                <FieldGroup label="Altura cm">
                  <NumInput value={macerado.aguaMacerado.alturaCm} onChange={(v) => setAguaMacerado("alturaCm", v)} />
                </FieldGroup>
                <FieldGroup label="Olla">
                  <TextInput value={macerado.aguaMacerado.olla} onChange={(v) => setAguaMacerado("olla", v)} />
                </FieldGroup>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <FieldGroup label="CaCl2 gr">
                  <NumInput value={macerado.aguaMacerado.cacl2Gr} onChange={(v) => setAguaMacerado("cacl2Gr", v)} />
                </FieldGroup>
                <FieldGroup label="CaSO4 gr">
                  <NumInput value={macerado.aguaMacerado.caso4Gr} onChange={(v) => setAguaMacerado("caso4Gr", v)} />
                </FieldGroup>
                <FieldGroup label="MgSO4 gr">
                  <NumInput value={macerado.aguaMacerado.mgso4Gr} onChange={(v) => setAguaMacerado("mgso4Gr", v)} />
                </FieldGroup>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FieldGroup label="T Strike °C">
                  <NumInput value={macerado.aguaMacerado.tStrikeC} onChange={(v) => setAguaMacerado("tStrikeC", v)} />
                </FieldGroup>
                <FieldGroup label="Ascorbic acid gr">
                  <NumInput value={macerado.aguaMacerado.ascorbicAcidGr} onChange={(v) => setAguaMacerado("ascorbicAcidGr", v)} />
                </FieldGroup>
              </div>
              <FieldGroup label="Ajuste PH (citrico/fosforico)">
                <TextInput value={macerado.aguaMacerado.ajustePh} onChange={(v) => setAguaMacerado("ajustePh", v)} />
              </FieldGroup>
            </div>

            {/* Agua lavado */}
            <div className="border rounded-lg p-3 space-y-2">
              <SubTitle>Agua lavado</SubTitle>
              <div className="grid grid-cols-3 gap-2">
                <FieldGroup label="Lts">
                  <NumInput value={macerado.aguaLavado.lts} onChange={(v) => setAguaLavado("lts", v)} />
                </FieldGroup>
                <FieldGroup label="Altura cm">
                  <NumInput value={macerado.aguaLavado.alturaCm} onChange={(v) => setAguaLavado("alturaCm", v)} />
                </FieldGroup>
                <FieldGroup label="Olla">
                  <TextInput value={macerado.aguaLavado.olla} onChange={(v) => setAguaLavado("olla", v)} />
                </FieldGroup>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <FieldGroup label="CaCl2 gr">
                  <NumInput value={macerado.aguaLavado.cacl2Gr} onChange={(v) => setAguaLavado("cacl2Gr", v)} />
                </FieldGroup>
                <FieldGroup label="CaSO4 gr">
                  <NumInput value={macerado.aguaLavado.caso4Gr} onChange={(v) => setAguaLavado("caso4Gr", v)} />
                </FieldGroup>
                <FieldGroup label="MgSO4 gr">
                  <NumInput value={macerado.aguaLavado.mgso4Gr} onChange={(v) => setAguaLavado("mgso4Gr", v)} />
                </FieldGroup>
              </div>
              <FieldGroup label="Temp °C (75-82 °C)">
                <NumInput value={macerado.aguaLavado.tempC} onChange={(v) => setAguaLavado("tempC", v)} />
              </FieldGroup>
              <FieldGroup label="Ajuste PH (citrico/fosforico)">
                <TextInput value={macerado.aguaLavado.ajustePh} onChange={(v) => setAguaLavado("ajustePh", v)} />
              </FieldGroup>
              <FieldGroup label="PH (Objetivo: 4.5-5.5)">
                <NumInput value={macerado.aguaLavado.ph} onChange={(v) => setAguaLavado("ph", v)} />
              </FieldGroup>
            </div>
          </div>

          {/* General */}
          <div className="space-y-3">
            <CheckRow
              checked={macerado.general.checkGustoAgua}
              onCheckedChange={(v) => setMaceradoGeneral("checkGustoAgua", v)}
              label="Check gusto agua"
            />
            <div className="grid grid-cols-3 gap-3">
              <FieldGroup label="Hora calentar agua">
                <TimeInput value={macerado.general.horaCalentarAgua} onChange={(v) => setMaceradoGeneral("horaCalentarAgua", v)} />
              </FieldGroup>
              <FieldGroup label="Hora inicio empaste">
                <TimeInput value={macerado.general.horaInicioEmpaste} onChange={(v) => setMaceradoGeneral("horaInicioEmpaste", v)} />
              </FieldGroup>
              <FieldGroup label="Hora inicio macerado">
                <TimeInput value={macerado.general.horaInicioMacerado} onChange={(v) => setMaceradoGeneral("horaInicioMacerado", v)} />
              </FieldGroup>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FieldGroup label="Temp objetivo °C">
                <NumInput value={macerado.general.tempObjetivoC} onChange={(v) => setMaceradoGeneral("tempObjetivoC", v)} />
              </FieldGroup>
              <FieldGroup label="Temp mash °C">
                <NumInput value={macerado.general.tempMashC} onChange={(v) => setMaceradoGeneral("tempMashC", v)} />
              </FieldGroup>
              <FieldGroup label="PH mash (Obj: 5.3-5.6)">
                <NumInput value={macerado.general.phMash} onChange={(v) => setMaceradoGeneral("phMash", v)} />
              </FieldGroup>
            </div>
          </div>

          {/* Timeline table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1 pr-2 font-medium text-muted-foreground w-20">Min</th>
                  {MASH_MINUTES.map((m) => (
                    <th key={m} className="text-center py-1 px-1 font-medium w-12">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-1 pr-2 text-muted-foreground">Recirculado</td>
                  {macerado.timeline.map((entry) => (
                    <td key={entry.minute} className="py-1 px-1 text-center">
                      <Checkbox checked={entry.recirculado} onCheckedChange={(v) => setTimeline(entry.minute, "recirculado", v === true)} className="mx-auto" />
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-1 pr-2 text-muted-foreground">Revolver</td>
                  {macerado.timeline.map((entry) => (
                    <td key={entry.minute} className="py-1 px-1 text-center">
                      <Checkbox checked={entry.revolver} onCheckedChange={(v) => setTimeline(entry.minute, "revolver", v === true)} className="mx-auto" />
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-1 pr-2 text-muted-foreground">Temp °C</td>
                  {macerado.timeline.map((entry) => (
                    <td key={entry.minute} className="py-1 px-0.5">
                      <Input
                        type="number"
                        value={entry.tempC ?? ""}
                        onChange={(e) => setTimeline(entry.minute, "tempC", e.target.value === "" ? null : Number(e.target.value))}
                        className="h-6 text-xs px-1 w-10"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-1 pr-2 text-muted-foreground">Hora</td>
                  {macerado.timeline.map((entry) => (
                    <td key={entry.minute} className="py-1 px-0.5">
                      <Input
                        type="time"
                        value={entry.hora ?? ""}
                        onChange={(e) => setTimeline(entry.minute, "hora", e.target.value || null)}
                        className="h-6 text-xs px-1 w-14"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CollapsibleCard>

      {/* ---- LAVADO ---- */}
      <CollapsibleCard title="Lavado" open={openLavado} onToggle={onToggleLavado}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border rounded-lg p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <FieldGroup label="Hora inicio recirculado">
                <TimeInput value={lavado.horaInicioRecirculado} onChange={(v) => setLavado("horaInicioRecirculado", v)} />
              </FieldGroup>
              <FieldGroup label="Hora fin recirculado">
                <TimeInput value={lavado.horaFinRecirculado} onChange={(v) => setLavado("horaFinRecirculado", v)} />
              </FieldGroup>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FieldGroup label="Hora inicio lavado">
                <TimeInput value={lavado.horaInicioLavado} onChange={(v) => setLavado("horaInicioLavado", v)} />
              </FieldGroup>
              <FieldGroup label="Hora fin lavado">
                <TimeInput value={lavado.horaFinLavado} onChange={(v) => setLavado("horaFinLavado", v)} />
              </FieldGroup>
            </div>
          </div>
          <div className="border rounded-lg p-3 space-y-2">
            <SubTitle>Primer mosto</SubTitle>
            <div className="grid grid-cols-2 gap-2">
              <FieldGroup label="Densidad gr/L">
                <NumInput value={lavado.primerMostoDensidad} onChange={(v) => setLavado("primerMostoDensidad", v)} />
              </FieldGroup>
              <FieldGroup label="PH">
                <NumInput value={lavado.primerMostoPh} onChange={(v) => setLavado("primerMostoPh", v)} />
              </FieldGroup>
            </div>
          </div>
        </div>
      </CollapsibleCard>

      {/* ---- FIN LAVADO / PRE HEAT UP ---- */}
      <CollapsibleCard title="Fin Lavado / Pre Heat Up" open={openPreboil} onToggle={onTogglePreboil}>
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
      <CollapsibleCard title="Hervido" open={openHervido} onToggle={onToggleHervido}>
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
      <CollapsibleCard title="Whirlpool y Enfriado" open={openWhirlpool} onToggle={onToggleWhirlpool}>
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
      <CollapsibleCard title="Fermentacion" open={openFermentacion} onToggle={onToggleFermentacion}>
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
      <CollapsibleCard title="Embarrilado" open={openEmbarrilado} onToggle={onToggleEmbarrilado}>
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
