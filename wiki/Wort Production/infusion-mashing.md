# Infusion Mashing

*From German brewing and more*

**Infusion mashing** is the process of achieving rest temperatures either by adding measured amounts of water heated to carefully calculated temperatures to the mash, or by using direct heat to heat the mash.

In a **single infusion mash**, all the mash water is added at once and held at a single steady temperature. In a **step infusion mash**, some water is held back and heated to a calculated temperature before being added to raise the mash to each successive rest. In either case, an insulated mash tun (such as a converted picnic cooler) maintains temperature without direct heat. Step infusion can also be accomplished with direct heat.

---

## Contents

1. [Single Temperature Infusion Mash](#single-temperature-infusion-mash)
2. [Multi Step Infusion Mashes](#multi-step-infusion-mashes)
3. [Hochkurz Mash](#hochkurz-mash)

---

## Single Temperature Infusion Mash

![Single infusion mash schedule diagram](../brewing/images/infusion-mashing/fig-001.png)

The single infusion mash uses one temperature rest at which both **beta and alpha amylase** are active to convert malt starches into wort sugars. The rest temperature controls how long beta amylase will remain active and therefore the amount of fermentable sugars produced. Higher mash temperatures reduce the limit of attenuation of the resulting wort.

This is the most common mash schedule among home brewers and craft brewers because it suits American and British 2-row malts — generally highly modified malts that don't benefit from lower-temperature rests. Rest temperatures are commonly between 149 °F (65 °C) and 165 °F (69 °C). Many brewers prefer 152–154 °F (66.5–67.5 °C) for a balance of body and fermentability suited to British and American style ales.

### Strike Water Temperature

The strike water temperature is calculated with the following formula [Palmer, 2006]:

```
Tw = (0.2 / R) × (T2 − T1) + T2
```

- **R** = ratio of water to grain in quarts per pound
- **T1** = temperature of the grains (°F or °C)
- **T2** = target mash temperature (°F or °C)

> **Note:** Palmer states R can be expressed as qt/lb or L/kg. This is incorrect — 1 L/kg ≈ 0.5 qt/lb. When using metric units, this difference must be accounted for. Temperature can be Fahrenheit or Celsius as long as all values use the same unit.

### Hitting the Mash Temperature

This formula does not account for heat loss to the mash tun (it assumes zero thermal mass). To compensate:
- Preheat the mash tun with boiling water before dough-in, or
- Adjust strike water temperature based on results from previous mashes, or
- Add the strike water to the mash tun first, then adjust its temperature with hot or cold water before adding the grains.

When mashing in at or above the **gelatinization temperature** of barley starch (140–150 °F / 60–65 °C), add grains to the strike water rather than the reverse. This minimises the formation of dough balls — clumps whose outer starch layer gelatinises and seals in unconverted starch.

### Mash Duration

With today's highly modified malts, conversion is generally complete after 15–30 min. Most brewers mash 60–90 min because fermentability continues to increase even after the wort is iodine negative, and longer mash times can improve conversion efficiency by reaching harder-to-access starch. Always verify conversion with a **Starch Test**.

### Mash-Out

A **mash-out rest** can be added by raising the mash to 167 °F (75 °C) using hot water infusions or decoction. This temperature should not be exceeded — alpha amylase is not fully deactivated until 176 °F (80 °C). The purpose of mash-out is not to stop enzymatic activity but to lower wort viscosity and aid lautering while still allowing enzyme activity to convert any starch released during sparging [Narziss, 2005].

---

## Multi Step Infusion Mashes

Multi step infusion mashes use more than one temperature rest (not counting mash-out). Temperature is raised using direct heat, hot water infusions, or both. Relevant rests include:

- **Acid rest** — for enzymatic mash acidification and pH adjustment. No significant conversion occurs, so there is no time pressure.
- **Ferulic acid rest** — primarily for generating ferulic acid, which wheat beer yeasts convert to 4-vinylguaiacol (4VG), the phenolic character of Bavarian Weizenbier.
- **Protein rest** — temperature and duration depend on malt modification. Closer to 122 °F (50 °C) emphasises short-chain proteins (amino acids); closer to 133 °F (55 °C) produces more medium-chain proteins (good for head retention and body). Well-modified modern malts may benefit from only the higher-range rest or none at all.
- **Saccharification rest** — can be a single rest (as in single infusion) or multiple rests targeting beta and alpha amylase separately. The latter can produce more fermentable wort by maximising the output of beta amylase and limit dextrinase.

> When raising mash temperature with direct heat, increase at no more than 2–4 °F/min (1–2 °C/min) to avoid scorching.

### Example: 2-Step Infusion Mash for German Malts

![Two-step infusion mash schedule](../brewing/images/infusion-mashing/fig-002.png)

This schedule works well with moderately modified German malts. It employs a short protein rest at 133 °F (55 °C) and a single saccharification rest, with temperature raised by boiling water infusions.

**Procedure:**
1. Calculate strike water for a grist/water ratio of 1.25 qt/lb (~2.5 L/kg) and a target of 129–133 °F (53–55 °C). Add water to grain (below gelatinisation temperature, so dough balls are not a concern). Stabilise between 122–133 °F (50–55 °C).
2. Use the protein rest to measure and adjust mash pH. Subsequent water additions will not significantly affect pH.
3. Bring 60–70% of the strike water volume to a boil. When the protein rest is complete, ladle boiling water into the mash in stages, stirring and measuring temperature after each addition, until the saccharification rest temperature is reached.
4. Hold the saccharification rest. Adjust this temperature experimentally to hit your desired attenuation — due to the protein rest, the wort will be more fermentable at the same saccharification temperature compared to a single infusion mash.

**Alternative formula for infusion water addition** [Palmer, 2006]:
```
Wa = (T2 − T1)(0.2G + Wm) / (Tw − T2)
```
- **Wa** = amount of infusion water to add
- **Wm** = total water already in the mash
- **T1** = initial mash temperature
- **T2** = target mash temperature
- **Tw** = temperature of infusion water
- **G** = weight of grain

Adding boiling water in stages and measuring directly is generally more reliable since it accounts for factors the formula cannot.

> A thinner mash does **not** increase tannin extraction — quite the opposite. German brewers prefer thinner mashes for lighter beers as less sparge water is needed, reducing tannin extraction during lautering. Thicker mashes enhance proteolytic activity; thinner mashes enhance amylase activity.

---

## Hochkurz Mash

![Hochkurz mash schedule](../brewing/images/infusion-mashing/fig-003.png)

The **Hochkurz mash** (*hoch* = high, *kurz* = short) doughs in at a high temperature (above protein rest temperatures) and completes in under 2 hours. It has become the standard mashing schedule in Germany, particularly in large breweries where mashing a new batch every 2 hours is required.

The Hochkurz mash uses **two saccharification rests**:
- A **maltose rest** (low temperature) favours beta amylase and sets wort fermentability.
- A **dextrinisation rest** (high temperature) favours alpha amylase and completes starch conversion.

### With Hot Water Infusions

Dough in at a water-to-grist ratio of 2.5–3 L/kg (1.25–1.5 qt/lb). The mash will thin progressively with each infusion — this is fine, as enzymes and gelatinisation work better in a thinner mash.

### With Direct Heat

Use a mash thickness of 3.5–4.5 L/kg (1.75–2.25 qt/lb). This makes stirring during heating phases easier. Aim for a dough-in temperature slightly below the first rest temperature.

### Rest Temperatures and Durations

- **Maltose rest:** 63 °C (145 °F). Duration controls fermentability — 30 min is a good starting point, longer for more fermentable wort, shorter for less. For very high fermentability, add an intermediate rest at 65 °C (150 °F). Wrap the pot in blankets to hold temperature.
- **Dextrinisation rest:** 70–72 °C (158–162 °F). Hold until iodine negative; can be extended to 45–60 min. Many authors credit extended rest at this temperature with improvements to head retention and mouthfeel through glycoproteins extracted from the malt.
- **Mash-out:** Optional — raise to mash-out temperature and lauter.

---

*Source: [braukaiser.com](http://braukaiser.com/wiki/index.php?title=Infusion_Mashing&oldid=3371) — Last modified 1 August 2009. Content available under Attribution-NonCommercial 3.0 Unported.*
