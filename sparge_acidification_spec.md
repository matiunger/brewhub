# Sparge Water Acidification — Complete Technical Specification
*Extracted from Bru'n Water v1.25 by Martin Brungard*

---

## Overview

The goal is to calculate how much acid (in mL or grams) to add to sparge water to drop its alkalinity below ~25 ppm as CaCO₃. The math is a carbonate equilibrium titration: given the starting bicarbonate/carbonate content and pH, determine the molar quantity of acid needed to reach a target pH, then convert moles → volume or mass based on the chosen acid's properties.

---

## Inputs

| Variable | Symbol | Unit | Description |
|---|---|---|---|
| Starting alkalinity | `alk` | ppm as CaCO₃ | Pulled from Water Report Input sheet. Equals the water's total alkalinity. |
| Starting water pH | `pH_start` | Standard Units | Measured or assumed (use 7.0 if unknown). |
| Target water pH | `pH_target` | Standard Units | Recommended 5.5–6.0 for sparge water. |
| Water volume to treat | `vol` | Gallons or Liters | Set to 1 for per-unit calculation; program scales to actual sparge volume elsewhere. |
| Acid type | — | selection | One of: Acetic, Hydrochloric, Lactic, Phosphoric, Sulfuric, Citric, Tartaric, Malic |
| Acid strength | `strength` | % or N or M | Numerical value of the acid's concentration. For solid acids this input is unused. |
| Strength unit | — | %, N, or M | Percentage by mass, Normality, or Molarity |

---

## Acid Reference Table

Each acid has fixed properties used throughout the calculation:

| # | Acid | pK₁ | pK₂ | pK₃ | Mol. Wt. (g/mol) | Form | SG / Density |
|---|---|---|---|---|---|---|---|
| 1 | Acetic | 4.75 | — | — | 60.05 | Liquid | Polynomial (see below) |
| 2 | Hydrochloric | −7 | — | — | 36.46 | Liquid | Polynomial |
| 3 | Lactic | 3.86 | — | — | 90.08 | Liquid | Polynomial |
| 4 | Phosphoric | 2.12 | 7.20 | 12.44 | 98.00 | Liquid | Polynomial |
| 5 | Sulfuric | −1 | 1.92 | — | 98.07 | Liquid | Polynomial |
| 6 | Citric | 3.14 | 4.77 | 6.39 | 192.13 | **Solid** | 1480 g/L |
| 7 | Tartaric | 2.98 | 4.34 | — | 150.09 | **Solid** | 1000 g/L |
| 8 | Malic | 3.40 | 5.20 | — | 134.09 | **Solid** | 1609 g/L |

> **Citric, Tartaric, and Malic** are solids only — their `strength` input is ignored.

---

## Density (SG) Polynomials for Liquid Acids

Density in **g/L** as a function of `strength` (in % by mass, i.e. the raw number, e.g. `88` not `0.88`):

```
Acetic:
  SG = 1000 × (−7.575×10⁻¹⁰×s⁴ + 7.01×10⁻⁸×s³ − 9.254×10⁻⁶×s² + 1.575×10⁻³×s + 0.9979)

Hydrochloric:
  SG = 1000 × (−3.1666×10⁻⁷×s³ + 1.8499×10⁻⁵×s² + 4.7666×10⁻³×s + 0.998)

Lactic:
  SG = 1000 × (−5.6193×10⁻¹⁰×s⁴ + 5.115×10⁻⁸×s³ − 1.1408×10⁻⁶×s² + 2.4529×10⁻³×s + 0.998)

Phosphoric:
  SG = 1000 × (−3.9523×10⁻⁹×s⁴ + 6.8571×10⁻⁷×s³ + 5.4475×10⁻⁷×s² + 5.51368×10⁻³×s + 0.99778)

Sulfuric:
  SG = 1000 × (−2.0911×10⁻⁸×s⁴ + 3.4312×10⁻⁶×s³ − 1.3954×10⁻⁴×s² + 9.0885×10⁻³×s + 0.9947)
```

Where `s` = strength as the numeric % value (e.g. 85 for 85%).

