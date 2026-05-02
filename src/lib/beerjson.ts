// BeerJSON 1.0 import/export mapping

// ---- Unit helpers ----

function massToGrams(value: number, unit: string): number {
  switch (unit) {
    case "kg": return value * 1000;
    case "lb": return value * 453.592;
    case "oz": return value * 28.3495;
    case "g":
    default:   return value;
  }
}

function volumeToLiters(value: number, unit: string): number {
  switch (unit) {
    case "gal": return value * 3.78541;
    case "qt":  return value * 0.946353;
    case "fl_oz": return value * 0.0295735;
    case "ml": return value / 1000;
    case "l":
    default:   return value;
  }
}

function colorToLovibond(value: number, unit: string): number {
  switch (unit) {
    case "srm": return (value + 0.76) / 1.3546;
    case "ebc": return ((value / 1.97) + 0.76) / 1.3546;
    case "lovibond":
    default:    return value;
  }
}

function timeToMinutes(value: number, unit: string): number {
  switch (unit) {
    case "sec":   return value / 60;
    case "hr":    return value * 60;
    case "day":   return value * 1440;
    case "min":
    default:      return value;
  }
}

// ---- Types ----

type MassWithUnit = { value: number; unit: string };
type VolumeWithUnit = { value: number; unit: string };
type ColorWithUnit = { value: number; unit: string };
type TimeWithUnit = { value: number; unit: string };

interface BeerJsonFermentable {
  name: string;
  amount: MassWithUnit;
  color?: ColorWithUnit;
  yield?: { fine_grind?: { value: number; unit: string } };
  producer?: string;
}

interface BeerJsonHopAddition {
  name: string;
  amount: MassWithUnit;
  alpha_acid?: { value: number; unit: string };
  timing?: {
    use?: string;
    time?: TimeWithUnit;
  };
}

interface BeerJsonCultureAddition {
  name: string;
  amount?: MassWithUnit | VolumeWithUnit;
  amount_as_weight?: MassWithUnit;
  form?: string;
  producer?: string;
  attenuation?: { value: number; unit: string };
  temperature?: { value: number; unit: string };
}

interface BeerJsonWaterAddition {
  name: string;
  calcium?: MassWithUnit;
  magnesium?: MassWithUnit;
  sodium?: MassWithUnit;
  chloride?: MassWithUnit;
  sulfate?: MassWithUnit;
  bicarbonate?: MassWithUnit;
  zinc?: MassWithUnit;
}

interface BeerJsonRecipe {
  name: string;
  type?: string;
  style?: { name?: string };
  batch_size?: VolumeWithUnit;
  efficiency?: { brewhouse?: { value: number; unit: string } };
  notes?: string;
  fermentable_additions?: BeerJsonFermentable[];
  hop_additions?: BeerJsonHopAddition[];
  culture_additions?: BeerJsonCultureAddition[];
  water_additions?: BeerJsonWaterAddition[];
  boil?: { pre_boil_size?: VolumeWithUnit; boil_time?: TimeWithUnit };
  original_gravity?: { value: number; unit: string };
  final_gravity?: { value: number; unit: string };
  ibu_estimate?: { value: number; unit: string };
  color_estimate?: ColorWithUnit;
}

export interface BeerJson {
  beerjson: {
    version: number;
    recipes: BeerJsonRecipe[];
  };
}

// ---- Batch type (subset used for export) ----

interface BatchForExport {
  name: string;
  type: string;
  style: string | null;
  notes: string | null;
  targetFermentarL: number | null;
  targetOg: number | null;
  targetFg: number | null;
  targetIbu: number | null;
  targetSrm: number | null;
  boilTimeMin: number | null;
  equipment: { brewhouseEfficiency: number } | null;
  grains: {
    grams: number;
    grain: { name: string; brand: string | null; colorL: number | null; maxYield: number | null };
  }[];
  hops: {
    grams: number;
    additionTime: number;
    use: string;
    hop: { name: string; alphaAcid: number };
  }[];
  yeasts: {
    quantity: string;
    temp: number | null;
    yeast: { name: string; brand: string | null; type: string | null; attenuation: number | null };
  }[];
  targetWaterProfile: {
    name: string;
    caPpm: number;
    mgPpm: number;
    naPpm: number;
    clPpm: number;
    so4Ppm: number;
    znPpm: number | null;
    hco3Ppm: number | null;
  } | null;
}

// ---- Export ----

function batchTypeToBeerjson(type: string): string {
  if (type === "beer") return "all grain";
  if (type === "cider") return "cider";
  return "other";
}

