interface BatchWithIngredients {
  grains: {
    grams: number;
    grain: {
      maxYield: number | null;
      colorL: number | null;
    };
  }[];
  hops: {
    grams: number;
    additionTime: number;
    use: string;
    hop: {
      alphaAcid: number;
    };
  }[];
  yeasts: {
    yeast: {
      attenuation: number | null;
    };
  }[];
  targetFermentarL: number | null;
}

export function calculateBrewingStats(batch: BatchWithIngredients) {
  const batchVolume = batch.targetFermentarL || 20; // Default to 20L if not specified
  
  // Calculate OG from grains
  let totalExtractableSugar = 0;
  let totalGravityPoints = 0;
  
  batch.grains.forEach((bg) => {
    const yield_ = bg.grain.maxYield || 75; // Default 75% yield
    const extractableSugar = (bg.grams / 1000) * (yield_ / 100); // kg of extract
    totalExtractableSugar += extractableSugar;
  });
  
  // Standard formula: OG = 1 + (points / 1000)
  // Points = extract (kg) * 384 / batch volume (L)
  // This gives approximate gravity points
  const points = (totalExtractableSugar * 384) / batchVolume;
  const og = 1 + (points / 1000);
  
  // Calculate FG from OG and average yeast attenuation
  let avgAttenuation = 75; // Default 75%
  if (batch.yeasts.length > 0) {
    const totalAttenuation = batch.yeasts.reduce((sum, by) => {
      return sum + (by.yeast.attenuation || 75);
    }, 0);
    avgAttenuation = totalAttenuation / batch.yeasts.length;
  }
  
  const attenuationFactor = avgAttenuation / 100;
  const fg = 1 + ((points * (1 - attenuationFactor)) / 1000);
  
  // Calculate ABV
  const abv = (og - fg) * 131.25;
  
  // Calculate IBU using Tinseth formula
  let totalIbu = 0;
  batch.hops.forEach((bh) => {
    const aa = bh.hop.alphaAcid / 100;
    const grams = bh.grams;
    const time = bh.additionTime;
    
    // Tinseth utilization formula
    // For boil hops: U = 1.65 * 0.000125^(boil gravity - 1) * (1 - e^(-0.04 * time)) / 4.15
    const boilGravity = (og + 1) / 2; // Average between OG and water (1.000)
    const utilization = 1.65 * Math.pow(0.000125, boilGravity - 1) * 
                       (1 - Math.exp(-0.04 * time)) / 4.15;
    
    // IBU contribution
    const ibu = (grams * aa * utilization * 1000) / batchVolume;
    
    // Adjust for different hop uses
    let useFactor = 1;
    if (bh.use === "fwh") useFactor = 1.1;
    else if (bh.use === "whirlpool" || bh.use === "hop_stand") useFactor = 0.5;
    else if (bh.use === "dry_hop") useFactor = 0;
    
    totalIbu += ibu * useFactor;
  });
  
  // Calculate SRM (Standard Reference Method)
  // Formula: SRM = 1.4922 * MCU^0.6859
  // MCU (Malt Color Units) = (grain weight in lbs * grain color in L) / batch volume in gallons
  let mcu = 0;
  batch.grains.forEach((bg) => {
    const weightLbs = bg.grams * 0.00220462; // Convert grams to lbs
    const colorL = bg.grain.colorL || 2; // Default to 2L (pale)
    mcu += (weightLbs * colorL) / (batchVolume * 0.264172); // Convert L to gallons
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
  };
}