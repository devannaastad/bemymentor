-- AlterTable
ALTER TABLE "Mentor" ADD COLUMN     "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingStep" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "profileCompleteness" INTEGER NOT NULL DEFAULT 0;