function hopUseToBeerjson(use: string): string {
  if (use === "dry_hop") return "add_to_fermentation";
  if (use === "whirlpool" || use === "hop_stand") return "add_to_whirlpool";
  return "add_to_boil"; // fwh, boil
}

export function batchToBeerjson(batch: BatchForExport): BeerJson {
  const recipe: BeerJsonRecipe = {
    name: batch.name,
    type: batchTypeToBeerjson(batch.type),
    batch_size: { value: batch.targetFermentarL ?? 20, unit: "l" },
    efficiency: {
      brewhouse: { value: batch.equipment?.brewhouseEfficiency ?? 75, unit: "%" },
    },
  };

  if (batch.style) recipe.style = { name: batch.style };
  if (batch.notes) recipe.notes = batch.notes;
  if (batch.boilTimeMin) recipe.boil = { boil_time: { value: batch.boilTimeMin, unit: "min" } };
  if (batch.targetOg) recipe.original_gravity = { value: batch.targetOg, unit: "sg" };
  if (batch.targetFg) recipe.final_gravity = { value: batch.targetFg, unit: "sg" };
  if (batch.targetIbu) recipe.ibu_estimate = { value: batch.targetIbu, unit: "ibu" };
  if (batch.targetSrm) recipe.color_estimate = { value: batch.targetSrm, unit: "srm" };

  if (batch.grains.length > 0) {
    recipe.fermentable_additions = batch.grains.map((bg) => {
      const f: BeerJsonFermentable = {
        name: bg.grain.name,
        amount: { value: bg.grams, unit: "g" },
      };
      if (bg.grain.brand) f.producer = bg.grain.brand;
      if (bg.grain.colorL != null) f.color = { value: bg.grain.colorL, unit: "lovibond" };
      if (bg.grain.maxYield != null) {
        f.yield = { fine_grind: { value: bg.grain.maxYield, unit: "%" } };
      }
      return f;
    });
  }

  if (batch.hops.length > 0) {
    recipe.hop_additions = batch.hops.map((bh) => ({
      name: bh.hop.name,
      amount: { value: bh.grams, unit: "g" },
      alpha_acid: { value: bh.hop.alphaAcid, unit: "%" },
      timing: {
        use: hopUseToBeerjson(bh.use),
        time: { value: bh.additionTime, unit: "min" },
      },
    }));
  }

  if (batch.yeasts.length > 0) {
    recipe.culture_additions = batch.yeasts.map((by) => {
      const c: BeerJsonCultureAddition = {
        name: by.yeast.name,
        form: by.yeast.type ?? "dry",
      };
      if (by.yeast.brand) c.producer = by.yeast.brand;
      if (by.yeast.attenuation != null) {
        c.attenuation = { value: by.yeast.attenuation, unit: "%" };
      }
      if (by.temp != null) {
        c.temperature = { value: by.temp, unit: "c" };
      }
      // Store the quantity string as amount weight if it looks numeric
      const qty = parseFloat(by.quantity);
      if (!isNaN(qty)) {
        c.amount_as_weight = { value: qty, unit: "g" };
      }
      return c;
    });
  }

  if (batch.targetWaterProfile) {
    const wp = batch.targetWaterProfile;
    const water: BeerJsonWaterAddition = {
      name: wp.name,
      calcium: { value: wp.caPpm, unit: "mg/l" },
      magnesium: { value: wp.mgPpm, unit: "mg/l" },
      sodium: { value: wp.naPpm, unit: "mg/l" },
      chloride: { value: wp.clPpm, unit: "mg/l" },
      sulfate: { value: wp.so4Ppm, unit: "mg/l" },
    };
    if (wp.znPpm != null) water.zinc = { value: wp.znPpm, unit: "mg/l" };
    if (wp.hco3Ppm != null) water.bicarbonate = { value: wp.hco3Ppm, unit: "mg/l" };
    recipe.water_additions = [water];
  }

  return {
    beerjson: {
      version: 1,
      recipes: [recipe],
    },
  };
}

// ---- Import ----

function beerjsonTypeToBrewhub(type: string | undefined): string {
  if (!type) return "beer";
  if (type === "cider") return "cider";
  if (type === "other" || type === "mead" || type === "wine" || type === "kombucha") return "other";
  return "beer"; // all grain, extract, partial mash, etc.
}

function hopUseFromBeerjson(use: string | undefined): string {
  if (!use) return "boil";
  if (use === "add_to_fermentation") return "dry_hop";
  if (use === "add_to_whirlpool") return "whirlpool";
  return "boil"; // add_to_boil, first wort, etc.
}

