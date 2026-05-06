-- Add snapshot fields to batch_grains
ALTER TABLE "batch_grains" ADD COLUMN "name" TEXT;
ALTER TABLE "batch_grains" ADD COLUMN "brand" TEXT;
ALTER TABLE "batch_grains" ADD COLUMN "color_l" REAL;
ALTER TABLE "batch_grains" ADD COLUMN "max_yield" REAL;
ALTER TABLE "batch_grains" ADD COLUMN "grain_group" TEXT;

-- Add snapshot fields to batch_hops
ALTER TABLE "batch_hops" ADD COLUMN "name" TEXT;
ALTER TABLE "batch_hops" ADD COLUMN "alpha_acid" REAL;

-- Add snapshot fields to batch_yeasts
ALTER TABLE "batch_yeasts" ADD COLUMN "name" TEXT;
ALTER TABLE "batch_yeasts" ADD COLUMN "brand" TEXT;
ALTER TABLE "batch_yeasts" ADD COLUMN "attenuation" REAL;

-- Backfill snapshots for existing records from inventory
UPDATE "batch_grains" SET
  "name"        = (SELECT "name"        FROM "grains" WHERE "grains"."id" = "batch_grains"."grain_id"),
  "brand"       = (SELECT "brand"       FROM "grains" WHERE "grains"."id" = "batch_grains"."grain_id"),
  "color_l"     = (SELECT "color_l"     FROM "grains" WHERE "grains"."id" = "batch_grains"."grain_id"),
  "max_yield"   = (SELECT "max_yield"   FROM "grains" WHERE "grains"."id" = "batch_grains"."grain_id"),
  "grain_group" = (SELECT "grain_group" FROM "grains" WHERE "grains"."id" = "batch_grains"."grain_id");

UPDATE "batch_hops" SET
  "name"      = (SELECT "name"       FROM "hops" WHERE "hops"."id" = "batch_hops"."hop_id"),
  "alpha_acid"= (SELECT "alpha_acid" FROM "hops" WHERE "hops"."id" = "batch_hops"."hop_id");

UPDATE "batch_yeasts" SET
  "name"        = (SELECT "name"        FROM "yeasts" WHERE "yeasts"."id" = "batch_yeasts"."yeast_id"),
  "brand"       = (SELECT "brand"       FROM "yeasts" WHERE "yeasts"."id" = "batch_yeasts"."yeast_id"),
  "attenuation" = (SELECT "attenuation" FROM "yeasts" WHERE "yeasts"."id" = "batch_yeasts"."yeast_id");
