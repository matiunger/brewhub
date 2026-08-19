# Munger Brewing — Travel Poster Label Prompt Guidelines

**Travel-poster production system** for Munger beer labels.

This is a **standalone variant** of `label-prompt-guidelines.md`. It keeps the same brand rules (shield, logo, naming, versioning, no glassware, attribute type, hero–badge integration) but locks the **hero craft** to classic **German / Austrian alpine travel-poster** illustration (~1920s–1960s advertising art).

| Doc | Role |
| --- | --- |
| `label-prompt-guidelines.md` | Original / linocut-oriented system |
| `label-prompt-guidelines-travelposter.md` | **This file** — travel poster only |
| `label-hero-style-experiments.md` | Multi-style experiments (botanical, etching, etc.) |

**Logo:** Always include the Munger Brewing wordmark at the **top of the badge**. Prefer `image_edit` with the logo file as a reference so letterforms stay accurate.

- Logo file: `Munger/munger.png`
- Output folder: `Munger/labels/`

**Aspect ratio:** `1:1` (crop to the shield later if needed for bottles)

**Beer naming (on the label):** Beers do **not** have nicknames. The large hero typography is the **beer style name** only.

**File naming (on disk):** Always version — `{style-slug}-travelposter-v{N}.jpg`. **Never overwrite** an existing label file. Before each save, check `Munger/labels/` for the next free `N`.

---

## Illustration craft (travel poster)

Paint the hero as **classic German/Austrian alpine travel-poster** art:

- Flat **gouache-like** color shapes
- Clean contours, clear silhouettes
- Soft sky / field color **bands**
- Gentle depth with a horizon
- Sunny and inviting (or warm dusk for dark beers)
- **Not** heavy linocut cross-hatching
- **Not** photoreal, **not** 3D, **not** dense woodcut texture

Keep it poster-flat so it sits on a craft-beer badge with the Munger logo.

| vs linocut | Travel poster |
| ---------- | ------------- |
| Bold black outline + hatch | Clean contour, less dense hatch |
| Engraved / woodcut texture | Flat gouache shapes, soft poster shading |
| Compressed still-life | More air, horizon, sky bands, scenic depth |
| Workshop print mood | Holiday / brauerei advertising mood |

---

## Visual system


| Element         | Pattern                                                                                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Format**      | Vertical **shield/badge** (flat top, rounded U-bottom), white outside                                                                                                                                                          |
| **Border**      | Thin dashed / rope-like edge (layout detail only; not a naval theme)                                                                                                                                                           |
| **Background**  | Solid color field with **subtle vintage paper texture** only (fine fiber grain, soft aged paper tooth) — **no** motif doodles or repeated icons                                                                                |
| **Style**       | **Travel poster** — flat gouache shapes, clean contours, sky/field bands, clear silhouettes                                                                                                                                    |
| **Palette**     | 2–4 flat colors + cream/white; background hue shifts by beer mood                                                                                                                                                              |
| **Type**        | One large block of distressed vintage display type: the **beer style name**. Letterforms **echo the beer’s attributes**; layout may be **whimsical** (inclined, slightly misaligned, uneven baseline, playful stack). No nickname. |
| **Subject**     | One bold **hero scene or cluster** — place, craft, ingredients, aroma; layered but readable                                                                                                                                    |
| **Integration** | Hero **belongs to the whole badge** — not a rectangular postcard window (see Hero–badge integration)                                                                                                                           |
| **Logo**        | **Munger Brewing** wordmark at the top (arched `MUNGER`, curved underline, spaced `BREWING`)                                                                                                                                   |
| **Tone**        | German / Bavarian gemütlichkeit — alpine light, brauerei, hop gardens, orchards; warm and grounded, not sailor / tattoo / maritime                                                                                             |


### Layout order (top → bottom)

1. **Munger Brewing logo**
2. **Hero illustration** (travel-poster scene, integrated)
3. **Beer style name** (display type — attribute-shaped + optional whimsical layout)

