-- AlterTable: Add anti-fraud fields to Mentor
ALTER TABLE "Mentor" ADD COLUMN "isTrusted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Mentor" ADD COLUMN "verifiedBookingsCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Mentor" ADD COLUMN "stripeConnectId" TEXT;
ALTER TABLE "Mentor" ADD COLUMN "stripeOnboarded" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Add verification and payout tracking to Booking
ALTER TABLE "Booking" ADD COLUMN "platformFee" INTEGER;
ALTER TABLE "Booking" ADD COLUMN "mentorPayout" INTEGER;
ALTER TABLE "Booking" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN "verifiedAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "isFraudReported" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN "fraudReportedAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "fraudNotes" TEXT;
ALTER TABLE "Booking" ADD COLUMN "payoutStatus" TEXT NOT NULL DEFAULT 'HELD';
ALTER TABLE "Booking" ADD COLUMN "payoutReleasedAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "payoutId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Mentor_stripeConnectId_key" ON "Mentor"("stripeConnectId");
CREATE INDEX "Mentor_isTrusted_idx" ON "Mentor"("isTrusted");
CREATE INDEX "Booking_isVerified_idx" ON "Booking"("isVerified");
CREATE INDEX "Booking_payoutStatus_idx" ON "Booking"("payoutStatus");
