# Munger Brewing — Beer Label Prompt Guidelines

Style system derived from Paul’s Malt vintage badge art (`paulsmalt_old_images/`). Use this to generate consistent craft-beer labels for different beer styles.

Keep the **layout and illustration craft** of those badges (shield shape, bold linocut type, flat limited palette, logo on top). Keep the **mood** toward German / Bavarian beer culture — warm, grounded, festival-and-kellerhaus feeling

**Logo:** Always include the Munger Brewing wordmark at the **top of the badge**. Prefer `image_edit` with the logo file as a reference so letterforms stay accurate.

- Logo file: `Munger/munger.png` (or the uploaded wordmark asset)
- Output folder: `Munger/labels/`

**Aspect ratio:** `1:1` (crop to the shield later if needed for bottles)

**Beer naming (on the label):** Beers do **not** have nicknames. The large hero typography is the **beer style name** only.

**File naming (on disk):** Always version — `{style-slug}-v{N}.jpg`. **Never overwrite** an existing label file. Before each save, check `Munger/labels/` for the next free `N`.

---

## Visual system


| Element         | Pattern                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Format**      | Vertical **shield/badge** (flat top, rounded U-bottom), white outside                                                                                                                                                                                                                                                                                                                                     |
| **Border**      | Thin dashed / rope-like edge                                                                                                                                                                                                                                                                                                                                                                              |
| **Background**  | Solid color field with **subtle vintage paper texture** only (fine fiber grain, soft aged paper tooth, slight uneven ink absorbency) — **no** motif doodles, repeated icons, or pattern fills of hops/grain/etc.                                                                                                                                                                                          |
| **Style**       | Hand-drawn **engraving / linocut / vintage poster** — bold outlines, cross-hatching, stippling, distressed ink                                                                                                                                                                                                                                                                                            |
| **Palette**     | 2–4 flat colors + cream/white; background hue shifts by beer mood                                                                                                                                                                                                                                                                                                                                         |
| **Type**        | One large block of distressed vintage display type: the **beer style name** (e.g. `MUNICH HELLES`, `HOPPY LAGER`). Letterforms **echo the beer’s attributes**; layout may be **whimsical** (inclined, slightly misaligned, uneven baseline, playful stack — see Type &amp; style attributes). No nickname line. Optional tiny secondary line only if needed (ABV, batch note) — never a second brand name |
| **Subject**     | One bold **hero cluster** (not a lone simple icon) — layered scene with 2–4 related elements, rich linocut detail; still reads as a single focal subject                                                                                                                                                                                                                                                  |
| **Integration** | Hero **belongs to the whole badge** — not a rectangular picture window floating inside it (see Hero–badge integration)                                                                                                                                                                                                                                                                                    |
| **Logo**        | **Munger Brewing** wordmark at the top of the badge (arched `MUNGER`, curved underline, spaced `BREWING`)                                                                                                                                                                                                                                                                                                 |
| **Tone**        | Craft-beer badge with **German / Bavarian** warmth — hops, grain, pretzels, alpine hills, brew kettles, wheat sheaves, lion heraldry, oak barrels — playful but grounded, not nautical or sailor-tattoo themed                                                                                                                                                                                            |


### Layout order (top → bottom)

1. **Munger Brewing logo**
2. **Hero illustration**
3. **Beer style name** (large distressed display type — attribute-shaped + optional whimsical layout)

---

## Hero–badge integration

The hero must float or **integrate with the whole label**, not sit in a separate framed panel.

### Rules to enforce in every prompt

1. **No rectangular inset / picture frame / postcard window** around the hero.
2. **No hard straight crop lines** (horizontal or vertical bars that box the scene).
3. Hero art **bleeds into** the solid badge field: edges soft, vignetted, or broken by overlapping motifs (cones, leaves, barrels, trees, hills).
4. Foreground elements may **overlap** into the areas near logo and title so the composition reads as one shield, not three stacked boxes (logo | picture | type).
5. Paper-textured solid field color should **meet** the hero, not stop at a sharp rectangle.

### Prompt language (always include)

```text
The hero illustration must fully integrate with the badge: no rectangular picture window, no straight-edged postcard frame, no hard crop box. Scene elements bleed softly into the solid badge color field; organic edges; foreground motifs may overlap the field so logo, art, and title share one continuous surface.
```

### Negative cues (state explicitly)

```text
Do not draw a framed landscape panel, photo insert, or box with straight top and bottom edges inside the shield.
```

---

## Type &amp; style attributes

There is **no fixed font file** for the style name — the image model draws distressed vintage display lettering. Shape that lettering so it **represents how the beer drinks**, not a random poster font.

When writing the prompt, name 2–4 attributes and map them to type treatment:


