-- CreateTable
CREATE TABLE "Car" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "brand" TEXT NOT NULL,
    "licensePlace" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "fuelTypeId" INTEGER NOT NULL,
    CONSTRAINT "Car_fuelTypeId_fkey" FOREIGN KEY ("fuelTypeId") REFERENCES "CarFuelType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CarFuelType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Car_licensePlace_key" ON "Car"("licensePlace");
