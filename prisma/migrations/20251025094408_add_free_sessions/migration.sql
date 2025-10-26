-- AlterTable
ALTER TABLE "Mentor" ADD COLUMN     "freeSessionDuration" INTEGER,
ADD COLUMN     "freeSessionsRemaining" INTEGER,
ADD COLUMN     "offersFreeSession" BOOLEAN NOT NULL DEFAULT false;
