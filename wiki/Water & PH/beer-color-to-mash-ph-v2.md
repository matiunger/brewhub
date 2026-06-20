# Beer Color to Mash pH (v2.0)

*From German brewing and more — Kai Troester, braukaiser.com*

This article outlines the derivation of formulas that can be used to predict **grist pH** (and with it mash pH) based on the estimated beer color. It utilizes a correlation that exists between a malt's color and its pH properties. While this correlation is rather loose for base malts, it is sufficiently strong for specialty malts to allow formulas that predict grist and mash pH from beer color.

> **Grist pH** (or distilled water mash pH) is the pH "inherent" to the grist, measurable when mineral-free water is used for mashing.

This article is math-heavy and is provided as a reference for brewers who want to understand how mash pH and beer color connect on a mathematical level.

---

## Contents

1. [How Mash pH and Beer Color Use Similar Formulas](#how-mash-ph-and-beer-color-use-similar-formulas)
2. [Grists with Roasted Malts](#grists-with-roasted-malts)
3. [Theory and Practice](#theory-and-practice)
4. [From Grist pH to Mash pH](#from-grist-ph-to-mash-ph)
5. [References](#references)

---

## How Mash pH and Beer Color Use Similar Formulas

To estimate the grist (distilled water mash) pH, the following formula can be used:

```
pH_grist = [Σ(pH_bi × g_bi) + 5.7 × Σ(g_sj)] − [Σ(a_sj × g_sj) / B]    (1)
```

Where:
- **pH_grist** = distilled water mash pH of the resulting grist
- **pH_bi** = distilled water mash pH of base malt *i*
- **g_bi** = base malt *i*'s fraction of the grist (0–1)
- **g_sj** = specialty malt *j*'s fraction of the grist (0–1)
- **a_sj** = specialty malt *j*'s specific acidity in mEq/kg
- **B** = pH buffer capacity of the malt in mEq/(kg·pH) — approximately 35 mEq/(kg·pH) or 15 mEq/(lb·pH)

This is a revised version of the formula given in [The Effect of Brewing Water and Grist Composition on the pH of the Mash](brewing/effect-of-water-and-grist-on-mash-ph). It calculates the weighted average of the base malt pH and specialty malt titration endpoint (5.7), then subtracts the pH shift caused by specialty malt acidity.

Most homebrew software calculates SRM using Malt Color Units (MCU):

```
SRM = f(MCU)                                                                 (2)

MCU = [Σ(m_bi × c_bi) + Σ(m_sj × c_sj)] / V_w                             (3)
```

Where:
- **MCU** = Malt Color Units
- **m_bi** = weight of base malt *i* in pounds
- **c_bi** = color of base malt *i* in Lovibond
- **m_sj** = weight of specialty malt *j* in pounds
- **c_sj** = color of specialty malt *j* in Lovibond
- **V_w** = produced volume of wort

The goal is to express the specialty malt acidity term from (1) using the specialty malt color term from (3). For crystal and lightly roasted specialty malts, the following relationship between color and acidity was found:

```
a_sj ≈ 0.18 × c_sj  (mEq/lb per Lovibond)                                  (4)
```

After substituting and simplifying (assuming light base malts at pH 5.7, a 10 lb grist, and 2°L base malt color in a 5-gallon batch):

```
pH_grist ≈ 5.7 − (SRM − 4) / (15 × 0.44)                                  (9–11)
```

> The "4 +" constant from base malt MCU contribution eventually drops out in favor of values derived from practical brewing observations.

---

## Grists with Roasted Malts

For grists containing strongly roasted malts, the color contribution from roasted malts is handled separately. Let **P_r** = percentage of color from roasted malts (0–1).

The key difference: the acidity of heavily roasted malts is **independent of their color**, at approximately:
- **40 mEq/kg** (or ~18 mEq/lb)

This means darker roasted malts provide less acidity per unit of color than lighter roasted malts, which is the opposite of crystal malts.

After incorporating the roasted malt acidity contribution, the grist pH formula becomes:

```
pH_grist ≈ 5.7 − S_c × (1 − P_r) × SRM − S_r × P_r × SRM               (16–17)
```

Where:
- **S_c** = pH-drop-per-SRM slope for crystal/base/lightly roasted malts
- **S_r** = pH-drop-per-SRM slope for strongly roasted malts

**Term interpretation:**
1. The pH of a colorless beer's grist
2. A factor depending on beer strength (original gravity)
3. Color-dependent pH drop for crystal/base/lightly roasted malts (via MCU)
4. pH drop from roasted malts (depends on roasted malt color contribution and the color of the roasted malt itself)

Note that Term 4 depends on both the color increase from roasted malts *and* the color rating of the roasted malt — darker roasted malts provide less acidity per color unit than lighter roasted malts.

---

## Theory and Practice

While the analytical formula can predict grist pH, better correlation to actual measured mash pH is achieved by using the formula structure but augmenting it with parameters derived from brewing practice:

```
pH_grist = pH_0SRM − (P/7.68) × [S_c × (1 − r) × SRM + S_r × r × SRM]  (18)
```

Where:
- **pH_0SRM** = extrapolated grist pH for a beer of 0 SRM color
- **P** = original extract of the beer in Plato
- **S_c** = pH/SRM slope for crystal, base and lightly roasted malts
- **S_r** = pH/SRM slope for roasted malts
- **r** = ratio of color from roasted malts to total beer color
- **SRM** = beer color

The factor relating original extract to grain bill (assuming 80% grain extract potential, 80% kettle efficiency, and wort volume ≈ wort weight in kg):

```
P / 7.68 ≈ mg / V_w                                                         (19)
```

The slopes resolve to:

```
S_c = 7.68 × 0.18 / (15 × 0.44) ≈ 0.21                                    (20)
S_r = 7.68 × 18 / (15 × 350) ≈ 0.026                                       (21)
```

Where:
- 0.18 = acidity per color from crystal malt regression (mEq/lb·°L)
- 15 = malt buffer capacity (mEq/(lb·pH))
- 0.44 = MCU-to-SRM approximation factor
- 18 = specific acidity of roasted malt (mEq/lb)
- 350 = assumed roasted malt color in Lovibond

Through correlation with measured mash pH values, **pH_0SRM = 5.6** gave the best fit (slightly lower than the initial theoretical 5.7, due to non-linearity in the MCU-to-SRM equation at low MCU values). The final practical formula:

```
pH_grist = 5.6 − (P/7.68) × [0.21 × (1 − r) × SRM + 0.026 × r × SRM]   (22)
```

**Practical example:** For a 12°P (SG 1.048) beer, a color increase of 10 SRM from crystal malts drops the grist pH by ~0.18 units. If that same 10 SRM increase came from 350°L roasted malt, the associated pH drop is only ~0.05.

---

## From Grist pH to Mash pH

Determining mash pH from grist pH is straightforward when the **residual alkalinity (RA)** of the water is known.

**Metric units:**

```
pH_mash = pH_grist + (RA × V_strike) / (B × m_g)
         = pH_grist + (RA / B) × R                                          (23)
```

Where:
- **RA** = residual alkalinity in ppm CaCO₃
- **V_strike** = strike water volume in liters
- **B** = malt pH buffer capacity in mEq/(kg·pH) — assumed 35 mEq/(kg·pH)
- **m_g** = grist weight in kg
- **R** = mash thickness in l/kg

**US units** (with B = 35 mEq/(kg·pH) absorbed into constants):

```
pH_mash = pH_grist + RA × V_strike / (262 × m_g)                          (24)
```

Where V_strike is in gallons, m_g in pounds, and RA in ppm CaCO₃.

**Additional acid adjustment:**

If acids are added to the mash that were not included in the residual alkalinity:

```
ΔpH = −A / (B × m_g)                                                       (25)
```

Where **A** = amount of acid in mEq.

---

## References

1. Kai Troester, *The effect of brewing water and grist composition on the pH of the mash*, 2009 — [see full paper](brewing/effect-of-water-and-grist-on-mash-ph)
2. Kai Troester, *Mash pH: Beer Color and Grist Acidity*, Zymurgy September/October 2011

---

*Source: [braukaiser.com](http://braukaiser.com/wiki/index.php?title=Beer_color_to_mash_pH_(v2.0)) — last modified 28 March 2012. Content available under Attribution-NonCommercial 3.0 Unported.*