export interface ImportedBatchData {
  batch: {
    name: string;
    type: string;
    style: string | null;
    notes: string | null;
    targetFermentarL: number | null;
    boilTimeMin: number | null;
    targetOg: number | null;
    targetFg: number | null;
    targetIbu: number | null;
    targetSrm: number | null;
    draft: boolean;
  };
  grains: {
    name: string;
    brand: string | null;
    colorL: number | null;
    maxYield: number | null;
    grams: number;
  }[];
  hops: {
    name: string;
    alphaAcid: number;
    grams: number;
    additionTime: number;
    use: string;
  }[];
  yeasts: {
    name: string;
    brand: string | null;
    type: string | null;
    attenuation: number | null;
    quantity: string;
    temp: number | null;
  }[];
  waterProfile: {
    name: string;
    caPpm: number;
    mgPpm: number;
    naPpm: number;
    clPpm: number;
    so4Ppm: number;
    znPpm: number | null;
    hco3Ppm: number | null;
  } | null;
}

export function beerjsonToBatchData(recipe: BeerJsonRecipe): ImportedBatchData {
  const batch = {
    name: recipe.name,
    type: beerjsonTypeToBrewhub(recipe.type),
    style: recipe.style?.name ?? null,
    notes: recipe.notes ?? null,
    targetFermentarL: recipe.batch_size
      ? volumeToLiters(recipe.batch_size.value, recipe.batch_size.unit)
      : null,
    boilTimeMin: recipe.boil?.boil_time
      ? timeToMinutes(recipe.boil.boil_time.value, recipe.boil.boil_time.unit)
      : null,
    targetOg: recipe.original_gravity?.value ?? null,
    targetFg: recipe.final_gravity?.value ?? null,
    targetIbu: recipe.ibu_estimate?.value ?? null,
    targetSrm: recipe.color_estimate
      ? colorToLovibond(recipe.color_estimate.value, recipe.color_estimate.unit) * 1.3546 - 0.76 // back to SRM
      : null,
    draft: true,
  };

  // Keep SRM as-is if already in SRM
  if (recipe.color_estimate?.unit === "srm") {
    batch.targetSrm = recipe.color_estimate.value;
  } else if (recipe.color_estimate?.unit === "ebc") {
    batch.targetSrm = recipe.color_estimate.value / 1.97;
  }

  const grains = (recipe.fermentable_additions ?? []).map((f) => ({
    name: f.name,
    brand: f.producer ?? null,
    colorL: f.color ? colorToLovibond(f.color.value, f.color.unit) : null,
    maxYield: f.yield?.fine_grind?.value ?? null,
    grams: massToGrams(f.amount.value, f.amount.unit),
  }));

  const hops = (recipe.hop_additions ?? []).map((h) => ({
    name: h.name,
    alphaAcid: h.alpha_acid?.value ?? 5,
    grams: massToGrams(h.amount.value, h.amount.unit),
    additionTime: h.timing?.time
      ? timeToMinutes(h.timing.time.value, h.timing.time.unit)
      : 60,
    use: hopUseFromBeerjson(h.timing?.use),
  }));

  const yeasts = (recipe.culture_additions ?? []).map((c) => {
    const qtyRaw = c.amount_as_weight ?? c.amount;
    let quantity = "1 pkg";
    if (qtyRaw) {
      const g = massToGrams(qtyRaw.value, (qtyRaw as MassWithUnit).unit);
      quantity = `${Math.round(g)} g`;
    }
    return {
      name: c.name,
      brand: c.producer ?? null,
      type: c.form ?? null,
      attenuation: c.attenuation?.value ?? null,
      quantity,
      temp: c.temperature?.value ?? null,
    };
  });

  let waterProfile: ImportedBatchData["waterProfile"] = null;
  if (recipe.water_additions && recipe.water_additions.length > 0) {
    const w = recipe.water_additions[0];
    const ppm = (m: MassWithUnit | undefined) =>
      m ? massToGrams(m.value, m.unit === "mg/l" ? "mg" : m.unit) : 0;
    waterProfile = {
      name: w.name,
      caPpm: ppm(w.calcium),
      mgPpm: ppm(w.magnesium),
      naPpm: ppm(w.sodium),
      clPpm: ppm(w.chloride),
      so4Ppm: ppm(w.sulfate),
      znPpm: w.zinc ? ppm(w.zinc) : null,
      hco3Ppm: w.bicarbonate ? ppm(w.bicarbonate) : null,
    };
  }

  return { batch, grains, hops, yeasts, waterProfile };
}
