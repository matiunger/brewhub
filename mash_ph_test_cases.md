# Mash pH Simulation — Test Cases for Software Comparison

Reference document for comparing mash pH predictions across your app, Bru'n Water, and Brewer's Friend.

All batch sizes target **~20 L into fermenter** unless noted. Grain bill weights assume typical mash efficiency (75%) and account for losses. Mash thickness is **3.0 L/kg** as a default for full-volume and BIAB; sparge cases use thicker mash ratios (~2.5 L/kg). All pH targets are at **room temperature (20°C)**.

---

## Case #1 — RO water, pale ale malt only

**Scenario:** Baseline test — no salts, no acid, no alkalinity. Isolates the grain buffering model.

| Parameter | Value |
|---|---|
| Method | Full volume |
| Batch size | 20 L |
| Water source | RO / distilled (all ions = 0 ppm) |
| Mash volume | 17 L |
| Mash thickness | 3.0 L/kg |
| Acid additions | None |
| Salt additions | None |
| Target pH | 5.2–5.4 |
| Reference expected | ~5.72 (no additions — will be above target) |

### Grain bill (total grain: 5.7 kg)

| Malt | % | Grams |
|---|---|---|
| Pale Ale malt (Maris Otter) | 100% | 5700 g |

### Water profile

| Ion | ppm |
|---|---|
| Ca²⁺ | 0 |
| Mg²⁺ | 0 |
| Na⁺ | 0 |
| SO₄²⁻ | 0 |
| Cl⁻ | 0 |
| HCO₃⁻ | 0 |

**Purpose:** Tests the distilled water mash pH reference value for pale malt. With no water chemistry in play, the output *is* the grain model baseline. Expect all tools to land 5.65–5.75. Differences here are purely from different malt pH reference databases.

---

## Case #2 — Tap water, American IPA (fly sparge)

**Scenario:** Sulfate-forward hop-accentuating profile. High bicarbonate tap water requires acid to neutralise alkalinity.

| Parameter | Value |
|---|---|
| Method | Fly sparge |
| Batch size | 20 L |
| Water source | Medium tap water |
| Mash volume | 15 L (2.5 L/kg) |
| Sparge volume | 10 L |
| Acid addition | 2.2 ml 88% lactic acid (added to mash water) |
| Salt additions | 3 g CaSO₄ (gypsum) + 1 g CaCl₂ (split: 70% mash / 30% sparge) |
| Target pH | 5.2–5.4 |
| Reference expected | ~5.30 |

### Grain bill (total grain: 6.0 kg)

| Malt | % | Grams |
|---|---|---|
| 2-row pale malt | 90% | 5400 g |
| Crystal 40L | 10% | 600 g |

### Water profile (before additions)

| Ion | ppm |
|---|---|
| Ca²⁺ | 80 |
| Mg²⁺ | 10 |
| Na⁺ | 20 |
| SO₄²⁻ | 60 |
| Cl⁻ | 30 |
| HCO₃⁻ | 120 |

**Purpose:** Tests bicarbonate neutralisation + acid titration against a real tap water background. Key stress: HCO₃⁻ at 120 ppm requires meaningful acid to overcome. Also tests whether the split salt addition across mash and sparge is handled correctly.

---

## Case #3 — RO water, German Weizen (BIAB)

**Scenario:** High wheat content raises pH — tests the wheat malt buffering model and chloride-forward salt profile.

| Parameter | Value |
|---|---|
| Method | BIAB |
| Batch size | 23 L |
| Water source | RO + mineral build |
| Mash volume | 23 L (full volume, ~3.0 L/kg) |
| Acid addition | None |
| Salt additions | 1.5 g CaCl₂ + 0.5 g MgSO₄ (Epsom salt) |
| Target pH | 5.2–5.4 |
| Reference expected | ~5.45 |

### Grain bill (total grain: 7.7 kg)

| Malt | % | Grams |
|---|---|---|
| Wheat malt | 60% | 4620 g |
| Pilsner malt | 40% | 3080 g |

### Water profile (after additions)

