# Water Chemistry

Water chemistry has a significant impact on beer flavor, mouthfeel, and perceived bitterness.

## Key Minerals

| Ion | Symbol | Typical Range (ppm) | Effect |
|-----|--------|---------------------|--------|
| Calcium | Ca²⁺ | 50–150 | Enzyme activity, yeast health, clarity |
| Magnesium | Mg²⁺ | 10–30 | Yeast nutrient (avoid excess — bitter) |
| Sodium | Na⁺ | 0–150 | Rounds and softens flavor |
| Chloride | Cl⁻ | 0–250 | Fullness, sweetness, malt emphasis |
| Sulfate | SO₄²⁻ | 0–400 | Dryness, crispness, hop emphasis |
| Bicarbonate | HCO₃⁻ | 0–250 | Alkalinity, raises mash pH |

## Cl:SO4 Ratio

The chloride-to-sulfate ratio shapes the character of your beer:

- **> 1:1 Cl:SO4** — malt-forward, soft, full-bodied
- **1:1** — balanced
- **< 1:1 Cl:SO4** — hop-forward, dry, crisp

## Mash pH

Target mash pH is 5.2–5.4 for most beers. Darker malts lower pH; alkaline water raises it.

Use acidulated malt or food-grade acids (lactic, phosphoric) to lower pH. Chalk (CaCO₃) or baking soda can raise it.

## Salt Additions

Common salts and their ions:

| Salt | Ca | Mg | Na | Cl | SO4 | HCO3 |
|------|----|----|----|----|-----|------|
| Gypsum (CaSO₄) | + | | | | + | |
| Calcium Chloride (CaCl₂) | + | | | + | | |
| Epsom Salt (MgSO₄) | | + | | | + | |
| Baking Soda (NaHCO₃) | | | + | | | + |
| Chalk (CaCO₃) | + | | | | | + |
| Salt (NaCl) | | | + | + | | |

## Practical Water Treatment

*Via the Birra Podcast, T1E02 and T2E04.*

**Start with an analysis.** You can't correct a profile you haven't measured — get alkalinity, hardness (Ca + Mg — not the same as total mineralization), pH, calcium, magnesium, sulfate, chloride, sodium, and TDS as a general "how much mineral support does this water have" indicator. Alkalinity acts as a pH **buffer**: it resists the drop in mash pH that malt acidity and the calcium/magnesium-phosphate reaction would otherwise produce, so higher alkalinity means a harder fight to hit your mash pH target. Calcium and magnesium push pH the other way — they precipitate with malt phosphates, and that reaction releases protons (acidity) into the mash.

**Remove chlorine and chloramine before it reaches yeast** — chlorinated compounds react with yeast into medicinal chlorophenols at very low, easily-perceptible thresholds. Plain chlorine can be knocked back by resting water uncovered overnight, a short boil, or a carbon filter. **Chloramine (common in warmer months/seasons) resists both resting and boiling** — a carbon filter is the reliable fix, since it removes a consistent residual regardless of how much chlorine/chloramine was in the source water (rest/boil performance instead varies with the starting concentration).

**When to invest in RO**: broadly useful above ~150 ppm TDS; below ~100 ppm, diluting with store-bought still water is a viable low-equipment alternative. RO is also worth it whenever one specific ion is a problem even at otherwise-moderate TDS (e.g. sodium in the 180–220 ppm range) — diluting brings every ion down proportionally (e.g. a 25% dilution cuts sodium, alkalinity, sulfate, and chloride each to 25% of their starting value). **Don't run pure RO water for every style** — very low-mineral water suits light, hop-forward beers, but dark and caramel-forward styles (stout, porter, Scottish ale) taste flat and one-dimensional ("reheated coffee" — all roast, no supporting complexity) without real mineral backbone. A **water softener never belongs in a brewing water line on its own** — ion-exchange softeners swap calcium/magnesium for sodium, which strips useful hardness and adds an unwanted flavor ion without touching alkalinity at all. Its only legitimate brewing role is as a pre-treatment stage *before* an RO unit, protecting the membrane from scale — the RO unit downstream then removes the sodium it added.

**When adding salts, plan the whole ion, not just the target one.** Every salt brings two ions — asking for more sulfate via calcium sulfate also adds calcium; asking for more chloride via calcium chloride does too. Sketch out the combined effect on every parameter (not just the one you're chasing) before adding anything, especially calcium, which tends to land in range automatically as a side effect of chasing sulfate/chloride targets. Prefer calcium salts over magnesium salts as your primary lever — magnesium in excess brings a metallic, unpleasant bitterness (and can combine with high sulfate to cause digestive upset) — and reach for magnesium only as a secondary adjustment once calcium is already near its practical ceiling (~150 ppm).

**The pH that matters is the mash pH, not the water pH alone or the malt's titratable acidity alone** — it's the combined result once water and grain are mixed that you should be measuring and targeting; treating water pH as a proxy for mash pH misses the interaction between the two. *Via the Birra Podcast, T2E05.* Adjust the water's alkalinity/hardness and lean on the acidity differences between malts (roasted and caramel malts are more acidic than pale ale malt, which is more acidic than Pilsner) to get close to your mash pH target before reaching for acid — treat added lactic/citric/phosphoric acid as the last, minimal correction, not the primary tool. If the mash pH lands right with little or no acid addition, pH tends to stay in good shape through the rest of the process too (heavily cold-dry-hopped beers are the main exception — see [[cold-dry-hopping-and-oxygen-control]]). Since a pH reading is fast and cheap, there's little reason not to check it at multiple stages — mash, recirculation, start and end of boil, through fermentation, and in the finished beer — rather than only checking once.

**Dissolve salts fully before brewing with that water** — gypsum (calcium sulfate) is the slowest to dissolve; recirculating with a pump for about 15 minutes gets it fully into solution (larger volumes need more time, or budget for a small undissolved fraction). Also account for **hydration water in the salt itself** when weighing — many brewing salts are sold as hydrates (e.g. gypsum with attached water molecules), so part of the measured weight isn't the active ion; use the correct formula weight for the hydration state you're using, and store salts somewhere they won't pick up ambient moisture and throw off future weighings.

## Water Profiles in BrewHub

Store source and target profiles in **Inventory > Water**. When creating a batch, select both profiles and BrewHub will calculate the salt additions needed.
