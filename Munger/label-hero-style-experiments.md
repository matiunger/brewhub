# Munger Brewing — Hero Illustration Style Experiments

**Companion doc** — does **not** replace `label-prompt-guidelines.md`.

Use this when trying a different **main hero** drawing style while keeping brand rules (logo, shield layout, naming, versioning, no glassware, attribute-based type).

| Doc | Role |
| --- | --- |
| `label-prompt-guidelines.md` | **Canonical** production system (linocut / vintage German poster badge) |
| `label-hero-style-experiments.md` | **This file** — alternate hero craft options to A/B test |

---

## What stays fixed (always)

Copy these from the canonical guidelines — only the **hero rendering style** changes:

- Shield badge, dashed border, white outside, logo on top (`munger.png` via `image_edit`)
- Style name only (no nicknames); type echoes beer attributes (light, crisp, round, full…)
- Hero from origin / landscape, craft vessels, ingredients, aromas — **no glasses / steins / mugs**
- Hero **integrates with the whole badge** — no rectangular postcard window / hard straight crop (see below + canonical `Hero–badge integration`)
- Limited flat palette by beer family; German / Bavarian (or orchard) mood
- Save as `{style-slug}-v{N}.jpg` — **never overwrite**
- Output folder: `Munger/labels/`

Optional naming suffix for experiments: `{style-slug}-{style-key}-v{N}.jpg`  
e.g. `munich-helles-travelposter-v1.jpg`, `munich-dunkel-botanical-v1.jpg`

---

## Recommendation (start here)

### Primary pick: **Alpine travel poster** (German / Austrian advertising art, ~1920–1960)

**Why this fits Munger best right now**

- Your strongest Helles heroes are already *place-based* (Alps, Frauenkirche, beer garden). Travel-poster craft is built for that: layered depth, clear silhouette, sunny optimism.
- Still flat-color and badge-friendly — doesn’t fight the shield or the logo.
- Clear visual step away from **linocut cross-hatching** without going photographic or 3D.
- Reads “German beer culture / holiday gemütlichkeit,” not tattoo flash or British maritime.
- Scales well across styles: bright Helles, harvest Märzen, orchard cider; dunkels can shift to dusk/warm copper light in the same language.

**How it differs from the canonical linocut**

| | Canonical linocut | Travel poster hero |
| --- | --- | --- |
| Line | Bold black outline, heavy hatch/stipple | Clean contour, less dense hatch |
| Form | Engraved / woodcut texture | Flat gouache-like shapes, soft poster shading |
| Scene | Still-life cluster or compressed scene | More air, horizon, sky bands, scenic depth |
| Mood | Craft-print workshop | Holiday postcard / brauerei ad |
| Integration | Motifs on continuous field | Same rule — **must not** become a boxed landscape panel |

**Use when:** Helles, pils, festbier, kölsch, cider — anything with landscape or “place” story.

**File key:** `travelposter`

### Critical: integrated hero (not a picture-in-a-box)

What works in `munich-dunkel-travelposter-v1` and `hoppy-lager-travelposter-v1`: the scene **is** the badge middle — hops, poles, barrels, sky, and hills meet the solid color field; edges are soft or broken by motifs; logo and title sit on the same continuous surface.

What fails in early `munich-helles-travelposter` versions: a **straight-edged rectangular window** (hard top/bottom/side crop) like a mini painting taped onto the shield. That reads as three stacked bands (logo | picture | type) instead of one badge.

**Always prompt (travel poster especially):**

```text
The hero must fully integrate with the whole badge: no rectangular picture window, no straight-edged postcard frame, no hard horizontal or vertical crop box inside the shield. Landscape and objects bleed softly into the solid badge color field; trees, hop poles, barrels, hills, or foliage may break the edge of the scene so logo, art, and title share one continuous surface — like hoppy-lager-travelposter and munich-dunkel-travelposter, not a framed inset.
```

---

### Strong second: **Botanical wood-engraving** (naturalist still-life)

**Why**

- Perfect when the story is **ingredients + aroma** (hops, malt, pear, citrus) rather than city/mountain.
- Feels craft and heritage without steins/glasses.
- Differentiates Session IPA / hoppy lager / pear cider from place-based lagers.

