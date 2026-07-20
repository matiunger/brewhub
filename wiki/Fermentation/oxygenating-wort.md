# Oxygenating Wort

*Via the Birra Podcast, "Levaduras líquidas" (T2E11), an interview with Mariano Balbarrey, and T1E11. A technique-focused companion to [[managing-fermentation]] — that page covers the "why" and dosing targets; this one covers equipment and hands-on technique.*

**Liquid yeast is unforgiving of poor oxygenation.** Most of the classic liquid-yeast problems — fermentation that won't start, acetaldehyde spikes, diacetyl that never gets reabsorbed — trace back to insufficient oxygen, not to pitch viability. Get the oxygenation step right before troubleshooting anything else.

## Air vs. Pure Oxygen

Injecting **air** saturates wort at roughly **7–8 ppm dissolved O₂** — that's the ceiling; you cannot push past it with air alone. Reaching the **12–16 ppm** some strains need requires injecting **pure (medical-grade) oxygen** instead.

## Technique: In-Line, Not Splash

Oxygenate **in line**, immediately after the plate chiller and before the fermenter: cold wort flows through a diffusion stone fed with a low, controlled O₂ flow rate, and everything that passes through carries dissolved oxygen with it. Splashing wort into the fermenter, or bubbling O₂/CO₂ through a carbonation stone at the top of the tank, is not an adequate substitute for liquid strains — it doesn't dissolve enough oxygen into the bulk liquid.

- **Match O₂ flow rate to wort flow rate.** If the oxygen flow is too high relative to the wort passing over the diffuser, bubbles collide, merge into larger bubbles, and escape through the blow-off without ever dissolving. What matters is how much oxygen actually dissolves, not how much you spend — small, fine bubbles that get carried along by the wort stream are what actually gets absorbed.
- **Keep the diffusion stone clean.** Mineral scale reduces its effectiveness by changing pore size and diffusion characteristics. Clean it in an ultrasonic bath; if autoclaving, avoid high-mineral water that can deposit scale on the stone during the process.
- **Homebrew setup**: a medical oxygen tank plus a lance-style stone or an inline "TG"-type filter/diffuser. Investing in a proper oxygenation setup matters more for beer quality than upgrading to a fancier stainless brew kettle — put money here first.

## How Much, and How to Compensate Without a Meter

- **Target 8–14 ppm** dissolved O₂ in wort for most liquid-strain fermentations (equivalent to 8,000–14,000 ppb — see the units note below).
- **It's much easier to underdo oxygenation than to overdo it.** Yeast consumes essentially all the dissolved oxygen during its aerobic growth phase, so there's a wide safety margin on the high side; a real overshoot mostly risks shifting sterol synthesis toward lanosterol instead of ergosterol (a flavor-profile effect), not oxidizing the beer — since the oxygen gets consumed immediately by yeast rather than sitting free in solution.
- **No dissolved-oxygen meter?** Simply double the oxygenation time you'd have used for dry yeast. It's an imprecise substitute for measurement, but a meter isn't mandatory — understanding *why* oxygen matters and applying it deliberately gets you most of the benefit. One shared reference measurement (e.g. splitting the cost of a meter among several homebrewers, per [[managing-fermentation]]) is enough to calibrate a system once.
- **Filling a fermenter over two days (double batch)**: oxygenate and pitch on day one as normal, then oxygenate again when the second batch is added the next day — don't treat it as a single oxygenation event just because it's one fermenter.

## Don't Confuse ppm and ppb

Two completely different measurement scales are in play, using different instruments:
- **Wort, pre-fermentation**: measured in **ppm (mg/L)** — target 8–14 ppm.
- **Finished, packaged beer**: measured in **ppb** — 50–100 ppb is already enough to visibly oxidize a finished beer. 1 ppm = 1,000 ppb.

Mixing these scales up (e.g. treating a wort oxygenation meter and a packaged-beer TPO meter as interchangeable) leads to serious errors in either direction. See [[cold-dry-hopping-and-oxygen-control]] for the ppb-scale, post-fermentation side of oxygen management.

## Strain-Specific Requirements

Requirement varies a lot by strain lineage. English and Belgian strains generally need more oxygen than American ones — historically, those traditions fermented in open, shallow vessels (e.g. square Belgian abbey fermenters) with much more surface contact with air, and the strains evolved accordingly. One documented example: the English strain **Bermondsey** (Vermont Yeast Labs) needs **~16 ppm** — double the ~7–8 ppm ceiling air alone can deliver — which makes pure O₂ injection mandatory for that strain, not optional. See [[liquid-yeast-strains]] for more strain profiles.

## Fit Oxygenation Into the Whole Fermentation Protocol

Inoculation rate, oxygen, nutrients, and temperature all need to move together, not be tuned in isolation:
- A fresh lab pitch and a harvested slurry aren't interchangeable — a harvested pitch already carries more biomass.
- Fermenting at the low end of a strain's range (e.g. 17°C) versus the high end (e.g. 20.5°C) changes what the rest of the protocol should look like.
- High-gravity worts (e.g. 1.080 with a dextrose adjunct) need proportionally more of all three — inoculum, oxygen, and nutrients — scaled up together, not just one of them. Dextrose in particular brings fermentable sugar with zero nutrient content, which combined with high-gravity osmotic stress is close to a guaranteed stuck fermentation if the rest of the protocol isn't scaled to match.

## Related

[[managing-fermentation]] · [[liquid-yeast-strains]] · [[choosing-a-yeast-strain]] · [[cold-dry-hopping-and-oxygen-control]] · [[yeast-metabolism-and-flavor-byproducts]]
