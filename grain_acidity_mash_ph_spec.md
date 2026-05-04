# Grain Acidity & Mash pH Prediction — Complete Technical Specification
*Extracted from Bru'n Water v1.25 by Martin Brungard*

---

## Overview

The mash pH predictor balances two opposing forces:
- **Grain acidity** — darker and more modified malts contribute more acidic compounds (organic acids from kilning, Maillard products, melanoidins)
- **Water alkalinity** — bicarbonate/carbonate buffers in the mash water resist acidification

The net result, normalized to the mash volume and corrected for mash thickness, feeds a linear empirical model that predicts room-temperature mash pH.

---

## Inputs

### Per Grain Row (up to 12 rows)

| Variable | Symbol | Unit | Description |
|---|---|---|---|
| Grain name | — | text | Label only, not used in calc |
| Grain type | `type` | 1–4 | 1=Base Malt, 2=Crystal Malt, 3=Roast Malt, 4=Acid Malt |
| Quantity whole | `qty_whole` | lb or kg | Whole-unit mass |
| Quantity fractional | `qty_frac` | oz or g | Fractional mass (oz if gallons system, g if liters) |
| Color | `color` | °L or EBC | Grain color in Lovibond or EBC (set by color system selector) |

### Global Inputs

| Variable | Symbol | Unit | Description |
|---|---|---|---|
| Mash water volume | `mash_vol` | gal or L | Total water added to mash tun |
| Batch (kettle) volume | `batch_vol` | gal or L | Finished wort volume (used only for color calc) |
| Color system | — | "Lovibond" or "EBC" | Grain color input units |
| Volume units | — | "Gallons" or "Liters" | Affects all unit conversions |
| Water source | — | "Existing" or "Adjusted" | Which water profile to use for alkalinity |
| Bicarbonate (HCO₃) | `hco3` | ppm | Of the selected water (existing or adjusted) |
| Calcium (Ca) | `ca` | ppm | Of the selected water |
| Magnesium (Mg) | `mg` | ppm | Of the selected water |

---

## Unit System Constants

These are looked up from the `mashvaritable` table based on the selected volume unit:

| Constant | Gallons | Liters | Barrels | Hectoliters | Meaning |
|---|---|---|---|---|---|
| `U` | 1 | 2.205 | 1 | 2.205 | lb-to-kg conversion (internal mass normalization) |
| `V` | 16 | 1000 | 16 | 1000 | oz-per-lb or g-per-kg (sub-unit divisor) |
| `N` | 3.785 | 1 | 117.335 | 100 | liters per volume unit |
| `W` | 4 | 1 | 124 | 100 | quarts-per-gal or L/L (for WGR calc) |
| `X` | 1 | 0.2642 | 31 | 26.42 | batch volume scaling factor (for color) |

> For a **gallons** system: `U=1`, `V=16`, `N=3.785`, `W=4`, `X=1`
> For a **liters** system: `U=2.205`, `V=1000`, `N=1`, `W=1`, `X=0.2642`

---

## Step-by-Step Calculation

### Step 1: Normalize Grain Mass to lb-equivalent

For each grain row `i`:

```
mass_lb[i] = qty_whole[i] + (qty_frac[i] / V)
```

Where `V` is 16 (oz/lb) for gallons, 1000 (g/kg) for liters. This gives total mass in the native unit (lb or kg). The `U` constant normalizes it internally, but since `U=1` for gallons and `U=2.205` for liters (kg→lb factor), all acidity calculations work in lb-equivalents.

```
mass_norm[i] = mass_lb[i] * U
```

---

### Step 2: Convert Color to Lovibond

If color system is **Lovibond**: use directly.
If color system is **EBC**: convert to Lovibond using the Mebak formula:

```
color_L[i] = 0.375 × color_EBC[i] + 0.561
```

---

### Step 3: Calculate Grain Acidity per Row (mEq)

