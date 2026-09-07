-- SQLite can't ADD COLUMN with a non-constant default (CURRENT_TIMESTAMP),
-- so rebuild the table: new shape has inspectionDate instead of quantityUnit.
-- Existing rows are backfilled with their createdAt as inspectionDate.

PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Inspection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "materialName" TEXT NOT NULL,
    "spk" TEXT NOT NULL,
    "materialDescription" TEXT NOT NULL,
    "inspectionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantityValue" REAL NOT NULL,
    "steelThicknessMm" REAL NOT NULL,
    "materialCategory" TEXT NOT NULL,
    "r1c1" REAL NOT NULL,
    "r1c2" REAL NOT NULL,
    "r1c3" REAL NOT NULL,
    "r1c4" REAL NOT NULL,
    "r1c5" REAL NOT NULL,
    "r1c6" REAL NOT NULL,
    "r2c1" REAL NOT NULL,
    "r2c2" REAL NOT NULL,
    "r2c3" REAL NOT NULL,
    "r2c4" REAL NOT NULL,
    "r2c5" REAL NOT NULL,
    "r2c6" REAL NOT NULL,
    "r3c1" REAL NOT NULL,
    "r3c2" REAL NOT NULL,
    "r3c3" REAL NOT NULL,
    "r3c4" REAL NOT NULL,
    "r3c5" REAL NOT NULL,
    "r3c6" REAL NOT NULL,
    "averageThicknessUm" REAL NOT NULL,
    "minimumRequiredUm" REAL,
    "result" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_Inspection" (
    "id", "companyName", "materialName", "spk", "materialDescription",
    "inspectionDate", "quantityValue", "steelThicknessMm", "materialCategory",
    "r1c1", "r1c2", "r1c3", "r1c4", "r1c5", "r1c6",
    "r2c1", "r2c2", "r2c3", "r2c4", "r2c5", "r2c6",
    "r3c1", "r3c2", "r3c3", "r3c4", "r3c5", "r3c6",
    "averageThicknessUm", "minimumRequiredUm", "result", "createdAt", "updatedAt"
)
SELECT
    "id", "companyName", "materialName", "spk", "materialDescription",
    "createdAt", "quantityValue", "steelThicknessMm", "materialCategory",
    "r1c1", "r1c2", "r1c3", "r1c4", "r1c5", "r1c6",
    "r2c1", "r2c2", "r2c3", "r2c4", "r2c5", "r2c6",
    "r3c1", "r3c2", "r3c3", "r3c4", "r3c5", "r3c6",
    "averageThicknessUm", "minimumRequiredUm", "result", "createdAt", "updatedAt"
FROM "Inspection";

DROP TABLE "Inspection";
ALTER TABLE "new_Inspection" RENAME TO "Inspection";

CREATE INDEX "Inspection_companyName_idx" ON "Inspection"("companyName");
CREATE INDEX "Inspection_spk_idx" ON "Inspection"("spk");
CREATE INDEX "Inspection_result_idx" ON "Inspection"("result");
CREATE INDEX "Inspection_createdAt_idx" ON "Inspection"("createdAt");
CREATE INDEX "Inspection_inspectionDate_idx" ON "Inspection"("inspectionDate");

PRAGMA foreign_keys=ON;