> For Normality (N) or Molarity (M) inputs, the SG polynomial is **not used** — concentration is used directly in the dose formula.

---

## Step-by-Step Calculation

### Step 1: Total Carbonate Concentration (Ct)

Convert alkalinity from ppm as CaCO₃ to mM/L:

```
Ct = (alk / 50) / (f2_start − f2_ref + f3_ref − f3_start)
```

Where the ionization fractions for the carbonate system at **starting pH** use pKa values of **6.38** (pK₁) and **10.33** (pK₂):

```
r1 = 10^(pH_start − 6.38)
r2 = 10^(pH_start − 10.33)
D  = 1 + r1 + (r1 × r2)

f1_start = 1 / D            ← fraction as H₂CO₃
f2_start = r1 / D           ← fraction as HCO₃⁻
f3_start = (r1 × r2) / D   ← fraction as CO₃²⁻
```

The same fractions are also computed at a **reference pH of 4.3** (hardcoded):

```
r1_ref = 10^(4.3 − 6.38)
r2_ref = 10^(4.3 − 10.33)
D_ref  = 1 + r1_ref + (r1_ref × r2_ref)

f1_ref = 1 / D_ref
f2_ref = r1_ref / D_ref
f3_ref = (r1_ref × r2_ref) / D_ref
```

Then:

```
Ct = (alk / 50) / ((f2_ref − f2_start) + (f3_start − f3_ref))
```

> The reference pH 4.3 represents the essentially fully protonated carbonate system (almost all CO₂) — it normalizes the denominator so Ct correctly represents the total dissolved inorganic carbon.

---

### Step 2: Moles of Acid Required (Acid_Required — mM/L)

Compute ionization fractions at the **target pH**:

```
r1_target = 10^(pH_target − 6.38)
r2_target = 10^(pH_target − 10.33)
D_target  = 1 + r1_target + (r1_target × r2_target)

f1_target = 1 / D_target
f2_target = r1_target / D_target
f3_target = (r1_target × r2_target) / D_target
```

Then the moles of acid required per liter:

```
Acid_Required (mM/L) = Ct × ((f1_target − f1_start) + (f3_start − f3_target))
                       + 10^(−pH_target) − 10^(−pH_start)
                       + 0.01
```

The `+ 0.01` is a small empirical correction for ion activity / measurement uncertainty.

> Intuitively: you're driving the carbonate from its starting distribution toward the target distribution, consuming one proton per HCO₃⁻ → H₂CO₃ conversion and two protons per CO₃²⁻ → H₂CO₃.

---

### Step 3: Effective mM/L Accounting for Acid Dissociation (mM_required)

For **polyprotic acids** (Phosphoric, Citric, Tartaric, Malic, Sulfuric), the acid may not donate all its protons at the target pH. A correction factor `frac` accounts for this:

Using the acid's pK values at the target pH:

```
Ka1 = 10^(pH_target − pK1)
Ka2 = 10^(pH_target − pK2)   ← use 20 (i.e. 10^(pH−20) ≈ 0) if monoprotic
Ka3 = 10^(pH_target − pK3)   ← use 20 if di- or monoprotic

D_acid = 1 + Ka1 + (Ka1×Ka2) + (Ka1×Ka2×Ka3)

f0 = 1 / D_acid                        ← fully protonated fraction
f1 = Ka1 / D_acid                      ← singly deprotonated
f2 = Ka1×Ka2 / D_acid                  ← doubly deprotonated
f3 = Ka1×Ka2×Ka3 / D_acid             ← triply deprotonated

frac = f1 + 2×f2 + 3×f3               ← average protons donated per molecule
```

Then:

```
mM_required = Acid_Required / frac
```

> For example, phosphoric acid at pH 5.6 donates slightly less than 1 proton per molecule on average because pK₁=2.12 means it's mostly in the H₂PO₄⁻ form. `frac` ≈ 0.97 in typical conditions, a ~3% correction.

---

### Step 4: Convert mM_required to Acid Volume or Mass

The conversion depends on the **strength unit** selected (%, N, or M) and whether the acid is liquid or solid.

