# Accurately Calculating Sugar Additions for Carbonation

*From German brewing and more*

Carbonation calculation spreadsheet — preloaded with [US units](http://braukaiser.com/documents/Kaiser_carbonation_calculator_US.xls) or [metric units](http://braukaiser.com/documents/Kaiser_carbonation_calculator_metric.xls) — for quick access. Read this article to understand how it works.

Accurately calculating carbonation is a great exercise for working with apparent and true (real) attenuations as well as the extract % or Plato scale. The final carbonation of bottle-conditioned beer depends on:
1. The CO₂ already present in the beer at bottling time.
2. The CO₂ generated during bottle conditioning.

The CO₂ already in the beer can be determined from the CO₂ headspace pressure and beer temperature using **Carbonation Tables**, which show equilibrium CO₂ content for a given pressure and temperature.

The CO₂ created by bottle conditioning is based on the amount of sugar fermented. Each gram of fermentable extract is fermented into equal parts (by weight) of alcohol and CO₂ — not exactly true, but close enough for this calculation.

---

## Contents

- [Converting Units](#converting-units)
- [Corn Sugar](#corn-sugar)
- [Table Sugar](#table-sugar)
- [Dried Malt Extract](#dried-malt-extract)
- [Speise](#speise)
- [Kräusen Beer](#kraeusen-beer)
- [Remaining or Residual Extract](#remaining-or-residual-extract)
- [Final Remarks](#final-remarks)
- [Sources](#sources)

---

## Converting Units

Since this article uses metric units, the following conversions apply for American home brewers:

```
1 g      = 0.035 oz
1 l      = 1.06 qt
1 g/l CO₂ = 0.5 volumes CO₂
1 Plato  = −463.37 + (668.72 × SG) − (205.35 × SG²)   [ENSMINGER]
         ≈ (SG − 1) × 1000 / 4   (quick approximation)
```

---

## Corn Sugar

The easiest way to add fermentable extract is through the addition of pure sugar — **dextrose** (corn sugar) or **sucrose** (table sugar).

Most corn sugar is actually **glucose monohydrate** — each glucose molecule is bound with a water molecule, which adds to its weight but not to CO₂ potential. Glucose monohydrate contains **9% water by weight**, so only 91% of its weight is active. (This is the corn sugar that doesn't clump when not stored in a sealed container.)

```
C_beer = C_flat-beer + 0.5 × 0.91 × m_corn-sugar / V_beer
```

- **C_beer** — final carbonation of the beer (g/l)
- **C_flat-beer** — CO₂ content before bottling (g/l)
- **m_corn-sugar** — weight of corn sugar / glucose monohydrate (g)
- **V_beer** — beer volume (l)

---

## Table Sugar

Table sugar (sucrose) contains no water, and yeast converts half its weight to CO₂:

```
C_beer = C_flat-beer + 0.5 × m_table-sugar / V_beer
```

- **m_table-sugar** — weight of table sugar / sucrose (g)

---

## Dried Malt Extract

When using **DME** for priming, its fermentability must be accounted for. A typical apparent fermentability (limit of attenuation) of malt extract is **80%** (e.g., a 12 Plato wort will finish at 2.4 Plato).

To calculate the amount of fermentable sugars, convert apparent to **true attenuation** (see [Understanding Attenuation](understanding-attenuation)):

```
A_true = A_apparent × 0.82
```

The carbonation achievable with DME:

```
C_beer = C_flat-beer + 0.5 × 0.82 × 0.80 × m_DME / V_beer
```

- **C_beer** — final carbonation of the beer (g/l)
- **C_flat-beer** — CO₂ content before bottling (g/l)
- **m_DME** — weight of dried malt extract (g)
- **V_beer** — beer volume (l)

---

## Speise

The carbonation calculation with Speise is similar to DME, with the difference that the fermentability is known and the volume of the primed beer is increased by the Speise volume. When using sugar or DME, the added water volume is negligible. With Speise or Kräusen, the volume contribution is significant.

![Figure 1 — Fermentable extract in Speise and Kräusen](../brewing/images/calculating-sugar-additions/fig-000.png)

*Figure 1 — The fermentable extract in Speise and Kräusen*

First, determine the **apparent attenuation** of the Speise. If using wort from the same batch being carbonated, the original extract (OE) and final extract (FE) are known. When boiling the Speise to sanitize it, **boil with a lid on** to minimize evaporation (which changes its OE), or compensate by adding water.

```
AA_Speise = 100 − (100 × FE_Speise / OE_Speise)
```

- **AA_Speise** — apparent attenuation of the Speise wort
- **OE_Speise** — original extract of the Speise wort (Plato)
- **FE_Speise** — expected final extract of the Speise wort — use the beer's final gravity reading

Convert apparent to **real attenuation**:

```
RA_Speise = 0.82 × AA_Speise
```

Calculate the **total extract weight** in the Speise using the Plato scale:

```
m_extract = V_Speise × sg × OE / 100
```

- **m_extract** — extract weight (g)
- **V_Speise** — volume of the wort (ml)
- **sg** — specific gravity of the wort (can be omitted for lower-gravity worts; sg ≈ 1 + OE/250)
- **OE** — original extract in % or Plato

Scale by true attenuation to get **fermentable extract**:

```
m_fermentable = m_extract × RA_Speise
```

Then calculate the final carbonation. Note: the Speise volume is added to the beer volume; the Speise's own CO₂ saturation is neglected (small contribution):

```
C_beer = C_flat-beer + 0.5 × m_fermentable / (V_flat-beer + V_Speise)
```

- **C_beer** — final carbonation of the beer (g/l)
- **C_flat-beer** — CO₂ content before bottling (g/l)
- **V_flat-beer** — beer volume before bottling (l)

---

## Kräusen Beer

The calculations for Kräusen beer are similar to Speise, except that the **current attenuation** of the Kräusen must be taken into account. Take a gravity reading shortly before use.

Calculate current and final true attenuations:

```
RA_current = 0.82 × (1 − OE_K / AE_K)
RA_final   = 0.82 × (1 − OE_K / FE_K)
```

- **RA_current** — current true attenuation of the Kräusen beer
- **OE_K** — original extract of the Kräusen wort (Plato)
- **AE_K** — current measured extract of the Kräusen beer (Plato)
- **FE_K** — expected final extract of the Kräusen wort (Plato) — use the beer's final gravity reading

The **fermentable extract remaining** in the Kräusen is based on the difference between current and final true attenuation:

```
m_fermentable-K = V_K × SG × OE / 100 × (RA_final − RA_current)
```

- **m_fermentable-K** — fermentable extract left in Kräusen beer (g)
- **V_K** — Kräusen beer volume (ml)
- **SG** — specific gravity of the Kräusen (use starting or current gravity; can be omitted for low-gravity or low-attenuation Kräusen)

Final carbonation:

```
C_beer = C_flat-beer + 0.5 × m_fermentable-K / (V_flat-beer + V_K)
```

---

## Remaining or Residual Extract

The last priming method is carbonating with **remaining fermentable extract** — bottling before fermentation is complete. A **fast ferment test** must have been done to determine the beer's limit of attenuation, since the beer will be bottled before finishing.

This approach is practical when:
- A beer is fermenting slowly at cold temperatures and the residual sugar will carbonate within a safe range.
- Quickly bottling samples from primary fermentation.

Calculate the real extract difference between current and expected final beer:

```
ΔRE = 0.82 × (AE_current − AE_expected-final)
```

- **ΔRE** — real extract difference (% w/w or Plato)
- **AE_current** — current measured extract of the beer (% w/w or Plato)
- **AE_expected-final** — expected final extract from fast ferment test (% w/w or Plato)

> Note: your yeast may not ferment all the way to the wort's attenuation limit. If unknown, assume the difference is 0 and verify with a final gravity reading after conditioning.

ΔRE represents the weight percentage of residual fermentable sugar in the beer. Each gram of fermentable extract yields 0.5 g CO₂:

```
c_residual = 5 × ΔRE
```

- **c_residual** — carbonation from residual fermentable extract (g/l)

**Guidelines derived from this approach:**
- Each degree Plato of residual extract yields approximately **4.1 g/l** or **2 volumes CO₂**.
- Each gravity point yields approximately **1 g/l** or **0.51 volumes CO₂**.

---

## Final Remarks

While the number of formulas is daunting, they give the brewer flexibility since they can be combined. For example, when priming with Kräusen you may want to add sugar if the Kräusen volume is too small or too far attenuated. Accounting for remaining fermentable extract is often necessary when yeast was crashed early or fermentation was slow.

A [carbonation spreadsheet](http://braukaiser.com/documents/Kaiser_carbonation_calculator_US.xls) (also in [metric units](http://braukaiser.com/documents/Kaiser_carbonation_calculator_metric.xls)) simplifies this: enter all data and adjust volumes and sugar amounts until the desired carbonation is reached.

---

## Sources

- [McGill] Robert McGill, *Priming With Sugar*, BYO article: [byo.com/feature/1542.html](http://www.byo.com/feature/1542.html)
- [ENSMINGER] Peter A. Ensminger, *Beer Data on HBD*: [hbd.org/ensmingr/](http://hbd.org/ensmingr/)

---

*Source: [braukaiser.com/wiki — Accurately Calculating Sugar Additions for Carbonation](http://braukaiser.com/wiki/index.php?title=Accurately_Calculating_Sugar_Additions_for_Carbonation) — last modified 23 September 2012. Content available under Attribution-NonCommercial 3.0 Unported.*
