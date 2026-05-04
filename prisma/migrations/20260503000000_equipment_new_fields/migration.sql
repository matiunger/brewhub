-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_equipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "brewhouse_efficiency" REAL NOT NULL,
    "mash_efficiency" REAL,
    "mash_tun_volume_l" REAL,
    "mash_tun_dead_space_l" REAL,
    "boil_pot_volume_l" REAL,
    "boil_pot_diameter" REAL,
    "boil_evaporation_rate_l_h" REAL,
    "heating_evaporation_rate_l_h" REAL,
    "sparge_water_pot_diameter" REAL,
    "grain_absorption_l_kg" REAL,
    "fermenter_loss_l" REAL NOT NULL,
    "trub_loss_l" REAL NOT NULL,
    "system_loss_percent" REAL,
    "temp_contraction_percent" REAL DEFAULT 4
);
INSERT INTO "new_equipment" (
    "id", "name", "brewhouse_efficiency", "mash_efficiency",
    "boil_pot_diameter", "boil_evaporation_rate_l_h",
    "fermenter_loss_l", "trub_loss_l", "system_loss_percent"
)
SELECT
    "id", "name", "brewhouse_efficiency", "mash_efficiency",
    "boil_pot_diameter", "evaporation_rate",
    "fermenter_loss_l", "trub_loss_l", "system_loss_percent"
FROM "equipment";
DROP TABLE "equipment";
ALTER TABLE "new_equipment" RENAME TO "equipment";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