---

## Hero–badge integration

The hero must **integrate with the whole label**, not sit in a separate framed panel.

**Good (target):** `hoppy-lager-travelposter-v1`, `munich-dunkel-travelposter-v1`, `munich-helles-travelposter-v3` — scene elements grow out of the solid color field; hops, barrels, hills, or sky **bleed into** the badge ground; soft or organic edges; logo and title share the same continuous surface.

**Bad (avoid):** Early Helles travel-poster tendency — a **hard rectangular “postcard” window** with straight top/bottom/side edges, like a photo pasted on the shield. That splits the badge into logo | picture | type.

### Rules to enforce in every prompt

1. **No rectangular inset / picture frame / postcard window** around the hero.
2. **No hard straight crop lines** (horizontal or vertical bars that box the scene).
3. Hero art **bleeds into** the solid badge field: edges soft, vignetted, or broken by overlapping motifs (cones, leaves, barrels, trees, hills, hop poles).
4. Foreground elements may **overlap** toward logo and title so the composition reads as **one shield**, not three stacked boxes.
5. Paper-textured solid field color should **meet** the hero, not stop at a sharp rectangle.

### Prompt language (always include)

```text
The hero must fully integrate with the whole badge: no rectangular picture window, no straight-edged postcard frame, no hard horizontal or vertical crop box inside the shield. Landscape and objects bleed softly into the solid badge color field; trees, hop poles, barrels, hills, or foliage may break the edge of the scene so logo, art, and title share one continuous surface.
```

### Negative cues (state explicitly)

```text
Do not draw a framed landscape panel, photo insert, or box with straight top and bottom edges inside the shield.
```

---

## Type & style attributes

There is **no fixed font file** for the style name — the image model draws distressed vintage display lettering. Shape that lettering so it **represents how the beer drinks**.

| Attribute (examples)     | Type direction                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| **Light / delicate**     | Lighter stroke weight, more open letterspacing, airy counters                                 |
| **Crisp / dry / snappy** | Cleaner edges, slightly condensed or angular forms, tight tracking                            |
| **Round / soft / malty** | Rounded terminals, fuller bowls, gentler curves                                               |
| **Full / rich / heavy**  | Bold weight, wide stance, solid filled forms, less airy spacing                               |
| **Hop-forward / bitter** | Sharper serifs or spiky energy, slightly irregular “bite” in the distress                     |
| **Fruity / floral**      | Softer, more organic curves; playful but still vintage display                                |
| **Dark / roasty**        | Dense, weighty lettering; grounded baseline; optional copper/cream on deep fields             |
| **Bright / clean lager** | Balanced classic poster caps; even rhythm; calm, not aggressive                               |

### Whimsical layout (encouraged)

The style name does **not** need to sit as a perfectly straight, machine-aligned block. Prefer **hand-set poster energy** — lively composition that still reads clearly as the style name.

**Allowed / preferred:** slight incline or tilt; gentle arc, bounce, or wave; slight letter-to-letter misalignment (uneven baseline, small rotation or size jitter); playful stacking or staggered two-line arrangement; uneven organic tracking; optional soft overlap of a letter into nearby foliage (still legible).

**Still required:** fully legible style name; distressed vintage display (not modern UI / neon script / 3D type); attributes still guide weight, width, roundness, spacing, and edge energy; no nickname.

**Rules**

- Still **distressed vintage display** that fits a travel-poster badge — not a modern UI font.
- Attributes shape letterform character; **whimsical layout** shapes how the words sit on the badge — use both.
- State attributes explicitly, e.g. `typography that feels light, crisp, and clean for a pale Munich lager`.
- Invite layout play when it fits, e.g. `whimsical hand-set layout: slight incline, uneven baseline, playful letter stagger — still fully legible`.

---

## Hero philosophy

Heroes should tell the **story of the drink** — not show a pour. Travel poster favors **place and landscape**, but craft and ingredients still belong in the scene.

