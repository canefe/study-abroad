/*
  Warnings:

  - You are about to drop the column `semester` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `semester` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `semester` on the `CourseChoice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Application" DROP COLUMN "semester",
ADD COLUMN     "alternateRoute" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasTakenCS1F" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "semester";

-- AlterTable
ALTER TABLE "CourseChoice" DROP COLUMN "semester";

-- DropEnum
DROP TYPE "Semester";
