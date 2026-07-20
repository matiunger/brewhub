# Yeast Metabolism and Flavor Byproducts

*Via the Birra Podcast, "Metabolismo de levaduras" (T1E05), an interview with brewing scientist Diego Perrotta. The biochemistry behind the practical levers in [[managing-fermentation]] — read that page for the how-to, this one for the why.*

Every brewing process step is stress on yeast: it prefers to grow at 28–30°C, not the 12–20°C brewers ferment at, and it doesn't "want" the CO₂ and alcohol it's producing. Brewing is the craft of directing that stress toward the flavor outcome you want, using pitch rate, temperature, and dissolved CO₂/oxygen as the levers.

## How Esters Form

An ester forms from the reaction of an alcohol with an acid:
- The acid side comes from **acetyl-CoA**, produced when pyruvate is decarboxylated (glucose → pyruvate → acetyl-CoA).
- The alcohol side is either ethanol, or a higher/fusel alcohol from the amino-acid degradation pathway (see below).
- **Acetate esters** (acetyl-CoA + a higher alcohol — e.g. isoamyl acetate, banana) occur at much higher concentration than **ethyl esters** (a fatty-acid CoA + ethanol) — acetate esters dominate most beer aroma profiles.

The enzyme responsible, **acetyltransferase (ATF)**, is genetically and ploidy-dependent — how many gene copies a strain carries and mutations in ATF's regulatory regions determine how ester-forward that strain is. **This means strain selection is the first and largest lever**: no amount of temperature or pitch-rate manipulation makes a genuinely low-ester strain produce big fruity esters.

> Isoamyl acetate (the "banana" ester) is sold commercially as a mixture of stereoisomers — same formula, different 3D structure — one reads as classic banana, the other as pear/tutti-frutti. This is part of why "banana" character varies so much between strains and beers.

## Levers That Increase Esters (once you've picked an ester-forward strain)