| Source                     | What to show                                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| **Style history / origin** | Alps, Munich skyline, Frauenkirche, river plains, hop gardens, orchards, harvest hills             |
| **Cellar & craft**         | Oak barrels, copper kettles, hop poles, brauerei roofs, cider press                                |
| **Ingredients**            | Hops (cones, bines), barley / wheat, malt piles, fruit, blossoms                                   |
| **Aromas & flavors**       | Citrus, blossom, roast, bread crust — as props in the landscape, not a lab still-life only         |
| **Light**                  | Bright noon / soft sun for pale beers; warm dusk / copper sky for dunkel, bock, dark beers         |

### Avoid in the hero

- **No drinking glasses** (Willibecher, pilsner glass, tulip, stein, etc.)
- **No full steins or mugs of beer** as the main subject
- **No motif doodle patterns** in the background field — paper texture only

The drink is implied through place, ingredients, and mood — not a filled glass.

---

## Base prompt (with logo)

Pass the logo as a reference image. Only swap the bracketed variables.

```text
Create a vintage craft-beer bottle label badge. Vertical shield shape with a flat top and rounded U-shaped bottom, thin dashed rope-like border, isolated on pure white. Solid [BACKGROUND_COLOR] fill with subtle vintage paper texture only — fine fiber grain, soft aged paper tooth, slight uneven ink absorbency; no motif doodles, no repeated icons, no pattern of hops, grain, or other objects in the background. Do not include beer glasses, steins, or mugs anywhere on the badge.

At the very top of the badge, place the MUNGER BREWING logo exactly as shown in the reference image: bold arched wordmark MUNGER with a curved underline and BREWING spaced below in small caps. Adapt the logo to cream or off-white (or black if the background is light) so it stays sharp and legible on the badge color. Do not redraw or restyle the letterforms.

HERO ILLUSTRATION STYLE: Paint the hero as classic German/Austrian alpine travel-poster illustration (1920s–1950s advertising art): flat gouache-like color shapes, clean contours, soft sky or field color bands, clear silhouettes, gentle depth with a horizon — not heavy linocut cross-hatching, not photoreal, not 3D. Keep it poster-flat so it sits on a craft-beer badge.

Centered hero subject: [HERO_SUBJECT] — a layered place-and-story composition from origin landscape, craft vessels, ingredients, and aroma cues — not a pour or glassware. The hero must fully integrate with the whole badge: no rectangular picture window, no straight-edged postcard frame, no hard horizontal or vertical crop box inside the shield. Landscape and objects bleed softly into the solid badge color field; trees, hop poles, barrels, hills, or foliage may break the edge so logo, art, and title share one continuous surface.

Large distressed vintage display typography in the lower half reading “[BEER_STYLE]” in cream or off-white with optional accent color — letterforms shaped to feel [STYLE_ATTRIBUTES] (weight, width, roundness, spacing, and edge energy matching how the beer drinks). Whimsical hand-set poster layout allowed and preferred: slight incline or tilt, gentle arc or bounce, uneven baseline, small letter-to-letter misalignment or size jitter, playful stacking or staggered lines — still fully legible as the style name; not rigid machine-aligned type. This is the main title; do not add a nickname or secondary brand name. Limited flat color palette of [COLOR_1], [COLOR_2], cream, and black. German / Bavarian beer mood: warm, festive, gemutlichkeit, craft-brewery badge.
```

### Variable slots


| Slot                  | Guidance                                                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `BACKGROUND_COLOR`    | Match beer mood (see palette table); paper texture sits on this solid field                                                 |
| `HERO_SUBJECT`        | Travel-poster scene: place + craft + ingredients; **no glasses**; integrated with badge field                               |
| `BEER_STYLE`          | Real style name only (e.g. Munich Helles, Hoppy Lager, Pear Cider)                                                          |
| `STYLE_ATTRIBUTES`    | 2–4 mouthfeel words (light, crisp, clean · round, full, malty · bright, hoppy, snappy); pair with whimsical layout cues when useful |
| `COLOR_1` / `COLOR_2` | Accents; keep poster-flat with cream + black                                                                                |


