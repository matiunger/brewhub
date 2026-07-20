# Hop Stand Chemistry and Technique

*Via the Birra Podcast, "Hop stand y la química del lúpulo en el lado caliente" (T2E07). Complements [[whirlpooling]] (mechanical trub separation) and [[hopping]] (addition strategy overall).*

A hop stand (steeping hops in hot, post-boil wort before chilling) behaves very differently from a boil addition because nothing is being isomerized or driven off by a rolling boil — extraction here is about solubility and volatility, not bittering chemistry.

## The Three Families of Hop Oil

- **Hydrocarbons** (myrcene, farnesene, caryophyllene) — 40–80% of total hop oil. Myrcene is the most abundant single compound but also the most volatile and least water-soluble; it mostly survives only when hops are added cold (below ~8°C), which is one reason cold dry hopping tastes different from a hot-side addition.
- **Oxygenated compounds** (linalool, geraniol, citronelol, plus various aldehydes and ketones) — roughly 30% of total oil, and the most important family for hop stand/whirlpool work specifically, because they're more resistant to volatilization and oxidation than the hydrocarbons. A variety like **Bravo** owes its strong floral character to high geraniol.
- **Thiols (sulfur compounds)** — under 1% of total oil, but responsible for grapefruit, mandarin, passionfruit, mango, and papaya notes at an extremely low detection threshold — small enough that they can dominate the nose even at 100x lower concentration than myrcene. High-dose cold dry hopping can push these the wrong way into garlic/onion territory.

**Practical takeaway:** when choosing hops specifically for a hot-side addition (whirlpool/hop stand), prioritize varieties known for high oxygenated-compound content — they're the ones that will actually survive the process. See [[characterizing-hops]] and [[selecting-hops]] for variety picks by technique.

## The "Survivals" Concept

Not every compound extracted in the hop stand makes it to the glass — some are lost to the whirlpool, to CO₂ scrubbing during fermentation, and to further processing. "Survivals" refers to the fraction of extracted aroma compounds that actually survive that whole chain. Hops with high survivals (Bravo, Columbus, Idaho 7 — roughly 3x Cascade's survival rate) are disproportionately efficient choices for whirlpool/hop stand use; save low-survival varieties like Cascade for dry hopping, where there's no fermentation to scrub them out. (Source concept: Scott Janisch, "Survivals: Unpacking Hot Side Hop Flavor.")

## Temperature

Target **80–95°C** for the hop stand — this range maximizes essential-oil solubility, minimizes further isomerization (avoids adding unplanned bitterness), minimizes volatilization loss, and is still hot enough to prevent microbial contamination. Below 80°C, oil solubility drops and a woody off-character can appear; above 95°C, volatilization losses climb.

Within that window, temperature also shapes *which* profile you extract:
- **90–95°C** favors resinous and floral profiles.
- **80–90°C** favors citrus and fruity profiles.
- **85–90°C** is a reasonable compromise when steeping a blend of varieties that span both profiles.

## Contact Time

Extraction only really gets going after **~40 minutes** of contact — a 15–20 minute stand wastes much of the hop charge because the oils haven't had time to dissolve into the wort. As a rate of thumb scaled to hop load:

| Dose | Minimum contact time |
|------|----------------------|
| 2 g/L | ~30 min |
| 4 g/L | ~45 min |
| 6 g/L | ~60 min |
| 8+ g/L | ~75–90 min |

Higher doses extract less efficiently per gram, hence the longer contact time. **Sequence matters**: the clock starts when hops go in, continues through whirlpool (recirculation counts toward contact time), continues through the resting/settling period, and stops when active chilling begins — chilling time itself is not counted as part of the hop stand.

*Via the Birra Podcast, T1E02.* A homebrew-scale version of the same idea: **10 minutes of pump recirculation** (to fully integrate the hops into the wort) followed by **~40 minutes of undisturbed rest** (settled hop material keeps transferring flavor/aroma from the bottom of the pot, not just while suspended). Scale the rest period to dose: ~30 min rest for a light addition (<3 g/L), up to ~70 min rest (plus 15 min pump) for an intense one (10–12 g/L, e.g. an Imperial IPA). As a dosing anchor, a single hot-side addition typically runs from **2–3 g/L at minimum up to 10–13 g/L** for very aggressively hopped styles.

**Vary variety by addition, not just amount.** The same hop variety produces a noticeably different flavor/aroma profile in whirlpool vs. dry hop — so rather than using one variety across every addition, pick varieties suited to what each stage extracts well (see [[selecting-hops]]), and let the balance of whirlpool vs. dry hop shift by style: e.g. a strong whirlpool with no dry hop for an American Amber Ale, versus a restrained whirlpool with a heavy dry hop for a Session APA. A **double whirlpool** — one variety added at flame-off, a second variety added ~10–15 minutes later once the wort is down to ~80°C, each given its own rest — is one way to extract two distinct profiles in the same batch.

## Cooling Without a Chiller

Two low-tech methods for hitting the target hop-stand temperature and then dropping it:
- **Frozen water bottle**: freeze a 1 L bottle of treated (dechlorinated) water the day before. Brew slightly more concentrated than the final recipe target, then add the frozen water to simultaneously cool the wort into the 80–95°C range and dilute to the target OG.
- **Cold water dilution**: add treated, dechlorinated cold water directly to the hot wort — the wort's own heat pasteurizes the added water. This does add some dissolved oxygen (an acceptable tradeoff at this stage), but has worked reliably in practice for years. A contraflow chiller (thick-tube design) also works well here; avoid a plate chiller on wort that's still turbid post-whirlpool — it clogs, is hard to clean, and can contaminate subsequent batches.
  - **Rule of thumb**: diluting with X% cold water drops the temperature by roughly X°C — adding 20% cold water cools the wort about 20°C. Don't push past ~20% dilution, or you start losing sugar extraction from the reduced sparge volume upstream.
  - **Practical batch method**: size the recipe for your full target volume, but boil a smaller, more concentrated volume — vigorously, without worrying about the reduced volume, since the boil's job here is protein coagulation and driving off unwanted compounds. At flame-off, dilute with cold treated water to hit both the target OG and the target hop-stand temperature in one step. Example at scale: target 1000 L, boil 900 L vigorously for 75+ minutes down to ~850 L, then add 150 L of cold dechlorinated water at flame-off to land around 80–85°C — the same ratio scales down to any homebrew batch size.

## DMS Is a Boil Problem, Not a Hop Stand Problem

A vigorous **25–40 minute boil** drives off DMS precursors (SMM). If the boil did its job, an extended hop stand afterward does not regenerate meaningful DMS — there's nothing left to convert. If the boil was too short or too gentle and precursors remain, the 80–90°C hop stand temperature range *can* form DMS, since there's no more boiling to evaporate it off. In other words: fix an underboiled wort at the boil, not by shortening the hop stand.

A real-world commercial protocol using this reasoning: 15 minutes of whirlpool with pump recirculation, 60 minutes rest/settling, 40 minutes of active cooling — about 2 hours from flame-off to fermenter, with no detectable DMS.

## Whirlpool as Biotransformation Feedstock

Hop stand/whirlpool additions load the wort with compounds that yeast can further transform into new flavor and aroma during active fermentation — it's a foundational input for biotransformation, not just a standalone aroma technique.

## Related

[[characterizing-hops]] · [[selecting-hops]] · [[hopping]] · [[whirlpooling]] · [[cold-dry-hopping-and-oxygen-control]] · [[managing-the-boil]]
