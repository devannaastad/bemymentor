-- CreateTable: Availability - mentor weekly schedule
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable: BlockedSlot - specific blocked dates/times
CREATE TABLE "BlockedSlot" (
    "id" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockedSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Availability_mentorId_idx" ON "Availability"("mentorId");
CREATE INDEX "Availability_dayOfWeek_idx" ON "Availability"("dayOfWeek");
CREATE INDEX "Availability_isActive_idx" ON "Availability"("isActive");
CREATE INDEX "BlockedSlot_mentorId_idx" ON "BlockedSlot"("mentorId");
CREATE INDEX "BlockedSlot_startTime_idx" ON "BlockedSlot"("startTime");

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlockedSlot" ADD CONSTRAINT "BlockedSlot_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
