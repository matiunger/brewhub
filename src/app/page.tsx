import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ImportBeerJsonButton } from "@/components/import-beerjson-button";
import { parseBrewdayData } from "@/lib/brewday-types";
import { calculateIbuBreakdown } from "@/lib/calculations";

interface HomePageProps {
  searchParams: Promise<{ type?: string; draft?: string; sort?: string; order?: string }>;
}

const SRM_PALETTE = [
  "#FFE699","#FFD878","#FFCA5A","#FFBF42","#FBB123","#F8A600","#F39C00","#EA8F00",
  "#E58500","#DE7C00","#D77200","#CF6900","#CB6200","#C35900","#BB5100","#B54C00",
  "#B04500","#A63E00","#A13700","#9B3200","#952D00","#8E2900","#882300","#821E00",
  "#7B1A00","#771900","#701400","#6A0F00","#660D00","#5E0B00","#530700","#4D0600",
  "#470500","#420400","#3D0300","#370200","#310200","#2C0100","#270100","#220000",
];

function srmToColor(srm: number | null | undefined): string {
  if (!srm) return "#d1d5db";
  const idx = Math.min(Math.max(Math.round(srm), 1), 40) - 1;
  return SRM_PALETTE[idx];
}

function calcAbv(og: number | null | undefined, fg: number | null | undefined): number | null {
  if (!og || !fg) return null;
  return ((og - fg) / 1000) * 131.25;
}

type BatchWithRelations = Awaited<ReturnType<typeof prisma.batch.findMany>>[number] & {
  grains: { grams: number; colorL: number | null; grain: { colorL: number | null } }[];
  hops: { grams: number; alphaAcid: number | null; additionTime: number; use: string; hop: { alphaAcid: number } }[];
};

type DisplayValues = { og: number | null; ibu: number | null; srm: number | null; abv: number | null };

function computeDisplayValues(batch: BatchWithRelations): DisplayValues {
  const data = parseBrewdayData(batch.brewdayData);
  const stepsWithDensity = data.fermentation.steps.filter((s) => s.densityGL != null);
  const finalOg = stepsWithDensity.length > 0 ? stepsWithDensity[0].densityGL! : null;
  const finalFg = stepsWithDensity.length > 1 ? stepsWithDensity[stepsWithDensity.length - 1].densityGL! : null;
  const finalVol = data.fermentation.steps[0]?.volumeL ?? null;

  // Final IBU — same formula as final stats panel
  let finalIbu: number | null = null;
  if (finalOg != null) {
    const result = calculateIbuBreakdown(
      batch.hops,
      finalOg / 1000,
      finalVol ?? batch.targetFermentarL ?? 20,
      batch.boilTimeMin ?? 60,
    );
    finalIbu = result.totalPerceivedIbu > 0 ? result.totalPerceivedIbu : null;
  }

  // Final SRM — grain bill over actual post-chill volume
  let finalSrm: number | null = null;
  {
    const boilEntries = data.boil.entries;
    const d = batch.equipmentBoilPotDiameter;
    const trubLossL = batch.equipmentTrubLossL ?? 1.0;
    const contractionFactor = 1 - ((batch.equipmentTempContractionPct ?? 4) / 100);

    const entryVol = (e: { heightCm: number | null; volumeL: number | null }): number | null => {
      if (d != null && d > 0 && e.heightCm != null && e.heightCm > 0)
        return Math.PI * Math.pow(d / 2, 2) * e.heightCm / 1000;
      return e.volumeL ?? null;
    };

    const lastEntry = [...boilEntries].reverse().find((e) => entryVol(e) != null);
    const endOfBoilL = lastEntry != null ? entryVol(lastEntry) : null;
    const postChillL =
      endOfBoilL != null && endOfBoilL > 0
        ? endOfBoilL * contractionFactor
        : finalVol != null && finalVol > 0
          ? finalVol + trubLossL
          : null;

    if (postChillL != null) {
      const mcu = batch.grains.reduce((sum, r) => {
        const colorL = r.colorL ?? r.grain.colorL;
        return colorL != null ? sum + (r.grams * 0.00220462 * colorL) / (postChillL * 0.264172) : sum;
      }, 0);
      finalSrm = mcu > 0 ? 1.4922 * Math.pow(mcu, 0.6859) : null;
    }
  }

  return {
    og: finalOg ?? batch.targetOg,
    ibu: finalIbu ?? batch.targetIbu,
    srm: finalSrm ?? batch.targetSrm,
    abv: calcAbv(finalOg, finalFg) ?? calcAbv(batch.targetOg, batch.targetFg),
  };
}

type SortKey = "name" | "style" | "brewDate" | "og" | "ibu" | "srm" | "abv";

