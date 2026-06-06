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

> **Note:** `npx tsx --tsconfig tsconfig.json` hangs silently in this project (due to `"moduleResolution": "bundler"` in tsconfig). Use `sqlite3` directly for reads instead — the table name is `wiki_pages` (snake_case).

Run:

```bash
sqlite3 prisma/dev.db "SELECT slug, folder, title FROM wiki_pages;"
```

Parse the output (pipe-delimited) into a map of `slug → { folder, title }`.

To compare content, use bash directly:

```bash
file_content=$(cat "wiki/${slug}.md")
db_content=$(sqlite3 prisma/dev.db "SELECT content FROM wiki_pages WHERE slug='${slug}';")
if [ "$file_content" = "$db_content" ]; then echo "SAME"; else echo "DIFF"; fi
```

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

> **Note:** Do NOT inline file content into shell `-e` strings — markdown files contain backticks and special characters that break shell escaping. Instead, write a temp `.mjs` script that uses `readFileSync`, then delete it after.

For each create or update, write `_wiki_upsert.mjs` in the project root:

```js
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
const p = new PrismaClient();
const content = readFileSync('wiki/SLUG.md', 'utf8');
await p.wikiPage.upsert({
  where: { slug: 'SLUG' },
  create: { slug: 'SLUG', folder: 'FOLDER', title: 'TITLE', content },
  update: { folder: 'FOLDER', title: 'TITLE', content },
});
console.log('ok');
await p.$disconnect();
process.exit(0);
```

Then run:

```bash
node _wiki_upsert.mjs 2>&1 && rm _wiki_upsert.mjs
```

If multiple pages need upserting, batch them all in one `_wiki_upsert.mjs` script.

For **deletes** (user chose option 1):

```bash
sqlite3 prisma/dev.db "DELETE FROM wiki_pages WHERE slug='SLUG';" && echo "deleted"
```

For **exports** (user chose option 2): use the Write tool to create `wiki/{slug}.md` with the DB content (fetch via `sqlite3 prisma/dev.db "SELECT content FROM wiki_pages WHERE slug='SLUG';"`), creating any needed subfolders first.

### 6. Print summary

```
Sync complete:
  Created:          [slugs or "none"]
  Updated:          [slugs or "none"]
  Deleted:          [slugs or "none"]
  Exported to file: [slugs or "none"]
  Skipped:          [slugs or "none"]
```
