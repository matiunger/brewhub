Sync the `wiki/` folder markdown files (including subfolders) with the BrewHub wiki database.

## Rules

- **File is source of truth** — file content always wins on update.
- **Slug** = relative path from `wiki/` without `.md` (e.g. `ingredients/hop-guide`).
- **Folder** = everything before the last `/` in the slug, or `""` for root files.
- **Title** = first line matching `^# ` with the `# ` stripped; fallback = slug's last segment.
- Pages in the DB with **no matching file** are conflicts — ask the user.

## Steps

### 1. Find all markdown files

Use Glob with pattern `wiki/**/*.md` in the project root. Collect all matches.

For each file path like `wiki/ingredients/hop-guide.md`:
- `slug` = `ingredients/hop-guide`
- `folder` = `ingredients`
- `title` = first line starting with `# ` (strip the `# `), or `hop-guide` if none
- `content` = full file text

For root files like `wiki/index.md`:
- `slug` = `index`
- `folder` = `""`

### 2. Fetch all DB pages

Run:

```bash
cd /Users/Mathi/Documents/poinglabs/projects/brewhub && npx tsx --tsconfig tsconfig.json -e "
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const pages = await p.wikiPage.findMany({ select: { slug: true, folder: true, title: true, content: true, updatedAt: true } });
console.log(JSON.stringify(pages));
await p.\$disconnect();
"
```

Parse the JSON into a map of `slug → { folder, title, content, updatedAt }`.

### 3. Diff and categorize

| Case | Action |
|------|--------|
| Slug in files only | **Create** in DB |
| Slug in both, content identical | **Skip** |
| Slug in both, content differs | **Update** DB with file content |
| Slug in DB only | **Conflict** — ask user |

### 4. Resolve conflicts

For every DB-only page, use AskUserQuestion:

> Wiki page **`{slug}`** ("{title}") exists in the database but has no file in `wiki/`. What should I do?
> 1. Delete it from the database
> 2. Export it as `wiki/{slug}.md` (creates any needed subfolders)
> 3. Skip (leave it as-is)

Apply the user's choice before moving on.

### 5. Apply creates and updates

For each create or update, run:

```bash
cd /Users/Mathi/Documents/poinglabs/projects/brewhub && npx tsx --tsconfig tsconfig.json -e "
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
await p.wikiPage.upsert({
  where: { slug: 'SLUG' },
  create: { slug: 'SLUG', folder: 'FOLDER', title: 'TITLE', content: \`CONTENT\` },
  update: { folder: 'FOLDER', title: 'TITLE', content: \`CONTENT\` },
});
console.log('ok');
await p.\$disconnect();
"
```

Substitute SLUG, FOLDER, TITLE, CONTENT. Escape any backticks in CONTENT as `` \` ``.

For **deletes** (user chose option 1):

```bash
cd /Users/Mathi/Documents/poinglabs/projects/brewhub && npx tsx --tsconfig tsconfig.json -e "
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
await p.wikiPage.delete({ where: { slug: 'SLUG' } });
console.log('deleted');
await p.\$disconnect();
"
```

For **exports** (user chose option 2): use the Write tool to create `wiki/{slug}.md` with the DB content.

### 6. Print summary

```
Sync complete:
  Created:          [slugs or "none"]
  Updated:          [slugs or "none"]
  Deleted:          [slugs or "none"]
  Exported to file: [slugs or "none"]
  Skipped:          [slugs or "none"]
```
