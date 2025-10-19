/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Mentor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Mentor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Mentor" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "socialLinks" JSONB,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "rating" SET DEFAULT 5.0,
ALTER COLUMN "reviews" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "Application_userId_idx" ON "Application"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Mentor_userId_key" ON "Mentor"("userId");

-- CreateIndex
CREATE INDEX "Mentor_userId_idx" ON "Mentor"("userId");

-- CreateIndex
CREATE INDEX "Mentor_category_idx" ON "Mentor"("category");

-- CreateIndex
CREATE INDEX "Mentor_isActive_idx" ON "Mentor"("isActive");

-- AddForeignKey
ALTER TABLE "Mentor" ADD CONSTRAINT "Mentor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
