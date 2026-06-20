# Enzymes

*From German brewing and more — braukaiser.com*

Enzymes are very important to mashing. They catalyze conversion reactions which break down malt compounds — the largest being starch. In the case of starch, this conversion is necessary to form water-soluble dextrins and sugars, the latter of which can be metabolized by yeast. Enzymes are proteins (chains of amino acids) which lower the energy needed for a chemical reaction, allowing it to occur faster and at lower temperatures.

---

## Contents

1. [How enzymatic reactions work](#how-enzymatic-reactions-work)
2. [Enzyme and substrate concentration](#enzyme-and-substrate-concentration)
3. [How temperature affects enzymatic reactions](#how-temperature-affects-enzymatic-reactions)
   - 3.1 [With limited substrate](#with-limited-substrate)
4. [The effect of pH](#the-effect-of-ph)
5. [Inhibitors and cofactors](#inhibitors-and-cofactors)
6. [References](#references)

---

## How enzymatic reactions work

Most enzymes are very specific to the reaction they catalyze and work only with a specific **substrate**, producing only a specific product. In the case of beta amylase, the substrate is a glucose chain and the product is maltose.

Without an enzyme a chemical reaction may look like:

```
substrate₁ + substrate₂ → product
```

But the initial energy (temperature) needed may be so high the reaction rarely occurs. With an enzyme present the reaction becomes two steps, each requiring less energy:

```
substrate₁ + enzyme → enzyme-substrate-intermediate
enzyme-substrate-intermediate + substrate₂ → product + enzyme
```

The enzyme itself is not consumed — once free again it can catalyze another reaction.

An example from the mash: **maltase** splits a maltose molecule into two glucose molecules, consuming one water molecule:

```
C₁₂H₂₂O₁₁ + H₂O → 2 C₆H₁₂O₆
```

![Beta amylase splitting maltotetraose into two maltose molecules](../brewing/images/enzymes/fig-000.png)

*Figure 1 — A simplified illustration of beta amylase splitting maltotetraose into two maltose molecules. (A) Beta amylase bonds to the non-reducing end of the glucose chain — its shape fits only there. (B) The intermediary bond reacts with a water molecule. (C) Two maltose molecules are released and the beta amylase is freed.*

A simple model for the highly specific behavior of enzymes is the **lock-and-key hypothesis**: the enzyme has a shape that fits only a particular substrate. If this shape changes significantly due to temperature, pH, or inhibitors blocking the active site, the enzyme becomes inactive.

---

## Enzyme and substrate concentration

If substrate is available in excess, reaction activity is proportional to enzyme amount — doubling enzyme concentration doubles production in the same time.

If enzymes are in excess, the reaction rate is proportional to available substrate, but approaches a maximum set by enzyme concentration. This is described by the **Michaelis-Menten equation**:

```
reaction rate = maximum rate × [S] / (kₘ + [S])
```

where **kₘ** is the Michaelis constant (the substrate concentration at which 1/2 of maximum reaction rate is reached) and [S] is the substrate concentration.

![Reaction rate vs substrate concentration for 3 different enzyme concentrations](../brewing/images/enzymes/fig-001.png)

*Figure 2 — The change of reaction rate as a function of substrate concentration for 3 different enzyme concentrations (1x, 2x, 4x). With increasing substrate the rate approaches a maximum determined by enzyme concentration. kₘ is the substrate concentration at which 1/2 of maximum rate is reached.*

In mashing both effects exist. At the beginning, starch is in excess and the diastatic power of the malt (enzyme concentration) determines how fast conversion proceeds.

---

## How temperature affects enzymatic reactions

The rate of enzymatic reactions follows the **Arrhenius equation**:

```
reaction rate = A × e(−ΔG*/RT)
```

where A is the Arrhenius constant, ΔG* is the activation energy, R is the universal gas constant, and T is absolute temperature in Kelvin. The reaction rate follows an exponential curve — for every 10°C (18°F) increase, the reaction rate increases 1.2–2.5 fold.

![Rate of enzymatic reaction increases exponentially with temperature](../brewing/images/enzymes/fig-002.png)

*Figure 2 — The rate of enzymatic reaction increases exponentially as temperature increases.*

But why are there different temperature optima for different enzymes? Enzymes are shaped proteins, and their shape is held by weak bonds between amino acids. At high temperatures the enzyme molecule vibrates too intensely, breaking these bonds — the enzyme **denatures**, losing its shape and ability to catalyze reactions. Above a critical temperature the denaturing rate increases 6–36 fold per 10°C, far outpacing the increase in reaction rate.

![Decrease of active enzyme concentration over time for 5 temperatures](../brewing/images/enzymes/fig-003.png)

*Figure 3 — The decrease of active enzyme concentration over time for 5 different temperatures for a hypothetical enzyme. The higher the temperature, the steeper the decline.*

Based on the Arrhenius equation and enzyme denaturing, one can plot the increase of product over time. While a high temperature causes a steep initial rise in product, it also causes a rapid drop in enzyme concentration, and product rise quickly levels off:

![Product concentration over time for 5 temperatures](../brewing/images/enzymes/fig-004.png)

*Figure 4 — The increase of product concentration for 5 different temperatures. The temperature yielding the most product depends on the duration of the reaction. Until time t₁ the highest temperature actually yields the best efficiency, but after that almost all enzymes are denatured and product rise falls behind lower temperatures.*

A useful analogy: a toy car powered by a motor rated for 10V. At 5V it runs slowly but for a long time. At 15V faster but the motor soon burns out. At 20V the fastest start, but the motor burns out immediately. **At high temperatures enzymes are sprinters; at lower temperatures they are marathon runners.**

![Relationship between reaction temperature and final product concentration for various reaction times](../brewing/images/enzymes/fig-005.png)

*Figure 5 — The relationship between reaction temperature and final product concentration for various reaction times. There is no single temperature optimum for an enzyme — it depends on reaction time. The shorter the time, the higher the optimum temperature.*

### With limited substrate

If substrate is limited, a maximum product amount exists and temperature determines whether enzymes reach it within the available time.

![Limited substrate — product maximum and temperature](../brewing/images/enzymes/fig-006.png)

*Figure X — With limited substrate there is a maximum product that can be created. Temperature determines how quickly this maximum is reached — or whether it is reached at all, if too many enzymes are denatured too early.*

![Temperature optimum with limited substrate](../brewing/images/enzymes/fig-007.png)

*Figure X — With limited substrate there is also a minimum time necessary to approach maximum product concentration, and a broad temperature range in which this can be achieved given sufficient time.*

All these scenarios exist in mashing:
- **Alpha amylase + starch**: the goal is full conversion; the high denaturing temperature of this enzyme provides a wide usable temperature range.
- **Beta amylase**: the saccharification rest temperature is chosen to limit beta amylase activity, controlling attenuation by preventing it from converting all its substrate.
- **Proteolytic enzymes**: modern malts skip the protein rest precisely because these enzymes denature early, limiting conversion of medium- and long-chain proteins.

---

## The effect of pH

The **pH** of a solution is a logarithmic measure of freely available H⁺ ions. These ions affect enzymes by reacting with carboxyl or amino functional groups on the enzyme chain.

At high pH (low H⁺ concentration), the carboxyl group dissociates:

```
COOH → COO⁻ + H⁺
```

At low pH (high H⁺ concentration), the amino group binds a proton:

```
NH₂ + H⁺ → NH₃⁺
```

These reactions determine the electric charges and shape of the enzyme and its ability to bind substrate. Each enzyme has an **optimal pH** at which it performs best; on either side effectiveness declines.

![pH optimum for each enzyme](../brewing/images/enzymes/fig-008.png)

*Figure 8 — For each enzyme there is an optimal pH. The location and width of that optimum depends on the enzyme type. The pH-dependent efficiency change is caused by changes in enzymatic structure and electric charges at or around the active sites.*

> **Reversibility:** Changes within 2–3 pH units of the optimum are generally reversible — no permanent damage occurs. A more severe change (3+ units) is likely to denature the enzyme permanently. This means a suboptimal mash pH does not necessarily destroy enzymes; correcting pH can restore activity (except for enzymes already denatured).

> **Temperature correction:** The pH of wort and mash is about 0.35 units lower at 65°C (149°F) than at room temperature (20°C / 68°F), and 0.45 units lower at 75°C. Always note the measurement temperature when comparing pH values [Briggs, 2004].

---

## Inhibitors and cofactors

Some enzymes require a **cofactor** — typically a non-protein compound such as a metal ion — for the reaction to proceed. Without it, the enzyme cannot function. An important example for yeast metabolism is zinc.

**Inhibitors** reduce the reaction rate of enzymes. Three types:

- **Competitive inhibition** — the inhibitor resembles the substrate and occupies the active site, blocking it. Eventually the inhibitor frees the enzyme. The higher the inhibitor concentration relative to substrate, the slower the reaction.
- **Non-competitive inhibition** — the inhibitor reacts with the enzyme outside its active site, changing its shape so the substrate cannot bind. Similar in effect to extreme pH changes.
- **Substrate inhibition** — in some cases an excess of substrate paradoxically reduces reaction rate, possibly because too many substrate molecules compete for the active site, preventing any one from staying long enough to react.

---

## References

- [Chemistry for Biologists — How enzymes work](http://www.rsc.org/education/teachers/learnnet/cfb/enzymes.htm), RSC
- [The effect of temperature on enzymes](http://www.lsbu.ac.uk/biology/enztech/temperature.html) / [The effect of pH on enzymes](http://www.lsbu.ac.uk/biology/enztech/ph.html), London South Bank University
- [Arrhenius Equation](http://en.wikipedia.org/wiki/Arrhenius_equation), Wikipedia
- [Michaelis-Menten kinetics](http://en.wikipedia.org/wiki/Michaelis-Menten_kinetics), Wikipedia
- [Cofactors](http://en.wikipedia.org/wiki/Cofactor_(biochemistry)), Wikipedia
- [pH and enzymes](http://academic.brooklyn.cuny.edu/biology/bio4fv/page/ph_and_.htm), City University of New York
- [Introduction to Enzymes](http://www.worthington-biochem.com/introbiochem/default.html), Worthington Biochemical
- Briggs, D.E. et al. *Brewing Science and Practice*, Woodhead Publishing, 2004
- Narziss, L. & Back, W. *Abriss der Bierbrauerei*, WILEY-VCH, 2005

*Source: braukaiser.com — last modified 8 March 2009*
