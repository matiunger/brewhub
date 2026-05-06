-- Split yeast quantity string into numeric amount + units
ALTER TABLE "batch_yeasts" ADD COLUMN "quantity_amount" REAL;
ALTER TABLE "batch_yeasts" ADD COLUMN "quantity_units" TEXT;
