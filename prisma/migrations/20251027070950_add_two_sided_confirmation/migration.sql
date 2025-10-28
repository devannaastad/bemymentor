-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "autoConfirmAt" TIMESTAMP(3),
ADD COLUMN     "mentorCompletedAt" TIMESTAMP(3),
ADD COLUMN     "studentConfirmedAt" TIMESTAMP(3);
