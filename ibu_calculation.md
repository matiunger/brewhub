# IBU Calculation Module — Technical Specification

## Overview

This spec defines a module for estimating International Bitterness Units (IBUs) in a brewing software application. It covers boil additions, whirlpool/hop stand additions, and dry hop perceived bitterness contributions.

The module should accept a recipe (batch parameters + a list of hop additions) and return a total estimated IBU value, plus a per-addition breakdown for UI display.

---

## 1. Data Model

### 1.1 Batch Parameters

```typescript
interface BatchParameters {
  batchVolumeLiters: number;        // post-boil volume into fermenter
  boilGravity: number;              // average gravity during boil, e.g. 1.055
  boilTimeMinutes: number;          // total boil duration
  postBoilVolumeLiters?: number;    // optional, defaults to batchVolumeLiters
}
```

**Notes:**
- `boilGravity` should be the *average* gravity over the boil. If only original gravity (OG) is known, approximate as `boilGravity ≈ OG × (postBoilVolume / preBoilVolume)`. UI may compute this automatically.
- All volumes in liters; all weights in grams. Provide unit conversion helpers separately.

### 1.2 Hop Addition

```typescript
type HopUse = 'boil' | 'whirlpool' | 'dry_hop' | 'first_wort' | 'mash';

type HopForm = 'pellet' | 'whole' | 'cryo' | 'extract';

interface HopAddition {
  name: string;
  alphaAcidPercent: number;         // e.g. 12.5 for 12.5%
  weightGrams: number;
  use: HopUse;
  timeMinutes: number;              // meaning depends on `use` (see below)
  form: HopForm;
  
  // Whirlpool / hop stand only
  whirlpoolTempCelsius?: number;    // required if use === 'whirlpool'
  
  // Optional adjustments
  ageYears?: number;                // for alpha acid degradation, default 0
  storageCondition?: 'cold' | 'room' | 'warm';  // default 'cold'
}
```

**Time semantics by `use`:**
- `boil`: minutes remaining when added (60 = added at start of 60-min boil)
- `whirlpool`: total contact time at the specified temperature, in minutes
- `dry_hop`: total contact time in fermenter, in days (used only for sanity checks; not in formula)
- `first_wort`: treat as a 60-minute boil addition (or boil duration, whichever is shorter), per Tinseth's recommendation
- `mash`: treat as `first_wort` for IBU purposes (negligible difference; documented assumption)

---

## 2. Core Formula: Tinseth (Boil Additions)

Use Glenn Tinseth's formula as the canonical method for all boil-temperature additions.

### 2.1 Formula

```
IBU = (alphaAcidDecimal × weightGrams × utilization × 1000) / batchVolumeLiters
```

Where:
- `alphaAcidDecimal = alphaAcidPercent / 100`
- `utilization = bignessFactor × boilTimeFactor`

### 2.2 Utilization Components

```
bignessFactor = 1.65 × 0.000125^(boilGravity - 1)

boilTimeFactor = (1 - exp(-0.04 × timeMinutes)) / 4.15
```

### 2.3 Reference Implementation (TypeScript)

```typescript
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
```

### 2.4 First Wort Hops

Compute as a boil addition with `timeMinutes = min(boilTimeMinutes, 60)`. Tinseth's research suggests no IBU bonus over an equivalent late-boil addition; flavor benefits are not modeled here.

---

## 3. Whirlpool / Hop Stand Additions

Whirlpool additions occur below boiling, where isomerization continues at a reduced rate. Use a temperature-dependent model.

### 3.1 Approach

1. Compute an **effective boil-equivalent time** based on whirlpool temperature and contact duration.
2. Feed that equivalent time into the Tinseth formula as if it were a boil addition.

### 3.2 Temperature Factor

Isomerization rate approximately halves for every 10°C drop below boiling (100°C at sea level). Model as:

```
tempFactor = 2^((whirlpoolTempCelsius - 100) / 10)
```

This yields:
- 100°C → 1.00 (full boil rate)
- 90°C  → 0.50
- 80°C  → 0.25
- 75°C  → ~0.18
- 70°C  → 0.125
- Below 60°C → treat as zero (set `tempFactor = 0` for `whirlpoolTempCelsius < 60`)

### 3.3 Effective Time

```
effectiveBoilMinutes = whirlpoolContactMinutes × tempFactor
```

