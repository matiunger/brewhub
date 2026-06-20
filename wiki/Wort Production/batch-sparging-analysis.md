# Batch Sparging Analysis

*From German brewing and more*

Because of its simplicity and static nature, batch sparging lends itself to mathematical modelling. This article focuses on illustrating the trends and conclusions that can be drawn from a mathematical analysis of batch sparging, rather than deriving the formulas themselves. A final section covers formula derivation for interested readers.

> This article only discusses **lauter efficiency** for batch sparging. As discussed in [Understanding Efficiency](../understanding-efficiency), brewhouse efficiency is the product of conversion and lauter efficiency:
>
> `brewhouse efficiency = conversion efficiency × lauter efficiency`

---

## Contents

1. [Assumptions](#assumptions)
2. [Model and Formulas Used](#model-and-formulas-used)
3. [Effect of Relative Run-off Sizes](#effect-of-the-relative-run-off-sizes)
4. [Effect of Grist Size (Weight)](#effect-of-the-grist-size-weight)
   - [True vs. Apparent Grain Absorption](#true-vs-apparent-grain-absorption)
5. [Effect of Pre-Boil Volume](#effect-of-the-pre-boil-volume)
6. [Last Running Gravity](#last-running-gravity)
7. [Summary](#summary)
   - [Example: How Well Am I Doing with My Batch Sparging?](#example-how-well-am-i-doing-with-my-batch-sparging)
8. [Formulas](#formulas)

---

## Assumptions

Two fundamental assumptions underpin the batch sparging model:

1. The mash is complete at the start of lautering — no additional starch conversion occurs during the lauter. (The closer conversion efficiency is to 100% during mashing, the less starch can be converted during lautering.)
2. After the mash is drained, all converted extract remaining in the mash tun is contained in water held back by the grain and/or the dead space of the mash tun.
3. Adding another batch of sparge water only dilutes the wort left in the mash tun — it does not extract additional extract from the grains.

---

## Model and Formulas Used

The model assumes that all extract is dissolved in the water volume in the lauter tun (V_LT) and that this liquid is drained until only the dead space and grain-absorbed volume remains (V_DG). More water is then added, evenly diluting the residual wort. The lauter tun is drained again and added to the boil kettle.

**Key parameters:**

| Symbol | Description |
|--------|-------------|
| V_LT-n | Wort volume in mash tun before run-off step n (gal) |
| V_D | Dead volume of lauter tun — water that cannot be drained even without grain (gal) |
| m_G | Weight of grist (lb) |
| A | Grain absorption ratio for wort (gal/lb) |
| V_DG | Wort left in lauter tun after draining: V_DG = V_D + A × m_G |
| V_r-n | Run-off volume for each run-off: V_r-n = V_LT-n − V_DG |
| V_b | Pre-boil volume collected: V_b = V_r-1 + V_r-2 + … |

---

## Effect of the Relative Run-off Sizes

![Lauter efficiency as a function of relative run-off size in a 1-sparge batch sparging scenario](../brewing/images/batch-sparging-analysis/fig-000.png)

*Figure 1 — Lauter efficiency as a function of the relative size between the first run-off volume and the total pre-boil volume in a 1-sparge batch sparging scenario. (V_b = 6.5 gal, A = 0.19 gal/lb, V_D = 0 gal)*

An efficiency optimum exists when the 1st and 2nd run-offs are each half the pre-boil volume. Even slightly unequal run-offs remain very close to the optimum. Towards the extremes — where one run-off approaches the full boil volume — efficiency drops by nearly 10%. This is the efficiency difference between no-sparge and a single batch sparge.

The efficiency curve shifts downward as grain weight increases (pre-boil volume held constant), reflecting the greater volume of wort left behind in more grain.

**Conclusions:**
- In batch sparging, run-offs should be of **equal size** to maximise lauter efficiency.
- Eyeballing volumes is fine — slight or moderate inequalities do not cause a significant efficiency drop.

> All subsequent experiments assume equal run-off sizes, even for 2- and 3-sparge cases.

---

## Effect of the Grist Size (Weight)

Grist size and grain absorption ratio have a significant effect on batch sparging lauter efficiency. The more wort is held back by the grain and lauter tun dead space, the more extract remains in the grain after run-off. Subsequent sparges can only recover a fraction of that remaining extract, and the efficiency gain from each additional sparge is diminishing.

![Lauter efficiency based on grain weight and number of run-offs](../brewing/images/batch-sparging-analysis/fig-001.png)

*Figure 2 — Lauter efficiency based on grain weight and number of run-offs (1, 2, 3, and 4) for mashes with a water-to-grain ratio above 1 qt/lb. (V_b = 6.5 gal, A = 0.19 gal/lb, V_D = 0 gal)*

The range most relevant for home brewers is 8–20 lb of grain (assuming 5-gallon batches).

### True vs. Apparent Grain Absorption

**Apparent grain absorption** is calculated by subtracting the collected wort volume from the total water used (adjusting for any wort remaining in an incompletely drained grain bed). For most brewers this is around 1 L/kg (0.12 gal/lb), and it is the value brewing software uses to estimate water requirements.

However, this ignores that the volume of a sugar solution exceeds the volume of its water alone. Each kilogram of extract dissolved in the wort increases the total liquid volume by about **0.63 L** (0.63 L/kg or 0.30 qt/lb). With 100% conversion, **true grain absorption** is approximately **1.56 L/kg (0.19 gal/lb)** — the value used in this article's models.

> The distinction between apparent and true grain absorption is analogous to apparent vs. real attenuation: brewers typically mean apparent grain absorption, but the true value matters for accurate modelling.

![Lauter efficiency vs wort strength (alternative representation)](../brewing/images/batch-sparging-analysis/fig-002.png)

*Figure 3 — Lauter efficiency plotted against resulting wort strength. Assumptions: 80% fine-grind extract, 100% conversion efficiency, 15% boil-off, 6.5 gal pre-boil volume, 0.19 gal/lb grain absorption.*

**Conclusion:**
- The more grain used, the more efficiency suffers. This can be offset by additional sparges, but there is an upper limit to achievable efficiency for any given grist size, absorption ratio, and pre-boil volume.

---

## Effect of the Pre-Boil Volume

![Lauter efficiency based on targeted pre-boil volume](../brewing/images/batch-sparging-analysis/fig-003.png)

*Figure 4 — Lauter efficiency based on targeted pre-boil volume. (m_G = 15 lb, A = 0.19 gal/lb, V_D = 0 gal)*

Larger pre-boil volumes increase lauter efficiency by providing more sparge water to recover extract. However, brewers target a specific gravity and cast-out volume, which constrains the pre-boil volume:

Assuming a cast-out target of 5.5 gal, the pre-boil volume could be as large as 7.3 gal (15%/hr boil-off, 2-hr boil). Increasing pre-boil volume from 6.5 to 7.5 gal gains only ~3% efficiency for a typical 15 lb grist.

> Neither boil-off rate nor boil time should be pushed arbitrarily higher — a higher boil-off rate risks "burning" wort through excessive thermal loading, and a longer boil coagulates too many proteins, hurting head retention and body.

**Conclusion:**
- Pre-boil volume affects efficiency, but practical constraints limit its range. Within those bounds, the efficiency change is modest.

---

## Last Running Gravity

In fly sparging, **over-sparging** is a concern because it can cause excessive tannin extraction from grain husks. The same concern may apply to batch sparging. pH is more important than gravity for tannin extraction, but run-off gravity serves as a useful indicator of how well the wort still buffers pH.

![Extract content and gravity of runnings for batch sparging based on grain weight](../brewing/images/batch-sparging-analysis/fig-004.png)

*Figure 5 — Extract content and gravity of the runnings for batch sparging based on grain weight. (V_b = 6.5 gal, A = 0.13 gal/lb, V_D = 0 gal)*

Interestingly, the **last run-off gravity** for 2-, 3-, and 4-run-off batch sparges follows approximately the same curve — meaning that regardless of how many times you sparge (with equal run-off sizes), the last run-off gravity is determined by:

- The volume remaining in the MLT after each run-off (grain weight × absorption ratio)
- The pre-boil volume

Both are largely fixed for a given recipe. Only the no-sparge run-off gravity is markedly higher.

Two opposing effects partially cancel out: more sparges require a higher-gravity first running (to allow equal-sized run-offs), but the final running gravity ends up at approximately the same point due to the progressively greater dilution rate.

**Conclusion:**
- The number of run-offs does **not** significantly affect the gravity of the last run-off, and therefore has little impact on tannin extraction potential.

---

## Summary

Batch sparging's inherent efficiency limit — a result of repeated dilution of wort left in the lauter tun — is determined by:

| Parameter | Flexibility |
|-----------|-------------|
| Pre-boil volume | Limited flexibility |
| Grain weight | Set by recipe |
| Wort absorption ratio | Fixed process parameter |
| Lauter tun dead space | Fixed equipment parameter |
| Relative run-off sizes | Should be equalised |
| Number of sparges | Freely adjustable, but diminishing returns |

The theoretical batch sparging lauter efficiency can be used to benchmark your actual process and predict how efficiency will change when brewing a larger beer or switching to no-sparge. If actual efficiency is significantly below the theoretical maximum, lower **conversion efficiency** is the most likely culprit — meaning a significant amount of starch was not converted during the mash.

Related articles: [Understanding Efficiency](../understanding-efficiency) · [Troubleshooting Brewhouse Efficiency](../troubleshooting-brewhouse-efficiency)

---

### Example: How Well Am I Doing with My Batch Sparging?

> **Note:** This example is out of date — the calculation does not account for the volume added by the extracted sugars.

Given:
- Total water used (cold): V_T = 8.0 gal
- Pre-boil volume (hot): V_b-hot = 6.6 gal
- Grain weight: m_G = 8.9 lb
- Actual extract efficiency: E_actual = 85%

**Step 1 — Correct hot pre-boil volume to cold** (water shrinks ~4% when cooled):

```
Vb = 6.6 × (1 − 0.04) = 6.3 gal
```

**Step 2 — Calculate grain absorption + dead volume:**

```
VDG = VT − Vb = 8.0 − 6.3 = 1.7 gal
```

**Step 3 — Absorption factor:**

```
A = VDG / mG = 1.7 / 8.9 = 0.19 gal/lb
```

**Step 4 — Run-off size (equal run-offs):**

```
VR = Vb / 2 = 3.15 gal
VLT = VR + VDG = 4.85 gal
```

**Step 5 — Theoretical efficiency (single batch sparge):**

```
Etheory = (VR + (VDG × VR) / VLT) / VLT
        = (3.15 + (1.7 × 3.15) / 4.85) / 4.85
        = 88%
```

The actual efficiency (85%) is **96% of the theoretical maximum** — very good, indicating little room for improvement in crush or mash conversion.

**Projected efficiencies for other sparge configurations:**

- *No-sparge theoretical:* `Vb / VT = 6.3 / 8.0 = 79%` → 96% of that ≈ **76% actual**
- *2-sparge theoretical:*

```
Etheory-2-sparge = VR-2 × (1 + VDG/VLT-2 + (VDG/VLT-2)²) / VLT-2
                 = 2.1 × (1 + 1.7/3.8 + (1.7/3.8)²) / 3.8
                 = 91%
```

96% of 91% ≈ **87% actual** (slightly better in practice since less grain reduces V_DG).

A 2% efficiency gain from adding a second sparge is modest — the brewer must decide if the extra effort is worthwhile.

---

## Formulas

![Batch sparging efficiency formula derivation](../brewing/images/batch-sparging-analysis/fig-005.png)

Efficiency is defined as the extract that made it into the boil kettle vs. the maximum extractable from the grains (determined by laboratory analysis). Assuming a perfect mash where all extract is dissolved in the mash water at an extract content of *e*:

```
E = (e × Vb) / (e × VLT)
```

Since *e* cancels, for **no-sparge**:

```
E = (VLT − VDG) / VLT
```

With each additional sparge a new term is added to the efficiency formula, but its contribution diminishes with every additional run-off. Many sparges with a fixed pre-boil volume also lead to thicker mashes, making it harder to evenly mix in the sparge water — violating the even-dilution assumption and potentially reducing actual efficiency below the model prediction.

---

*Source: [braukaiser.com](http://braukaiser.com/wiki/index.php?title=Batch_Sparging_Analysis&oldid=4754) — Last modified 13 December 2011. Content available under Attribution-NonCommercial 3.0 Unported.*