| Attribute (examples)     | Type direction                                                                    |
| ------------------------ | --------------------------------------------------------------------------------- |
| **Light / delicate**     | Lighter stroke weight, more open letterspacing, airy counters                     |
| **Crisp / dry / snappy** | Cleaner edges, slightly condensed or angular forms, tight tracking                |
| **Round / soft / malty** | Rounded terminals, fuller bowls, gentler curves                                   |
| **Full / rich / heavy**  | Bold weight, wide stance, solid filled forms, less airy spacing                   |
| **Hop-forward / bitter** | Sharper serifs or spiky energy, slightly irregular “bite” in the distress         |
| **Fruity / floral**      | Softer, more organic curves; playful but still vintage display                    |
| **Dark / roasty**        | Dense, weighty lettering; grounded baseline; optional copper/cream on deep fields |
| **Bright / clean lager** | Balanced classic poster caps; even rhythm; calm, not aggressive                   |


### Whimsical layout (encouraged)

The style name does **not** need to sit as a perfectly straight, machine-aligned block. Prefer **hand-set poster energy** — lively composition that still reads clearly as the style name.

**Allowed / preferred**

- Slight **incline or tilt** of the whole title, or of one line
- **Gentle arc**, bounce, or wave along the baseline
- **Slight letter-to-letter misalignment** (uneven baseline, small rotation or size jitter)
- **Playful stacking** or staggered two-line arrangement (e.g. `HOPPY` above a slightly offset `LAGER`)
- Uneven tracking / organic spacing that feels hand-cut, not InDesign-perfect
- Optional small **overlap** of a letter into nearby foliage or field (still legible)

**Still required**

- Fully **legible** style name (no cryptic jumble)
- **Distressed vintage display** in the linocut world — not modern UI, not neon script, not 3D bevel type
- Attributes still guide **weight, width, roundness, spacing, and edge energy**
- No nickname; no second brand name

**Rules**

- Attributes shape letterform character; **whimsical layout** shapes how the words sit on the badge — use both.
- Put attributes in the prompt explicitly, e.g. `typography that feels light, crisp, and clean for a pale Munich lager`.
- Also invite layout play when it fits, e.g. `whimsical hand-set layout: slight incline, uneven baseline, playful letter stagger — still fully legible`.

---

## Hero philosophy

Heroes should tell the **story of the drink** — not show a pour. Draw inspiration from:


| Source                     | What to show                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Style history / origin** | Landscapes, old towns, seasons, harvest, mountains, rivers, orchards                                   |
| **Cellar &amp; craft**     | Oak barrels, copper kettles, malting floors, hop poles, wooden shovels, barrel heads                   |
| **Ingredients**            | Hops (cones, bines, leaves), barley / wheat ears, malt piles, barley, fruit, herbs, spice              |
| **Aromas &amp; flavors**   | Citrus, stone fruit, blossom, spice, roast, smoke, resin, bread crust — as botanical / still-life cues |


### Avoid in the hero

- **No drinking glasses** 
- **No full steins or mugs of beer** as the main subject
- **No motif doodle patterns** in the background field — paper texture only

Supporting craft objects (barrels, kettles, hop poles, grain) are welcome. The drink is implied through ingredients, place, and mood — not a filled glass.

---

## Base prompt (with logo)

Pass the logo as a reference image. Only swap the bracketed variables.

```text
Create a vintage craft-beer bottle label badge in the style of hand-engraved linocut and classic German beer poster illustration. Vertical shield shape with a flat top and rounded U-shaped bottom, thin dashed rope-like border, isolated on pure white. Solid [BACKGROUND_COLOR] fill with subtle vintage paper texture only — fine fiber grain, soft aged paper tooth, slight uneven ink absorbency; no motif doodles, no repeated icons, no pattern of hops, grain, or other objects in the background. Do not include beer glasses, steins, or mugs anywhere on the badge.

At the very top of the badge, place the MUNGER BREWING logo exactly as shown in the reference image: bold arched wordmark MUNGER with a curved underline and BREWING spaced below in small caps. Adapt the logo to cream or off-white (or black if the background is light) so it stays sharp and legible on the badge color. Do not redraw or restyle the letterforms.

Below the logo, centered hero subject: [HERO_SUBJECT] — a layered, creative composition inspired by the style’s origin landscape, craft vessels (barrels, kettles), ingredients, and aroma/flavor cues — not a pour or glassware. Draw with bold black outlines, rich cross-hatching, stippling, and slightly distressed ink texture. Keep it one clear focal cluster with 2–4 related elements and full craft-poster character. The hero must fully integrate with the badge: no rectangular picture window, no straight-edged postcard frame, no hard crop box; scene elements bleed softly into the solid badge color field so logo, art, and title share one continuous surface. Large distressed vintage display typography in the center or lower half reading “[BEER_STYLE]” in cream or off-white with optional accent color — letterforms shaped to feel [STYLE_ATTRIBUTES] (weight, width, roundness, spacing, and edge energy matching how the beer drinks). Whimsical hand-set poster layout allowed and preferred: slight incline or tilt, gentle arc or bounce, uneven baseline, small letter-to-letter misalignment or size jitter, playful stacking or staggered lines — still fully legible as the style name; not rigid machine-aligned type. This is the main title; do not add a nickname or secondary brand name. Limited flat color palette of [COLOR_1], [COLOR_2], cream, and black. German / Bavarian beer mood: warm, festive, gemutlichkeit, craft-brewery badge.
```