**Tradeoff:** Weaker for Frauenkirche / beer-garden narratives; keep those in travel-poster or linocut.

**File key:** `botanical`

---

### Strong third: **Copperplate / bookplate etching**

**Why**

- Elegant, cellar-and-barrel gravitas for **Dunkel, bock, stout**.
- Fine parallel lines and soft plate-tone instead of chunky linocut.
- Feels “old Munich brauerei ledger / ex-libris.”

**Tradeoff:** Can look too dark or busy on small bottle faces; keep hero cluster simple.

**File key:** `etching`

---

## Other styles (worth testing later)

Ranked for fit with the existing badge system:


| Rank | Style key        | Look                                              | Best for                         | Risk                                      |
| ---- | ---------------- | ------------------------------------------------- | -------------------------------- | ----------------------------------------- |
| 1    | `travelposter`   | Alpine / Munich advertising poster                | Helles, fest, place-led labels   | Low                                       |
| 2    | `botanical`      | Naturalist wood-engraving, specimen still-life    | IPA, hoppy lager, cider, wheat   | Low                                       |
| 3    | `etching`        | Copperplate, fine hatch, bookplate                | Dunkel, bock, porter             | Medium (busy)                             |
| 4    | `gouache`        | Soft opaque paint, mid-century storybook          | Malty / round beers, cider       | Medium (can look cute, less “badge”)      |
| 5    | `silkscreen`     | Bold 2–3 color print, hard registration edges     | Hoppy / modern styles            | Medium (may clash with logo detail)       |
| 6    | `jugendstil`     | German Art Nouveau, ornamental curves, flora      | Specialty, wheat, floral sours   | Medium (ornament can swamp hero)          |
| 7    | `bauhaus`        | Geometric flat shapes, limited grid               | Experimental / hoppy             | Higher (cold vs gemütlich)                |
| 8    | `risograph`      | Contemporary grain, misregister, neon accents     | Modern IPA                       | Higher (can break vintage logo cohesion)  |

**Avoid for this brand (unless a deliberate one-off):** photorealism, 3D render, sailor/tattoo flash, British maritime woodcut, anime, pure blackletter collage without a clear hero.

---

## How to run an experiment

1. Keep canonical layout: logo → hero → style name.
2. Swap **only** the hero craft paragraph (keep paper-texture background language).
3. Keep palette family + no-glass + style attributes for type.
4. Save as `{style-slug}-{style-key}-v{N}.jpg`.
5. Compare side-by-side with the linocut version of the same beer (e.g. `munich-helles-v1.jpg` vs `munich-helles-travelposter-v1.jpg`).

### Prompt skeleton (style experiment)

```text
Create a vintage craft-beer bottle label badge. Vertical shield shape with a flat top and rounded U-shaped bottom, thin dashed rope-like border, isolated on pure white. Solid [BACKGROUND_COLOR] fill with subtle vintage paper texture only — fine fiber grain, soft aged paper tooth; no motif doodles or repeated icons in the background. Do not include beer glasses, steins, or mugs anywhere.

At the very top, place the MUNGER BREWING logo exactly as in the reference: arched MUNGER, curved underline, BREWING in small caps. Adapt logo to cream/off-white. Do not redraw letterforms.

HERO ILLUSTRATION STYLE: [STYLE_PARAGRAPH]

Centered hero subject: [HERO_SUBJECT] — origin / craft / ingredients / aroma cues; no glassware. The hero must fully integrate with the badge: no rectangular picture window or straight-edged postcard frame; scene bleeds into the solid field. Large distressed vintage display typography reading "[BEER_STYLE]" — letterforms shaped to feel [STYLE_ATTRIBUTES]; whimsical hand-set layout preferred (slight incline, uneven baseline, playful stagger — still fully legible). Limited flat palette of [COLOR_1], [COLOR_2], cream, and black. German / Bavarian craft-brewery mood.
```

---

## Style paragraphs (drop into `STYLE_PARAGRAPH`)

### 1. Travel poster — **recommended first test**

