-- CreateEnum for new categories
CREATE TYPE "MentorCategory_new" AS ENUM ('GAMING_ESPORTS', 'TRADING_INVESTING', 'STREAMING_CONTENT', 'YOUTUBE_PRODUCTION');

-- Add temporary column
ALTER TABLE "Mentor" ADD COLUMN "category_new" "MentorCategory_new";
ALTER TABLE "Application" ADD COLUMN "topic_new" "MentorCategory_new";

-- Map old categories to new ones
UPDATE "Mentor"
SET "category_new" =
  CASE
    WHEN category::text = 'gaming' THEN 'GAMING_ESPORTS'::"MentorCategory_new"
    WHEN category::text = 'trading' THEN 'TRADING_INVESTING'::"MentorCategory_new"
    ELSE 'STREAMING_CONTENT'::"MentorCategory_new"
  END;

UPDATE "Application"
SET "topic_new" =
  CASE
    WHEN topic::text = 'gaming' THEN 'GAMING_ESPORTS'::"MentorCategory_new"
    WHEN topic::text = 'trading' THEN 'TRADING_INVESTING'::"MentorCategory_new"
    ELSE 'STREAMING_CONTENT'::"MentorCategory_new"
  END;

-- Drop old columns
ALTER TABLE "Mentor" DROP COLUMN "category";
ALTER TABLE "Application" DROP COLUMN "topic";

-- Rename new columns
ALTER TABLE "Mentor" RENAME COLUMN "category_new" TO "category";
ALTER TABLE "Application" RENAME COLUMN "topic_new" TO "topic";

-- Drop old enum and rename new one
DROP TYPE "MentorCategory";
ALTER TYPE "MentorCategory_new" RENAME TO "MentorCategory";