---

## Background mood by style family


| Style family                        | Background                        | Accent ideas             | Light mood              |
| ----------------------------------- | --------------------------------- | ------------------------ | ----------------------- |
| Pale lager / pils / helles / kölsch | Sky blue, pale gold, soft cream   | White, gold              | Bright noon / clear sky |
| Pale ale / blonde                   | Warm teal, straw gold             | Cream, soft orange       | Soft daylight           |
| IPA / DIPA / NEIPA / session IPA    | Deep forest green, purple, copper | Citrus yellow, hop green | Bright hop garden       |
| Hoppy lager                         | Deep green-gold, teal             | Hop green, cream         | Sunny fields            |
| Amber / red / Vienna / märzen       | Cream, rust, copper               | Brown, gold              | Harvest afternoon       |
| Brown / mild / Munich dunkel        | Warm brown, tan, deep mahogany    | Cream, copper            | Dusk / copper sky       |
| Porter / stout                      | Near-black, deep brown, charcoal  | Cream, deep red          | Night / deep dusk       |
| Wheat / weizen / wit                | Soft gold, pale cream             | Wheat gold, soft orange  | Hazy warm light         |
| Sour / gose / fruited               | Magenta, pink, lime               | Cream, mint              | Bright / playful        |
| Cider / perry                       | Sage green, soft gold, cream      | Blossom pink, pear gold  | Orchard daylight        |
| Belgian / saison / tripel           | Warm gold, cream                  | Red, black               | Golden afternoon        |
| Bock / doppelbock / barleywine      | Deep burgundy, black              | Gold, cream              | Dusk / firelight        |


---

## Hero ideas (travel poster, no glassware)

One **hero scene** per label. Prefer open landscape or garden that bleeds into the field. Background = solid mood color + paper texture only (no motif pattern).


| Style                | Hero scene (examples — invent richer variants)                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Munich Helles        | Alps + sun + Frauenkirche (optionally empty beer-garden tables under chestnut trees); bright, open Munich plain                         |
| Munich Dunkel        | Dusk Alps / Frauenkirche silhouette + oak barrels + copper kettle + dark malt; warm copper evening light                                |
| Hoppy lager          | Hop poles and bines in rows over golden barley fields and soft hills                                                                    |
| Session IPA / IPA    | Hop garden landscape with citrus accents in the foreground; bright hop country                                                          |
| Pilsner / Czech Pils | Soft river plain or town silhouette + Saaz hop poles / golden fields                                                                    |
| Hefeweizen           | Wheat fields under soft sky + wheat sheaf and orange/clove botanical cues in foreground                                                 |
| Märzen / festbier    | Harvest hills + oak barrel + pretzel / festival hop wreath                                                                              |
| Bock / doppelbock    | Alpine dusk + heraldic lion or stout barrel stack + malt shovel                                                                         |
| Stout / porter       | Dark brauerei silhouette + copper kettle steam + roasted grain                                                                          |
| Amber / Vienna       | Malting floor / copper kettle steam over amber grain fields                                                                             |
| Sour / gose          | Bright coastal or garden path with citrus and salt-crystal still-life accents (still poster-flat)                                       |
| Kölsch               | Rhine-hill silhouette + modest hop leaf / crest (no glass)                                                                              |
| Pear cider / perry   | Orchard trees + ripe pears + blossom + wooden press or barrel                                                                           |


---

## Ready-to-run examples

### Munich Helles