- **Raise fermentation temperature** — the simplest, first-line tool for more ester character.
- **More glucose in the wort → more esters.** The chain is direct: more glucose raises pyruvate, which raises acetyl-CoA, which raises acetate ester production (e.g. more isoamyl acetate/banana character). This is one reason bottle-conditioned beers can develop solvent-like ethyl acetate: priming sugar raises acetyl-CoA right as the (often warmer) refermentation temperature is also pushing ester formation — with ethanol already abundant, ethyl acetate becomes close to inevitable. Commercial brewers manage this by refermenting with a **different, low-ethyl-acetate-producing strain**, not necessarily their primary fermentation strain.
- **Reduce dissolved oxygen** and **under-pitch** — both increase ester formation, and are used together for styles like NEIPA and Hefeweizen. Under-pitching works because yeast sensing abundant nutrients relative to its own population accelerates its own metabolism (racing to reproduce), which increases ester output as a side effect. Watch the tradeoff: under-pitching also increases higher/fusel alcohols (see below), so pair it with careful temperature control rather than using it in isolation.
- **Fermenter geometry** may matter too (see [[managing-fermentation]] for Strong's "shallower fermenters, more esters" observation) — consistent with yeast under more physical/CO₂ stress producing more esters.

## Levers That Suppress Esters

- **Positive CO₂ pressure in the fermenter** (roughly 0.25–0.5 bar, strain-dependent) inhibits the oxidative decarboxylation step that produces acetyl-CoA — the enzyme is present but starved of substrate because the wort can't accept more dissolved CO₂. Once you've hit your target ester profile, closing the fermenter to build pressure is a way to stop further ester formation on purpose. This has a second benefit if you're dry hopping at the same time: the same pressure also improves hop essential oil solubility (see [[hopping]]).

## Higher (Fusel) Alcohols — the Ehrlich Pathway

Higher alcohols form via the **Ehrlich pathway**: amino acid → keto-acid → aldehyde → higher alcohol. Not every amino acid feeds this pathway — leucine and isoleucine are among the ones that do, and yeast processes them sequentially rather than all at once. In moderation these add aromatic complexity; in excess they read as hot/solvent-like.

- **Temperature is the main control lever** for higher alcohols — they increase with fermentation temperature.
- **High-gravity worts make higher alcohols nearly unavoidable** because amino acid concentration scales with gravity. The practical goal shifts from "prevent formation" to "manage how much forms and help it convert into esters/integrate" rather than eliminating it outright — aging time also helps integrate higher alcohols in strong beers.
- **Reduce free amino nitrogen (FAN)** by replacing part of the grain bill with unmalted adjuncts, honey, or fruit juice — less protein input means less Ehrlich-pathway substrate.
- **Progressive/gradual wort feeding**: for very high-gravity beers, start yeast on a lower-gravity wort and add more wort progressively rather than pitching into full-strength wort at once. This lets the yeast acclimate gradually to rising alcohol and osmotic stress, and spreads the amino-acid/higher-alcohol load across the fermentation instead of front-loading it.
- **More oxygen at pitching helps at high gravity specifically**: oxygen drives ergosterol synthesis, which stabilizes the cell membrane against ethanol's solvent effect on lipids. This doesn't replace temperature control, though — even a well-oxygenated, well-pitched high-gravity fermentation will still overproduce higher alcohols without temperature discipline.
- **A gentle temperature ramp-down beats a sharp crash** for high-gravity beers — a gradual decline (shaped as much by fermenter geometry and cooling system as by the setpoint) gives yeast more time to keep working and convert higher alcohols into esters, versus stopping that conversion abruptly.

## Acetaldehyde

Acetaldehyde sits directly in the main fermentation pathway (glucose → pyruvate → **acetaldehyde** → ethanol) — it's the expected intermediate right before ethanol. It accumulates as an off-flavor (green apple) when fermentation is stressed or left incomplete, since the yeast hasn't finished converting it through to ethanol.

**Strain-specific example**: US-05 doesn't produce diacetyl but does generate acetaldehyde at low concentration. Rather than the classic diacetyl rest, ferment at ~17°C and then raise to 20°C for an **acetaldehyde rest** — the yeast consumes the accumulated acetaldehyde at the higher temperature, giving a clean, pseudo-lager profile well suited to a Golden Ale without sulfur character.

## Yeast as an Oxygen Scavenger in Packaging

Some commercial breweries (cited: Sierra Nevada, Founders) add a **micro-dose of fresh yeast and sugar** to already-carbonated cans/bottles — not to referment, but purely so the yeast consumes the trace oxygen picked up during packaging. The dose is small enough to avoid turbidity, sediment, or over-carbonation; a strain and quantity are chosen specifically for this scavenging role.

## Practical Strain Notes from the Episode

- **US-05 vs. US-04 for cold storage/reharvesting**: US-05 tolerates cold storage far better — US-04 viability drops quickly and it's very temperature-sensitive (a small swing can trigger premature flocculation and a stuck fermentation). For a brewery reharvesting yeast repeatedly, US-05 is the more practical choice to keep on hand.
- **Stretching one strain across styles**: US-05 can stand in for US-04 on a Scottish/Scotch Ale by under-pitching slightly and fermenting warmer than you would for an American IPA — not identical, but close enough when a dedicated English strain isn't available. Example: a ~1.075 OG Scotch Ale on US-05 at 22–23°C for more ester character, versus 18°C on the same strain and wort for a cleaner profile — same strain, very different beer, purely from pitch rate and temperature.
- **A well-chosen strain and controlled temperature at moderate gravity (~1050–1060, e.g. a typical NEIPA) shouldn't show problem-level higher alcohols** — if they show up at that gravity, suspect strain choice or temperature control before blaming the recipe.

## The Growth Curve and Why Oxygen/Nutrients Matter When They Do

*Via the Birra Podcast, T2E10 ("Fundamentos de microbiología").* Yeast growth runs through four phases, and knowing which phase needs what explains why oxygen and nutrient timing are so specific rather than "more is always better":

1. **Lag** — no visible growth; the cell is building the biological machinery it needs before it can start dividing. This is the phase where dissolved oxygen gets used to synthesize **ergosterol**, a membrane compound (analogous to cholesterol) that gives the cell membrane fluidity and transport capacity. Without oxygen here, ergosterol synthesis doesn't happen — which is why oxygen timing matters so specifically at pitching (see [[oxygenating-wort]]).
2. **Exponential** — mass growth and division. The ergosterol built during lag phase gets divided up among all the daughter cells produced here — by the end of this phase, each cell's individual ergosterol reserve is far more diluted than it was in the original pitch.
3. **Stationary** — nutrients run out, net growth stops. The cell shifts to storing glucose as **glycogen** (yeast's equivalent of starch) to prepare for the nutrient-poor conditions ahead. By this point ergosterol reserves are already thin.
4. **Decline** — death rate exceeds birth rate; risk of autolysis rises the longer yeast sits here.

This is the mechanistic reason harvested/reused yeast isn't ready to just re-pitch without support: a cell coming out of fermentation has already spent its ergosterol and is relying on stored glycogen, not fresh membrane material — it needs new oxygen (and often nutrients) at the next pitch to rebuild that capacity, exactly as [[oxygenating-wort]] and [[managing-fermentation]] describe.

## Related

[[managing-fermentation]] · [[understanding-attenuation]] · [[choosing-a-yeast-strain]] · [[hopping]] · [[fermenting-lagers]] · [[oxygenating-wort]]