**Volume unit conversion factor:**
- If volume unit = Gallons: `vol_factor = 3.785` (liters per gallon)
- If volume unit = Liters: `vol_factor = 1.0`

#### 4a. Liquid Acid — Percentage by mass (%)

```
strength_decimal = strength / 100          ← e.g. 88 → 0.88
vol_mL = (mM_required × MW × vol × vol_factor) / (strength_decimal × SG)
```

Where `SG` is the density in g/L from the polynomial in Step 0, and `MW` is molecular weight in g/mol. This gives **mL per unit volume** (per gallon or per liter, depending on `vol`).

#### 4b. Liquid Acid — Normality (N)

```
vol_mL = (Acid_Required × vol × vol_factor) / strength
```

`Acid_Required` here is in mEq/L (= mM/L × frac), and Normality is mEq/mL directly, so this simplifies.

#### 4c. Liquid Acid — Molarity (M)

```
vol_mL = (Acid_Required × vol × vol_factor) / (strength × frac)
```

#### 4d. Solid Acid (Citric, Tartaric, Malic)

```
mass_g = (mM_required × MW × vol × vol_factor) / 1000
```

The `/1000` converts mmol → mol × g/mol → grams.

---

### Step 5: Final Water Alkalinity (Output Check)

```
Final_Alkalinity = alk − (Acid_Required × 50)
```

Where `Acid_Required` is in mEq/L. Dividing by 50 converts from mEq/L → ppm as CaCO₃.

Target: `Final_Alkalinity ≤ 25 ppm as CaCO₃`

---

### Step 6: Anion Contributions (Optional Outputs)

For acids that introduce flavor-relevant anions into the water:

| Acid | Anion | ppm per mM/L |
|---|---|---|
| Sulfuric | SO₄²⁻ | `mM_required × 96` |
| Hydrochloric | Cl⁻ | `mM_required × 35.5` |
| Lactic | Lactate | 89 ppm (at reference dose) |
| Phosphoric | Phosphate | 95 ppm (at reference dose) |
| Acetic | Acetate | 59 ppm (at reference dose) |
| Citric | Citrate | 189 ppm (at reference dose) |
| Tartaric | Tartarate | 148 ppm (at reference dose) |
| Malic | Malate | 132 ppm (at reference dose) |

> The ppm values for Sulfuric and Hydrochloric are calculated dynamically; the rest are reference thresholds stored in the table.

---

## Complete Calculation Flow (Pseudocode)

