// --- IBU Calculation (Tinseth + Whirlpool + Dry Hop) ---

function tinsethUtilization(boilGravity: number, timeMinutes: number): number {
  const bigness = 1.65 * Math.pow(0.000125, boilGravity - 1);
  const timeFactor = (1 - Math.exp(-0.04 * timeMinutes)) / 4.15;
  return bigness * timeFactor;
}

function tinsethIbu(
  alphaAcidPercent: number,
  weightGrams: number,
  boilGravity: number,
  timeMinutes: number,
  batchVolumeLiters: number
): number {
  const aaDecimal = alphaAcidPercent / 100;
  const utilization = tinsethUtilization(boilGravity, timeMinutes);
  return (aaDecimal * weightGrams * utilization * 1000) / batchVolumeLiters;
}

function whirlpoolTempFactor(tempCelsius: number): number {
  if (tempCelsius < 60) return 0;
  return Math.pow(2, (tempCelsius - 100) / 10);
}

export interface HopIbuResult {
  ibu: number;
  perceivedIbu: number;
  isDryHop: boolean;
}

export interface IbuBreakdown {
  totalCalculatedIbu: number;
  totalPerceivedIbu: number;
  perHop: HopIbuResult[];
}

export function calculateIbuBreakdown(
  hops: Array<{
    grams: number;
    additionTime: number | null;
    use: string;
    alphaAcid?: number | null;
    hop: { alphaAcid: number };
  }>,
  boilGravity: number,
  batchVolumeLiters: number,
  boilTimeMinutes: number,
  whirlpoolTimeMinutes?: number | null,
  whirlpoolDefaultTempC = 90
): IbuBreakdown {
  const volume = Math.max(batchVolumeLiters, 0.001);
  const gravity = Math.min(Math.max(boilGravity, 1.000), 1.150);

  let totalCalculatedIbu = 0;
  let totalPerceivedIbu = 0;
  const perHop: HopIbuResult[] = [];

  for (const bh of hops) {
    const aa = bh.alphaAcid ?? bh.hop.alphaAcid;
    const grams = bh.grams;
    const time = bh.additionTime ?? 0;
    const use = bh.use;

    let ibu = 0;
    let perceivedIbu = 0;
    let isDryHop = false;

    if (use === "dry_hop") {
      isDryHop = true;
      perceivedIbu = (0.10 * (aa / 100) * grams * 1000) / volume;
    } else if (use === "whirlpool" || use === "hop_stand") {
      // Steep time: the hop's own time if set, else the batch whirlpool time, else 15 min
      const steepMin = time > 0 ? time : (whirlpoolTimeMinutes ?? 15);
      const effectiveTime = steepMin * whirlpoolTempFactor(whirlpoolDefaultTempC);
      ibu = tinsethIbu(aa, grams, gravity, effectiveTime, volume);
      perceivedIbu = ibu;
    } else if (use === "fwh" || use === "mash") {
      const fwhTime = Math.min(boilTimeMinutes, 60);
      ibu = tinsethIbu(aa, grams, gravity, fwhTime, volume);
      perceivedIbu = ibu;
    } else {
      ibu = tinsethIbu(aa, grams, gravity, Math.max(time, 0), volume);
      perceivedIbu = ibu;
    }

    totalCalculatedIbu += ibu;
    totalPerceivedIbu += perceivedIbu;
    perHop.push({ ibu, perceivedIbu, isDryHop });
  }

  return {
    totalCalculatedIbu: Math.max(0, totalCalculatedIbu),
    totalPerceivedIbu: Math.max(0, totalPerceivedIbu),
    perHop,
  };
}

const ABV_FACTOR = 131.25; // Standard simplified formula coefficient
const L_TO_GAL = 0.264172;
const G_TO_LBS = 0.00220462;
const L_PER_KG_TO_QT_PER_LB = 0.4792; // Water-to-grist ratio unit conversion

/** SG from extract (kg) dissolved in a volume (L), via °P and the Balling formula. */
export function gravityFromExtract(extractKg: number, volumeL: number): number {
  if (volumeL <= 0) return 1;
  const plato = (extractKg * 1000) / volumeL / 10;
  return 1 + plato / (258.6 - plato * (227.1 / 258.2));
}

