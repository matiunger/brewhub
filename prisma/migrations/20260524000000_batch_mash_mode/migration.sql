-- AddColumn: mash mode settings on Batch
ALTER TABLE "batches" ADD COLUMN "mash_mode" TEXT;
ALTER TABLE "batches" ADD COLUMN "mash_ratio_l_kg" REAL;
ALTER TABLE "batches" ADD COLUMN "mash_infuse_temp_c" REAL;
