export interface MashStepEntry {
  id: string;
  time: string | null;
  tempC: number | null;
  ph: number | null;
  recirculated: boolean;
  stir: boolean;
}

export interface FermentationStep {
  id: string;
  dateTime: string | null;
  volumeL: number | null;
  densityGL: number | null;
  ph: number | null;
  tempC: number | null;
  pressureBar: number | null;
  bubbleIntervalSec: number | null;
  notes: string | null;
}

export interface BoilEntry {
  id: string;
  time: string | null;
  heightCm: number | null;
  volumeL: number | null;
  targetVolumeL: number | null;
}

export interface PreparationData {
  freezeBottles: boolean;
  setupMill: boolean;
  cleanMashTun: boolean;
  cleanFermenter: boolean;
  weighGrains: boolean;
  prepareBurner: boolean;
  gasTankKg: number | null;
  filterWater: boolean;
  calibratePhMeter: boolean;
  prepareCooler: boolean;
  setupChillerCoils: boolean;
  prepareAlcohol: boolean;
  cleanKitchen: boolean;
  setupWorkspace: boolean;
  prepareStarter: boolean;
}

export interface MillingData {
  dateTime: string | null;
  gapMm: number | null;
}

export interface MashData {
  mashWater: {
    liters: number | null;
    heightCm: number | null;
    potDiameterCm: number | null;
    pot: string | null;
    tStrikeC: number | null;
    notes: string | null;
  };
  spargeWater: {
    liters: number | null;
    heightCm: number | null;
    potDiameterCm: number | null;
    pot: string | null;
    tempC: number | null;
    ph: number | null;
    notes: string | null;
  };
  general: {
    checkWaterTaste: boolean;
    heatWaterTime: string | null;
    mashInTime: string | null;
    mashStartTime: string | null;
    targetTempC: number | null;
    mashTempC: number | null;
    mashPh: number | null;
  };
  timeline: MashStepEntry[];
}

export interface SpargeData {
  recirculationStartTime: string | null;
  recirculationEndTime: string | null;
  spargeStartTime: string | null;
  spargeEndTime: string | null;
  firstRunningsDensity: number | null;
  firstRunningsPh: number | null;
}

export interface PreboilData {
  targetVolumeL: number | null;
  targetHeightCm: number | null;
  targetDensityGL: number | null;
  volumeL: number | null;
  heightCm: number | null;
  densityGL: number | null;
  tempC: number | null;
  ph: number | null;
}

export interface LastRunData {
  densityGL: number | null;
  ph: number | null;
}

export interface BoilData {
  entries: BoilEntry[];
  irishMossCheck: boolean;
  irishMossGr: number | null;
  nutrientsCheck: boolean;
  nutrientsGr: number | null;
  evaporationL: number | null;
}

export interface WhirlpoolChillingData {
  whirlpoolStartTime: string | null;
  chillingStartTime: string | null;
  startTempC: number | null;
  chillingEndTime: string | null;
  endTempC: number | null;
  transferEndTime: string | null;
  transferTempC: number | null;
  ogSample: boolean;
  ogSampleDensity: number | null;
  ogSampleTargetDensity: number | null;
  ogSamplePh: number | null;
}

export interface FermentationData {
  totalWeightKg: number | null;
  liquidWeightKg: number | null;
  volumeL: number | null;
  endGasTankKg: number | null;
  starterNotes: string | null;
  steps: FermentationStep[];
}

export interface KegEntry {
  id: string;
  kegId: string;
  kegName: string;
  tareWeightKg: number | null;
  totalWeightKg: number | null;
}

export interface KeggingData {
  gelatinCheck: boolean;
  gelatinText: string | null;
  smbCheck: boolean;
  smbText: string | null;
  dateTime: string | null;
  volumeL: number | null;
  kegs: KegEntry[];
}

export interface BrewdayData {
  preparation: PreparationData;
  milling: MillingData;
  mash: MashData;
  sparge: SpargeData;
  preboil: PreboilData;
  lastRun: LastRunData;
  boil: BoilData;
  whirlpoolChilling: WhirlpoolChillingData;
  fermentation: FermentationData;
  kegging: KeggingData;
}