Then run Tinseth with `timeMinutes = effectiveBoilMinutes`.

### 3.4 Cooling Caveat

If the user specifies an active chill that brings the wort below 60°C in under 5 minutes, no further adjustment is needed — the model already underweights cool temperatures. For passive cooling over 30+ minutes, optionally allow the user to specify a `coolingTimeMinutes` and integrate temperature decay; otherwise assume isothermal hold for simplicity. **Default behavior: isothermal.**

### 3.5 Reference Implementation

```typescript
function whirlpoolTempFactor(tempCelsius: number): number {
  if (tempCelsius < 60) return 0;
  return Math.pow(2, (tempCelsius - 100) / 10);
}

function whirlpoolIbu(
  alphaAcidPercent: number,
  weightGrams: number,
  boilGravity: number,
  contactMinutes: number,
  tempCelsius: number,
  batchVolumeLiters: number
): number {
  const effectiveTime = contactMinutes * whirlpoolTempFactor(tempCelsius);
  return tinsethIbu(
    alphaAcidPercent,
    weightGrams,
    boilGravity,
    effectiveTime,
    batchVolumeLiters
  );
}
```

### 3.6 Accuracy Note for UI

Display whirlpool IBU contributions with a `±25%` uncertainty indicator. The model is approximate.

---

## 4. Dry Hop "Perceived Bitterness"

Dry hops contribute no iso-alpha acids (no isomerization without heat) but add perceived bitterness via humulinones (oxidized alpha acids) and polyphenols.

### 4.1 Formula

Based on Maye et al. (2016):

```
dryHopPerceivedIbu = 0.10 × alphaAcidDecimal × weightGrams × 1000 / batchVolumeLiters
```

The `0.10` coefficient represents ~10% of alpha acid mass contributing as humulinone-equivalent bitterness. Make this **configurable** (range 0.05–0.15) so users can tune based on hop freshness.

### 4.2 Reporting

- Compute and display dry-hop IBU contribution **separately** from boil/whirlpool IBUs.
- Provide two totals:
  - **Calculated IBU** (boil + whirlpool only — matches lab spectrophotometric measurements)
  - **Perceived Bitterness** (calculated IBU + dry hop contribution)
- Default total shown in main UI: **Calculated IBU**. Show perceived value as secondary.

### 4.3 Reference Implementation

```typescript
function dryHopPerceivedIbu(
  alphaAcidPercent: number,
  weightGrams: number,
  batchVolumeLiters: number,
  coefficient: number = 0.10
): number {
  const aaDecimal = alphaAcidPercent / 100;
  return (coefficient * aaDecimal * weightGrams * 1000) / batchVolumeLiters;
}
```

---

## 5. Optional Adjustments

These are off by default. Expose as toggles in advanced settings.

### 5.1 Hop Age / Storage Degradation

Alpha acids degrade over time. Adjust effective AA% before feeding into formulas:

```
storageFactor = {
  'cold': 0.05,   // ~5% loss per year at freezer temps, sealed
  'room': 0.20,   // ~20% loss per year at room temp
  'warm': 0.35    // ~35% loss per year, poor storage
}[storageCondition]

effectiveAlphaAcidPercent = alphaAcidPercent × (1 - storageFactor)^ageYears
```

### 5.2 Hop Form

Pellets give slightly higher utilization than whole cones due to broken lupulin glands:

```
formFactor = {
  'pellet': 1.10,
  'whole':  1.00,
  'cryo':   2.00,   // cryo ~2x AA concentration; user should already enter the elevated AA%, so default to 1.0 — make this a UI decision
  'extract': 1.10
}
```

Apply as a multiplier on utilization (boil/whirlpool only; ignore for dry hop).

**Default: `formFactor = 1.0` for all forms.** Enable only if the user opts in, and document that pellet AA% on packaging usually already accounts for this.

### 5.3 Yeast/Fermentation Loss

Yeast strips 10–30% of iso-alpha acids during fermentation. If the user wants a "glass IBU" estimate:

```
glassIbu = calculatedIbu × (1 - fermentationLossFraction)
```

Default `fermentationLossFraction = 0.15`. Document clearly that calculated IBU is "post-boil wort IBU" by convention.

---

## 6. Module API

### 6.1 Primary Function

