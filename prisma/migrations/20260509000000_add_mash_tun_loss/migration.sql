-- Add mash_tun_loss_l to equipment and equipment snapshot to batches
ALTER TABLE "equipment" ADD COLUMN "mash_tun_loss_l" REAL;
ALTER TABLE "batches" ADD COLUMN "equipment_mash_tun_loss_l" REAL;

-- Backfill existing batches from linked equipment
UPDATE "batches" SET
  "equipment_mash_tun_loss_l" = (SELECT "mash_tun_loss_l" FROM "equipment" WHERE "equipment"."id" = "batches"."equipment_id")
WHERE "equipment_id" IS NOT NULL;
