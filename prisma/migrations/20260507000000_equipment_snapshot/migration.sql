-- Add equipment snapshot fields to batches
ALTER TABLE "batches" ADD COLUMN "equipment_name" TEXT;
ALTER TABLE "batches" ADD COLUMN "equipment_brewhouse_eff" REAL;
ALTER TABLE "batches" ADD COLUMN "equipment_mash_eff" REAL;
ALTER TABLE "batches" ADD COLUMN "equipment_mash_tun_volume_l" REAL;
ALTER TABLE "batches" ADD COLUMN "equipment_mash_tun_dead_space_l" REAL;
ALTER TABLE "batches" ADD COLUMN "equipment_boil_pot_volume_l" REAL;
ALTER TABLE "batches" ADD COLUMN "equipment_boil_evap_rate_l_h" REAL;
ALTER TABLE "batches" ADD COLUMN "equipment_heat_evap_rate_l_h" REAL;
ALTER TABLE "batches" ADD COLUMN "equipment_grain_abs_l_kg" REAL;
ALTER TABLE "batches" ADD COLUMN "equipment_fermenter_loss_l" REAL;
ALTER TABLE "batches" ADD COLUMN "equipment_trub_loss_l" REAL;
ALTER TABLE "batches" ADD COLUMN "equipment_system_loss_pct" REAL;
ALTER TABLE "batches" ADD COLUMN "equipment_temp_contraction_pct" REAL;

-- Backfill existing batches from linked equipment
UPDATE "batches" SET
  "equipment_name"                = (SELECT "name"                       FROM "equipment" WHERE "equipment"."id" = "batches"."equipment_id"),
  "equipment_brewhouse_eff"       = (SELECT "brewhouse_efficiency"       FROM "equipment" WHERE "equipment"."id" = "batches"."equipment_id"),
  "equipment_mash_eff"            = (SELECT "mash_efficiency"            FROM "equipment" WHERE "equipment"."id" = "batches"."equipment_id"),
  "equipment_mash_tun_volume_l"   = (SELECT "mash_tun_volume_l"         FROM "equipment" WHERE "equipment"."id" = "batches"."equipment_id"),
  "equipment_mash_tun_dead_space_l" = (SELECT "mash_tun_dead_space_l"   FROM "equipment" WHERE "equipment"."id" = "batches"."equipment_id"),
  "equipment_boil_pot_volume_l"   = (SELECT "boil_pot_volume_l"         FROM "equipment" WHERE "equipment"."id" = "batches"."equipment_id"),
  "equipment_boil_evap_rate_l_h"  = (SELECT "boil_evaporation_rate_l_h" FROM "equipment" WHERE "equipment"."id" = "batches"."equipment_id"),
  "equipment_heat_evap_rate_l_h"  = (SELECT "heating_evaporation_rate_l_h" FROM "equipment" WHERE "equipment"."id" = "batches"."equipment_id"),
  "equipment_grain_abs_l_kg"      = (SELECT "grain_absorption_l_kg"     FROM "equipment" WHERE "equipment"."id" = "batches"."equipment_id"),
  "equipment_fermenter_loss_l"    = (SELECT "fermenter_loss_l"          FROM "equipment" WHERE "equipment"."id" = "batches"."equipment_id"),
  "equipment_trub_loss_l"         = (SELECT "trub_loss_l"               FROM "equipment" WHERE "equipment"."id" = "batches"."equipment_id"),
  "equipment_system_loss_pct"     = (SELECT "system_loss_percent"       FROM "equipment" WHERE "equipment"."id" = "batches"."equipment_id"),
  "equipment_temp_contraction_pct"= (SELECT "temp_contraction_percent"  FROM "equipment" WHERE "equipment"."id" = "batches"."equipment_id")
WHERE "equipment_id" IS NOT NULL;
