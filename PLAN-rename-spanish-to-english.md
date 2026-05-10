# Plan: Rename Spanish brewday data model fields to English

## Context
The brewday data model (`src/lib/brewday-types.ts`) uses Spanish field names (e.g., `fermentacion`, `hervido`, `densidadGL`, `fechaHora`). All interface names, field names, and the `BrewdayData` top-level keys need to be renamed to English. The UI labels are already in English — only the data model / code identifiers need changing. Existing data in the `brewdayData` JSON column must be migrated.

## Files to modify
1. **`src/lib/brewday-types.ts`** — All interfaces, field names, defaults, and `parseBrewdayData()`
2. **`src/app/batches/[id]/brewday-section.tsx`** — All references to Spanish field/interface names (~1640 lines)
3. **`src/app/batches/[id]/beer-sections.tsx`** — References to `fermentacion`, `embarrilado`, `hervido`, `macerado`, `lavado`, `whirlpoolEnfriado`, `densidadGL`, `fechaHora`, `volumenL`, `alturaCm`, `hora`
4. **`src/app/page.tsx`** — References to `fermentacion`, `densidadGL`, `volumenL`, `hervido`
5. **New: `scripts/migrate-brewday-spanish-to-english.ts`** — One-time migration script

## Renaming map

### Top-level `BrewdayData` keys
| Spanish | English |
|---|---|
| `preparacion` | `preparation` |
| `molienda` | `milling` |
| `macerado` | `mash` |
| `lavado` | `sparge` |
| `preboil` | `preboil` (already English) |
| `lastRun` | `lastRun` (already English) |
| `hervido` | `boil` |
| `whirlpoolEnfriado` | `whirlpoolChilling` |
| `fermentacion` | `fermentation` |
| `embarrilado` | `kegging` |

### Interface renames
| Spanish | English |
|---|---|
| `PreparacionData` | `PreparationData` |
| `MoliendaData` | `MillingData` |
| `MaceradoData` | `MashData` |
| `LavadoData` | `SpargeData` |
| `PreboilData` | `PreboilData` (no change) |
| `LastRunData` | `LastRunData` (no change) |
| `HervidoData` | `BoilData` |
| `WhirlpoolEnfriadoData` | `WhirlpoolChillingData` |
| `FermentacionData` | `FermentationData` |
| `EmbarriladoData` | `KeggingData` |

### Field renames (across all interfaces)
| Spanish | English |
|---|---|
| `hora` | `time` |
| `fechaHora` | `dateTime` |
| `densidadGL` | `densityGL` |
| `volumenL` | `volumeL` |
| `alturaCm` | `heightCm` |
| `volumenObjL` | `targetVolumeL` |
| `recirculado` | `recirculated` |
| `revolver` | `stir` |
| `congelarBotellas` | `freezeBottles` |
| `armarMolino` | `setupMill` |
| `lavarMacerador` | `cleanMashTun` |
| `lavarFermentador` | `cleanFermenter` |
| `pesarMaltas` | `weighGrains` |
| `prepararAnafe` | `prepareBurner` |
| `cargaGarrafaKg` | `gasTankKg` |
| `filtrarAgua` | `filterWater` |
| `calibrarPhmetro` | `calibratePhMeter` |
| `prepararHeladera` | `prepareCooler` |
| `armarSerpentinas` | `setupChillerCoils` |
| `prepararAlcohol` | `prepareAlcohol` |
| `cocinaLimpia` | `cleanKitchen` |
| `prepararMesa` | `setupWorkspace` |
| `prepararStarter` | `prepareStarter` |
| `aguaMacerado` | `mashWater` |
| `aguaLavado` | `spargeWater` |
| `lts` | `liters` |
| `olla` | `pot` |
| `checkGustoAgua` | `checkWaterTaste` |
| `horaCalentarAgua` | `heatWaterTime` |
| `horaInicioEmpaste` | `mashInTime` |
| `horaInicioMacerado` | `mashStartTime` |
| `tempObjetivoC` | `targetTempC` |
| `tempMashC` | `mashTempC` |
| `phMash` | `mashPh` |
| `horaInicioRecirculado` | `recirculationStartTime` |
| `horaFinRecirculado` | `recirculationEndTime` |
| `horaInicioLavado` | `spargeStartTime` |
| `horaFinLavado` | `spargeEndTime` |
| `primerMostoDensidad` | `firstRunningsDensity` |
| `primerMostoPh` | `firstRunningsPh` |
| `volumenObjL` | `targetVolumeL` |
| `alturaObjCm` | `targetHeightCm` |
| `densidadObjGL` | `targetDensityGL` |
| `nutrientesCheck` | `nutrientsCheck` |
| `nutrientesGr` | `nutrientsGr` |
| `evaporacionL` | `evaporationL` |
| `horaInicioWhirlpool` | `whirlpoolStartTime` |
| `horaInicioEnfriado` | `chillingStartTime` |
| `tempInicioC` | `startTempC` |
| `horaFinEnfriado` | `chillingEndTime` |
| `tempFinC` | `endTempC` |
| `horaFinTrasvase` | `transferEndTime` |
| `tempTrasvaseC` | `transferTempC` |
| `muestraOg` | `ogSample` |
| `muestraOgDensidad` | `ogSampleDensity` |
| `muestraOgDensidadObj` | `ogSampleTargetDensity` |
| `muestraOgPh` | `ogSamplePh` |
| `pesoTotalKg` | `totalWeightKg` |
| `pesoLiquidoKg` | `liquidWeightKg` |
| `pesoGarrafaFinalKg` | `endGasTankKg` |
| `gelatinaCheck` | `gelatinCheck` |
| `gelatinaText` | `gelatinText` |

