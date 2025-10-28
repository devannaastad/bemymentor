-- Fix Application.topic column - change from enum to text
ALTER TABLE "Application" ALTER COLUMN "topic" TYPE TEXT;
