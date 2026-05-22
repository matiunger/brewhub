"use client";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Info, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  type TastingScoreData,
  DEFAULT_TASTING_SCORE_DATA,
  DESCRIPTOR_GROUPS,
  FLAW_NAMES,
} from "@/lib/tasting-types";
import { findStyleHints, type StyleHints } from "@/lib/style-guide";

// ---------- Sub-components ----------

function SegmentedScale({
  label,
  value,
  max,
  labels,
  onChange,
  inappropriate,
  onInappropriateChange,
}: {
  label: string;
  value: number;
  max: number;
  labels?: string[];
  onChange: (v: number) => void;
  inappropriate?: boolean;
  onInappropriateChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
      <div className="flex flex-1 gap-1">
        {Array.from({ length: max + 1 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={`h-7 flex-1 min-w-0 rounded text-xs border transition-colors ${
              value === i
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-muted"
            }`}
          >
            {labels ? labels[i] : i}
          </button>
        ))}
      </div>
      {onInappropriateChange && (
        <label className="ml-auto shrink-0 w-6 flex justify-center cursor-pointer">
          <input
            type="checkbox"
            checked={inappropriate ?? false}
            onChange={(e) => onInappropriateChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="h-4 w-4 rounded border-2 border-red-300 bg-red-100 dark:border-red-800 dark:bg-red-950/30 peer-checked:bg-red-600 peer-checked:border-red-600 transition-colors flex items-center justify-center text-[10px] leading-none text-transparent peer-checked:text-white select-none">✓</div>
        </label>
      )}
    </div>
  );
}

function BipolarScale({
  label,
  leftLabel,
  rightLabel,
  value,
  max,
  labels,
  onChange,
  inappropriate,
  onInappropriateChange,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  max: number;
  labels?: string[];
  onChange: (v: number) => void;
  inappropriate?: boolean;
  onInappropriateChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
      <div className="flex items-center gap-2 flex-1">
        {!labels && <span className="text-xs text-muted-foreground">{leftLabel}</span>}
        <div className={`flex gap-1 ${labels ? "flex-1" : ""}`}>
          {Array.from({ length: max + 1 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i)}
              className={`h-7 ${labels ? "flex-1 min-w-0" : "w-7"} rounded text-xs border transition-colors ${
                value === i
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              {labels ? labels[i] : i}
            </button>
          ))}
        </div>
        {!labels && <span className="text-xs text-muted-foreground">{rightLabel}</span>}
      </div>
      {onInappropriateChange && (
        <label className="ml-auto shrink-0 w-6 flex justify-center cursor-pointer">
          <input
            type="checkbox"
            checked={inappropriate ?? false}
            onChange={(e) => onInappropriateChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="h-4 w-4 rounded border-2 border-red-300 bg-red-100 dark:border-red-800 dark:bg-red-950/30 peer-checked:bg-red-600 peer-checked:border-red-600 transition-colors flex items-center justify-center text-[10px] leading-none text-transparent peer-checked:text-white select-none">✓</div>
        </label>
      )}
    </div>
  );
}

function ScoreInput({
  value,
  max,
  onChange,
  label = "Score",
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium w-28 shrink-0">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        min={0}
        max={max}
        step={0.5}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v)) onChange(Math.max(0, Math.min(max, v)));
        }}
        className="w-20 h-8 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <span className="text-xs text-muted-foreground">/ {max}</span>
    </div>
  );
}

function StyleHintToggle({ show, open, onToggle }: {
  show: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  if (!show) return null;
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`h-5 w-5 rounded flex items-center justify-center transition-colors ${open ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
      title="Show style guidelines"
    >
      <Info className="h-3.5 w-3.5" />
    </button>
  );
}

function StyleHintText({ text }: { text: string }) {
  return (
    <p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2 leading-relaxed border border-border/50">
      {text}
    </p>
  );
}

// ---------- Beer colors ----------

const BEER_COLORS = [
  { label: "Pale straw", value: "pale straw", hex: "#F5F098" },
  { label: "Straw",      value: "straw",      hex: "#EED870" },
  { label: "Pale gold",  value: "pale gold",  hex: "#E8C040" },
  { label: "Gold",       value: "gold",       hex: "#D49010" },
  { label: "Amber",      value: "amber",      hex: "#B86000" },
  { label: "Deep amber", value: "deep amber", hex: "#9A4800" },
  { label: "Copper",     value: "copper",     hex: "#7C3200" },
  { label: "Brown",      value: "brown",      hex: "#5C2000" },
  { label: "Dark brown", value: "dark brown", hex: "#381200" },
  { label: "Black",      value: "black",      hex: "#1C0800" },
];

// ---------- TastingForm ----------

interface TastingFormProps {
  batchId: string;
  batchName: string;
  batchStyle: string | null;
  tastingId: string | null;
  initialDate: Date | null;
  initialServingType: string;
  initialData?: TastingScoreData;
  packagingDateStr: string | null;
  saveAction: (data: { date: Date; servingType: string; scoreData: string; totalScore: number | null }) => Promise<void>;
  deleteAction: (() => Promise<void>) | null;
}

export function TastingForm({
  batchId,
  batchName,
  batchStyle,
  tastingId,
  initialDate,
  initialServingType,
  initialData,
  packagingDateStr,
  saveAction,
  deleteAction,
}: TastingFormProps) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const initDateStr = initialDate
    ? new Date(initialDate).toISOString().slice(0, 10)
    : todayStr;

  const [dateStr, setDateStr] = useState(initDateStr);
  const [servingType, setServingType] = useState(initialServingType);
  const [data, setData] = useState<TastingScoreData>(initialData ?? DEFAULT_TASTING_SCORE_DATA);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [openHint, setOpenHint] = useState<keyof StyleHints | null>(null);
  const styleHints = findStyleHints(batchStyle);

  function toggleHint(section: keyof StyleHints) {
    setOpenHint((prev) => (prev === section ? null : section));
  }

  function patch<K extends keyof TastingScoreData>(section: K, value: TastingScoreData[K]) {
    setData((prev) => ({ ...prev, [section]: value }));
  }

  function patchAroma<K extends keyof TastingScoreData["aroma"]>(key: K, value: TastingScoreData["aroma"][K]) {
    patch("aroma", { ...data.aroma, [key]: value });
  }

  function patchAppearance<K extends keyof TastingScoreData["appearance"]>(key: K, value: TastingScoreData["appearance"][K]) {
    patch("appearance", { ...data.appearance, [key]: value });
  }

  function patchFlavor<K extends keyof TastingScoreData["flavor"]>(key: K, value: TastingScoreData["flavor"][K]) {
    patch("flavor", { ...data.flavor, [key]: value });
  }

  function patchMouthfeel<K extends keyof TastingScoreData["mouthfeel"]>(key: K, value: TastingScoreData["mouthfeel"][K]) {
    patch("mouthfeel", { ...data.mouthfeel, [key]: value });
  }

  function patchOverall<K extends keyof TastingScoreData["overall"]>(key: K, value: TastingScoreData["overall"][K]) {
    patch("overall", { ...data.overall, [key]: value });
  }

  function setInap(
    section: "aroma" | "appearance" | "flavor" | "mouthfeel" | "overall",
    key: string,
    checked: boolean
  ) {
    const props = data[section].inappropriateProps;
    const next = checked ? [...props, key] : props.filter((k) => k !== key);
    patch(section, { ...data[section], inappropriateProps: next });
  }

  const totalScore = data.aroma.score + data.appearance.score + data.flavor.score + data.mouthfeel.score + data.overall.score;

  // Age since packaging
  const packagingDate = packagingDateStr ? (() => { const d = new Date(packagingDateStr); return isNaN(d.getTime()) ? null : d; })() : null;
  const tastingDate = dateStr ? new Date(dateStr) : null;
  const ageDays = packagingDate && tastingDate ? Math.round((tastingDate.getTime() - packagingDate.getTime()) / (1000 * 60 * 60 * 24)) : null;

  async function handleSave() {
    if (!dateStr) { toast.error("Please select a date"); return; }
    setSaving(true);
    try {
      await saveAction({
        date: new Date(dateStr),
        servingType,
        scoreData: JSON.stringify({ ...data, ageDays }),
        totalScore,
      });
    } catch (e) {
      if (isRedirectError(e)) throw e;
      toast.error("Failed to save tasting");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteAction || !confirm("Delete this tasting?")) return;
    setDeleting(true);
    try {
      await deleteAction();
    } catch (e) {
      if (isRedirectError(e)) throw e;
      toast.error("Failed to delete tasting");
      setDeleting(false);
    }
  }

  function toggleDescriptor(d: string) {
    const current = data.descriptors;
    patch("descriptors", current.includes(d) ? current.filter((x) => x !== d) : [...current, d]);
  }

  function toggleFlaw(name: string) {
    const current = data.flaws;
    const existing = current.find((f) => f.name === name);
    if (!existing) {
      patch("flaws", [...current, { name, severity: "L" }]);
    } else if (existing.severity === "L") {
      patch("flaws", current.map((f) => f.name === name ? { ...f, severity: "M" as const } : f));
    } else if (existing.severity === "M") {
      patch("flaws", current.map((f) => f.name === name ? { ...f, severity: "H" as const } : f));
    } else {
      patch("flaws", current.filter((f) => f.name !== name));
    }
  }

  function flawState(name: string): "off" | "L" | "M" | "H" {
    const f = data.flaws.find((x) => x.name === name);
    return f ? f.severity : "off";
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/batches/${batchId}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{tastingId ? "Edit Tasting" : "New Tasting"}</h1>
          <p className="text-sm text-muted-foreground">
            {batchName}
            {batchStyle && <span className="ml-2 text-xs font-normal opacity-60">{batchStyle}</span>}
          </p>
        </div>
        {deleteAction && (
          <Button variant="ghost" size="icon" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Meta */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Date</label>
              <Input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-40 h-8 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">Serving</label>
              <Select value={servingType} onValueChange={setServingType}>
                <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="bottle">Bottle</SelectItem>
                  <SelectItem value="can">Can</SelectItem>
                  <SelectItem value="growler">Growler</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {ageDays != null && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-muted-foreground">Age</label>
                <p className="text-sm">{ageDays}d since packaging</p>
              </div>
            )}
          </div>
          <textarea
            placeholder="Notes…"
            value={data.notes}
            onChange={(e) => patch("notes", e.target.value)}
            rows={2}
            className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </CardContent>
      </Card>

      {/* Appearance /3 */}
      <Card>
        <CardHeader className="pb-2 gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            Appearance <span className="text-muted-foreground font-normal text-sm">/ 3</span>
            <StyleHintToggle show={!!styleHints} open={openHint === "appearance"} onToggle={() => toggleHint("appearance")} />
          </CardTitle>
          {openHint === "appearance" && styleHints && <StyleHintText text={styleHints.appearance} />}
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-end"><span className="text-xs text-muted-foreground">Inappropriate</span></div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-muted-foreground w-28 shrink-0">Color</span>
            <div className="flex gap-1">
              {BEER_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => patchAppearance("color", data.appearance.color === c.value ? "" : c.value)}
                  title={c.label}
                  style={{ backgroundColor: c.hex }}
                  className={`h-7 w-7 rounded border-2 transition-colors ${
                    data.appearance.color === c.value
                      ? "border-primary ring-1 ring-primary"
                      : "border-transparent hover:border-border"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {BEER_COLORS.find((c) => c.value === data.appearance.color)?.label ?? "—"}
            </span>
            <label className="ml-auto shrink-0 w-6 flex justify-center cursor-pointer">
              <input type="checkbox" checked={data.appearance.inappropriateProps.includes("color")} onChange={(e) => setInap("appearance", "color", e.target.checked)} className="sr-only peer" />
              <div className="h-4 w-4 rounded border-2 border-red-300 bg-red-100 dark:border-red-800 dark:bg-red-950/30 peer-checked:bg-red-600 peer-checked:border-red-600 transition-colors flex items-center justify-center text-[10px] leading-none text-transparent peer-checked:text-white select-none">✓</div>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-28 shrink-0">Clarity</span>
            <Select value={data.appearance.clarity || "none"} onValueChange={(v) => patchAppearance("clarity", v === "none" ? "" : v)}>
              <SelectTrigger className="h-8 text-sm w-44"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                {["Brilliant", "Clear", "Slightly hazy", "Hazy", "Opaque"].map((c) => (
                  <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="ml-auto shrink-0 w-6 flex justify-center cursor-pointer">
              <input type="checkbox" checked={data.appearance.inappropriateProps.includes("clarity")} onChange={(e) => setInap("appearance", "clarity", e.target.checked)} className="sr-only peer" />
              <div className="h-4 w-4 rounded border-2 border-red-300 bg-red-100 dark:border-red-800 dark:bg-red-950/30 peer-checked:bg-red-600 peer-checked:border-red-600 transition-colors flex items-center justify-center text-[10px] leading-none text-transparent peer-checked:text-white select-none">✓</div>
            </label>
          </div>
          <SegmentedScale label="Head size" value={data.appearance.headSize} max={5} labels={["None", "Low", "Med-Low", "Med", "Med-High", "High"]} onChange={(v) => patchAppearance("headSize", v)} inappropriate={data.appearance.inappropriateProps.includes("headSize")} onInappropriateChange={(c) => setInap("appearance", "headSize", c)} />
          <SegmentedScale label="Head retention" value={data.appearance.headRetention} max={5} labels={["None", "Low", "Med-Low", "Med", "Med-High", "High"]} onChange={(v) => patchAppearance("headRetention", v)} inappropriate={data.appearance.inappropriateProps.includes("headRetention")} onInappropriateChange={(c) => setInap("appearance", "headRetention", c)} />
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-muted-foreground w-28 shrink-0">Head color</span>
            <div className="flex gap-1">
              {[
                { label: "White",  value: "white",  hex: "#FAFAFA" },
                { label: "Ivory",  value: "ivory",  hex: "#FFFFF0" },
                { label: "Beige",  value: "beige",  hex: "#D4C5A0" },
                { label: "Tan",    value: "tan",    hex: "#B8A070" },
              ].map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => patchAppearance("headColor", data.appearance.headColor === c.value ? "" : c.value)}
                  title={c.label}
                  style={{ backgroundColor: c.hex }}
                  className={`h-7 w-7 rounded border-2 transition-colors ${
                    data.appearance.headColor === c.value
                      ? "border-primary ring-1 ring-primary"
                      : "border-border hover:border-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {["White", "Ivory", "Beige", "Tan"].find((c) => c.toLowerCase() === data.appearance.headColor) ?? "—"}
            </span>
            <label className="ml-auto shrink-0 w-6 flex justify-center cursor-pointer">
              <input type="checkbox" checked={data.appearance.inappropriateProps.includes("headColor")} onChange={(e) => setInap("appearance", "headColor", e.target.checked)} className="sr-only peer" />
              <div className="h-4 w-4 rounded border-2 border-red-300 bg-red-100 dark:border-red-800 dark:bg-red-950/30 peer-checked:bg-red-600 peer-checked:border-red-600 transition-colors flex items-center justify-center text-[10px] leading-none text-transparent peer-checked:text-white select-none">✓</div>
            </label>
          </div>
          <input
            type="text"
            placeholder="Other notes…"
            value={data.appearance.other}
            onChange={(e) => patchAppearance("other", e.target.value)}
            className="w-full h-8 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <div className="pt-3 mt-1 border-t"><ScoreInput value={data.appearance.score} max={3} onChange={(v) => patchAppearance("score", v)} /></div>
        </CardContent>
      </Card>

      {/* Aroma & Flavor /32 */}
      <Card>
        <CardHeader className="pb-2 gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            Aroma &amp; Flavor
            <StyleHintToggle show={!!styleHints} open={openHint === "aroma"} onToggle={() => toggleHint("aroma")} />
          </CardTitle>
          {openHint === "aroma" && styleHints && (
            <div className="space-y-1.5">
              <StyleHintText text={`Aroma: ${styleHints.aroma}`} />
              <StyleHintText text={`Flavor: ${styleHints.flavor}`} />
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-end"><span className="text-xs text-muted-foreground">Inappropriate</span></div>
          <SegmentedScale label="Malt" value={data.aroma.malt} max={5} labels={["None", "Low", "Med-Low", "Med", "Med-High", "High"]} onChange={(v) => patchAroma("malt", v)} inappropriate={data.aroma.inappropriateProps.includes("malt")} onInappropriateChange={(c) => setInap("aroma", "malt", c)} />
          <SegmentedScale label="Hops" value={data.aroma.hops} max={5} labels={["None", "Low", "Med-Low", "Med", "Med-High", "High"]} onChange={(v) => patchAroma("hops", v)} inappropriate={data.aroma.inappropriateProps.includes("hops")} onInappropriateChange={(c) => setInap("aroma", "hops", c)} />
          <SegmentedScale label="Fermentation" value={data.aroma.fermentation} max={5} labels={["None", "Low", "Med-Low", "Med", "Med-High", "High"]} onChange={(v) => patchAroma("fermentation", v)} inappropriate={data.aroma.inappropriateProps.includes("fermentation")} onInappropriateChange={(c) => setInap("aroma", "fermentation", c)} />

          <div className="pt-2 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Descriptors</p>
            {([
              { key: "malt",         label: "Malt",         active: "bg-amber-400 text-amber-950 border-amber-400",       idle: "border-amber-300/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30" },
              { key: "hops",         label: "Hops",         active: "bg-lime-500 text-lime-950 border-lime-500",           idle: "border-lime-300/60 text-lime-800 dark:text-lime-300 hover:bg-lime-100 dark:hover:bg-lime-900/30" },
              { key: "fermentation", label: "Fermentation", active: "bg-violet-400 text-violet-950 border-violet-400",     idle: "border-violet-300/60 text-violet-800 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30" },
            ] as const).map(({ key, label, active, idle }) => (
              <div key={key} className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground w-20 shrink-0 pt-1">{label}</span>
                <div className="flex flex-wrap gap-1.5">
                  {DESCRIPTOR_GROUPS[key].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDescriptor(d)}
                      className={`px-2.5 py-0.5 rounded-full text-xs border transition-colors ${
                        data.descriptors.includes(d) ? active : idle
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-1">
            <p className="text-xs font-medium text-muted-foreground mb-2">Flaws</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {FLAW_NAMES.map((name) => {
                const state = flawState(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleFlaw(name)}
                    className={`flex items-center justify-between px-2 py-1.5 rounded border text-xs transition-colors ${
                      state === "off"
                        ? "border-border hover:bg-muted"
                        : state === "L"
                        ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400"
                        : state === "M"
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400"
                        : "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                    }`}
                  >
                    <span>{name}</span>
                    {state !== "off" && <span className="font-bold ml-1">{state}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <div className="flex justify-end"><span className="text-xs text-muted-foreground">Inappropriate</span></div>
            <SegmentedScale label="Sweetness" value={data.flavor.sweetness} max={5} labels={["None", "Low", "Med-Low", "Med", "Med-High", "High"]} onChange={(v) => patchFlavor("sweetness", v)} inappropriate={data.flavor.inappropriateProps.includes("sweetness")} onInappropriateChange={(c) => setInap("flavor", "sweetness", c)} />
            <SegmentedScale label="Bitterness" value={data.flavor.bitterness} max={5} labels={["None", "Low", "Med-Low", "Med", "Med-High", "High"]} onChange={(v) => patchFlavor("bitterness", v)} inappropriate={data.flavor.inappropriateProps.includes("bitterness")} onInappropriateChange={(c) => setInap("flavor", "bitterness", c)} />
            <SegmentedScale label="Acidity" value={data.flavor.acidity} max={5} labels={["None", "Low", "Med-Low", "Med", "Med-High", "High"]} onChange={(v) => patchFlavor("acidity", v)} inappropriate={data.flavor.inappropriateProps.includes("acidity")} onInappropriateChange={(c) => setInap("flavor", "acidity", c)} />
            <BipolarScale label="Balance" leftLabel="Hoppy" rightLabel="Malty" value={data.flavor.balance} max={4} labels={["Very hoppy", "Hoppy", "Balanced", "Malty", "Very malty"]} onChange={(v) => patchFlavor("balance", v)} inappropriate={data.flavor.inappropriateProps.includes("balance")} onInappropriateChange={(c) => setInap("flavor", "balance", c)} />
            <BipolarScale label="Finish" leftLabel="Dry" rightLabel="Sweet" value={data.flavor.finish} max={4} labels={["Very dry", "Dry", "Medium", "Sweet", "Very sweet"]} onChange={(v) => patchFlavor("finish", v)} inappropriate={data.flavor.inappropriateProps.includes("finish")} onInappropriateChange={(c) => setInap("flavor", "finish", c)} />
          </div>

          <input
            type="text"
            placeholder="Notes for aroma…"
            value={data.aroma.other}
            onChange={(e) => patchAroma("other", e.target.value)}
            className="w-full h-8 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <input
            type="text"
            placeholder="Notes for flavor…"
            value={data.flavor.other}
            onChange={(e) => patchFlavor("other", e.target.value)}
            className="w-full h-8 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />

          <div className="pt-3 mt-1 border-t space-y-2">
            <ScoreInput label="Aroma score" value={data.aroma.score} max={12} onChange={(v) => patchAroma("score", v)} />
            <ScoreInput label="Flavor score" value={data.flavor.score} max={20} onChange={(v) => patchFlavor("score", v)} />
          </div>
        </CardContent>
      </Card>

      {/* Mouthfeel /5 */}
      <Card>
        <CardHeader className="pb-2 gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            Mouthfeel <span className="text-muted-foreground font-normal text-sm">/ 5</span>
            <StyleHintToggle show={!!styleHints} open={openHint === "mouthfeel"} onToggle={() => toggleHint("mouthfeel")} />
          </CardTitle>
          {openHint === "mouthfeel" && styleHints && <StyleHintText text={styleHints.mouthfeel} />}
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-end"><span className="text-xs text-muted-foreground">Inappropriate</span></div>
          <SegmentedScale label="Body" value={data.mouthfeel.body} max={5} labels={["None", "Low", "Med-Low", "Med", "Med-High", "High"]} onChange={(v) => patchMouthfeel("body", v)} inappropriate={data.mouthfeel.inappropriateProps.includes("body")} onInappropriateChange={(c) => setInap("mouthfeel", "body", c)} />
          <SegmentedScale label="Carbonation" value={data.mouthfeel.carbonation} max={5} labels={["None", "Low", "Med-Low", "Med", "Med-High", "High"]} onChange={(v) => patchMouthfeel("carbonation", v)} inappropriate={data.mouthfeel.inappropriateProps.includes("carbonation")} onInappropriateChange={(c) => setInap("mouthfeel", "carbonation", c)} />
          <SegmentedScale label="Warmth" value={data.mouthfeel.warmth} max={5} labels={["None", "Low", "Med-Low", "Med", "Med-High", "High"]} onChange={(v) => patchMouthfeel("warmth", v)} inappropriate={data.mouthfeel.inappropriateProps.includes("warmth")} onInappropriateChange={(c) => setInap("mouthfeel", "warmth", c)} />
          <SegmentedScale label="Creaminess" value={data.mouthfeel.creaminess} max={5} labels={["None", "Low", "Med-Low", "Med", "Med-High", "High"]} onChange={(v) => patchMouthfeel("creaminess", v)} inappropriate={data.mouthfeel.inappropriateProps.includes("creaminess")} onInappropriateChange={(c) => setInap("mouthfeel", "creaminess", c)} />
          <SegmentedScale label="Astringency" value={data.mouthfeel.astringency} max={5} labels={["None", "Low", "Med-Low", "Med", "Med-High", "High"]} onChange={(v) => patchMouthfeel("astringency", v)} inappropriate={data.mouthfeel.inappropriateProps.includes("astringency")} onInappropriateChange={(c) => setInap("mouthfeel", "astringency", c)} />
          <input
            type="text"
            placeholder="Other notes…"
            value={data.mouthfeel.other}
            onChange={(e) => patchMouthfeel("other", e.target.value)}
            className="w-full h-8 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <div className="pt-3 mt-1 border-t"><ScoreInput value={data.mouthfeel.score} max={5} onChange={(v) => patchMouthfeel("score", v)} /></div>
        </CardContent>
      </Card>

      {/* Overall /10 */}
      <Card>
        <CardHeader className="pb-2 gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            Overall Impression <span className="text-muted-foreground font-normal text-sm">/ 10</span>
            <StyleHintToggle show={!!styleHints} open={openHint === "overall"} onToggle={() => toggleHint("overall")} />
          </CardTitle>
          {openHint === "overall" && styleHints && <StyleHintText text={styleHints.overall} />}
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-end"><span className="text-xs text-muted-foreground">Inappropriate</span></div>
          <BipolarScale label="Style accuracy" leftLabel="Off" rightLabel="On" value={data.overall.styleAccuracy} max={4} labels={["Off-style", "Slightly off", "Moderate", "Close", "On-style"]} onChange={(v) => patchOverall("styleAccuracy", v)} inappropriate={data.overall.inappropriateProps.includes("styleAccuracy")} onInappropriateChange={(c) => setInap("overall", "styleAccuracy", c)} />
          <BipolarScale label="Technical quality" leftLabel="Poor" rightLabel="Excellent" value={data.overall.technicalQuality} max={4} labels={["Poor", "Fair", "Good", "Very good", "Excellent"]} onChange={(v) => patchOverall("technicalQuality", v)} inappropriate={data.overall.inappropriateProps.includes("technicalQuality")} onInappropriateChange={(c) => setInap("overall", "technicalQuality", c)} />
          <BipolarScale label="Drinkability" leftLabel="Low" rightLabel="High" value={data.overall.intangibles} max={4} labels={["Very low", "Low", "Medium", "High", "Very high"]} onChange={(v) => patchOverall("intangibles", v)} inappropriate={data.overall.inappropriateProps.includes("intangibles")} onInappropriateChange={(c) => setInap("overall", "intangibles", c)} />
          <textarea
            placeholder="Feedback and recommendations…"
            value={data.overall.feedback}
            onChange={(e) => patchOverall("feedback", e.target.value)}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
          <div className="pt-3 mt-1 border-t"><ScoreInput value={data.overall.score} max={10} onChange={(v) => patchOverall("score", v)} /></div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur px-4 py-3 flex items-center justify-between gap-4">
        <div className="text-sm">
          <span className="text-muted-foreground">Total: </span>
          <span className="font-bold text-lg">{totalScore.toFixed(1)}</span>
          <span className="text-muted-foreground"> / 50</span>
        </div>
        <div className="flex gap-2">
          <Link href={`/batches/${batchId}`}>
            <Button variant="outline" size="sm">Cancel</Button>
          </Link>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