/** Average attenuation (%) across yeasts, preferring the per-batch value. Null if none known. */
export function averageAttenuation(
  yeasts: { attenuation?: number | null; yeast: { attenuation: number | null } }[]
): number | null {
  const values = yeasts
    .map((y) => y.attenuation ?? y.yeast.attenuation)
    .filter((v): v is number => v != null);
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** FG (SG) from OG (SG) and apparent attenuation (%). */
export function estimateFg(ogSg: number, attenuationPct: number): number {
  return ogSg - (ogSg - 1) * (attenuationPct / 100);
}

export function abvFromGravity(ogSg: number, fgSg: number): number {
  return (ogSg - fgSg) * ABV_FACTOR;
}

/** Morey SRM from the grain bill over a post-chill volume. Null if no colour data. */
export function calculateSrm(
  grains: { grams: number; colorL?: number | null; grain: { colorL: number | null } }[],
  postChillL: number
): number | null {
  if (postChillL <= 0) return null;
  const postChillGal = postChillL * L_TO_GAL;
  const mcu = grains.reduce((sum, g) => {
    const colorL = g.colorL ?? g.grain.colorL;
    return colorL != null ? sum + (g.grams * G_TO_LBS * colorL) / postChillGal : sum;
  }, 0);
  return mcu > 0 ? 1.4922 * Math.pow(mcu, 0.6859) : null;
}

/** Volume (L) of a boil log entry: from liquid height and pot diameter if known, else the stored volume. */
export function boilEntryVolumeL(
  entry: { heightCm: number | null; volumeL: number | null },
  potDiameterCm: number | null | undefined
): number | null {
  if (potDiameterCm != null && potDiameterCm > 0 && entry.heightCm != null && entry.heightCm > 0) {
    return (Math.PI * Math.pow(potDiameterCm / 2, 2) * entry.heightCm) / 1000;
  }
  return entry.volumeL ?? null;
}

/**
 * Measured post-chill volume: last boil log volume × thermal contraction,
 * falling back to fermenter volume + trub loss.
 */
export function measuredPostChillVolumeL(input: {
  boilEntries: { heightCm: number | null; volumeL: number | null }[];
  potDiameterCm: number | null | undefined;
  tempContractionPct: number | null | undefined;
  trubLossL: number | null | undefined;
  fermenterVolumeL: number | null;
}): number | null {
  const { boilEntries, potDiameterCm, tempContractionPct, trubLossL, fermenterVolumeL } = input;
  const contractionFactor = 1 - (tempContractionPct ?? 4) / 100;
  const lastVol = [...boilEntries]
    .reverse()
    .map((e) => boilEntryVolumeL(e, potDiameterCm))
    .find((v) => v != null);
  if (lastVol != null && lastVol > 0) return lastVol * contractionFactor;
  if (fermenterVolumeL != null && fermenterVolumeL > 0) return fermenterVolumeL + (trubLossL ?? 1.0);
  return null;
}

export type AcidType = "lactic" | "phosphoric" | "citric";

// Carbonate system fractions at a given pH (pK1=6.38, pK2=10.33)
function carbFractions(pH: number) {
  const r1 = Math.pow(10, pH - 6.38);
  const r2 = Math.pow(10, pH - 10.33);
  const D = 1 + r1 + r1 * r2;
  return { f1: 1 / D, f2: r1 / D, f3: (r1 * r2) / D };
}

// Density (g/L) of liquid acids from polynomial, s = strength as numeric % (e.g. 88)
function lacticSG(s: number) {
  return 1000 * (-5.6193e-10 * s ** 4 + 5.115e-8 * s ** 3 - 1.1408e-6 * s ** 2 + 2.4529e-3 * s + 0.998);
}
function phosphoricSG(s: number) {
  return 1000 * (-3.9523e-9 * s ** 4 + 6.8571e-7 * s ** 3 + 5.4475e-7 * s ** 2 + 5.51368e-3 * s + 0.99778);
}

const ACID_PROPS: Record<AcidType, { pK1: number; pK2: number; pK3: number; MW: number; form: "liquid" | "solid"; strength?: number; sg?: (s: number) => number }> = {
  lactic:     { pK1: 3.86, pK2: 20,   pK3: 20,    MW: 90.08,  form: "liquid", strength: 88,  sg: lacticSG },
  phosphoric: { pK1: 2.12, pK2: 7.20, pK3: 12.44, MW: 98.00,  form: "liquid", strength: 10,  sg: phosphoricSG },
  citric:     { pK1: 3.14, pK2: 4.77, pK3: 6.39,  MW: 192.13, form: "solid" },
};

// Fraction of acid in dissociated (active) form at given pH for a polyprotic acid
function acidDissociationFrac(pH: number, acid: { pK1: number; pK2: number; pK3: number }): number {
  const Ka1 = Math.pow(10, pH - acid.pK1);
  const Ka2 = Math.pow(10, pH - acid.pK2);
  const Ka3 = Math.pow(10, pH - acid.pK3);
  const D = 1 + Ka1 + Ka1 * Ka2 + Ka1 * Ka2 * Ka3;
  return Ka1 / D + (2 * Ka1 * Ka2) / D + (3 * Ka1 * Ka2 * Ka3) / D;
}

/**
 * Sparge water acidification via carbonate equilibrium titration (Bru'n Water method).
 * Returns mL for liquid acids, g for solid acids.
 */
export function calculateSpargeAcidDose(input: {
  sourceHco3Ppm: number;
  saltChalkGL: number;
  saltBakingSodaGL: number;
  phStart: number;
  phTarget: number;
  volumeL: number;
  acidType: AcidType;
}): { doseMl: number | null; doseG: number | null; startingAlkalinityPpm: number; finalAlkalinityPpm: number; acidRequired: number } {
  const { sourceHco3Ppm, saltChalkGL, saltBakingSodaGL, phStart, phTarget, volumeL, acidType } = input;

  // Effective HCO₃⁻ in sparge water (ppm), convert to alkalinity as CaCO₃
  const spargeHco3 = sourceHco3Ppm + saltChalkGL * 1219.2 + saltBakingSodaGL * 726.3;
  const alk = spargeHco3 * (50 / 61); // ppm as CaCO₃

  // Step 1: Carbonate fractions at start, reference (4.3), and target pH
  const fs = carbFractions(phStart);
  const fr = carbFractions(4.3);
  const ft = carbFractions(phTarget);

  const denom = (fs.f2 - fr.f2) + (fr.f3 - fs.f3);
  const Ct = denom !== 0 ? (alk / 50) / denom : 0; // mM/L total carbonate

  // Step 2: Acid required (mEq/L)
  const acidRequired = Math.max(
    0,
    Ct * ((ft.f1 - fs.f1) + (fs.f3 - ft.f3))
      + Math.pow(10, -phTarget) - Math.pow(10, -phStart)
      + 0.01,
  );

  // Step 3: frac correction for polyprotic acids
  const acid = ACID_PROPS[acidType];
  const frac = acidDissociationFrac(phTarget, acid);
  const mM_required = acidRequired / frac;

  // Step 4: Dose
  const finalAlkalinityPpm = alk - acidRequired * 50;

  if (acid.form === "solid") {
    const doseG = (mM_required * acid.MW * volumeL) / 1000;
    return { doseMl: null, doseG, startingAlkalinityPpm: alk, finalAlkalinityPpm, acidRequired };
  } else {
    const s = acid.strength!;
    const SG = acid.sg!(s);
    const doseMl = (mM_required * acid.MW * volumeL) / ((s / 100) * SG);
    return { doseMl, doseG: null, startingAlkalinityPpm: alk, finalAlkalinityPpm, acidRequired };
  }
}

// --- Step Infusion Mash Calculations ---

const L_PER_KG_GRAIN_VOLUME = 0.67; // 1 kg of grain displaces ~0.67 L

export function calculateStrikeTemperature(input: {
  targetTempC: number;
  grainTempC: number;
  mashRatioLKg: number;
}): number {
  const { targetTempC, grainTempC, mashRatioLKg } = input;
  const rQtLb = mashRatioLKg * L_PER_KG_TO_QT_PER_LB;
  return (0.2 / rQtLb) * (targetTempC - grainTempC) + targetTempC;
}

export function calculateInfusionVolume(input: {
  targetTempC: number;
  currentTempC: number;
  grainKg: number;
  currentWaterL: number;
  infuseWaterTempC: number;
}): number {
  const { targetTempC, currentTempC, grainKg, currentWaterL, infuseWaterTempC } = input;
  if (infuseWaterTempC <= targetTempC) return Infinity;
  return (targetTempC - currentTempC) * (grainKg * 0.4 + currentWaterL) / (infuseWaterTempC - targetTempC);
}

export interface DecoctionResult {
  decoctionL: number;           // mash volume to pull
  decoctionFraction: number;    // fraction of total mash pulled
  mainMashTempBeforeC: number;  // main mash temp after cooling while decoction is out
  resultingTempC: number;       // mash temp after decoction is returned
  unreachable: boolean;         // target cannot be reached even pulling the whole mash
}

// Decoction: pull a fraction of the mash, bring it to a boil, boil for a fixed time,
// return it. Assumes the pulled portion has the same composition as the whole mash
// (heat capacity proportional to volume) and ignores evaporation during the boil.
export function calculateDecoction(input: {
  targetTempC: number;
  currentTempC: number;
  grainKg: number;
  currentWaterL: number;
  boilTempC: number;
  timeOutMin: number;           // heat-up + boil time, while the main mash rests
  coolingRateCH: number;        // main mash heat loss (°C/h)
  amountOverrideL?: number | null;
}): DecoctionResult {
  const { targetTempC, currentTempC, grainKg, currentWaterL, boilTempC, timeOutMin, coolingRateCH, amountOverrideL } = input;
  const mashVolumeL = currentWaterL + grainKg * L_PER_KG_GRAIN_VOLUME;
  const mainMashTempBeforeC = currentTempC - coolingRateCH * (timeOutMin / 60);

  if (amountOverrideL != null && amountOverrideL > 0 && mashVolumeL > 0) {
    const f = Math.min(amountOverrideL / mashVolumeL, 1);
    return {
      decoctionL: amountOverrideL,
      decoctionFraction: f,
      mainMashTempBeforeC,
      resultingTempC: (1 - f) * mainMashTempBeforeC + f * boilTempC,
      unreachable: false,
    };
  }

  const f = boilTempC > mainMashTempBeforeC
    ? (targetTempC - mainMashTempBeforeC) / (boilTempC - mainMashTempBeforeC)
    : Infinity;
  const unreachable = !isFinite(f) || f >= 1;
  const fClamped = unreachable ? 1 : Math.max(f, 0);
  return {
    decoctionL: fClamped * mashVolumeL,
    decoctionFraction: fClamped,
    mainMashTempBeforeC,
    resultingTempC: unreachable ? boilTempC : Math.max(targetTempC, mainMashTempBeforeC),
    unreachable,
  };
}

export interface StepInfusionResult {
  stepIndex: number;
  waterAddedL: number;
  infuseTemperatureC: number;
  cumulativeWaterL: number;
  mashTunOccupiedL: number;
  decoction?: DecoctionResult & { boilMin: number };
}

export const DEFAULT_DECOCTION_HEATUP_MIN = 15;

export function calculateStepInfusionSchedule(input: {
  steps: Array<{
    stepTemperatureC: number;
    type: string;
    infuseTemperatureC: number | null;
    amountL?: number | null;
    rampTimeMin?: number | null;
    decoctionBoilMin?: number | null;
  }>;
  grainKg: number;
  grainTempC: number;
  mashRatioLKg: number;
  mashTunDeadSpaceL: number;
  defaultInfuseTempC: number;
  // Strike water override (full volume mode). Defaults to grain × ratio + dead space.
  initialWaterL?: number;
  // Only step infusion mode adds water on infusion steps; other modes treat them as temperature steps.
  allowInfusions?: boolean;
  decoctionBoilTempC?: number;
  coolingRateCH?: number;
}): StepInfusionResult[] {
  const {
    steps, grainKg, grainTempC, mashRatioLKg, mashTunDeadSpaceL, defaultInfuseTempC,
    initialWaterL, allowInfusions = true, decoctionBoilTempC = 100, coolingRateCH = 0,
  } = input;
  if (steps.length === 0) return [];

  const results: StepInfusionResult[] = [];
  let cumulativeWaterL = 0;
  let currentTempC = grainTempC;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    if (i === 0) {
      const waterAddedL = initialWaterL ?? grainKg * mashRatioLKg + mashTunDeadSpaceL;
      const effectiveRatio = initialWaterL != null && grainKg > 0 ? waterAddedL / grainKg : mashRatioLKg;
      const strikeTemp = calculateStrikeTemperature({
        targetTempC: step.stepTemperatureC,
        grainTempC,
        mashRatioLKg: effectiveRatio,
      });
      cumulativeWaterL = waterAddedL;
      currentTempC = step.stepTemperatureC;
      results.push({
        stepIndex: i,
        waterAddedL,
        infuseTemperatureC: strikeTemp,
        cumulativeWaterL,
        mashTunOccupiedL: cumulativeWaterL + grainKg * L_PER_KG_GRAIN_VOLUME,
      });
    } else if (step.type === "infusion" && allowInfusions) {
      const infuseTemp = step.infuseTemperatureC ?? defaultInfuseTempC;
      const waterAddedL = calculateInfusionVolume({
        targetTempC: step.stepTemperatureC,
        currentTempC,
        grainKg,
        currentWaterL: cumulativeWaterL,
        infuseWaterTempC: infuseTemp,
      });
      cumulativeWaterL += isFinite(waterAddedL) ? waterAddedL : 0;
      currentTempC = step.stepTemperatureC;
      results.push({
        stepIndex: i,
        waterAddedL,
        infuseTemperatureC: infuseTemp,
        cumulativeWaterL,
        mashTunOccupiedL: cumulativeWaterL + grainKg * L_PER_KG_GRAIN_VOLUME,
      });
    } else if (step.type === "decoction") {
      const boilMin = step.decoctionBoilMin ?? 0;
      const decoction = calculateDecoction({
        targetTempC: step.stepTemperatureC,
        currentTempC,
        grainKg,
        currentWaterL: cumulativeWaterL,
        boilTempC: decoctionBoilTempC,
        timeOutMin: (step.rampTimeMin ?? DEFAULT_DECOCTION_HEATUP_MIN) + boilMin,
        coolingRateCH,
        amountOverrideL: step.amountL,
      });
      currentTempC = decoction.resultingTempC;
      results.push({
        stepIndex: i,
        waterAddedL: 0,
        infuseTemperatureC: 0,
        cumulativeWaterL,
        mashTunOccupiedL: cumulativeWaterL + grainKg * L_PER_KG_GRAIN_VOLUME,
        decoction: { ...decoction, boilMin },
      });
    } else {
      // temperature steps: no water added, but temperature changes
      currentTempC = step.stepTemperatureC;
      results.push({
        stepIndex: i,
        waterAddedL: 0,
        infuseTemperatureC: 0,
        cumulativeWaterL,
        mashTunOccupiedL: cumulativeWaterL + grainKg * L_PER_KG_GRAIN_VOLUME,
      });
    }
  }

  return results;
}

