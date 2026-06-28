# Understanding Efficiency

*From German brewing and more — Braukaiser.com*

Efficiency is a commonly discussed subject among all-grain brewers. But with the abundance of definitions for it, it easily becomes a matter of comparing apples with oranges. This article tries to shed some light on the various efficiency definitions that are in place, how they are defined (sometimes differently, depending on the author) and how efficiency is affected. Everything you should know to understand a low mash, lauter, or brewhouse efficiency.

---

## Contents

1. [Existing Definitions](#existing-definitions)
   - [Conversion and lauter efficiency](#conversion-and-lauter-efficiency)
2. [Conversion efficiency](#conversion-efficiency)
   - [Measuring conversion efficiency](#measuring-conversion-efficiency)
   - [What affects the conversion efficiency?](#what-affects-the-conversion-efficiency)
3. [Lauter efficiency](#lauter-efficiency)
   - [Estimating lauter efficiency (batch sparging)](#estimating-lauter-efficiency-batch-sparging)
   - [Measuring lauter efficiency (batch and fly sparging)](#measuring-lauter-efficiency-batch-and-fly-sparging)
   - [What affects lauter efficiency in batch sparging](#what-affects-lauter-efficiency-in-batch-sparging)
   - [What affects lauter efficiency in fly sparging](#what-affects-lauter-efficiency-in-fly-sparging)
4. [Related material](#related-material)
5. [Sources](#sources)

---

## Existing Definitions

In *How To Brew*, John Palmer defines the brewing efficiency as the ratio between the gravity points of the wort in the kettle and the maximum potential (laboratory extract) of the grain:

```
kettle gravity points = brewing efficiency × grain amount in lb × kettle volume × potential of the grains
```

In *Designing Great Beers*, Ray Daniels defines what Palmer calls "brewing efficiency" as **mash efficiency**.

In *Abriss der Bierbrauerei*, German brewing author Ludwig Narziss defines **Sudhausausbeute** (German for brewhouse efficiency) as the ratio between the amount of extract in the boil kettle and the amount of grain used:

```
Sudhausausbeute = (kettle volume in l × kettle extract in % × kettle specific gravity) / grain mass in kg
```

> Note: This is a different approach — the reference is the **total weight of grain** (including husks and insoluble material), not the laboratory extract. Thus 75% Sudhausausbeute is a very good number, while the same calculation based on laboratory extract would only be modest. Take care when reading efficiency numbers from German sources.

The BYO Wizard defines **brewhouse yield** — the same calculation but based on the laboratory (fine grind) extract of the grain:

```
brewhouse yield = (kettle volume in l × kettle extract in % × kettle specific gravity) / (grain mass in kg × fine grind extract in %)
```

Technical brewing articles often refer to the **Overall Brewhouse Yield (OBY)**, which equals this brewhouse yield. It is affected by milling, mashing, and lautering, and indicates how close these processes came to the fine grind laboratory extract.

Beersmith software provides three efficiency types:
- **Brewhouse efficiency**: extractable extract into wort at target volume
- **Efficiency into boiler**: based on pre-boil volume and gravity
- **Efficiency into fermenter**: based on fermenter volume and gravity

> For comparison with other brewers, use efficiency into boiler (or brewhouse efficiency if the batch size matches the temperature-corrected post-boil volume).

---

### Conversion and lauter efficiency

The brewhouse efficiency can be broken into two separate efficiencies that measure mashing and lautering performance separately:

```
brewhouse efficiency = conversion efficiency × lauter efficiency
```

**Conversion efficiency** measures how well the mash extracted the grist (the benchmark is the fine grind extract). It is affected by mash parameters like pH, crush, diastatic power, temperature profile, mash type, and mash time. It should be close to 100%.

**Lauter efficiency** measures how well the lautering process transferred the extract into the boil kettle. It is affected by lauter system design, lautering type (no-sparge, batch sparge, fly sparge), and sparging practice.

---

## Conversion efficiency

### Measuring conversion efficiency

To determine the conversion efficiency, calculate the theoretical maximum of the first wort extract/gravity based on the laboratory extract of the grain and the volume of water added to the mash.

The formula for the theoretical maximum first wort extract (FW_max) in Plato:

```
FWmax = (mgrain × egrain × 100) / (mgrain × egrain + Vmash_water)
```

Where:
- `FWmax` = theoretical maximum extract content of the first wort (in Plato/Brix/weight %)
- `Vmash_water` = volume of strike water in liters (total water added to mash before first run-off, excluding decoction boil-off compensation)
- `mgrain` = weight of the grist in kg
- `egrain` = weighted average laboratory extract of the grist (from malt analysis; 0.8 = 80% is accurate for most base malts)

An approximation of the conversion efficiency (most accurate near 100%):

```
CE ≈ (FWmeasured / FWmax) × 100%
```

The more accurate formula (Hopcroft):

```
CE = FWmeasured × (mgrain × egrain + Vmash_water) / (mgrain × egrain × (100 - FWmeasured) / 100 + FWmeasured × Vmash_water / 100) × 1/100
```

The extract content in Plato can be estimated from specific gravity:

```
Plato ≈ (SG - 1.000) × 1000 / 4
```

The first wort extract can also be calculated from mash thickness alone:

```
FWmax = (R × 0.8 × 100) / (R × 0.8 + 100)    [where R = water/grain ratio in l/kg]
```

If the mash thickness is known in qt/lb, multiply by 2.09 to convert to l/kg.

![Table 1 — First wort extract/gravity based on mash thickness](../brewing/images/understanding-efficiency/fig-003.png)

*Table 1 — Extract content or gravity of the first wort based on the mash thickness. 100% mash efficiency, 80% fine grind extract, and 4% moisture content of the malt were assumed.*

---

### What affects the conversion efficiency?

If the mash efficiency is significantly short of 100% (i.e., lower than 90%), one or more mash parameters were suboptimal. Mash parameters don't have to be at their optimum — they only have to be "good enough". The range of "good enough" depends on the other mash parameters.

![Figure 1 — Mash parameter vs. starch conversion diagram](../brewing/images/understanding-efficiency/fig-008.png)

*Figure 1 — A diagram illustrating the dependency between a particular mash parameter and the amount of starch that is converted. The conversion efficiency plateaus once all starch is converted; only excessive denaturation of enzymes can cause it to decline.*

> Note: An iodine test may not detect low conversion efficiency if the unconverted starch is still locked away in large pieces of grist (surrounded by husk material). A negative iodine test but poor conversion efficiency shouldn't lead to quality problems — just poor brewhouse efficiency.

#### Temperature

Lower temperatures require longer rests in order to fully convert the mash, due to decreased enzyme activity. How long it takes depends on other mash parameters. Temperatures higher than 75–80°C (167–176°F) may cause too much alpha amylase to be denatured too quickly, resulting in a mash that may never fully convert.

Conversion below the starch gelatinization temperature (60–65°C / 140–150°F for large starch granules representing 85–90% of the starch; 51–92°C / 125–200°F for small granules) still takes place but at a slower pace. Once starch gelatinizes, enzymes have access to much more starch and conversion occurs much quicker.

#### pH

Near their temperature optimum, the amylase enzymes have a pH optimum between 5.4 and 5.7 (measured on a cooled mash sample): 5.4–5.6 for beta amylase, 5.6–5.8 for alpha amylase. Outside this pH range the enzymes still work, but not as well — the mash doesn't convert as quickly and the conversion efficiency may suffer.

Many brewers see a jump in brewhouse efficiency once they correct the mash pH. For information on estimating and correcting mash pH, see the Understanding Mash pH article.

#### Time

The longer the enzymes can work, the more they can convert. But if the mash fully converts before the rest time is over, an increase in rest time will not increase conversion efficiency (nothing is left to solubilize). Note that attenuation of the beer may still be affected by extended resting even after full conversion.

#### Malt Milling

If the grits are too coarse and pieces of endosperm are still (partially) enclosed by husks, the mash needs to be more intense to reach the starch inside. As the crush gets tighter, the endosperm pieces get smaller and more are separated from the husks.

> Note that a malt grain is about 1.8 mm (70 mil) thick. A mill gap spacing of 1.0–1.5 mm (40–60 mil) — the factory setting of many mills — cannot be expected to yield sufficient separation between endosperm and husks. Many home brewers see a jump in efficiency when they start milling more tightly or double-crushing the grain.

When using a lauter tun, there is a lower limit to the roller spacing. As malt is crushed ever tighter, husks are shredded more (though this can be mitigated through malt conditioning) and more flour is produced — both impede lautering and increase the risk of a stuck sparge. In general, **crush as tight as necessary for close to 100% conversion efficiency, but not tighter**.

#### Mash Schedule

The "intensity" of the mash affects how well it converts:

- **Triple decoction** is the most intense, repeatedly boiling grain to liberate starch enclosed in cell walls or between husk pieces — but also reduces diastatic power.
- **Stirring and agitation** increase intensity without reducing enzymes.
- Modern well-modified malts generally don't need decoction mashing if other mash parameters are optimal.
- **Dough-in below saccharification temperature** helps preserve diastatic power by allowing enzymes to hydrate before entering the temperature range where they begin to denature.
- **Rice or corn** with higher gelatinization temperatures must be pre-gelatinized (via cereal cooker) before adding to the mash. Flaked grains have already been gelatinized.

#### Mash-out

Some brewers report efficiency gains from a mash-out. This is most likely due to improved conversion efficiency: the alpha amylase is "super-charged" at 70–75°C (158–167°F) and converts starch that wasn't converted during the saccharification rest.

> Caution: Since beta amylase is quickly denatured during a mash-out, the extract gained is mostly **unfermentable** and will lower the overall attenuation of the wort. A mash-out should not be seen as a tool to increase conversion efficiency unless the decrease in fermentability is taken into account.

#### Diastatic Power

**Diastatic power** is a measure of the enzymatic strength (primarily amylase enzymes) of the malt. The higher the diastatic power, the more starch can be converted and the more forgiving the mash is if other parameters are suboptimal.

![Figure 2 — Diastatic power of malts vs. malt color](../brewing/images/understanding-efficiency/fig-016.png)

*Figure 2 — Diastatic power of various malts based on malt color (Data source: Briess Malting). The darker the malt, the higher/longer the kilning process and thus the lower the diastatic power. The relationship falls rather quickly as malt color increases.*

Key points:
- Only ~20% Pilsner malt (130°L) needs to be added to a 100% dark Munich grist (20°L) to double its diastatic strength.
- Among malts of similar color, higher soluble nitrogen ratio (SNR) generally correlates with higher diastatic power.
- Most modern malts have sufficient diastatic power for a single infusion mash.
- Decoction mashing reduces diastatic power by denaturing enzymes in the decoction. For mashes weak in enzymatic power, rest the decoction for conversion before bringing it to a boil.

#### Mash thickness

Water is required for gelatinization, enzyme hydration, and the conversion process itself (one molecule of water is consumed each time a glucose chain is split). High sugar concentrations in thick mashes also inhibit the amylase enzymes.

- Traditional British style infusion mashes: ~2–2.5 l/kg (1–1.15 qt/lb) — very thick
- German style mashes: ~3.5–5 l/kg (1.75–2.5 qt/lb) — much thinner

Thinner mashes lead to better overall efficiency. In thinner mashes, conversion processes occur faster. The alpha amylase is still fairly stable at common saccharification temperatures and benefits fully from a thinner mash. Beta amylase denatures more quickly in thinner mashes but is compensated by faster activity — resulting in no change in wort fermentability when mash thickness is changed.

#### Dough Balls

Dough balls form when gelatinized starch encloses dry starch/malt. The gelatinized starch forms a barrier that keeps mash water from entering the dough ball. This can cause a late release of starch that may or may not be converted in time.

To avoid dough balls:
- Slowly add malt to hot strike water while stirring well
- Use thinner mashes
- Dough-in below the starch gelatinization temperature of 60°C (140°F) eliminates the risk entirely
- Make sure to get into corners of rectangular mash tuns

---

## Lauter efficiency

The lautering process (separation of sweet wort and spent grain) is the other process that affects brewhouse efficiency. It is a mostly physical process. Two strategies are employed in home brewing: **batch sparging** (including no-sparge) and **fly sparging**.

---

### Estimating lauter efficiency (batch sparging)

In batch sparging, after the mash is complete the first wort is run off until the grain bed runs "dry". A volume of wort of the same gravity remains between the grains. A batch of sparge water is added and stirred in, diluting the remaining wort, then another batch of wort (lower gravity this time) is run off. This is repeated until the desired pre-boil volume is reached.

The efficiency of one batch sparge step:

```
Effbatch_sparge_step = 100% × Vrun_off / (Vrun_off + Vgrain_absorption + Vdead_space)
```

The extract content cancels out because it is the same in the divisor and dividend. For a subsequent batch sparge step:

```
Eff2nd_run_off = (100% - Eff1st_run_off) × Vrun_off / (Vrun_off + Vgrain_absorption + Vdead_space)
```

As the number of run-offs increases, ever weaker worts are run into the kettle and the gains diminish.

---

### Measuring lauter efficiency (batch and fly sparging)

For fly sparging, mathematical modeling is not practical due to the dynamic nature of the process. Instead, the lauter efficiency can be estimated by measuring the dissolved extract remaining in the spent grain after sparging.

**Method:**
1. After sparging is complete, add 0.5, 1.0, 1.5, or 2.0 qt of water per pound of initial grist weight (or 1–2 l/kg). Cold tap water works fine.
2. Stir the mash very well, getting into all corners and the bottom of the lautertun.
3. Take a hydrometer or refractometer reading of the mash liquid.
4. Correct for temperature and look up the value in Table 2.

![Table 2 — Estimating brewhouse efficiency loss in the lauter](../brewing/images/understanding-efficiency/fig-019.png)

*Table 2 — Table for estimating the brewhouse efficiency loss in the lauter based on the extract content/specific gravity of the mash water after adding water to the spent grain. Assumes 80% laboratory extract potential and 1.56 l/kg (0.19 gal/lb) grain absorption.*

The formula behind the table:

```
Efflost_in_lauter = extract × sg × (Agrain_absorption + Rwater_added) / 0.8
```

Where grain absorption rate = 1.56 l/kg and water addition rate expressed in l/kg.

---

### What affects lauter efficiency in batch sparging

**Grist size / starting gravity**: More grain means more wort absorbed (higher `Vgrain_absorption`), which increases the denominator of the efficiency equation and reduces efficiency. This is one reason big beers generally have lower batch sparge lauter efficiency.

**Number of run-offs**: Each additional sparge step brings more extract into the kettle but yields diminishing returns (because run-off sizes must decrease to maintain target pre-boil volume):
- No-sparge → single batch sparge: ~8% gain in lauter efficiency
- Single → double batch sparge: ~2–3% gain
- Double → triple: ~1% gain

**Pre-boil volume / boil-off**: A larger pre-boil volume (requiring more boil-off) increases the run-off volume and thus the lauter efficiency. But boil-off should only be changed within a limited range — excessively long or strong boils can be detrimental to beer quality.

**Run-off sizes in relation to each other**: Maximum lauter efficiency is achieved when both run-offs are equal in volume. However, the optimum is fairly flat — not until one run-off is less than ~30% and the other more than ~70% of the pre-boil volume is more than 1% of lauter efficiency lost.

---

### What affects lauter efficiency in fly sparging

Fly sparging efficiency suffers when the grain is not rinsed evenly. The main cause is **channeling** — sparge water finds paths of least resistance through the grain bed, leaving densely packed areas un-rinsed.

**Causes of channeling:**
- Run-off speed too fast — creates high pressure gradient, compresses grain bed, or causes the bed to pull away from sides
- Inadequate manifold design

**Mitigations:**
- Crush grain as coarsely as possible while still achieving sufficient conversion efficiency (larger particles improve flow rate, which is proportional to the square of average particle size)
- A mash-out reduces wort viscosity and causes proteins to form larger flocs, improving run-off speed
- Sufficient calcium ions in the mash also aid protein flocculation
- Watch for the **Oberteig** — a dense layer of small starch granules, beta glucans, proteins, and lipids that can form a barrier encouraging channeling. Disturb it with raking or cutting.
- Use a lauter tun design that allows uniform wort collection at the bottom (perforated plate or a well-designed slotted manifold)

The amount of sparge water used also affects lauter efficiency. More water = more extract rinsed from the grain. However, wort quality diminishes as lautering continues — pH rises (especially with high-alkalinity sparging liquor), risking excessive extraction of husk tannins (a major cause of astringency). This limits how much sparging is practical.

> If done correctly, fly sparging yields better lauter efficiency than batch sparging for the same amount of sparge water.

---

## Related material

- NHC 2010 presentation by Kai Troester: *Efficiency and How to Keep It Predictable*

---

## Sources

- [Palmer, 2006] John J. Palmer, *How to Brew*, Brewers Publications, Boulder CO, 2006
- [Daniels, 2000] Ray Daniels, *Designing Great Beers*, Brewers Publications, Boulder CO, 2000
- [BYO] Online article: Gravity & Brewhouse Efficiency
- [Narziss, 2005] Prof. Dr. agr. Ludwig Narziss, Prof. Dr.-Ing. habil. Werner Back, *Abriss der Bierbrauerei*. WILEY-VCH Verlags GmbH Weinheim Germany, 2005
- [Briggs, 2004] Dennis E. Briggs, Chris A. Boulton, Peter A. Brookes, Roger Stevens, *Brewing Science and Practice*, Woodhead Publishing, 2004
- [Briess 2008] Briess average malt analysis data 2007/2008
- [Priest, 2006] F. G. Priest, Graham G. Stewart, *Handbook of Brewing*, CRC Press, 2006

---

*Source: braukaiser.com — last modified 20 December 2010. Content available under Attribution-NonCommercial 3.0 Unported.*