Each grain type has a different acidity model based on empirical data (from Kai Troester's research). Acidity coefficients relate to organic acid content formed during malting/roasting:

| Grain Type | Code | Acidity Formula (mEq per lb-equivalent) |
|---|---|---|
| Base Malt | 1 | `0.28 × color_L` |
| Crystal Malt | 2 | `0.21 × color_L + 2.5` |
| Roast Malt | 3 | `38` (fixed — roasting dominates, color irrelevant) |
| Acid Malt | 4 | `95` (fixed — standardized lactic acid content) |

Calculate acidity for each row:

```
acidity[i] = mass_norm[i] × acidity_per_lb(type[i], color_L[i])
```

Where `acidity_per_lb` returns:
- Type 1: `0.28 × color_L`
- Type 2: `0.21 × color_L + 2.5`
- Type 3: `38`
- Type 4: `95`

> **Physical meaning:**
> - Base malts: acidity is almost entirely from enzymatic and kilning reactions, scales linearly with color (Maillard products)
> - Crystal malts: have a baseline acidity (2.5 mEq/lb) from caramelization, plus a color-dependent component
> - Roast malts: above ~180°L, acidity is dominated by pyrolysis acids (primarily organic acids from cellulose/hemicellulose degradation), not well-correlated with color — fixed coefficient used
> - Acid malt (Sauermalz): deliberately acidified by lactic acid bacteria to ~3% lactic acid, fixed high acidity

---

### Step 4: Total Grain Acidity (mEq)

```
total_grain_acidity = Σ acidity[i]    (sum over all grain rows)
```

---

### Step 5: Water Residual Alkalinity (ppm as CaCO₃)

This is the **net** alkalinity of the mash water after accounting for how calcium and magnesium partially counteract bicarbonate's buffering effect. This is an adaptation of the classic Kolbach Residual Alkalinity formula.

```
RA = HCO₃_ppm × (50/61) × (1 + 2×10⁻²·³³) − Ca_ppm × 0.7143 − Mg_ppm × 0.5879
```

Where:
- `HCO₃_ppm × (50/61)` converts bicarbonate (ppm as HCO₃) to alkalinity (ppm as CaCO₃)
- The `(1 + 2×10⁻²·³³)` factor ≈ 1.00936 corrects for a small carbonate (CO₃²⁻) fraction at typical water pH ~8
- `Ca_ppm × 0.7143` = `Ca × (2.497/3.5)` — calcium reduces effective alkalinity (Ca precipitates CaCO₃ in the mash, consuming bicarbonate)
- `Mg_ppm × 0.5879` = `Mg × (4.116/7)` — magnesium similarly reduces effective alkalinity

> **Note:** 0.7143 = 2.497/3.5 and 0.5879 = 4.116/7 where 2.497 and 4.116 are the Ca and Mg hardness-to-CaCO₃ conversion factors, and 3.5 and 7 are the Kolbach denominators. These are the **Residual Alkalinity** factors from Kolbach (1953).

For the **existing water**: use existing water's HCO₃, Ca, Mg.
For the **adjusted water**: use the adjusted mashing water profile's HCO₃, Ca, Mg (i.e., after mineral additions and acid treatment).

> **Adjusted water note:** The adjusted water bicarbonate is computed as:
> `HCO₃_adjusted = HCO₃_diluted + ΔHCO₃_from_minerals`
> Where diluted water = blend of existing + dilution water (if any), and ΔHCO₃ comes from baking soda, chalk, pickling lime additions (positive) or acid additions (negative).

---

### Step 6: Total Mash Water Alkalinity (mEq)

Convert RA from ppm to total milliequivalents in the mash water volume:

```
mash_vol_liters = mash_vol × N        (N = 3.785 for gallons, 1 for liters)

water_alkalinity_mEq = (RA / 50) × mash_vol_liters
```

The `/50` converts ppm as CaCO₃ to mEq/L (1 mEq/L CaCO₃ = 50 mg/L as CaCO₃).

---

### Step 7: Water-to-Grist Ratio (WGR)

```
total_grist = Σ mass_lb[i]          (lb or kg, native units)

WGR = mash_vol × W / total_grist    (qt/lb for gallons, L/kg for liters)
```

Where `W` is the sub-unit conversion (4 qt/gal for gallons, 1 for liters).

For **liters** system, the WGR is in L/kg. To use it in the pH formula (which was calibrated in qt/lb), convert:

```
WGR_qt_per_lb = WGR_L_per_kg × 0.4792     (if liters system)
WGR_qt_per_lb = WGR                         (if gallons system)
```

---

### Step 8: Net Acidity per Liter (I26)

This is the core quantity that drives the pH prediction:

```
net_acidity_per_liter = (total_grain_acidity − water_alkalinity_mEq × WGR_qt_per_lb / 1.5) / mash_vol_liters
```

The `WGR / 1.5` factor is an empirical correction:
- The reference WGR is **1.5 qt/lb** (typical homebrew mash thickness)
- Thinner mashes (higher WGR) amplify the alkalinity's effect proportionally
- Thicker mashes (lower WGR) reduce it
- This reflects that at higher dilution, there is relatively more water alkalinity per unit of grain acidity

---

### Step 9: Mash pH Prediction

```
mash_pH = 5.76 − 0.17 × net_acidity_per_liter
```

This is a **linear empirical model** calibrated against real mash measurements. The anchor point 5.76 represents the pH when grain acidity and water alkalinity are exactly in balance (`net_acidity_per_liter = 0`).

**Guidance on expected ranges:**

| `net_acidity_per_liter` | Predicted pH | Interpretation |
|---|---|---|
| < 0 | > 5.76 | Water alkalinity dominates; pH too high |
| 0 | 5.76 | Balanced |
| 1.5 | 5.50 | Ideal for most light beers |
| 2.4 | 5.35 | Good for pale lagers |
| 3.1 | 5.23 | Good for dark/roasty beers |
| > 5 | < 4.9 | Over-acidified |

**Target ranges (room-temperature measurement):**
- Lighter beers: **5.3 to 5.4**
- Darker beers: **5.4 to 5.6**
- Tart/crisp styles: **5.2 to 5.3**
- Acceptable range: **5.2 to 5.8**

> ⚠️ The model predicts **room-temperature mash pH**, which is lower than in-mash pH. pH strips reportedly read 0.2–0.3 units too low — if using strips, accept readings ~0.2 below target.

---

### Step 10: Beer Color (Optional — for display)

**MCU (Malt Color Units) per grain row:**

```
MCU[i] = (mass_norm[i] × color_L[i]) / (batch_vol × X)
```

Where:
- `batch_vol` = total finished wort volume
- `X` = batch volume scaling factor (1 for gallons, 0.2642 for liters)

**Total MCU (capped at 167):**

```
total_MCU = min(Σ MCU[i], 167)
```

The cap at 167 MCU prevents unrealistic color predictions for very dark grists.

**Beer color using the Morey equation:**

```
SRM = 1.49228 × total_MCU^0.6859

EBC = SRM × 1.97
```

---

## Complete Pseudocode

```js
// ─── CONSTANTS ────────────────────────────────────────────────────
const UNIT_CONSTANTS = {
  Gallons:     { U: 1,     V: 16,   N: 3.785,   W: 4,   X: 1      },
  Liters:      { U: 2.205, V: 1000, N: 1,       W: 1,   X: 0.2642 },
  Barrels:     { U: 1,     V: 16,   N: 117.335, W: 124, X: 31     },
  Hectoliters: { U: 2.205, V: 1000, N: 100,     W: 100, X: 26.42  }
}

// ─── INPUTS ───────────────────────────────────────────────────────
const grains = [
  { type: 1, qty_whole: 10, qty_frac: 0, color: 1.7 },   // 10 lb Base Malt @ 1.7L
  // ... up to 12 rows
]
const mash_vol   = 3.75      // gallons
const batch_vol  = 5.0       // gallons
const vol_unit   = "Gallons"
const color_sys  = "Lovibond"  // or "EBC"
const hco3_ppm   = 0          // mash water bicarbonate (ppm)
const ca_ppm     = 0          // mash water calcium (ppm)
const mg_ppm     = 0          // mash water magnesium (ppm)

// ─── SETUP ────────────────────────────────────────────────────────
const { U, V, N, W, X } = UNIT_CONSTANTS[vol_unit]

// ─── STEP 1 & 2: Mass normalization and color conversion ──────────
function toColor_L(color, system) {
  if (system === "Lovibond") return color
  return 0.375 * color + 0.561    // EBC → Lovibond (Mebak formula)
}

// ─── STEP 3: Acidity per grain row ────────────────────────────────
function acidityPerLb(type, color_L) {
  switch(type) {
    case 1: return 0.28 * color_L           // Base Malt
    case 2: return 0.21 * color_L + 2.5    // Crystal Malt
    case 3: return 38                        // Roast Malt (fixed)
    case 4: return 95                        // Acid Malt (fixed)
  }
}

// ─── STEP 4: Total grain acidity ──────────────────────────────────
let total_grain_acidity = 0
let total_grist = 0
let total_MCU = 0

for (const g of grains) {
  const mass_lb   = g.qty_whole + g.qty_frac / V
  const mass_norm = mass_lb * U
  const color_L   = toColor_L(g.color, color_sys)

  const acidity = mass_norm * acidityPerLb(g.type, color_L)
  total_grain_acidity += acidity

  total_grist += mass_lb

  const mcu = (mass_norm * color_L) / (batch_vol * X)
  total_MCU += mcu
}

total_MCU = Math.min(total_MCU, 167)   // cap at 167

// ─── STEP 5: Residual alkalinity (ppm as CaCO3) ───────────────────
const RA = hco3_ppm * (50/61) * (1 + 2 * Math.pow(10, -2.33))
         - ca_ppm  * 0.7143
         - mg_ppm  * 0.5879

// ─── STEP 6: Total mash water alkalinity (mEq) ────────────────────
const mash_vol_liters       = mash_vol * N
const water_alkalinity_mEq  = (RA / 50) * mash_vol_liters

// ─── STEP 7: Water-to-grist ratio (qt/lb equivalent) ─────────────
let WGR = (mash_vol * W) / total_grist          // qt/lb or L/kg
if (vol_unit === "Liters" || vol_unit === "Hectoliters") {
  WGR = WGR * 0.4792                             // L/kg → qt/lb
}

// ─── STEP 8: Net acidity per liter ────────────────────────────────
const net_acidity_per_liter = (total_grain_acidity - water_alkalinity_mEq * WGR / 1.5)
                              / mash_vol_liters

// ─── STEP 9: Mash pH prediction ───────────────────────────────────
const mash_pH = 5.76 - 0.17 * net_acidity_per_liter

// ─── STEP 10: Beer color ──────────────────────────────────────────
const SRM = 1.49228 * Math.pow(total_MCU, 0.6859)
const EBC = SRM * 1.97
```

---

## Key Constants Summary

| Constant | Value | Source / Meaning |
|---|---|---|
| Base malt acidity slope | 0.28 mEq/lb/°L | Empirical (Troester) |
| Crystal malt acidity slope | 0.21 mEq/lb/°L | Empirical (Troester) |
| Crystal malt baseline | 2.5 mEq/lb | Caramelization baseline |
| Roast malt acidity | 38 mEq/lb | Fixed (pyrolysis acids) |
| Acid malt acidity | 95 mEq/lb | Fixed (~3% lactic acid) |
| pH anchor | 5.76 | pH when grain/water acidity balanced |
| pH slope | −0.17 pH/mEq·L⁻¹ | Empirical calibration |
| Reference WGR | 1.5 qt/lb | Standard mash thickness |
| Ca RA factor | 0.7143 | Kolbach: Ca×2.497/3.5 |
| Mg RA factor | 0.5879 | Kolbach: Mg×4.116/7 |
| HCO₃ carbonate correction | 1.00936 | 1 + 2×10⁻²·³³ |
| HCO₃→alk conversion | 50/61 | ppm HCO₃ → ppm as CaCO₃ |
| alk→mEq/L | ÷ 50 | ppm as CaCO₃ → mEq/L |
| EBC→Lovibond | 0.375×EBC + 0.561 | Mebak formula |
| Morey coefficient | 1.49228 | SRM color model |
| Morey exponent | 0.6859 | SRM color model |
| MCU cap | 167 | Prevents runaway dark beer predictions |
| SRM→EBC | × 1.97 | Approximate conversion |
| L/kg → qt/lb | × 0.4792 | Metric WGR conversion |

---

## Notes for Implementation

1. **Water profile selection:** The model accepts either the *existing* (untreated) water or the *adjusted* (after mineral additions) mashing water profile. The HCO₃, Ca, Mg inputs should reflect whichever is selected.

2. **Acid malt interacts with alkalinity:** If any grain is Acid Malt (type 4), no alkalinity-raising minerals (baking soda, chalk, pickling lime) should be added — they counteract each other. The spreadsheet flags this as an error.

3. **Roast malt threshold:** The instruction text says grains above ~180°L should be entered as Roast Malt. Below that, use Base or Crystal. The code doesn't enforce this — it's a user responsibility — but you may want to warn if a Crystal-typed grain has color > 180°L.

4. **WGR feedback loop:** Because WGR appears in both the alkalinity term and divides by 1.5, changing mash water volume affects pH in two ways:
   - More water → more alkalinity → higher pH (direct)
   - But also higher WGR → WGR/1.5 multiplier increases → amplifies alkalinity further → even higher pH
   This means thin mashes are particularly sensitive to water alkalinity.

5. **pH prediction accuracy:** The model is expected to be within ±0.2 pH units of actual room-temperature mash pH under normal conditions. Factors that can cause larger deviations: non-standard base malts (some are pre-acidified), very thick mashes, unusual grain blends.

6. **Negative net_acidity_per_liter:** Produces a pH above 5.76. This happens when water alkalinity strongly dominates (high RA, thin mash, little dark grain). The model will still compute a value — it may predict pH above 5.8 which indicates the water needs acidification or dilution.

7. **The 0.01 term in Acid_Required (sparge spec):** This spec does NOT include any pH adjustment acid — that is handled separately in the mash acid addition section of the Water Adjustment sheet, which reduces HCO₃ before it reaches this pH predictor.

8. **Beer color is independent of pH:** The `total_MCU` and Morey equation only depend on grain mass and color, not on water chemistry. It's a bonus output computed alongside pH.
