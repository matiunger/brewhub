/**
 * One-time migration: rename Spanish brewday JSON keys to English.
 * Run with: npx tsx scripts/migrate-brewday-spanish-to-english.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Top-level section renames
const SECTION_MAP: Record<string, string> = {
  preparacion: "preparation",
  molienda: "milling",
  macerado: "mash",
  lavado: "sparge",
  hervido: "boil",
  whirlpoolEnfriado: "whirlpoolChilling",
  fermentacion: "fermentation",
  embarrilado: "kegging",
};

// Field renames (applied recursively across all nested objects)
const FIELD_MAP: Record<string, string> = {
  hora: "time",
  fechaHora: "dateTime",
  densidadGL: "densityGL",
  volumenL: "volumeL",
  alturaCm: "heightCm",
  volumenObjL: "targetVolumeL",
  alturaObjCm: "targetHeightCm",
  densidadObjGL: "targetDensityGL",
  recirculado: "recirculated",
  revolver: "stir",
  congelarBotellas: "freezeBottles",
  armarMolino: "setupMill",
  lavarMacerador: "cleanMashTun",
  lavarFermentador: "cleanFermenter",
  pesarMaltas: "weighGrains",
  prepararAnafe: "prepareBurner",
  cargaGarrafaKg: "gasTankKg",
  filtrarAgua: "filterWater",
  calibrarPhmetro: "calibratePhMeter",
  prepararHeladera: "prepareCooler",
  armarSerpentinas: "setupChillerCoils",
  prepararAlcohol: "prepareAlcohol",
  cocinaLimpia: "cleanKitchen",
  prepararMesa: "setupWorkspace",
  prepararStarter: "prepareStarter",
  aguaMacerado: "mashWater",
  aguaLavado: "spargeWater",
  lts: "liters",
  olla: "pot",
  checkGustoAgua: "checkWaterTaste",
  horaCalentarAgua: "heatWaterTime",
  horaInicioEmpaste: "mashInTime",
  horaInicioMacerado: "mashStartTime",
  tempObjetivoC: "targetTempC",
  tempMashC: "mashTempC",
  phMash: "mashPh",
  horaInicioRecirculado: "recirculationStartTime",
  horaFinRecirculado: "recirculationEndTime",
  horaInicioLavado: "spargeStartTime",
  horaFinLavado: "spargeEndTime",
  primerMostoDensidad: "firstRunningsDensity",
  primerMostoPh: "firstRunningsPh",
  nutrientesCheck: "nutrientsCheck",
  nutrientesGr: "nutrientsGr",
  evaporacionL: "evaporationL",
  horaInicioWhirlpool: "whirlpoolStartTime",
  horaInicioEnfriado: "chillingStartTime",
  tempInicioC: "startTempC",
  horaFinEnfriado: "chillingEndTime",
  tempFinC: "endTempC",
  horaFinTrasvase: "transferEndTime",
  tempTrasvaseC: "transferTempC",
  muestraOg: "ogSample",
  muestraOgDensidad: "ogSampleDensity",
  muestraOgDensidadObj: "ogSampleTargetDensity",
  muestraOgPh: "ogSamplePh",
  pesoTotalKg: "totalWeightKg",
  pesoLiquidoKg: "liquidWeightKg",
  pesoGarrafaFinalKg: "endGasTankKg",
  gelatinaCheck: "gelatinCheck",
  gelatinaText: "gelatinText",
};

function renameKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(renameKeys);
  }
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const newKey = FIELD_MAP[key] ?? key;
      result[newKey] = renameKeys(value);
    }
    return result;
  }
  return obj;
}

function migrateSections(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const newKey = SECTION_MAP[key] ?? key;
    result[newKey] = renameKeys(value);
  }
  return result;
}

async function main() {
  const batches = await prisma.batch.findMany({
    where: { brewdayData: { not: null } },
    select: { id: true, name: true, brewdayData: true },
  });

  console.log(`Found ${batches.length} batches with brewday data.`);

  let migrated = 0;
  let skipped = 0;

  for (const batch of batches) {
    if (!batch.brewdayData) continue;

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(batch.brewdayData);
    } catch {
      console.warn(`  [SKIP] ${batch.name} (${batch.id}): invalid JSON`);
      skipped++;
      continue;
    }

    // Check if already migrated (has English top-level keys)
    if ("fermentation" in parsed || "preparation" in parsed) {
      console.log(`  [SKIP] ${batch.name} (${batch.id}): already migrated`);
      skipped++;
      continue;
    }

    const migrated_data = migrateSections(parsed);
    const newJson = JSON.stringify(migrated_data);

    await prisma.batch.update({
      where: { id: batch.id },
      data: { brewdayData: newJson },
    });

    console.log(`  [OK]   ${batch.name} (${batch.id})`);
    migrated++;
  }

  console.log(`\nDone. Migrated: ${migrated}, Skipped: ${skipped}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
