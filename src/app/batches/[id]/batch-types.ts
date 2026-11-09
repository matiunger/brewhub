// Shared shapes for the batch page components

export interface Grain {
  id: string;
  name: string;
  brand: string | null;
  colorL: number | null;
  maxYield: number | null;
  grainGroup: string | null;
}

export interface Hop {
  id: string;
  name: string;
  alphaAcid: number;
}

export interface Yeast {
  id: string;
  name: string;
  brand: string | null;
  attenuation: number | null;
}

export interface BatchGrain {
  id: string;
  grams: number;
  mashAddition: string | null;
  // Snapshot fields (copied from inventory at add time, editable per batch)
  name: string | null;
  brand: string | null;
  colorL: number | null;
  maxYield: number | null;
  grainGroup: string | null;
  grain: Grain;
}

export interface BatchHop {
  id: string;
  grams: number;
  use: string;
  additionTime: number | null;
  // Snapshot fields
  name: string | null;
  alphaAcid: number | null;
  hop: Hop;
}

export interface BatchYeast {
  id: string;
  quantityAmount: number | null;
  quantityUnits: string | null;
  temp: number | null;
  pitchRate: number | null;
  starterNotes: string | null;
  // Snapshot fields
  name: string | null;
  brand: string | null;
  attenuation: number | null;
  yeast: Yeast;
}

export interface Stats {
  og: number;
  fg: number;
  ibu: number;
  srm: number;
  abv: number;
}

export interface Equipment {
  id: string;
  name: string;
  fermenterLossL: number;
  trubLossL: number;
  systemLossPercent: number | null;
  mashTunDeadSpaceL: number | null;
  grainAbsorptionLKg: number | null;
  boilEvaporationRateLH: number | null;
  heatingEvaporationRateLH: number | null;
  tempContractionPercent: number | null;
}

export interface EquipmentSnapshot {
  name: string | null;
  brewhouseEff: number | null;
  mashEff: number | null;
  mashTunVolumeL: number | null;
  mashTunDeadSpaceL: number | null;
  mashTunLossL: number | null;
  boilPotVolumeL: number | null;
  boilEvapRateLH: number | null;
  heatEvapRateLH: number | null;
  grainAbsLKg: number | null;
  fermenterVolumeL: number | null;
  fermenterWeightKg: number | null;
  fermenterLossL: number | null;
  trubLossL: number | null;
  systemLossPct: number | null;
  tempContractionPct: number | null;
  boilPotDiameter: number | null;
  spargeWaterPotDiameter: number | null;
}

export interface WaterProfile {
  id: string;
  name: string;
  caPpm: number;
  mgPpm: number;
  naPpm: number;
  clPpm: number;
  so4Ppm: number;
  znPpm: number | null;
  hco3Ppm: number | null;
  pH: number | null;
}

export interface MashStep {
  id: string;
  name: string;
  type: string;
  stepTemperatureC: number;
  stepTimeMin: number;
  amountL: number | null;
  rampTimeMin: number | null;
  endTemperatureC: number | null;
  description: string | null;
  infuseTemperatureC: number | null;
  decoctionBoilMin: number | null;
  sortOrder: number;
}