function buildUrl(params: Record<string, string | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) p.set(k, v);
  }
  return `/` + (p.size ? `?${p.toString()}` : "");
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { type: typeFilter, draft: draftFilter, sort = "brewDate", order = "desc" } = await searchParams;

  const whereClause: any = {};
  if (typeFilter) whereClause.type = typeFilter;
  if (draftFilter === "true") whereClause.draft = true;
  if (draftFilter === "false") whereClause.draft = false;

  const batches = await prisma.batch.findMany({
    where: whereClause,
    include: {
      grains: { include: { grain: { select: { colorL: true } } } },
      hops: { include: { hop: { select: { alphaAcid: true } } } },
    },
  }) as BatchWithRelations[];

  // Pre-compute display values once per batch
  const displayMap = new Map(batches.map((b) => [b.id, computeDisplayValues(b)]));

  const sorted = [...batches].sort((a, b) => {
    const da = displayMap.get(a.id)!;
    const db = displayMap.get(b.id)!;
    let av: number | string, bv: number | string;
    switch (sort as SortKey) {
      case "name":     av = a.name.toLowerCase();             bv = b.name.toLowerCase();             break;
      case "style":    av = (a.style ?? "").toLowerCase();    bv = (b.style ?? "").toLowerCase();    break;
      case "brewDate": av = a.brewDate?.getTime() ?? 0;       bv = b.brewDate?.getTime() ?? 0;       break;
      case "og":       av = da.og ?? 0;                       bv = db.og ?? 0;                       break;
      case "ibu":      av = da.ibu ?? 0;                      bv = db.ibu ?? 0;                      break;
      case "srm":      av = da.srm ?? 0;                      bv = db.srm ?? 0;                      break;
      case "abv":      av = da.abv ?? 0;                      bv = db.abv ?? 0;                      break;
      default:         av = a.brewDate?.getTime() ?? 0;       bv = b.brewDate?.getTime() ?? 0;
    }
    const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
    return order === "asc" ? cmp : -cmp;
  });

  function thLink(label: string, col: SortKey, align: "left" | "right" = "left") {
    const isActive = sort === col;
    const nextOrder = isActive && order === "asc" ? "desc" : "asc";
    const href = buildUrl({ type: typeFilter, draft: draftFilter, sort: col, order: nextOrder });
    return (
      <th className={`px-4 py-3 font-medium text-${align}`}>
        <a href={href} className={`inline-flex items-center gap-1 hover:text-foreground transition-colors ${isActive ? "text-foreground" : ""}`}>
          {label}
          <span className="text-[10px] w-3">
            {isActive ? (order === "asc" ? "↑" : "↓") : ""}
          </span>
        </a>
      </th>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Batches</h1>
        <div className="flex gap-2">
          <ImportBeerJsonButton />
          <Link href="/batches/new">
            <Button>+ New Batch</Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-4">
        <a
          href="/"
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            !typeFilter && !draftFilter
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          All
        </a>
        <a
          href="/?draft=false"
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            draftFilter === "false"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Executed
        </a>
        <a
          href="/?draft=true"
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            draftFilter === "true"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Drafts
        </a>
        <div className="border-l mx-2" />
        {["beer", "cider", "hopwater", "other"].map((t) => (
          <a
            key={t}
            href={`/?type=${t}${draftFilter ? `&draft=${draftFilter}` : ""}`}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              typeFilter === t
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </a>
        ))}
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
              <th className="px-4 py-3 w-8" />
              {thLink("Name", "name", "left")}
              {thLink("Style", "style", "left")}
              {thLink("Brew Date", "brewDate", "left")}
              {thLink("OG", "og", "right")}
              {thLink("IBU", "ibu", "right")}
              {thLink("SRM", "srm", "right")}
              {thLink("ABV", "abv", "right")}
            </tr>
          </thead>
          <tbody className="divide-y">
            {sorted.map((batch) => {
              const dv = displayMap.get(batch.id)!;
              return (
                <tr key={batch.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span
                      className="block w-4 h-4 rounded-full border border-black/10"
                      style={{ backgroundColor: srmToColor(dv.srm) }}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/batches/${batch.id}`} className="hover:underline">
                      {batch.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {batch.style || <span className="opacity-40">—</span>}
                  </td>
                  <td className={`px-4 py-3 ${batch.draft ? "text-amber-500" : "text-muted-foreground"}`}>
                    {batch.brewDate
                      ? batch.brewDate.toLocaleDateString('en-GB', { timeZone: 'UTC' })
                      : <span className="opacity-40">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {dv.og ? dv.og.toFixed(1) : <span className="opacity-40">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {dv.ibu ? Math.round(dv.ibu) : <span className="opacity-40">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {dv.srm ? dv.srm.toFixed(1) : <span className="opacity-40">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {dv.abv != null ? dv.abv.toFixed(1) + "%" : <span className="opacity-40">—</span>}
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  No batches found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