export const DEFAULT_BREWDAY_DATA: BrewdayData = {
  preparation: {
    freezeBottles: false,
    setupMill: false,
    cleanMashTun: false,
    cleanFermenter: false,
    weighGrains: false,
    prepareBurner: false,
    gasTankKg: null,
    filterWater: false,
    calibratePhMeter: false,
    prepareCooler: false,
    setupChillerCoils: false,
    prepareAlcohol: false,
    cleanKitchen: false,
    setupWorkspace: false,
    prepareStarter: false,
  },
  milling: { dateTime: null, gapMm: null },
  mash: {
    mashWater: { liters: null, heightCm: null, potDiameterCm: null, pot: null, tStrikeC: null, notes: null },
    spargeWater: { liters: null, heightCm: null, potDiameterCm: null, pot: null, tempC: null, ph: null, notes: null },
    general: { checkWaterTaste: false, heatWaterTime: null, mashInTime: null, mashStartTime: null, targetTempC: null, mashTempC: null, mashPh: null },
    timeline: [{ id: "initial", time: null, tempC: null, ph: null, recirculated: false, stir: false }],
  },
  sparge: { recirculationStartTime: null, recirculationEndTime: null, spargeStartTime: null, spargeEndTime: null, firstRunningsDensity: null, firstRunningsPh: null },
  preboil: { targetVolumeL: null, targetHeightCm: null, targetDensityGL: null, volumeL: null, heightCm: null, densityGL: null, tempC: null, ph: null },
  lastRun: { densityGL: null, ph: null },
  boil: { entries: [], irishMossCheck: false, irishMossGr: null, nutrientsCheck: false, nutrientsGr: null, evaporationL: null },
  whirlpoolChilling: { whirlpoolStartTime: null, chillingStartTime: null, startTempC: null, chillingEndTime: null, endTempC: null, transferEndTime: null, transferTempC: null, ogSample: false, ogSampleDensity: null, ogSampleTargetDensity: null, ogSamplePh: null },
  fermentation: { totalWeightKg: null, liquidWeightKg: null, volumeL: null, endGasTankKg: null, starterNotes: null, steps: [{ id: "pitching", dateTime: null, volumeL: null, densityGL: null, ph: null, tempC: null, pressureBar: null, bubbleIntervalSec: null, notes: null }] },
  kegging: { gelatinCheck: false, gelatinText: null, smbCheck: false, smbText: null, dateTime: null, volumeL: null, kegs: [] },
};

export function parseBrewdayData(raw: string | null): BrewdayData {
  if (!raw) return DEFAULT_BREWDAY_DATA;
  try {
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_BREWDAY_DATA,
      ...parsed,
      preparation: { ...DEFAULT_BREWDAY_DATA.preparation, ...parsed.preparation },
      milling: { ...DEFAULT_BREWDAY_DATA.milling, ...parsed.milling },
      mash: {
        ...DEFAULT_BREWDAY_DATA.mash,
        ...parsed.mash,
        mashWater: { ...DEFAULT_BREWDAY_DATA.mash.mashWater, ...parsed.mash?.mashWater },
        spargeWater: { ...DEFAULT_BREWDAY_DATA.mash.spargeWater, ...parsed.mash?.spargeWater },
        general: { ...DEFAULT_BREWDAY_DATA.mash.general, ...parsed.mash?.general },
        timeline: Array.isArray(parsed.mash?.timeline) && parsed.mash.timeline.length > 0
          ? parsed.mash.timeline.map((e: Record<string, unknown>) => ({
              id: (e.id as string) ?? crypto.randomUUID(),
              time: (e.time as string | null) ?? null,
              tempC: (e.tempC as number | null) ?? null,
              ph: (e.ph as number | null) ?? null,
              recirculated: (e.recirculated as boolean) ?? false,
              stir: (e.stir as boolean) ?? false,
            }))
          : DEFAULT_BREWDAY_DATA.mash.timeline,
      },
      sparge: { ...DEFAULT_BREWDAY_DATA.sparge, ...parsed.sparge },
      preboil: { ...DEFAULT_BREWDAY_DATA.preboil, ...parsed.preboil },
      lastRun: { ...DEFAULT_BREWDAY_DATA.lastRun, ...parsed.lastRun },
      boil: { ...DEFAULT_BREWDAY_DATA.boil, ...parsed.boil },
      whirlpoolChilling: { ...DEFAULT_BREWDAY_DATA.whirlpoolChilling, ...parsed.whirlpoolChilling },
      fermentation: {
        ...DEFAULT_BREWDAY_DATA.fermentation,
        ...parsed.fermentation,
        steps: Array.isArray(parsed.fermentation?.steps) && parsed.fermentation.steps.length > 0
          ? parsed.fermentation.steps.map((s: Record<string, unknown>) => ({
              id: (s.id as string) ?? crypto.randomUUID(),
              dateTime: (s.dateTime as string | null) ?? null,
              volumeL: (s.volumeL as number | null) ?? null,
              densityGL: (s.densityGL as number | null) ?? null,
              ph: (s.ph as number | null) ?? null,
              tempC: (s.tempC as number | null) ?? null,
              pressureBar: (s.pressureBar as number | null) ?? null,
              bubbleIntervalSec: (s.bubbleIntervalSec as number | null) ?? null,
              notes: (s.notes as string | null) ?? null,
            }))
          : DEFAULT_BREWDAY_DATA.fermentation.steps,
      },
      kegging: { ...DEFAULT_BREWDAY_DATA.kegging, ...parsed.kegging, kegs: parsed.kegging?.kegs ?? [] },
    };
  } catch {
    return DEFAULT_BREWDAY_DATA;
  }
}
