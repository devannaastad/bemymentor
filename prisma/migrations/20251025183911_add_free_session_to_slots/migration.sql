-- AlterTable
ALTER TABLE "AvailableSlot" ADD COLUMN     "isFreeSession" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "AvailableSlot_isFreeSession_idx" ON "AvailableSlot"("isFreeSession");
