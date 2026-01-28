INSERT INTO "CarFuelType" ("name") VALUES ('Petrol');
INSERT INTO "CarFuelType" ("name") VALUES ('Diesel');
INSERT INTO "CarFuelType" ("name") VALUES ('Electric');

INSERT INTO "Car" ("brand", "licensePlace", "year", "driverName", "fuelTypeId")
VALUES (
    'Toyota', 
    'ABC-123', 
    2020, 
    'John Doe', 
    (SELECT "id" FROM "CarFuelType" WHERE "name" = 'Petrol' LIMIT 1)
);

INSERT INTO "Car" ("brand", "licensePlace", "year", "fuelTypeId")
VALUES (
    'Tesla', 
    'ELC-999', 
    2023, 
    (SELECT "id" FROM "CarFuelType" WHERE "name" = 'Electric' LIMIT 1)
);

INSERT INTO "Car" ("brand", "licensePlace", "year", "driverName", "fuelTypeId")
VALUES (
    'Ford', 
    'XYZ-555', 
    2018, 
    'Jane Smith', 
    (SELECT "id" FROM "CarFuelType" WHERE "name" = 'Diesel' LIMIT 1)
);