```text
Paint the hero as classic German/Austrian alpine travel-poster illustration (1920s–1950s advertising art): flat gouache-like color shapes, clean contours, soft sky gradients in bands, clear silhouettes, gentle depth with a horizon, sunny and inviting — not heavy linocut cross-hatching, not photoreal, not 3D. Keep it poster-flat so it sits on a craft-beer badge. The scene must integrate with the whole shield: no rectangular picture window, no straight crop box; art bleeds into the solid badge field; foreground motifs break the scene edge so logo, hero, and title share one continuous surface.
```

**Helles example hero:** Alps + sun + Frauenkirche + beer garden tables under chestnut trees (empty tables — no glassware) — **open composition** bleeding into sky-blue field, not a boxed postcard.

### 2. Botanical wood-engraving

```text
Draw the hero as a naturalist botanical wood-engraving: precise plant forms, fine parallel grain lines, specimen-like clarity, cream paper feel in the highlights — hop vines, grain ears, fruit, and blossoms as a scientific still-life, not a tourist scene. Avoid dense linocut chunkiness; favor engraved plant detail.
```

**IPA / hoppy lager example hero:** hop bine cluster, leaves, cones, citrus slices (no glass).

### 3. Copperplate etching

```text
Render the hero as a copperplate bookplate etching: fine parallel hatching, soft plate tone, elegant dark-light modeling on barrels, kettles, and malt — refined cellar gravitas, not chunky poster linocut. Keep the composition open enough to read at badge size.
```

**Dunkel example hero:** oak barrel, copper kettle steam, dark malt pile, barley ears.

### 4. Soft gouache (optional)

```text
Illustrate the hero in soft opaque gouache, mid-century European picture-book craft: rounded forms, velvety flat color, gentle shadow blobs, warm and friendly — still limited palette, no watercolor bleed chaos, no photo texture.
```

### 5. Silkscreen (optional)

```text
Treat the hero as a limited-color silkscreen print: 2–3 hard-edged ink layers, slight misregistration optional, bold shapes, minimal internal line — graphic and modern while staying inside the badge.
```

---

## Suggested first A/B set

| File to generate                         | Style          | Beer          | Why                                      |
| ---------------------------------------- | -------------- | ------------- | ---------------------------------------- |
| `munich-helles-travelposter-v1.jpg`      | Travel poster  | Munich Helles | Best test of place-led hero language     |
| `munich-dunkel-etching-v1.jpg`           | Etching        | Munich Dunkel | Tests dark, rich gravitas                |
| `session-ipa-botanical-v1.jpg`           | Botanical      | Session IPA   | Tests ingredient/aroma-led hero          |
| `pear-cider-botanical-v1.jpg`            | Botanical      | Pear Cider    | Orchard still-life without a glass       |

After 2–3 experiments, pick **one** hero craft for the whole line (or allow travel poster for lagers + botanical for hop/fruit) and fold the winner into a future revision of `label-prompt-guidelines.md`.

---

## Decision guide (quick)

```
Is the story mostly PLACE (city, Alps, garden, harvest landscape)?
  → travelposter

Is the story mostly INGREDIENTS / AROMA (hops, fruit, grain)?
  → botanical

Is the beer DARK / HEAVY / CELLAR (dunkel, bock, stout)?
  → etching  (or travelposter at dusk)

Want one system for the whole lineup with least risk?
  → travelposter
```

---

## Checklist for style experiments

- [ ] Canonical layout + logo reference still used
- [ ] Hero style paragraph is explicit (named craft + “not linocut” if needed)
- [ ] Hero **integrates** with badge (no rectangular inset / straight crop box)
- [ ] No glasses / steins / mugs
- [ ] Type still matches beer attributes; whimsical layout OK if legible
- [ ] New versioned filename with optional `-{style-key}-`
- [ ] Did **not** casually overwrite `label-prompt-guidelines.md` (integration rule may live in both docs)

---

## Reference

- Canonical system: `Munger/label-prompt-guidelines.md`
- Logo: `Munger/munger.png`
- Layout inspiration (linocut baseline): `Munger/paulsmalt_old_images/`
- Labels output: `Munger/labels/`
