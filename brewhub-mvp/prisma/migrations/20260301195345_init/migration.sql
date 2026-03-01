-- CreateTable
CREATE TABLE "equipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "brewhouse_efficiency" REAL NOT NULL,
    "mash_efficiency" REAL,
    "evaporation_rate" REAL,
    "boil_pot_diameter" REAL,
    "fermenter_loss_l" REAL NOT NULL,
    "trub_loss_l" REAL NOT NULL,
    "system_loss_percent" REAL,
    "bagasse_loss_l" REAL
);

-- CreateTable
CREATE TABLE "grains" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "max_yield" REAL,
    "color_l" REAL,
    "profile" TEXT,
    "uses" TEXT
);

-- CreateTable
CREATE TABLE "hops" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "alpha_acid" REAL NOT NULL,
    "profile" TEXT,
    "styles" TEXT,
    "alternatives" TEXT
);

-- CreateTable
CREATE TABLE "yeasts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "type" TEXT,
    "temperature_range" TEXT,
    "profile" TEXT,
    "uses" TEXT,
    "attenuation" REAL
);

-- CreateTable
CREATE TABLE "water_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ca_ppm" REAL NOT NULL,
    "mg_ppm" REAL NOT NULL,
    "na_ppm" REAL NOT NULL,
    "cl_ppm" REAL NOT NULL,
    "so4_ppm" REAL NOT NULL,
    "zn_ppm" REAL,
    "hco3_ppm" REAL
);

-- CreateTable
CREATE TABLE "kegs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "number" TEXT,
    "capacity" REAL NOT NULL,
    "tare_weight" REAL,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "batches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brew_date" DATETIME NOT NULL,
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

-- CreateTable
CREATE TABLE "batch_grains" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batch_id" TEXT NOT NULL,
    "grain_id" TEXT NOT NULL,
    "grams" REAL NOT NULL,
    CONSTRAINT "batch_grains_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "batch_grains_grain_id_fkey" FOREIGN KEY ("grain_id") REFERENCES "grains" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "batch_hops" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batch_id" TEXT NOT NULL,
    "hop_id" TEXT NOT NULL,
    "grams" REAL NOT NULL,
    "addition_time" REAL NOT NULL,
    "use" TEXT NOT NULL,
    CONSTRAINT "batch_hops_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "batch_hops_hop_id_fkey" FOREIGN KEY ("hop_id") REFERENCES "hops" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "batch_yeasts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batch_id" TEXT NOT NULL,
    "yeast_id" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "temp" REAL,
    CONSTRAINT "batch_yeasts_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "batch_yeasts_yeast_id_fkey" FOREIGN KEY ("yeast_id") REFERENCES "yeasts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
