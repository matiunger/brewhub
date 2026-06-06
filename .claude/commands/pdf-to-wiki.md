Convert a PDF file into a markdown wiki page with extracted images.

Usage: `/pdf-to-wiki <path-to-pdf> [wiki/subfolder/output-name]`

- `$ARGUMENTS` — first token is the PDF path; optional second token is the output path relative to `wiki/` (without `.md`). If omitted, infer a slug from the PDF filename.

## Steps

### 1. Parse arguments

Split `$ARGUMENTS` on whitespace. First token = PDF path. Second token (optional) = output slug like `brewing/overview-ph`.

If no output slug is provided, derive one:
- Take the PDF filename without extension
- Lowercase, replace spaces/underscores with hyphens
- Strip leading numbers and underscores (e.g. `1 Overview_PH` → `overview-ph`)
- Prepend `brewing/` as default folder

Ask the user to confirm the output slug before proceeding if it was inferred (not explicitly provided).

### 2. Inspect the PDF

Run both in parallel:

```bash
pdfinfo "<PDF_PATH>"
```

```bash
pdfimages -list "<PDF_PATH>"
```

From `pdfinfo`, note the page count and title.
From `pdfimages -list`, identify which images are content figures vs. small repeated elements (logos/icons). Content images are typically >100px in both dimensions and appear once per page.

### 3. Extract text

```bash
pdftotext -layout "<PDF_PATH>" -
```

Read the full output carefully. Note:
- Section headings (lines that appear isolated, in all-caps or title-case, short)
- Figure captions (lines starting with "Figure N" or "Fig. N")
- Two-column layouts (text side-by-side — merge into single column)
- Repeated artifacts (page headers/footers, page numbers) — omit these

### 4. Extract images

Determine the images output directory:
- `IMAGES_DIR` = `wiki/<subfolder>/images/<output-name>/` (e.g. `wiki/brewing/images/overview-ph/`)

```bash
mkdir -p "<IMAGES_DIR>" && pdfimages -png "<PDF_PATH>" "<IMAGES_DIR>fig"
```

This creates files named `fig-000.png`, `fig-001.png`, etc.

Map each extracted image to the figure it represents using the page numbers from `pdfimages -list`. Skip small repeated images (both dimensions < 100px, or appearing on every page). For remaining images, match them to figure captions found in the text.

### 5. Write the markdown file

Output path: `wiki/<output-slug>.md`

Structure the markdown as follows:

```markdown
# <Title>

*<Subtitle if present>*

<Introductory paragraph if present>

---

## Contents

<TOC matching the document's sections>

---

## <Section 1>

<Content...>

![<Figure description>](images/<output-name>/fig-NNN.png)

*Figure N — <caption text>*

...
```

Rules:
- Use proper unicode superscripts for chemical notation (H⁺, OH⁻, CO₂, H₂O, etc.)
- Convert inline figure captions that appeared beside text in two-column layouts into proper captions placed after the paragraph that references them
- Use `>` blockquotes for technical notes or caveats
- Use `**bold**` for key terms on first use
- Place `---` horizontal rules between major sections
- For references, use markdown links where URLs are available
- End with a source attribution italicised line if the document has a source URL or publication info

### 6. Report

Print a summary:
```
Created: wiki/<output-slug>.md
Images:  <N> figures extracted to wiki/<subfolder>/images/<output-name>/
         (listed by fig-NNN.png → Figure N mapping)
Skipped: <N> small/repeated images (logos etc.)
```

Suggest running `/sync-wiki` to push the new page to the database.