export function calculateAcidAddition(input: {
  grains: { grams: number; colorL?: number | null; grainGroup?: string | null; grain: { colorL: number | null; grainGroup: string | null } }[];
  mashWaterL: number;
  targetPh: number;
  sourceHco3Ppm: number;
  sourceCaPpm: number;
  sourceMgPpm: number;
  saltGypsumGL: number;
  saltCaCl2GL: number;
  saltChalkGL: number;
  saltEpsomGL: number;
  saltBakingSodaGL: number;
  acidType: AcidType;
  /** mL for liquid acids, g for solid acids. 0 = no acid added. */
  acidDose: number;
}): { estimatedMashPh: number; finalMashPh: number; phDiff: number } {
  const { grains, mashWaterL, targetPh, sourceHco3Ppm, sourceCaPpm, sourceMgPpm,
          saltGypsumGL, saltCaCl2GL, saltChalkGL, saltEpsomGL, saltBakingSodaGL, acidType, acidDose } = input;

  // Step 1–3: Grain acidity (Bru'n Water model, liters system: U=2.205)
  // grain_group mapping (BeerJSON → Bru'n Water type):
  //   base / flaked / smoked / adjunct → Base Malt: 0.28 × colorL
  //   caramel / specialty              → Crystal Malt: 0.21 × colorL + 2.5
  //   roasted                          → Roast Malt: 38 (fixed)
  //   null/unknown                     → color-based fallback
  function acidityPerLbEq(colorL: number, grainGroup: string | null): number {
    switch (grainGroup) {
      case "base":
      case "flaked":
      case "smoked":
      case "adjunct":
        return 0.28 * colorL;
      case "caramel":
      case "specialty":
        return 0.21 * colorL + 2.5;
      case "roasted":
        return 38;
      default:
        // Fallback: infer from color
        if (colorL > 160) return 38;
        if (colorL > 4)   return 0.21 * colorL + 2.5;
        return 0.28 * colorL;
    }
  }

  let totalGrainAcidity = 0; // mEq (lb-equivalents)
  let totalGristKg = 0;

  for (const g of grains) {
    const colorL = (g.colorL ?? g.grain.colorL) ?? 2;
    const grainGroup = g.grainGroup ?? g.grain.grainGroup;
    const massKg = g.grams / 1000;
    const massLbEq = massKg * 2.205; // U=2.205 for liters system
    totalGrainAcidity += massLbEq * acidityPerLbEq(colorL, grainGroup);
    totalGristKg += massKg;
  }

  // Step 5: Residual Alkalinity (ppm as CaCO₃) — Kolbach formula with carbonate correction
  const effectiveCa   = sourceCaPpm  + saltGypsumGL * 232.8 + saltCaCl2GL * 272.0 + saltChalkGL * 400.4;
  const effectiveMg   = sourceMgPpm  + saltEpsomGL  * 98.6;
  const effectiveHco3 = sourceHco3Ppm + saltChalkGL * 1219.2 + saltBakingSodaGL * 726.3;

  const RA = effectiveHco3 * (50 / 61) * (1 + 2 * Math.pow(10, -2.33))
           - effectiveCa * 0.7143
           - effectiveMg * 0.5879;

  // Step 6: Total mash water alkalinity (mEq)
  const waterAlkalinityMEq = (RA / 50) * mashWaterL;

  // Step 7: Water-to-grist ratio (L/kg → qt/lb)
  const WGR = totalGristKg > 0 ? (mashWaterL / totalGristKg) * L_PER_KG_TO_QT_PER_LB : 3;

  // Step 8–9: Net acidity per liter → estimated mash pH (no acid)
  const netAcidityPerLiter = totalGristKg > 0
    ? (totalGrainAcidity - waterAlkalinityMEq * WGR / 1.5) / mashWaterL
    : 0;
  const estimatedMashPh = 5.76 - 0.17 * netAcidityPerLiter;

  // Forward calculation: convert acid dose to mEq, compute final pH
  const acid = ACID_PROPS[acidType];
  // Use estimatedMashPh for frac (good approximation at expected post-acid pH range)
  const frac = acidDissociationFrac(estimatedMashPh, acid);

  let mMTotal = 0;
  if (acidDose > 0) {
    if (acid.form === "solid") {
      mMTotal = (acidDose * 1000) / acid.MW;
    } else {
      const s = acid.strength!;
      const SG = acid.sg!(s);
      // acidDose mL × SG g/L / 1000 = g solution; × s/100 = g acid; / MW × 1000 = mmol
      mMTotal = (acidDose * (s / 100) * SG) / acid.MW;
    }
  }

  const additionalAcidityMEq = mMTotal * frac;
  // Acid is added to mash water → reduces effective water alkalinity, which is then
  // amplified by WGR/1.5 exactly like the original water alkalinity (Bru'n Water model).
  const effectiveWaterAlkWithAcid = waterAlkalinityMEq - additionalAcidityMEq;
  const netAcidityWithAcid = totalGristKg > 0
    ? (totalGrainAcidity - effectiveWaterAlkWithAcid * WGR / 1.5) / mashWaterL
    : 0;
  const finalMashPh = 5.76 - 0.17 * netAcidityWithAcid;
  const phDiff = finalMashPh - targetPh;

  return { estimatedMashPh, finalMashPh, phDiff };
}