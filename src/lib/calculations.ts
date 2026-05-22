interface BatchWithIngredients {
  grains: {
    grams: number;
    // Snapshot fields take priority; fall back to inventory if null
    colorL?: number | null;
    maxYield?: number | null;
    grain: {
      maxYield: number | null;
      colorL: number | null;
    };
  }[];
  hops: {
    grams: number;
    additionTime: number | null;
    use: string;
    alphaAcid?: number | null;
    hop: {
      alphaAcid: number;
    };
  }[];
  yeasts: {
    attenuation?: number | null;
    yeast: {
      attenuation: number | null;
    };
  }[];
  targetFermentarL: number | null;
  equipment: {
    trubLossL: number;
    brewhouseEfficiency: number;
    mashEfficiency?: number | null;
  } | null;
  // Equipment snapshot fields (take priority over linked equipment)
  equipmentTrubLossL?: number | null;
  equipmentBrewhouseEff?: number | null;
  equipmentMashEff?: number | null;
}

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
      const effectiveTime = 15 * whirlpoolTempFactor(whirlpoolDefaultTempC);
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

export function calculateBrewingStats(batch: BatchWithIngredients) {
  const batchVolume = batch.targetFermentarL || 20; // Default to 20L if not specified
  const trubLossL = batch.equipmentTrubLossL ?? batch.equipment?.trubLossL ?? 1.0;
  const postChillVolumeL = batchVolume + trubLossL;

  // Mash efficiency: snapshot takes priority, fall back to linked equipment, then default 75%
  const mashEff = (
    batch.equipmentMashEff ??
    batch.equipment?.mashEfficiency ??
    batch.equipmentBrewhouseEff ??
    batch.equipment?.brewhouseEfficiency ??
    75
  ) / 100;

  // Total theoretical extract (kg), then apply mash efficiency
  let totalExtractableSugar = 0;
  batch.grains.forEach((bg) => {
    const yield_ = (bg.maxYield ?? bg.grain.maxYield) || 75;
    totalExtractableSugar += (bg.grams / 1000) * (yield_ / 100);
  });
  const adjustedExtract = totalExtractableSugar * mashEff;

  // °P = extract (kg) × 1000 / post-chill volume (L) / 10
  const plato = (adjustedExtract * 1000) / postChillVolumeL / 10;
  // Balling formula: SG from °P
  const og = 1 + plato / (258.6 - plato * (227.1 / 258.2));
  
  // Calculate FG from OG and average yeast attenuation
  let avgAttenuation = 75; // Default 75%
  if (batch.yeasts.length > 0) {
    const totalAttenuation = batch.yeasts.reduce((sum, by) => {
      return sum + ((by.attenuation ?? by.yeast.attenuation) || 75);
    }, 0);
    avgAttenuation = totalAttenuation / batch.yeasts.length;
  }
  
  const attenuationFactor = avgAttenuation / 100;
  const fg = og - (og - 1) * attenuationFactor;
  
  // Calculate ABV
  const abv = (og - fg) * ABV_FACTOR;
  
  // Calculate IBU using Tinseth formula
  const boilGravityForIbu = (og + 1) / 2; // Average between OG and water
  const ibuResult = calculateIbuBreakdown(batch.hops, boilGravityForIbu, batchVolume, 60);
  const totalIbu = ibuResult.totalCalculatedIbu;
  
  // Convert post-chill volume to gallons for MCU
  const postChillGal = postChillVolumeL * L_TO_GAL;

  // Calculate SRM (Standard Reference Method)
  // Formula: SRM = 1.4922 * MCU^0.6859
  // MCU (Malt Color Units) = (grain weight in lbs * grain color in L) / post-chill volume in gallons
  let mcu = 0;
  batch.grains.forEach((bg) => {
    const weightLbs = bg.grams * G_TO_LBS; // Convert grams to lbs
    const colorL = (bg.colorL ?? bg.grain.colorL) || 2; // Default to 2L (pale)
    mcu += (weightLbs * colorL) / postChillGal;
  });
  
  const srm = 1.4922 * Math.pow(mcu, 0.6859);
  
  // Calculate total grain weight
  const totalGrainWeight = batch.grains.reduce((sum, bg) => sum + bg.grams, 0);
  
  return {
    og: Math.max(1.000, og),
    fg: Math.max(1.000, fg),
    ibu: Math.max(0, totalIbu),
    srm: Math.max(0, srm),
    abv: Math.max(0, abv),
    totalGrainWeight,
    ogMashEffPct: Math.round(mashEff * 100),
    ogPostChillVolumeL: Math.round(postChillVolumeL * 10) / 10,
    ogAdjustedExtractKg: Math.round(adjustedExtract * 100) / 100,
  };
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