-- AlterTable
ALTER TABLE "Mentor" ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];