| Ion | ppm |
|---|---|
| Ca²⁺ | 50 |
| Mg²⁺ | 5 |
| Na⁺ | 10 |
| SO₄²⁻ | 10 |
| Cl⁻ | 60 |
| HCO₃⁻ | 0 |

**Purpose:** Wheat malt has a different buffering capacity and distilled water pH than barley pale malt — most tools model this, but with different coefficients. A 60% wheat bill amplifies any modeling difference. Expected to land high without acid; use this to verify how much the wheat fraction shifts pH versus a pure barley bill.

---

## Case #4 — Hard water, stout (full volume)

**Scenario:** High alkalinity hard water. Roasted malts provide natural acidity — tests whether acid-base balance from dark malts offsets high bicarbonate without acid addition.

| Parameter | Value |
|---|---|
| Method | Full volume |
| Batch size | 20 L |
| Water source | Hard tap water (high HCO₃) |
| Mash volume | 17 L |
| Acid addition | None (roast malt provides natural acidity) |
| Salt additions | None |
| Target pH | 5.2–5.4 |
| Reference expected | ~5.28 |

### Grain bill (total grain: 5.5 kg)

| Malt | % | Grams |
|---|---|---|
| Pale ale malt | 75% | 4125 g |
| Roasted Barley (500L) | 10% | 550 g |
| Chocolate malt (350L) | 10% | 550 g |
| Crystal 80L | 5% | 275 g |

### Water profile (before additions)

| Ion | ppm |
|---|---|
| Ca²⁺ | 150 |
| Mg²⁺ | 15 |
| Na⁺ | 30 |
| SO₄²⁻ | 80 |
| Cl⁻ | 50 |
| HCO₃⁻ | 250 |

