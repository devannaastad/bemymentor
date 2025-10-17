-- CreateTable
CREATE TABLE "Mentor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "reviews" INTEGER NOT NULL,
    "offerType" TEXT NOT NULL,
    "accessPrice" INTEGER,
    "hourlyRate" INTEGER,
    "badges" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