```text
Create a vintage craft-beer bottle label badge. Vertical shield shape with a flat top and rounded U-shaped bottom, thin dashed rope-like border, isolated on pure white. Solid soft sky-blue fill with subtle vintage paper texture only — fine fiber grain, soft aged paper tooth; no motif doodles or repeated mountain icons in the background. Do not include beer glasses, steins, or mugs anywhere on the badge.

At the very top of the badge, place the MUNGER BREWING logo exactly as shown in the reference image: bold arched wordmark MUNGER with a curved underline and BREWING spaced below in small caps. Adapt the logo to cream or off-white. Do not redraw or restyle the letterforms.

HERO ILLUSTRATION STYLE: classic German/Austrian alpine travel-poster illustration (1920s–1950s): flat gouache-like color shapes, clean contours, soft sky color bands, clear silhouettes, gentle depth — not heavy linocut, not photoreal, not 3D.

Centered hero: soft alpine peaks under a radiant sun and the Munich Frauenkirche with twin onion-domed towers — bright, calm Munich plain. The hero must fully integrate with the badge: no rectangular picture window, no straight-edged postcard frame, no hard crop box; mountains and architecture bleed softly into the sky-blue field so logo, art, and title share one continuous surface.

Large distressed vintage display typography reading "MUNICH HELLES" in cream with soft gold accents — letterforms light, crisp, and clean (open spacing, balanced poster caps). Whimsical hand-set layout: gentle arc or soft tilt, slight letter misalignment — fully legible. Main title only; no nickname. Limited flat palette of sky blue, cream, soft gold, and black. German / Bavarian gemutlichkeit.
```

### Hoppy lager

```text
Create a vintage craft-beer bottle label badge. Vertical shield shape with a flat top and rounded U-shaped bottom, thin dashed rope-like border, isolated on pure white. Solid deep green-gold fill with subtle vintage paper texture only — fine fiber grain, soft aged paper tooth; no motif doodles or repeated hop icons in the background. Do not include beer glasses, steins, or mugs anywhere on the badge.

At the very top of the badge, place the MUNGER BREWING logo exactly as shown in the reference image: bold arched wordmark MUNGER with a curved underline and BREWING spaced below in small caps. Adapt the logo to cream or off-white. Do not redraw or restyle the letterforms.

HERO ILLUSTRATION STYLE: classic German/Austrian alpine travel-poster illustration: flat gouache-like color shapes, clean contours, soft field color bands, clear silhouettes — not heavy linocut, not photoreal, not 3D.

Centered hero: hop-garden landscape — rows of hop poles and climbing bines, bold hop cone clusters and leaves in the foreground, golden barley field bands and a soft Bavarian horizon under a bright sky. The hero must fully integrate with the badge: no rectangular picture window; hop poles and foliage break into the solid green-gold field so logo, art, and title share one continuous surface. No glassware.

Large distressed vintage display typography reading "HOPPY LAGER" in cream with hop-green accents — letterforms bright, crisp, and hop-forward. Whimsical hand-set layout: slight upward incline, uneven baseline, playful stagger between lines — fully legible. Main title only. Limited flat palette of deep green-gold, hop green, cream, soft gold, and black.
```

### Munich Dunkel

```text
Create a vintage craft-beer bottle label badge. Vertical shield shape with a flat top and rounded U-shaped bottom, thin dashed rope-like border, isolated on pure white. Solid deep warm mahogany-brown fill with subtle vintage paper texture only — fine fiber grain, soft aged paper tooth; no motif doodles or repeated barrel icons in the background. Do not include beer glasses, steins, or mugs anywhere on the badge.

At the very top of the badge, place the MUNGER BREWING logo exactly as shown in the reference image: bold arched wordmark MUNGER with a curved underline and BREWING spaced below in small caps. Adapt the logo to cream or off-white. Do not redraw or restyle the letterforms.

HERO ILLUSTRATION STYLE: classic German/Austrian travel-poster illustration at warm dusk: flat gouache-like color shapes, clean contours, copper and amber sky bands, clear silhouettes — not heavy linocut, not photoreal, not 3D.

Centered hero: dusk alpine foothills and Frauenkirche silhouette, oak barrels, copper brew kettle, dark Munich malt and barley ears — toasty malty brauerei mood. The hero must fully integrate with the badge: no rectangular picture window; barrels and kettle bleed into the mahogany field so logo, art, and title share one continuous surface. No glassware.

Large distressed vintage display typography reading "MUNICH DUNKEL" in cream with copper accents — letterforms round, full, malty, and rich. Whimsical hand-set layout: soft tilt, weighty but slightly uneven baseline — fully legible. Main title only. Limited flat palette of deep warm brown, copper, cream, soft gold, and black.
```

