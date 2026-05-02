-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_batch_yeasts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batch_id" TEXT NOT NULL,
    "yeast_id" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "temp" REAL,
    CONSTRAINT "batch_yeasts_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "batch_yeasts_yeast_id_fkey" FOREIGN KEY ("yeast_id") REFERENCES "yeasts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_batch_yeasts" ("batch_id", "id", "quantity", "temp", "yeast_id") SELECT "batch_id", "id", "quantity", "temp", "yeast_id" FROM "batch_yeasts";
DROP TABLE "batch_yeasts";
ALTER TABLE "new_batch_yeasts" RENAME TO "batch_yeasts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
