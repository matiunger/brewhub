-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_batches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brew_date" DATETIME,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "style" TEXT,
    "notes" TEXT,
    "draft" BOOLEAN NOT NULL DEFAULT true,
    "target_fermentar_l" REAL,
    "target_og" REAL,
    "target_fg" REAL,
    "target_ibu" REAL,
    "target_srm" REAL,
    "equipment_id" TEXT,
    "source_water_profile_id" TEXT,
    "target_water_profile_id" TEXT,
    "heat_up_time_min" REAL,
    "boil_time_min" REAL,
    "whirpool_time_min" REAL,
    CONSTRAINT "batches_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "batches_source_water_profile_id_fkey" FOREIGN KEY ("source_water_profile_id") REFERENCES "water_profiles" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "batches_target_water_profile_id_fkey" FOREIGN KEY ("target_water_profile_id") REFERENCES "water_profiles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_batches" ("boil_time_min", "brew_date", "draft", "equipment_id", "heat_up_time_min", "id", "name", "notes", "source_water_profile_id", "style", "target_fermentar_l", "target_fg", "target_ibu", "target_og", "target_srm", "target_water_profile_id", "type", "whirpool_time_min") SELECT "boil_time_min", "brew_date", "draft", "equipment_id", "heat_up_time_min", "id", "name", "notes", "source_water_profile_id", "style", "target_fermentar_l", "target_fg", "target_ibu", "target_og", "target_srm", "target_water_profile_id", "type", "whirpool_time_min" FROM "batches";
DROP TABLE "batches";
ALTER TABLE "new_batches" RENAME TO "batches";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
