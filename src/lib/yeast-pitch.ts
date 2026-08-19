import type { YeastGrowthModel } from "@/lib/brewday-types";

export const DEFAULT_CELL_DENSITY_B_PER_G = 10;

export const YEAST_GROWTH_MODELS: { value: YeastGrowthModel; label: string }[] = [
  { value: "braukaiser_stir_plate", label: "Braukaiser — Stir plate" },
  { value: "white_shaking", label: "C. White — Shaking" },
  { value: "white_no_agitation", label: "C. White — No agitation" },
];

export function isYeastGrowthModel(v: unknown): v is YeastGrowthModel {
  return v === "white_shaking" || v === "white_no_agitation" || v === "braukaiser_stir_plate";
}

/** Inverse Balling, same as final-stats in beer-sections. */
export function sgToPlato(sg: number): number {
  const k = 227.1 / 258.2;
  return ((sg - 1) * 258.6) / (1 + k * (sg - 1));
}

export function cellsAfterStarter(input: {
  cellsBeforeB: number;
  starterSizeL: number | null;
  starterGravityGL: number | null;
  growthModel: YeastGrowthModel;
}): number | null {
  const { cellsBeforeB, starterSizeL, starterGravityGL, growthModel } = input;
  if (starterSizeL == null || starterSizeL <= 0) return cellsBeforeB;
  if (cellsBeforeB <= 0) return 0;

  if (growthModel === "braukaiser_stir_plate") {
    if (starterGravityGL == null || starterGravityGL <= 1000) return null;
    const sg = starterGravityGL / 1000;
    const plato = sgToPlato(sg);
    if (plato <= 0) return null;
    const gramsExtract = (plato / 100) * starterSizeL * starterGravityGL;
    if (gramsExtract <= 0) return null;
    const inoculation = cellsBeforeB / gramsExtract;
    let growthPerG: number;
    if (inoculation < 1.4) growthPerG = 1.4;
    else if (inoculation <= 3.5) growthPerG = 2.33 - 0.67 * inoculation;
    else growthPerG = 0;
    return cellsBeforeB + growthPerG * gramsExtract;
  }

  // Chris White / Brewer's Friend fit of White & Zainasheff (2010)
  const x = cellsBeforeB / starterSizeL;
  if (x <= 0) return cellsBeforeB;
  let growth = 12.54793776 * Math.pow(x, -0.4594858324) - 0.9994994906;
  if (growthModel === "white_shaking") growth += 0.5;
  // White curve falls below 1 at high inoculation; yeast do not disappear.
  growth = Math.min(6, Math.max(1, growth));
  return cellsBeforeB * growth;
}

export function pitchRateMPerMlPerP(
  cellsAfterB: number,
  volumeL: number,
  ogGL: number
): number | null {
  if (volumeL <= 0 || ogGL <= 1000) return null;
  const plato = sgToPlato(ogGL / 1000);
  if (plato <= 0) return null;
  return cellsAfterB / volumeL / plato;
}

export function calculateYeastPitch(input: {
  dryYeastGrams: number | null;
  cellDensityBPerG: number | null;
  starterSizeL: number | null;
  starterGravityGL: number | null;
  growthModel: YeastGrowthModel;
  volumeL: number | null;
  ogGL: number | null;
}): {
  cellsBeforeB: number | null;
  cellsAfterB: number | null;
  pitchRate: number | null;
  plato: number | null;
} {
  const density = input.cellDensityBPerG ?? DEFAULT_CELL_DENSITY_B_PER_G;
  const cellsBeforeB =
    input.dryYeastGrams != null && input.dryYeastGrams > 0 && density > 0
      ? input.dryYeastGrams * density
      : null;

  const cellsAfterB =
    cellsBeforeB != null
      ? cellsAfterStarter({
          cellsBeforeB,
          starterSizeL: input.starterSizeL,
          starterGravityGL: input.starterGravityGL,
          growthModel: input.growthModel,
        })
      : null;

  const plato =
    input.ogGL != null && input.ogGL > 1000 ? sgToPlato(input.ogGL / 1000) : null;

  const pitchRate =
    cellsAfterB != null && input.volumeL != null && input.ogGL != null
      ? pitchRateMPerMlPerP(cellsAfterB, input.volumeL, input.ogGL)
      : null;

  return { cellsBeforeB, cellsAfterB, pitchRate, plato };
}
