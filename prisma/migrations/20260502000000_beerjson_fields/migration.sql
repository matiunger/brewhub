-- BeerJSON alignment: add standard fields to grains, hops, yeasts, water profiles

-- Grain (Fermentable)
ALTER TABLE "grains" ADD COLUMN "type" TEXT;
ALTER TABLE "grains" ADD COLUMN "origin" TEXT;
ALTER TABLE "grains" ADD COLUMN "grain_group" TEXT;

-- Hop
ALTER TABLE "hops" ADD COLUMN "origin" TEXT;
ALTER TABLE "hops" ADD COLUMN "form" TEXT;
ALTER TABLE "hops" ADD COLUMN "beta_acid" REAL;
ALTER TABLE "hops" ADD COLUMN "hop_type" TEXT;

-- Yeast (Culture) — existing "type" = BeerJSON "form" (liquid/dry), add "culture_type" for BeerJSON "type" (ale/lager/etc)
ALTER TABLE "yeasts" ADD COLUMN "culture_type" TEXT;

-- Water Profile
ALTER TABLE "water_profiles" ADD COLUMN "ph" REAL;
