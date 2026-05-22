export interface TastingAroma {
  malt: number;      // 0-5
  hops: number;      // 0-5
  fermentation: number; // 0-5
  inappropriateProps: string[]; // property names flagged as inappropriate
  other: string;
  score: number;     // /12
}

export interface TastingAppearance {
  color: string;     // very pale, pale, gold, amber, brown, dark
  clarity: string;   // brilliant, clear, slightly hazy, hazy, opaque
  headSize: number;  // 0-5
  headRetention: number; // 0-5
  headColor: string; // white, off-white, cream, tan
  inappropriateProps: string[];
  other: string;
  score: number;     // /3
}

export interface TastingFlavor {
  sweetness: number;   // 0-5
  bitterness: number;  // 0-5
  acidity: number;     // 0-5
  balance: number;     // 0-4 (0=hoppy, 4=malty)
  finish: number;      // 0-4 (0=dry, 4=sweet)
  inappropriateProps: string[];
  other: string;
  score: number;       // /20
}

export interface TastingMouthfeel {
  body: number;         // 0-5
  carbonation: number;  // 0-5
  warmth: number;       // 0-5
  creaminess: number;   // 0-5
  astringency: number;  // 0-5
  inappropriateProps: string[];
  other: string;
  score: number;        // /5
}

export interface TastingOverall {
  styleAccuracy: number;    // 0-4
  technicalQuality: number; // 0-4
  intangibles: number;      // 0-4
  inappropriateProps: string[];
  feedback: string;
  score: number;            // /10
}

export interface TastingScoreData {
  aroma: TastingAroma;
  appearance: TastingAppearance;
  flavor: TastingFlavor;
  mouthfeel: TastingMouthfeel;
  overall: TastingOverall;
  descriptors: string[];
  flaws: { name: string; severity: "L" | "M" | "H" }[];
  notes: string;
  ageDays: number | null;
}

export const DESCRIPTOR_GROUPS = {
  malt:         ["Bready", "Biscuity", "Grainy", "Toasty", "Caramel", "Toffee", "Chocolate", "Coffee", "Roasty", "Sweet", "Malty", "Nutty", "Dark Fruit", "Honey", "Smoky"],
  hops:         ["Citrus", "Piney", "Tropical", "Herbal", "Floral", "Spicy", "Earthy", "Hoppy", "Bitter", "Resinous", "Grapefruit"],
  fermentation: ["Fruity", "Estery", "Clean", "Banana", "Clove", "Pepper", "Tart"],
};

export const FLAW_NAMES = [
  "Acetaldehyde", "Acetic", "Astringency", "DMS", "Diacetyl", "Earthy",
  "Grainy", "Grassy", "Harsh bitterness", "Lightstruck", "Metallic",
  "Musty", "Oxidized", "Phenolic", "Sulfur", "Vegetal",
];

export const DEFAULT_TASTING_SCORE_DATA: TastingScoreData = {
  aroma: { malt: 0, hops: 0, fermentation: 0, inappropriateProps: [], other: "", score: 0 },
  appearance: { color: "", clarity: "", headSize: 0, headRetention: 0, headColor: "", inappropriateProps: [], other: "", score: 0 },
  flavor: { sweetness: 0, bitterness: 0, acidity: 0, balance: 2, finish: 2, inappropriateProps: [], other: "", score: 0 },
  mouthfeel: { body: 0, carbonation: 0, warmth: 0, creaminess: 0, astringency: 0, inappropriateProps: [], other: "", score: 0 },
  overall: { styleAccuracy: 2, technicalQuality: 2, intangibles: 2, inappropriateProps: [], feedback: "", score: 0 },
  descriptors: [],
  flaws: [],
  notes: "",
  ageDays: null,
};

export function parseTastingData(json: string): TastingScoreData {
  try {
    const parsed = JSON.parse(json);
    return {
      ...DEFAULT_TASTING_SCORE_DATA,
      ...parsed,
      aroma: { ...DEFAULT_TASTING_SCORE_DATA.aroma, ...parsed.aroma },
      appearance: { ...DEFAULT_TASTING_SCORE_DATA.appearance, ...parsed.appearance },
      flavor: { ...DEFAULT_TASTING_SCORE_DATA.flavor, ...parsed.flavor },
      mouthfeel: { ...DEFAULT_TASTING_SCORE_DATA.mouthfeel, ...parsed.mouthfeel },
      overall: { ...DEFAULT_TASTING_SCORE_DATA.overall, ...parsed.overall },
      descriptors: Array.isArray(parsed.descriptors) ? parsed.descriptors : [],
      flaws: Array.isArray(parsed.flaws) ? parsed.flaws : [],
    };
  } catch {
    return DEFAULT_TASTING_SCORE_DATA;
  }
}