**Purpose:** The acid contribution of roasted malts vs. 250 ppm bicarbonate alkalinity is a fundamental acid-base balance test. Burton-on-Trent style hard water was historically paired with pale ales; Dublin-style water with stouts — this case tests whether the tool correctly predicts that roast acidity compensates for high alkalinity. Tools differ significantly in how they model the acidifying power of roast malt (Bru'n Water uses Lovibond-based acidity values; some tools simplify this).

---

## Case #5 — Soft water, Pilsner lager (fly sparge, split acid)

**Scenario:** Soft water with separate acid additions to mash water and sparge water. Tests split-volume acid modelling.

| Parameter | Value |
|---|---|
| Method | Fly sparge |
| Batch size | 20 L |
| Water source | Soft water (low mineral) |
| Mash volume | 14 L (2.5 L/kg) |
| Sparge volume | 12 L |
| Acid addition | 0.8 ml 88% lactic → mash water + 1.2 ml 88% lactic → sparge water |
| Salt additions | 1 g CaCl₂ → mash water + 0.5 g CaCl₂ → sparge water |
| Target pH | 5.2–5.4 (mash) / sparge runoff < 6.0 |
| Reference expected | ~5.33 mash pH |

### Grain bill (total grain: 5.6 kg)

| Malt | % | Grams |
|---|---|---|
| Pilsner malt (2-row) | 100% | 5600 g |

### Water profile (before additions)

| Ion | ppm |
|---|---|
| Ca²⁺ | 20 |
| Mg²⁺ | 5 |
| Na⁺ | 5 |
| SO₄²⁻ | 15 |
| Cl⁻ | 20 |
| HCO₃⁻ | 30 |

**Purpose:** Two independent acid calculations — one for mash water volume, one for sparge water volume. Some tools treat the total acid as applied to the total water; others correctly separate mash and sparge volumes. This case exposes that distinction. Also tests sparge runoff pH — the acidified sparge water should keep runoff below 6.0 to avoid tannin extraction.

---

## Case #6 — RO water, Munich Dunkel (BIAB)

**Scenario:** Munich malt has a lower distilled water pH than pale malt — less acid is required than most brewers expect.

| Parameter | Value |
|---|---|
| Method | BIAB |
| Batch size | 22 L |
| Water source | RO + minimal mineral build |
| Mash volume | 22 L (~3.0 L/kg) |
| Acid addition | 1.5 ml 88% lactic acid |
| Salt additions | 1 g CaCl₂ + 1 g CaSO₄ |
| Target pH | 5.2–5.4 |
| Reference expected | ~5.35 |

### Grain bill (total grain: 7.3 kg)

| Malt | % | Grams |
|---|---|---|
| Munich I malt | 85% | 6205 g |
| CaraMunich II | 10% | 730 g |
| Melanoidin malt | 5% | 365 g |

### Water profile (after additions)

| Ion | ppm |
|---|---|
| Ca²⁺ | 40 |
| Mg²⁺ | 5 |
| Na⁺ | 5 |
| SO₄²⁻ | 15 |
| Cl⁻ | 40 |
| HCO₃⁻ | 0 |

**Purpose:** Munich malt typically has a distilled water mash pH around 5.55–5.65, lower than pale malt's 5.70–5.75. A 85% Munich bill self-adjusts significantly. If your app uses the same base pH for Munich as pale malt, it will over-predict pH here and recommend more acid than needed.

---

## Case #7 — Phosphoric acid vs. lactic acid comparison (full volume)

**Scenario:** Run twice with the same water and grain bill, targeting the same pH using two different acid types. Results should converge if acid dissociation modelling is correct.

| Parameter | Value |
|---|---|
| Method | Full volume |
| Batch size | 20 L |
| Water source | Medium tap water |
| Mash volume | 17 L |
| Acid addition — Run A | 1.8 ml 88% lactic acid |
| Acid addition — Run B | 1.1 ml 85% phosphoric acid |
| Salt additions | 2 g CaCl₂ + 2 g CaSO₄ |
| Target pH | 5.2–5.4 (both runs) |
| Reference expected | ~5.32 (both runs should match) |

### Grain bill (total grain: 5.8 kg)

| Malt | % | Grams |
|---|---|---|
| Pale ale malt | 90% | 5220 g |
| Crystal 20L | 10% | 580 g |

### Water profile (before additions)

| Ion | ppm |
|---|---|
| Ca²⁺ | 80 |
| Mg²⁺ | 10 |
| Na⁺ | 20 |
| SO₄²⁻ | 40 |
| Cl⁻ | 40 |
| HCO₃⁻ | 120 |

**Purpose:** Different acids have different molar masses, densities, and pKa values. Lactic acid (pKa 3.86, MW 90.1 g/mol) vs. phosphoric acid (triprotic, pKa₁ 2.15) behave differently in buffered mash. At mash pH ~5.3, phosphoric's second dissociation is mostly inactive — tools that incorrectly include it will under-predict the required volume. Both runs should produce the same mash pH if the acid model is correct.

---

## Case #8 — Batch sparge, double runoff (sparge runoff pH tracking)

**Scenario:** Two separate batch sparges. Tests whether the tool correctly predicts pH rise in subsequent sparges and flags tannin extraction risk.

| Parameter | Value |
|---|---|
| Method | Double batch sparge |
| Batch size | 20 L |
| Water source | Soft-medium tap water |
| Mash volume | 10 L (2.0 L/kg) |
| Sparge 1 volume | 8 L |
| Sparge 2 volume | 7 L |
| Acid addition | 1 ml 88% lactic → each batch sparge water |
| Salt additions | 1.5 g CaCl₂ total (1 g mash + 0.25 g each sparge) |
| Target pH | Mash 5.2–5.4 / each sparge runoff < 6.0 |
| Reference expected | Mash ~5.38 |

### Grain bill (total grain: 5.0 kg)

| Malt | % | Grams |
|---|---|---|
| Pale ale malt | 80% | 4000 g |
| Vienna malt | 20% | 1000 g |

### Water profile (before additions)

| Ion | ppm |
|---|---|
| Ca²⁺ | 50 |
| Mg²⁺ | 8 |
| Na⁺ | 10 |
| SO₄²⁻ | 30 |
| Cl⁻ | 35 |
| HCO₃⁻ | 60 |

**Purpose:** As grain bed sugars are rinsed out across sparges, buffering capacity in the runoff decreases and pH rises. Each subsequent sparge runoff will have a higher pH. Most tools predict mash pH well but handle multi-sparge runoff pH inconsistently. Record and compare: mash pH, sparge 1 runoff pH, sparge 2 runoff pH.

---

## Case #9 — High-gravity NEIPA (full volume, thick mash)

**Scenario:** Large grain bill with flaked adjuncts and a thick mash-to-water ratio. Tests adjunct handling and grain ratio sensitivity.

| Parameter | Value |
|---|---|
| Method | Full volume |
| Batch size | 21 L |
| Water source | RO + chloride-forward build |
| Mash volume | ~17 L (high grain-to-water ratio ~2.8 L/kg) |
| Acid addition | 2.5 ml 88% lactic acid (dense mash — less water to dilute acid) |
| Salt additions | 2 g CaCl₂ + 1.5 g CaSO₄ |
| Target pH | 5.2–5.4 |
| Reference expected | ~5.27 |

### Grain bill (total grain: 6.1 kg)

| Malt | % | Grams |
|---|---|---|
| Pale ale malt (2-row) | 50% | 3050 g |
| Flaked Oats | 30% | 1830 g |
| Flaked Wheat | 10% | 610 g |
| Crystal 10L | 10% | 610 g |

### Water profile (after additions)

| Ion | ppm |
|---|---|
| Ca²⁺ | 75 |
| Mg²⁺ | 5 |
| Na⁺ | 10 |
| SO₄²⁻ | 50 |
| Cl⁻ | 100 |
| HCO₃⁻ | 0 |

**Purpose:** Flaked adjuncts (oats, wheat) contribute starch and beta-glucans but have a different buffering behavior than kilned malts — some tools assign them a neutral buffering contribution, others give them a slight alkaline push. The dense grain bill also means more buffering capacity per litre of water. This case tests mash thickness sensitivity and adjunct grain modelling simultaneously.

---

## Case #10 — Sour mash / kettle sour (acid malt contribution)

**Scenario:** Acid malt (Sauermalz) used instead of liquid acid. Target pH is intentionally low for a kettle sour base.

| Parameter | Value |
|---|---|
| Method | Full volume |
| Batch size | 20 L |
| Water source | RO / distilled |
| Mash volume | 17 L |
| Acid addition | None — acid malt provides acidification |
| Salt additions | 1 g CaCl₂ |
| Target pH | 4.5–4.8 (intentionally low for sour base) |
| Reference expected | ~4.62 |

### Grain bill (total grain: 5.5 kg)

| Malt | % | Grams |
|---|---|---|
| Pilsner malt | 80% | 4400 g |
| Wheat malt | 10% | 550 g |
| Acid malt (Sauermalz, ~2.5% lactic) | 10% | 550 g |

### Water profile (after additions)

| Ion | ppm |
|---|---|
| Ca²⁺ | 30 |
| Mg²⁺ | 5 |
| Na⁺ | 5 |
| SO₄²⁻ | 10 |
| Cl⁻ | 30 |
| HCO₃⁻ | 0 |

**Purpose:** Acid malt contributes lactic acid from the malt surface (~2–2.5% lactic by weight). The effective acid contribution per 100 g of Sauermalz is roughly equivalent to ~1.2 ml of 88% lactic acid. Tools model this differently — some treat it as a fixed lactic acid equivalent, others as a simple pH offset per % of grist. Discrepancies are common and often large (>0.10 pH units) for bills with >5% acid malt.

---

## Case #11 — Alkaline addition, dark lager (baking soda to raise pH)

**Scenario:** Black patent malt drops pH aggressively on RO water — baking soda (NaHCO₃) is used to raise pH back into range. Tests bidirectional pH adjustment.

| Parameter | Value |
|---|---|
| Method | Full volume |
| Batch size | 20 L |
| Water source | RO + minimal build |
| Mash volume | 17 L |
| Acid addition | None |
| Salt additions | 1.5 g NaHCO₃ (raises pH) + 1 g CaCl₂ |
| Target pH | 5.3–5.5 |
| Reference expected | ~5.42 |

### Grain bill (total grain: 5.6 kg)

| Malt | % | Grams |
|---|---|---|
| Pale ale malt | 90% | 5040 g |
| Black Patent malt (525L) | 10% | 560 g |

### Water profile (after additions — note elevated Na⁺ from NaHCO₃)

| Ion | ppm |
|---|---|
| Ca²⁺ | 20 |
| Mg²⁺ | 5 |
| Na⁺ | 53 |
| SO₄²⁻ | 10 |
| Cl⁻ | 42 |
| HCO₃⁻ | 89 |

**Purpose:** Most brewers adjust pH downward with acid. Alkaline corrections (baking soda, chalk, slaked lime) are less commonly modelled and often less tested. Black Patent malt at 10% of grist can drop pH by 0.3–0.5 units below the pale malt baseline on RO water. NaHCO₃ is the most common corrective addition in this scenario. If your app handles only acid additions, this case will expose that gap.

---

## Comparison recording sheet

Use this table to record results from each tool for all 11 cases.

| # | Scenario | Target pH | Bru'n Water | Brewer's Friend | Your app | Δ (max–min) | Notes |
|---|---|---|---|---|---|---|---|
| 1 | RO, pale ale only | 5.2–5.4 | | | | | |
| 2 | Tap, IPA, fly sparge | 5.2–5.4 | | | | | |
| 3 | RO build, Weizen BIAB | 5.2–5.4 | | | | | |
| 4 | Hard water, stout | 5.2–5.4 | | | | | |
| 5 | Soft, Pilsner, split acid | 5.2–5.4 | | | | | |
| 6 | RO, Munich Dunkel BIAB | 5.2–5.4 | | | | | |
| 7A | Tap, IPA, lactic acid | 5.2–5.4 | | | | | |
| 7B | Tap, IPA, phosphoric acid | 5.2–5.4 | | | | | |
| 8 | Soft, batch sparge ×2 | mash 5.2–5.4 | | | | | |
| 9 | RO, NEIPA, thick mash | 5.2–5.4 | | | | | |
| 10 | RO, kettle sour, acid malt | 4.5–4.8 | | | | | |
| 11 | RO, dark lager, NaHCO₃ | 5.3–5.5 | | | | | |

**Delta thresholds:**
- Δ < 0.05 — within meter calibration noise, acceptable agreement
- Δ 0.05–0.10 — minor modeling difference, worth noting
- Δ > 0.10 — significant divergence, investigate the root cause

---

## Known modeling differences between tools

| Topic | Bru'n Water | Brewer's Friend | Likely cause of divergence |
|---|---|---|---|
| Pale malt base pH | ~5.72 (Brungard data) | ~5.68 (Palmer/Kaiser data) | Different empirical reference datasets |
| Dark malt acidifying power | Lovibond-based lookup table | SRM formula approximation | Roast intensity vs. color proxy |
| Wheat malt buffering | Separate coefficient | Treated similarly to pale | Barley vs. wheat cell wall chemistry |
| Munich malt base pH | ~5.62 | ~5.65 | Source malt dataset |
| Acid malt (Sauermalz) | Lactic acid equivalent per gram | % grist pH offset | Modelling approach |
| Mash thickness sensitivity | Moderate correction | Variable by version | Dilution effect on buffer capacity |
| Phosphoric acid model | Diprotic at mash pH | Varies | pKa₂ inclusion decision |
| Alkaline additions | Supported (NaHCO₃, Ca(OH)₂) | Supported | Generally consistent |
| Multi-sparge runoff pH | Predicted separately | Often mash pH only | Buffering depletion modelling |
| Temperature correction | Reports at 20°C | Reports at 20°C | Should be consistent — verify |

---

*Generated for mash pH app validation. All gram weights assume a target of ~20 L into fermenter with 75% mash efficiency and standard boil-off/trub losses. Adjust grain weights proportionally for different batch sizes.*
