# Batch Sparge and Party Gyle Simulator

*From German brewing and more — Braukaiser.com*

The batch sparging process is fairly predictable and can easily be modeled. This is done in the **Batch Sparge and Party Gyle Simulator**, a spreadsheet which allows planning of batch sparge and party gyle scenarios.

**Party Gyle** is a style of brewing where the mash is lautered in batches. The resulting worts of different strengths may be blended or not to yield different beers from a single mash. In batch sparge brewing, all run-offs are collected in the same boil kettle to yield a single beer.

The process is simple: after all or part of the wort has been drained from the lautertun, a batch of sparge water is added and mixed well with the grain. The goal is to dilute the wort that remained in the spent grain and distribute its extract evenly throughout the new wort volume. After that, the wort is lautered and drained again. This may be repeated one more time, but brewers rarely use more than 2 sparge batches (collecting 3 run-offs total).

The mathematical model calculates how much extract is transferred into the boil kettle with each run-off and how much extract remains in the lautertun before it is diluted by the addition of a known amount of water. The amount of extract dissolved during mashing can be calculated from the grist's extract potential and the **Conversion Efficiency** of that mash.

---

## Contents

1. [Units](#units)
2. [Initial mash](#initial-mash)
3. [Equipment](#equipment)
4. [1st run-off](#1st-run-off)
5. [Boil off options](#boil-off-options)
6. [Recharge](#recharge)
7. [Combined run-offs](#combined-run-offs)

---

## Units

![Units section of the spreadsheet](../brewing/images/batch-sparge-party-gyle-simulator/fig-000.png)

While the spreadsheet strictly uses metric units under the hood, the user can specify which units should be used for weights, volumes, extract content, and grain absorption. It makes sense to save a copy of the spreadsheet loaded with your preferred unit settings.

---

## Initial mash

![Initial mash section](../brewing/images/batch-sparge-party-gyle-simulator/fig-001.png)

To calculate the amount of extract that will be dissolved, the following inputs are needed:

- **Amount of grain**
- **Extract potential** (default is 80% fine grind dry basis and 4% moisture content)
- **Conversion efficiency** — depends on your mashing parameters; get this number from previous mashes (see [Understanding Efficiency](understanding-efficiency.md))
- **Water amount** — needed to calculate the volume of resulting wort and its strength

---

## Equipment

![Equipment section](../brewing/images/batch-sparge-party-gyle-simulator/fig-002.png)

The only equipment parameters that batch sparging depends on are the **specific grain absorption** and **dead spaces**. For most brewers, dead spaces are virtually nonexistent. Commonly found grain absorption values:

- **0.12 gal/lb** (US units)
- **1 l/kg** (metric)

These are the defaults. If you have better data for your equipment, use it. Note that the grain absorption and dead space volume are only used to calculate the amount of wort that can be drained. If you enter the actual collected volume directly, these equipment parameters have no effect.

---

## 1st run-off

![1st run-off section](../brewing/images/batch-sparge-party-gyle-simulator/fig-003.png)

Each run-off section provides:

- The **volume that can possibly be drained** and its **strength (gravity)**
- The amount that can be drained is used as the default for the collected volume, but can be changed
- Based on the collected volume and wort strength, the **efficiency collected with that run-off** is calculated

---

## Boil off options

![Boil off options section](../brewing/images/batch-sparge-party-gyle-simulator/fig-004.png)

This section is useful for getting an idea of how strong and how much wort remains after boiling. It lists the post-boil volumes and strength for total evaporation percentages ranging from **5 to 30%**.

> In general the evaporation should be between 10 and 15%, which is enough to drive off DMS and is not yet excessive. Larger beers may need or even benefit from a larger boil-off.

The boil-off options are given for each individual run-off and for all supported run-off combinations.

---

## Recharge

![Recharge section](../brewing/images/batch-sparge-party-gyle-simulator/fig-005.png)

When batch sparging, only water is added in preparation of an additional run-off. In **party gyle** brewing, the brewer may decide to add more grain and mash again to boost the gravity of the 2nd run-off.

This is supported in the recharge sections where the amount of water and grain added can be entered. Along with the grain addition is a conversion efficiency number, which by default is set to whatever was used in the initial mash section.

---

## Combined run-offs

![Combined run-offs section](../brewing/images/batch-sparge-party-gyle-simulator/fig-006.png)

The spreadsheet supports up to **3 run-offs** and all combinations, with the exception of combining the 1st and 3rd run-off without the 2nd. In a 2 run-off batch sparge, you would look for the **1st + 2nd run-off** section to find your total volume, wort strength, and overall efficiency.

---

*Source: braukaiser.com — last modified 1 September 2010. Content available under Attribution-NonCommercial 3.0 Unported.*