---

## Workflow

1. **Lock the system** — shield + travel-poster hero + paper-textured color field + logo on top + style name only.
2. **Use `image_edit` with `munger.png`** — do not invent the wordmark from text alone.
3. **State the craft every time** — “German/Austrian alpine travel-poster… flat gouache… not linocut, not photoreal, not 3D.”
4. **Enforce integration** — always include the no-postcard-window language.
5. **Design the hero from story** — place / craft / ingredients / aroma; **never a glass**.
6. **Match light to beer** — bright for pale; dusk/copper for dark.
7. **Shape type with attributes** — light/crisp vs round/full, etc.
8. **Text accuracy** — for final print, overlay the real logo (and optionally set type) in Figma/Illustrator if needed.
9. **Save versioned files** — never overwrite:
   - `{style-slug}-travelposter-v{N}.jpg`
   - e.g. `munich-helles-travelposter-v4.jpg`, `hoppy-lager-travelposter-v2.jpg`
   - Before saving: list existing `*-travelposter-v*.jpg` for that style and use **max N + 1**

### Consistency checklist

- [ ] Shield shape, white outside
- [ ] Dashed / rope border
- [ ] **Travel poster** craft (flat gouache, clean contours, sky/field bands)
- [ ] **Not** linocut / photoreal / 3D
- [ ] Background is solid mood color + **paper texture only** (no motif doodles / repeated icons)
- [ ] Munger logo at top (legible, correct letterforms)
- [ ] One clear **hero scene** (place / craft / ingredients)
- [ ] Hero **integrates with the whole badge** (no rectangular postcard window)
- [ ] **No glasses, steins, or mugs**
- [ ] **Beer style name** as the only large title
- [ ] Letterforms **echo beer attributes**
- [ ] Style-name layout may be **whimsical** (incline, misalignment, uneven baseline) but stays legible
- [ ] Light mood matches beer (bright vs dusk)
- [ ] German / Bavarian (or orchard) mood
- [ ] Limited flat palette
- [ ] Saved as new `{style-slug}-travelposter-v{N}.jpg` — **did not overwrite**

---

## Reference travel-poster outputs

Successful integration examples to emulate:


| File                                      | Style         | Notes                                      |
| ----------------------------------------- | ------------- | ------------------------------------------ |
| `labels/hoppy-lager-travelposter-v1.jpg`  | Hoppy lager   | Hop garden bleeds into field — strong ref  |
| `labels/munich-dunkel-travelposter-v1.jpg`| Munich Dunkel | Dusk place + craft, integrated             |
| `labels/munich-helles-travelposter-v3.jpg`| Munich Helles | Alps + garden without hard postcard box    |
| `labels/session-ipa-travelposter-v1.jpg`  | Session IPA   | Hop garden + citrus accents                |

Weaker integration (avoid repeating):


| File                                      | Notes                                         |
| ----------------------------------------- | --------------------------------------------- |
| `labels/munich-helles-travelposter-v1.jpg`| Rectangular inset tendency                    |
| `labels/munich-helles-travelposter-v2.jpg`| Rectangular inset tendency                    |


---

## Reference sources

- Canonical (linocut) system: `Munger/label-prompt-guidelines.md`
- Multi-style experiments: `Munger/label-hero-style-experiments.md`
- Logo: `Munger/munger.png`
- Labels output: `Munger/labels/`