### Props/callbacks in `brewday-section.tsx`
| Spanish | English |
|---|---|
| `openPreparacion` / `onTogglePreparacion` | `openPreparation` / `onTogglePreparation` |
| `openMolienda` / `onToggleMolienda` | `openMilling` / `onToggleMilling` |
| `openMacerado` / `onToggleMacerado` | `openMash` / `onToggleMash` |
| `openLavado` / `onToggleLavado` | `openSparge` / `onToggleSparge` |
| `openHervido` / `onToggleHervido` | `openBoil` / `onToggleBoil` |
| `openFermentacion` / `onToggleFermentacion` | `openFermentation` / `onToggleFermentation` |
| `openEmbarrilado` / `onToggleEmbarrilado` | `openKegging` / `onToggleKegging` |
| `setAguaMacerado` | `setMashWater` |
| `setAguaLavado` | `setSpargeWater` |
| `setAguaLavadoOlla` | `setSpargeWaterPot` |
| `setMaceradoGeneral` | `setMashGeneral` |
| `setLavado` | `setSparge` |
| `setHervido` | `setBoil` |
| `setFermentacion` | `setFermentation` |
| `setEmbarrilado` | `setKegging` |
| `FermentacionSection` | `FermentationSection` |

### `SectionKey` in `beer-sections.tsx`
| Spanish | English |
|---|---|
| `bdPreparacion` | `bdPreparation` |
| `bdMolienda` | `bdMilling` |
| `bdMacerado` | `bdMash` |
| `bdLavado` | `bdSparge` |
| `bdHervido` | `bdBoil` |
| `bdFermentacion` | `bdFermentation` |
| `bdEmbarrilado` | `bdKegging` |

## Execution order

### Step 1: Rename `src/lib/brewday-types.ts`
- Rename all interfaces, fields, `DEFAULT_BREWDAY_DATA`, and `parseBrewdayData()` to English
- This is the source of truth — all other files import from here

### Step 2: Update `src/app/batches/[id]/brewday-section.tsx`
- Update all imports, destructuring, callback names, props, and field references

### Step 3: Update `src/app/batches/[id]/beer-sections.tsx`
- Update `SectionKey` type, default open state keys, `<BrewdaySection>` prop names (lines ~3066-3088)
- Update field references: `fermentacion` → `fermentation`, `densidadGL` → `densityGL`, etc.

### Step 4: Update `src/app/page.tsx`
- Update field references in `computeDisplayValues()`

### Step 5: Create migration script `scripts/migrate-brewday-spanish-to-english.ts`
- Read all batches with non-null `brewdayData`
- Parse JSON, recursively rename keys using the mapping
- Write back updated JSON
- Run via `npx tsx scripts/migrate-brewday-spanish-to-english.ts`

## Verification
1. Run `npx tsc --noEmit` to verify no TypeScript errors
2. Run `npm run build` (or `next build`) to verify full build passes
3. Run migration script against the database
4. Open a batch with brewday data in the browser and verify all fields display correctly
