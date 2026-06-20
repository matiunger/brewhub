# Troubleshooting Brewhouse Efficiency

*From German brewing and more — Braukaiser.com*

Rather than listing all the factors that can affect the brewhouse efficiency, this article provides a systematic approach to identify and fix low efficiency related to mashing and lautering.

---

## Contents

1. [Determining the brewhouse efficiency](#determining-the-brewhouse-efficiency)
   - [Measuring and Measurement Errors](#measuring-and-measurement-errors)
   - [Measuring Volumes](#measuring-volumes)
   - [Cooling a Hydrometer Sample](#cooling-a-hydrometer-sample)
   - [Check the hydrometer](#check-the-hydrometer)
   - [Calculating Efficiency](#calculating-efficiency)
2. [How good is my efficiency?](#how-good-is-my-efficiency)
3. [The concept of conversion and lauter efficiency](#the-concept-of-conversion-and-lauter-efficiency)
4. [Determining Conversion Efficiency](#determining-conversion-efficiency)
5. [Evaluating conversion efficiency](#evaluating-conversion-efficiency)
6. [Determining Lauter efficiency](#determining-lauter-efficiency)
7. [Example: Making sense of the numbers](#example-making-sense-of-the-numbers)
8. [Sources](#sources)

---

## Determining the brewhouse efficiency

Before looking for the causes of low efficiency, determine it accurately. Since a number of different definitions exist, it is possible that the actual efficiency is in an acceptable range but was calculated with a different formula which returned a lower result. Other error factors are incorrect gravity, volume, or weight measurements.

This analysis focuses on the **efficiency into the boil kettle**. The efficiency doesn't change during the boil (no extract is lost except for a fraction of protein that precipitates). Efficiency shortcomings after the boil are obvious and proportional to the amount of wort lost. For a list of various efficiency definitions see [Understanding Efficiency](understanding-efficiency.md).

---

### Measuring and Measurement Errors

Before efficiency can be calculated, 3 things need to be measured on brew day:

- Amount of grain used
- Specific gravity or strength of the collected or finished wort
- Volume of the collected or finished wort

The following measurement errors can be considered reasonable:

| Measurement | Acceptable error |
|-------------|-----------------|
| Grain weight | ±1% (i.e., ±40g for 4.00 kg, or ±0.1 lb for 10 lb) |
| Specific gravity / wort strength | ±2% (i.e., ±0.25°P for 12°P, or ±1 point for 1.050 SG) |
| Volume | ±2% (i.e., ±0.5 l on 25 l, or ±0.5 qt on 6 gal) |

With these tolerances, efficiency can be calculated with ~5% accuracy.

> Example: If grain weight has a 5% error (±200g for a 4.0kg grist), the calculated efficiency will also have a 5% error — a calculated efficiency of 70% could actually be between 66% and 74%.

---

### Measuring Volumes

Account for **temperature-based volume expansion** of water/wort:

- At **100°C / 212°F**: wort has ~4% more volume than at room temperature. Multiply measured volume by **0.96**.
- At **~70°C / 160°F** (mash/lauter temps): wort has ~3% more volume than at room temperature. Multiply by **0.97**.

Also, calibrate or check your volume measurement system (dip-stick or kettle markings). Being off by 1 qt on a 6 gal batch is a 4% error in calculated efficiency.

---

### Cooling a Hydrometer Sample

Samples for hydrometer readings need to be cooled to the hydrometer's calibration temperature. Cool the sample in a way that **minimizes evaporation** — chilling in an open bowl can increase gravity by as much as 4 points. Always cool samples in a small, lid-covered jar set in ice water.

A [temperature correction table](http://www.braukaiser.com/documents/hydrometer_conversion_tables.pdf) can be used for converting between specific gravity and Plato and for temperature correction.

---

### Check the hydrometer

To check the hydrometer, use it in water at the calibration temperature noted on the scale. In water it should read 1.000 SG or 0.0°P/Brix. If it reads differently, remember to always subtract the difference from every reading.

Examples:
- Hydrometer reads 1.002 in water → subtract 2 gravity points from every reading
- Hydrometer reads 0.998 in water → add 2 gravity points to every reading

For a 2-point calibration: dissolve 40g of table sugar in 160g of water. The resulting solution is 20°P (1.083 SG).

---

### Calculating Efficiency

Two distinct approaches exist. Use the [Efficiency-Troubleshooting-Spreadsheet](http://braukaiser.com/documents/efficiency_calculator.xls) to calculate both.

#### Weight-based efficiency calculation

Best done with metric measurements. Convert if needed:
- Weight: kg = lb × 0.45
- Volume: liter = gal × 3.78 = qt × 0.95
- Gravity: Plato ≈ gravity points × 4

**Step 1** — Calculate kettle extract weight:
```
kettle extract weight (kg) = volume (l) × specific gravity × (gravity in Plato / 100)
```

**Step 2** — Calculate extract weight in the grist:

| Malt type | Fine grind extract | Corrected for ~4% moisture |
|-----------|-------------------|---------------------------|
| 2-row brewers malt | 80% | 77% |
| 6-row brewers malt | 78% | 75% |
| Pilsner, Vienna, Munich | 80% | 77% |
| Munich malt (Briess) | 74–76% | 71–73% |
| Specialty malts (crystal, roasted) | 72–75% | 69–72% |
| Carafa | 65% | 62% |
| Oat, barley, corn, wheat flakes | 70% | 67% |
| Rice flakes | 65% | 62% |

```
extract in grist (kg) = weight malt 1 (kg) × extract% / 100 + weight malt 2 (kg) × extract% / 100 + ...
```

Simplified (when <5% specialty malts are used):
```
extract in grist (kg) = weight of grist (kg) × 0.8
```

**Step 3** — Calculate brewhouse efficiency:
```
brewhouse efficiency (%) = 100% × kettle extract weight (kg) / extract in grist (kg)
```

**Example:**
- Grist: 4.5 kg Pilsner malt
- Cold post-boil volume: 21 liters
- Post-boil gravity: 1.048 / 12°P

```
kettle extract weight = 21 × 1.048 × 12 / 100 = 2.64 kg
extract in grist = 4.5 × 0.80 = 3.6 kg
brewhouse efficiency = 100% × 2.64 / 3.6 = 73%
```

*Dealing with kettle additions*: Subtract the weight of added sugar/extract from kettle extract weight before calculating. For liquid malt extract, subtract only 80% of its weight (it's 80% extract, 20% water).

---

#### Gravity potential-based efficiency calculation

Best done with US units. Convert if needed:
- Volume: gal = liter / 3.78
- Gravity: gravity points = Plato × 4
- Weight: lb = kg / 0.45

| Malt type | Fine grind extract potential | Corrected for ~4% moisture |
|-----------|------------------------------|---------------------------|
| 2-row brewers malt | 37 pppg | 36 pppg |
| 6-row brewers malt | 36 pppg | 35 pppg |
| Pilsner, Vienna, Munich | 37 pppg | 36 pppg |
| Munich malt (Briess) | 34–35 pppg | 33–34 pppg |
| Specialty malts (crystal, roasted) | 33–35 pppg | 32–34 pppg |
| Carafa | 30 pppg | 29 pppg |
| Oat, barley, corn, wheat flakes | 32 pppg | 31 pppg |
| Rice flakes | 30 pppg | 29 pppg |

(pppg = gravity points per pound per gallon)

**Step 1** — Calculate maximum gravity points:
```
maximum gravity points = (weight grain 1 (lb) × potential grain 1 (pppg) + weight grain 2 (lb) × potential grain 2 (pppg) + ...) / volume (gal)
```

Simplified (when <5% specialty malts used):
```
maximum gravity points = weight of grist (lb) × 37 pppg / volume (gal)
```

**Step 2** — Calculate efficiency:
```
brewhouse efficiency = 100% × actual gravity points / maximum gravity points
```

**Example:**
- Grist: 10 lb Pilsner malt
- Cold post-boil volume: 5.5 gal
- Post-boil gravity: 1.048 (48 gravity points)

```
maximum gravity points = 10 × 37 / 5.5 = 67.3
brewhouse efficiency = 100% × 48 / 67.3 = 71%
```

*Dealing with kettle additions*: For dry extract or sugar: subtract `weight (lb) × 46 pppg / kettle volume (gal)`. For liquid extract use 37 pppg.

---

## How good is my efficiency?

| Brewing system | Typical brewhouse efficiency |
|----------------|------------------------------|
| Large scale commercial brewing | 92–98% |
| Fly sparging | 80–95% |
| Batch sparging | 75–90% |
| No sparge | 65–80% |

Another factor: the **amount of grain relative to batch size**. Larger beers use more grain, meaning more wort is trapped in the grain after running off, resulting in lower efficiency.

> Very high efficiency does not necessarily mean the best beer possible. Over-sparging can lead to excessive extraction of unwanted grain compounds, in particular tannins from the husks.

Consider an efficiency below the ranges above as problematic and worth investigating — **but only once you know where in the process the efficiency is lost** can a decision be made about whether and how to improve it.

---

## The concept of conversion and lauter efficiency

Two main processes affect brewhouse efficiency:

- **Mashing**: a mainly bio-chemical process during which the extractable portion of the grain is made soluble through enzymatic and physical processes.
- **Lautering**: a physical process during which the sweet wort and its dissolved extract are transferred to the boil kettle while insoluble grain parts are left behind.

```
brewhouse efficiency = conversion efficiency × lauter efficiency
```

---

## Determining Conversion Efficiency

To determine the conversion efficiency, measure the gravity of the mash liquid once the mash is complete. Use the formula or table to calculate what the first wort extract content would be at 100% conversion efficiency:

![Table 1 — First wort extract based on mash thickness](../brewing/images/troubleshooting-brewhouse-efficiency/fig-001.png)

*Table 1 — Extract content or gravity of the first wort based on the mash thickness. 100% mash efficiency, 80% fine grind extract, and 4% moisture content of the malt were assumed.*

The conversion efficiency (approximate):
```
CE (%) ≈ (FWmeasured / FWmax) × 100%
```

Or using the Efficiency-Troubleshooting-Spreadsheet: enter grist weight, water used, and first wort extract/gravity.

> When measuring the first wort gravity, make sure to get a sample **after recirculating the wort through the grain** — to prevent measuring wort that was simply trapped under the false bottom or in the manifold. Cool the sample carefully to minimize evaporation.

---

## Evaluating conversion efficiency

If the conversion efficiency is less than 90–95%, **test the wort and spent grain for starch with iodine**:
- Wort: test on a piece of chalk or drywall (see [Iodine Test](iodine-test.md))
- Spent grain: pick up a few pieces, rub between two fingers, and add a drop of iodine solution. If they turn black-purple, starch is still present.

If starch is found, or conversion efficiency is especially poor (<80%), common causes include:

**Crush**: Too coarse — pieces of endosperm too large for complete gelatinization and enzyme access. Check for uncrushed kernels or kernels that don't release endosperm easily. Recommended gap: 0.5–0.8 mm (20–32 mil).

**Temperature**: Check your thermometer against ice water (0°C/32°F) and boiling water (100°C/212°F at sea level). Any temperature below ~80°C/175°F can technically achieve full conversion, but temperatures of 63–80°C (145–175°F) are needed for practical saccharification rest times.

**pH**: Optimal mash pH is 5.3–5.7 (measured at room temperature). Check the mash water's residual alkalinity or — better — measure the actual mash pH with precision test strips (e.g., EMD colorpHast) or a pH meter.

**Diastatic power**: Can be a problem with large amounts of highly kilned malts (e.g., dark Munich) or unmalted grains. Enzymatically weak mashes may need more time, a different schedule (step mash), or replacement of some weak malts with stronger ones (Pale or Pilsner malt).

**Time**: Extending the saccharification rest from 60 to 90+ minutes may achieve full conversion at lower temperatures or with enzymatically weak grists.

**Water/grist ratio**: Gelatinization and enzymatic activity require free water. The lower limit is ~2 l/kg (1 qt/lb). Very thin mashes (up to 6 l/kg or 3 qt/lb) also work well. It is unlikely that a mash was too thin for conversion.

**Mash schedule**: Enzymatically weak mashes, undermodified malts, or adjunct mashes may not fully convert with a simple single infusion mash. Consider decoction, cereal mash, or a dextrinization rest at 70–75°C (158–166°F) to speed up alpha amylase activity.

**Dough balls**: If strike water temperature is above 60–65°C (140–150°F), starch around a ball of malt gelatinizes and prevents water from reaching the dry malt inside. Ensure the mash is well stirred at dough-in; adding grain to water (rather than water to grain) at temperatures above 60°C reduces dough ball formation.

---

## Determining Lauter efficiency

There are 2 ways to determine lauter efficiency.

### Calculating Lauter efficiency (batch sparging)

Measure the following accurately:
- Grain weight and extract content
- Total water volume used for mashing and sparging (at room temperature; excludes decoction boil-off compensation water)
- Total volume of wort collected and temperature at which it was measured
- Extract content (°P) or specific gravity of the collected wort (well-mixed)
- Optionally: individual collected volumes and temperatures for each run-off (otherwise equal run-off sizes are assumed)

Then use the [Batch-Sparging-Efficiency-Spreadsheet](http://braukaiser.com/documents/batch_sparging_efficiency_analysis.xls) to calculate the theoretical lauter efficiency.

### Evaluating the batch sparging lauter efficiency

If the theoretical lauter efficiency isn't close to the lauter efficiency derived from conversion efficiency and brewhouse efficiency, the batch sparging process was suboptimal. Check:

- Was the mash thoroughly stirred after the addition of sparge water? A thick portion of mash can remain undisturbed at the bottom or in corners.
- Were measurements done correctly? Did you account for all water additions and collected wort?
- Did the mash drain completely before new sparge water was added? (Assumed for the calculation, though not strictly required.)

> Run-off speed and rest time after stirring don't have any impact on lauter efficiency in batch sparging.

### Testing the lauter efficiency (fly and batch sparging)

To estimate the extract left in the spent grain, dilute with a known amount of water and measure the gravity:

1. Add **0.5, 1.0, 1.5, or 2.0 qt per pound** of initial grist weight (or 1–2 l/kg). Cold tap water is fine.
2. Stir very well — make sure to dislodge grain stuck in corners and at the bottom.
3. Take a hydrometer or refractometer reading.
4. Correct for temperature and look up the value in Table 2.

![Table 2 — Estimating brewhouse efficiency loss in the lauter](../brewing/images/troubleshooting-brewhouse-efficiency/fig-005.png)

*Table 2 — Estimating the brewhouse efficiency loss in the lauter tun. Assumes 80% average laboratory extract and 0.19 gal/lb (1.58 l/kg) wort absorption rate.*

**Example:**
- Grist: 10 lb Pilsner malt
- Water added: 10 qt (= 1 qt/lb)
- Mash liquid SG: 1.006
- Conversion efficiency: 95%

From the table (1 qt/lb, SG 1.006): 7% of the brewhouse efficiency was lost in the spent grain.

```
Lauter efficiency = (95% - 7%) / 95% = 88% / 95% = 92.6%
```

The Efficiency-Troubleshooting-Spreadsheet can also perform this calculation.

### Evaluating Lauter efficiency

If lauter efficiency for fly sparging is much less than 90%, too many dissolved sugars were left in the spent grain. This is likely the result of **channeling**. Causes:

- Rushed run-off (the slower the run-off, the better the sparge water can rinse the sugars from the grain)
- Inadequate manifold design

If the manifold is the problem, batch sparging may be better suited for that lautertun.

---

## Example: Making sense of the numbers

A real batch worked through in full:

**Grist**: 4.3 kg 100% Pilsner malt (80% extract potential)
**Mash water**: 17 l

**Step 1 — Expected first wort at 100% conversion:**
```
4.3 × 0.8 × 100 / (4.3 × 0.8 + 17) = 16.8°P
```

**Step 2 — Measured first wort**: 16°P

**Conversion efficiency:**
```
16 / 16.8 × 100% = 95%
```
→ 5% of the starch didn't get converted (still in spent grain as unconverted starch — iodine test was negative, so it's bound in the grain, not floating in the wort).

**Step 3 — Lautering**: 600 ml of excess wort at 6°P didn't fit in the kettle.

Extract in excess wort:
```
0.6 l × 0.97 × 1.024 × 0.06 = 0.04 kg
```
→ ~1% of total available grain extract.

**Step 4 — Kettle measurement**: 26 l at ~70°C, 10.7°P

Efficiency into kettle:
```
100% × 26 × 0.97 × 1.043 × 0.107 / (4.3 × 0.8) = 82%
```

**Step 5 — Spent grain test**: After running the grain bed dry, 8.6 l of cold water (2 l/kg) was added to the spent grain. After stirring well, the gravity measured ~2.5°P.

From Table 2 (2.5°P, 2 l/kg): ~11% of potential extract remained in the spent grain liquid.

**Summary of what happened to 100% of potential grain extract:**

| Loss | Amount | Notes |
|------|--------|-------|
| Unconverted starch | 5% | Still in spent grain; iodine-negative wort |
| Didn't fit in kettle | 1% | Fix: use 600 ml less water next time |
| Remained in spent grain | 11% | Price of no/single batch sparge; could drop to ~8% with 2 sparges |
| **Into the boil kettle** | **82%** | Actual brewhouse efficiency |

Total: 99% (the missing 1% is measurement inaccuracy).

---

## Sources

- [BRIESS 2008] Briess average malt analysis data 2007/2008
- [HUPPMANN] Brochure for the Huppmann Lauterstar lauter tun design
- [WEYERMANN] Malzfabrik Weyermann malt specifications
- [BEST MALZ] Best Malz Malzqualitaeten
- [Briggs, 2004] Dennis E. Briggs, Chris A. Boulton, Peter A. Brookes, Roger Stevens, *Brewing Science and Practice*, Woodhead Publishing, 2004

---

*Source: braukaiser.com — last modified 20 December 2010. Content available under Attribution-NonCommercial 3.0 Unported.*
