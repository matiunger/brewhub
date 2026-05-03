/*
  Warnings:

  - You are about to drop the column `number` on the `kegs` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_kegs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "label" TEXT,
    "capacity" REAL NOT NULL,
    "tare_weight" REAL,
    "notes" TEXT
);
INSERT INTO "new_kegs" ("capacity", "id", "name", "notes", "tare_weight") SELECT "capacity", "id", "name", "notes", "tare_weight" FROM "kegs";
DROP TABLE "kegs";
ALTER TABLE "new_kegs" RENAME TO "kegs";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
