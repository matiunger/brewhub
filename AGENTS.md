# BrewHub — Agent Guide

BrewHub is a single-user homebrewing recipe & batch management app. Full-stack Next.js 16 with bleeding-edge React patterns.

## Tech Stack
- **Framework:** Next.js 16.1.6 (App Router)
- **Runtime:** React 19.2.3, TypeScript 5 (strict)
- **Styling:** Tailwind CSS v4, PostCSS, shadcn/ui (New York style, neutral base)
- **Database:** SQLite via Prisma 5.22.0 (`prisma/dev.db`)
- **Icons:** Lucide React
- **Fonts:** Geist Sans & Geist Mono (`next/font`)

## Commands
```bash
npm run dev      # Dev server on :3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint (flat config)
```

## Architecture Patterns

### 1. Server Components by Default
Pages are async Server Components that query Prisma directly.
```tsx
export default async function Page() {
  const data = await prisma.grain.findMany();
  return <Table data={data} />;
}
```

### 2. Two Mutation Patterns
- **Batches/Wiki:** Inline Server Actions in `page.tsx` with `"use server"`. Passed to client components via `.bind()`.
- **Inventory:** REST API routes (`src/app/api/*/route.ts`) + client `fetch()` in `"use client"` table components.

### 3. Prisma Singleton
Always import from `@/lib/db`. Do not instantiate `new PrismaClient()` elsewhere.
```ts
import { prisma } from "@/lib/db";
```

## Data Model (Prisma)
13 models in `prisma/schema.prisma`:
- **Inventory masters:** `Equipment`, `Grain`, `Hop`, `Yeast`, `WaterProfile`, `Keg`
- **Batch aggregate:** `Batch` → `BatchGrain`, `BatchHop`, `BatchYeast`, `MashStep`
- **Knowledge:** `WikiPage`
- Column names use `snake_case` via `@map`. Model names are PascalCase.

## File Organization
```
src/
  app/               # Next.js App Router
    api/             # REST API routes
    batches/[id]/    # Batch detail (Server Actions)
    inventory/*/     # Inventory pages (Server Component + client table)
    wiki/            # Wiki reader & editor
  components/
    ui/              # shadcn/ui primitives (Button, Dialog, Table, etc.)
    inventory/       # Inventory table components (client)
    wiki/            # Wiki components
  lib/
    db.ts            # Prisma singleton
    utils.ts         # cn() = clsx + tailwind-merge
    calculations.ts  # Brewing math (OG, FG, IBU, SRM, ABV)
    beerjson.ts      # BeerJSON 1.0 import/export with unit conversions
```

## Styling & UI Rules
- Use **Tailwind utility classes only**. No CSS Modules.
- Merge conditional classes with `cn()` from `@/lib/utils`.
- shadcn/ui primitives live in `src/components/ui/`. Add new ones with `npx shadcn add <component>`.
- Theme uses CSS variables in `globals.css` with `oklch` color values.
- Inventory sections are color-coded: Grains (orange), Hops (green), Cultures (purple), Water (blue), Kegs (amber), Equipment (gray).

## Path Aliases
```
@/* → ./src/*
```
Used everywhere. Never use relative paths like `../../../components/ui/button`.

## Key Conventions
- **No auth layer.** No user model, no middleware, no sessions. Single-user local app.
- **No tests.** No Jest/Vitest/Playwright configured yet.
- **Strict TypeScript.** `strict: true`, `isolatedModules: true`.
- **BeerJSON 1.0 compliance.** Full import/export mapping in `lib/beerjson.ts`.
- **Wiki pages** use `react-markdown` + `remark-gfm` for rendering.
- FormData Server Actions parse fields manually (`formData.get("name") as string`).

## Environment
`.env` sets `DATABASE_URL="file:./dev.db"`. The SQLite DB is committed (`prisma/dev.db`).

## Adding a New Feature
1. Update `prisma/schema.prisma` if data model changes, then run `npx prisma generate`.
2. For CRUD: prefer Server Actions for batch-related features, REST API for inventory masters.
3. Use shadcn/ui primitives for UI. Keep client components minimal.
4. Import Prisma client only from `@/lib/db`.
5. Use `cn()` for all conditional class merging.