```js
// INPUTS
const alk        = /* ppm as CaCO3 */
const pH_start   = /* e.g. 7.0 */
const pH_target  = /* e.g. 5.6 */
const vol        = /* e.g. 1 (gallons) */
const acid       = /* selected acid object from table */
const strength   = /* e.g. 85 (for 85%) */
const strengthUnit = /* "%", "N", "M", or "Solid" */
const volUnit    = /* "Gallons" or "Liters" */

// CONSTANTS
const pK_carb1 = 6.38
const pK_carb2 = 10.33
const pH_ref   = 4.3
const vol_factor = volUnit === "Gallons" ? 3.785 : 1.0

// STEP 1: Ionization fractions — helper function
function carbFractions(pH) {
  const r1 = 10 ** (pH - pK_carb1)
  const r2 = 10 ** (pH - pK_carb2)
  const D  = 1 + r1 + r1 * r2
  return { f1: 1/D, f2: r1/D, f3: r1*r2/D }
}

const fs = carbFractions(pH_start)
const fr = carbFractions(pH_ref)     // reference at 4.3
const ft = carbFractions(pH_target)

// Total carbonate in mM/L
const Ct = (alk / 50) / ((fr.f2 - fs.f2) + (fs.f3 - fr.f3))

// STEP 2: Acid required in mM/L (= mEq/L for monoprotic)
const Acid_Required = Ct * ((ft.f1 - fs.f1) + (fs.f3 - ft.f3))
                      + 10 ** (-pH_target) - 10 ** (-pH_start)
                      + 0.01

// STEP 3: Acid dissociation correction (frac)
function acidFrac(acid, pH_target) {
  const Ka1 = 10 ** (pH_target - acid.pK1)
  const Ka2 = 10 ** (pH_target - acid.pK2)  // use pK2=20 if not applicable
  const Ka3 = 10 ** (pH_target - acid.pK3)  // use pK3=20 if not applicable
  const D = 1 + Ka1 + Ka1*Ka2 + Ka1*Ka2*Ka3
  const f1 = Ka1 / D
  const f2 = Ka1*Ka2 / D
  const f3 = Ka1*Ka2*Ka3 / D
  return f1 + 2*f2 + 3*f3
}

const frac = acidFrac(acid, pH_target)
const mM_required = Acid_Required / frac

// STEP 4: SG from polynomial (liquid acids only)
function getSG(acid, strength_pct) {
  const s = strength_pct  // raw number, e.g. 85
  // use acid-specific polynomial coefficients
  return acid.sgPolynomial(s)
}

// STEP 4: Dose calculation
let dose_mL_or_g

if (acid.form === "Solid") {
  dose_mL_or_g = (mM_required * acid.MW * vol * vol_factor) / 1000  // grams

} else if (strengthUnit === "%") {
  const SG = getSG(acid, strength)
  dose_mL_or_g = (mM_required * acid.MW * vol * vol_factor) / ((strength / 100) * SG)

} else if (strengthUnit === "N") {
  dose_mL_or_g = (Acid_Required * vol * vol_factor) / strength

} else if (strengthUnit === "M") {
  dose_mL_or_g = (Acid_Required * vol * vol_factor) / (strength * frac)
}

// mL/gal or mL/L → total volume (if vol=1, this is the per-unit dose)
const dose_tsp = dose_mL_or_g / 4.929  // 1 tsp = 4.929 mL

// STEP 5: Final alkalinity
const final_alk = alk - (Acid_Required * 50)  // ppm as CaCO3

// STEP 6: Anion additions (Sulfuric and HCl only, dynamic)
const SO4_added = (acid.name === "Sulfuric") ? mM_required * 96 : 0
const Cl_added  = (acid.name === "Hydrochloric") ? mM_required * 35.5 : 0
```

---

## Key Constants Summary

| Constant | Value | Notes |
|---|---|---|
| Carbonate pK₁ | 6.38 | H₂CO₃ ⇌ HCO₃⁻ |
| Carbonate pK₂ | 10.33 | HCO₃⁻ ⇌ CO₃²⁻ |
| Reference pH | 4.3 | Hardcoded normalization point |
| mEq/L → ppm CaCO₃ | × 50 | Standard alkalinity conversion |
| Gallons → Liters | × 3.785 | Volume conversion |
| mL → tsp | ÷ 4.929 | 1 US tsp = 4.929 mL |
| Empirical correction | + 0.01 mM/L | Added to Acid_Required |

---

## Notes for Implementation

1. **Acid_Required can be negative** if the water is already below target pH. Clamp to 0 and show a "no acid needed" message.

2. **Final alkalinity can be negative** (over-acidified). This is a signal to raise the target pH.

3. **strength defaults to 1** if the user enters 0 (matches the `IF(N(B9)=0, 1, N(B9))` guard in the sheet).

4. **For monoprotic acids** (Acetic, Lactic, HCl), use pK₂ = pK₃ = 20. This makes Ka2, Ka3 ≈ 0, so `frac` = f1 ≈ 1.0 — almost no correction needed.

5. **For Sulfuric acid** (diprotic, pK₂ = 1.92), at typical sparge pH (~5.6) it's essentially fully dissociated (`frac` ≈ 2.0 at low pH, closer to 1.97 at pH 5.6). This halves the physical volume needed versus a monoprotic acid with the same molar mass.

6. **Solid acids**: No SG or strength input needed. Dose is purely `mM × MW × volume / 1000` → grams.

7. **When vol = 1**: The output is acid per 1 gallon (or liter). Multiply by actual sparge volume to get total addition.

8. **Alkalinity input of 0**: Ct = 0, so Acid_Required ≈ 0.01 mM/L (just the empirical term). No real acidification needed.