```typescript
interface IbuResult {
  totalCalculatedIbu: number;         // boil + whirlpool
  totalPerceivedIbu: number;          // calculated + dry hop contribution
  breakdown: HopAdditionResult[];
}

interface HopAdditionResult {
  name: string;
  use: HopUse;
  ibuContribution: number;
  utilization: number;                // 0 for dry hops
  effectiveTimeMinutes?: number;      // for whirlpool
  notes?: string[];                   // e.g. "±25% uncertainty"
}

function calculateIbu(
  batch: BatchParameters,
  additions: HopAddition[],
  options?: IbuCalculationOptions
): IbuResult;
```

### 6.2 Options

```typescript
interface IbuCalculationOptions {
  applyAgeAdjustment?: boolean;       // default false
  applyFormFactor?: boolean;          // default false
  applyFermentationLoss?: boolean;    // default false
  fermentationLossFraction?: number;  // default 0.15
  dryHopCoefficient?: number;         // default 0.10
}
```

---

## 7. Validation & Edge Cases

The implementation must handle:

1. **Zero or negative time** — return 0 IBU, no error.
2. **Missing whirlpool temperature** — throw a validation error before calculation.
3. **Boil gravity outside 1.000–1.150** — clamp to range, log warning.
4. **Alpha acid % outside 0–25** — validate; reject above 30 (cryo can hit 25; nothing legitimate exceeds 30).
5. **Batch volume ≤ 0** — throw validation error.
6. **Empty additions list** — return 0 IBU with empty breakdown.
7. **Numerical precision** — round final IBU values to 1 decimal place for display; keep full precision internally.

---

## 8. Test Cases

Implement these as unit tests. Expected values are from Tinseth's published tables and common brewing-software outputs (BeerSmith/Brewfather), accepted tolerance ±0.5 IBU.

### 8.1 Tinseth Reference

| Case | Inputs | Expected IBU |
|------|--------|--------------|
| Classic 60-min addition | 28g @ 5% AA, 60 min, 1.050 OG, 19 L | ~17.0 |
| 15-min addition | 28g @ 5% AA, 15 min, 1.050 OG, 19 L | ~9.4 |
| Flameout (0 min) | 28g @ 5% AA, 0 min, 1.050 OG, 19 L | 0 |
| High gravity penalty | 28g @ 5% AA, 60 min, 1.080 OG, 19 L | ~13.0 |

### 8.2 Whirlpool

| Case | Expected behavior |
|------|-------------------|
| 30 min @ 100°C | Equal to 30-min boil addition |
| 30 min @ 90°C | ~50% of 30-min boil addition |
| 30 min @ 75°C | ~18% of 30-min boil addition |
| 30 min @ 50°C | 0 IBU |

### 8.3 Dry Hop

| Case | Expected IBU |
|------|--------------|
| 100g @ 12% AA in 19 L, default coefficient | ~6.3 perceived IBU, 0 calculated IBU |

---

## 9. Out of Scope

- Lab-grade IBU prediction (requires actual chromatography data per hop variety)
- Modeling dry-hop creep (re-fermentation reducing iso-alpha acids)
- Polyphenol / tannin contributions to perceived bitterness beyond the 10% humulinone model
- Hop variety-specific cohumulone ratios
- Mash hopping flavor contributions
- Real-time temperature curve integration during whirlpool

These can be added in future versions. Document the simplifications in user-facing help text.

---

## 10. References

- Tinseth, G. "Glenn's Hop Utilization Numbers." realbeer.com, 1997.
- Maye, J.P., Smith, R., Leker, J. "Humulinone Formation in Hops and Hop Pellets and Its Implications for Dry Hopped Beers." *MBAA Technical Quarterly*, 2016.
- Malowicki, M.G., Shellhammer, T.H. "Isomerization and Degradation Kinetics of Hop α-Acids." *Journal of Agricultural and Food Chemistry*, 2005.
- Hieronymus, S. *For the Love of Hops.* Brewers Publications, 2012.

---

## 11. Implementation Priority

Build in this order for a minimum viable IBU module:

1. Tinseth boil formula + unit tests (Section 2)
2. Module API + breakdown reporting (Section 6)
3. Whirlpool model (Section 3)
4. Dry hop perceived bitterness (Section 4)
5. Validation/edge cases (Section 7)
6. Optional adjustments behind feature flags (Section 5)