### Variable slots


| Slot                  | Guidance                                                                                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BACKGROUND_COLOR`    | Match beer mood (see palette table); paper texture sits on this solid field                                                                                            |
| `HERO_SUBJECT`        | Layered cluster from history/landscape + craft + ingredients + aroma cues; **no glasses / steins / mugs**                                                              |
| `BEER_STYLE`          | Real style name only, in large display type (e.g. Munich Helles, Hoppy Lager, Pear Cider)                                                                              |
| `STYLE_ATTRIBUTES`    | 2–4 mouthfeel/character words that shape the type (e.g. light, crisp, clean · round, full, malty · bright, hoppy, snappy); pair with whimsical layout cues when useful |
| `COLOR_1` / `COLOR_2` | Accents; keep poster-flat with cream + black                                                                                                                           |


---

## Workflow

1. **Lock the system** — always shield + paper-textured color field + logo on top + one hero + **style name as the only large title**.
2. **Use `image_edit` with the logo reference** — do not rely on pure text-to-image for the wordmark.
3. **Design the hero from story, not serviceware** — origin / landscape + craft vessels + ingredients + aroma/flavor cues; **never a glass**.
4. **Background is paper, not pattern** — solid mood color + subtle vintage paper texture only; never motif doodles or repeated icons in the field.
5. **Vary only mood** — background color, hero, style name; keep paper texture subtle and consistent across the set.
6. **One style anchor (optional)** — if a badge looks perfect, use it as a reference for the next styles so the set matches.
7. **Text accuracy** — image models often garble letters. For final print art, place the real logo (and optionally set the style name) in Figma/Illustrator over the generated illustration.
8. **Save outputs** into `Munger/labels/` with **versioned** names — **never overwrite** an existing file:
  - `{style-slug}-v{N}.jpg` where `N` is the next free integer for that style
  - e.g. `munich-helles-v1.jpg`, `munich-helles-v2.jpg`, `hoppy-lager-v1.jpg`
  - Before saving: list `Munger/labels/{style-slug}-v*.jpg` (and any unversioned `{style-slug}.jpg`) and pick **max N + 1**
  - If only an unversioned file exists (legacy), leave it alone and start at `-v1` or continue from the highest `-vN` already present
  - Optional: keep a symlink or note of “current favorite,” but each generation is always a new numbered file

### Consistency checklist

- [ ] Shield shape, white outside
- [ ] Dashed / rope border
- [ ] Background is solid mood color + **paper texture only** (no motif doodles / repeated icons)
- [ ] Munger logo at top (legible, correct letterforms)
- [ ] One clear **hero cluster** (layered, creative — not a lone simple icon)
- [ ] Hero **integrates with the whole badge** (no rectangular postcard window / straight crop box)
- [ ] **No glasses, steins, or mugs** in the hero
- [ ] Hero draws from origin / landscape, craft (barrels, kettles), ingredients, and/or aroma–flavor cues
- [ ] **Beer style name** as the only large title (no nickname)
- [ ] Style-name letterforms **echo beer attributes** (light/crisp/round/full/etc.)
- [ ] Style-name layout may be **whimsical** (incline, misalignment, uneven baseline) but stays legible
- [ ] German / Bavarian (or orchard) craft mood (not sailor / maritime)
- [ ] Limited flat palette (no photo, no 3D, no heavy gradients)
- [ ] Saved as new `{style-slug}-v{N}.jpg` — **did not overwrite** an existing file

---

## Generated labels

Earlier experiments used nicknames, maritime mood, or glass-forward heroes; keep for reference only. Prefer regenerating under the rules above.


| File                                   | Style         | Notes                                              |
| -------------------------------------- | ------------- | -------------------------------------------------- |
| `labels/hoppy-lager-example.jpg`       | Hoppy lager   | Early example (pre–logo system)                    |
| `labels/hoppy-lager-bitter-tide.jpg`   | Hoppy lager   | Old system: nickname + maritime mood               |
| `labels/munich-helles-true-north.jpg`  | Munich Helles | Old system: nickname + maritime mood               |
| `labels/munich-helles-willibecher.jpg` | Munich Helles | Glass-forward hero (pre–no-glass rule)             |
| `labels/munich-helles.jpg`             | Munich Helles | Legacy unversioned (mountains + Frauenkirche + BG) |
| `labels/session-ipa.jpg`               | Session IPA   | Legacy unversioned; may include glass              |
| `labels/munich-dunkel.jpg`             | Munich Dunkel | Legacy unversioned                                 |
| `labels/hoppy-lager.jpg`               | Hoppy lager   | Legacy unversioned; may include glass              |
| `labels/pear-cider.jpg`                | Pear cider    | Legacy unversioned                                 |


**Going forward:** every new generation uses `{style-slug}-v{N}.jpg` only. Do not replace any of the files above.

---

## Reference sources

- Layout / linocut craft inspiration: `Munger/paulsmalt_old_images/`
- Newer Paul’s Malt SVGs: `Munger/paulsmalt_images/`
- Logo: `Munger/munger.png`

