-- CreateTable
CREATE TABLE "Inspection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "materialName" TEXT NOT NULL,
    "spk" TEXT NOT NULL,
    "materialDescription" TEXT NOT NULL,
    "quantityValue" REAL NOT NULL,
    "quantityUnit" TEXT NOT NULL,
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

-- CreateIndex
CREATE INDEX "Inspection_companyName_idx" ON "Inspection"("companyName");

-- CreateIndex
CREATE INDEX "Inspection_spk_idx" ON "Inspection"("spk");

-- CreateIndex
CREATE INDEX "Inspection_result_idx" ON "Inspection"("result");

-- CreateIndex
CREATE INDEX "Inspection_createdAt_idx" ON "Inspection"("createdAt");
