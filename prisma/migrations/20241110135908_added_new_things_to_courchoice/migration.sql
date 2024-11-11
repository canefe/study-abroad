/*
  Warnings:

  - Added the required column `choiceOrder` to the `CourseChoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semester` to the `CourseChoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `universityId` to the `CourseChoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `CourseChoice` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Semester" AS ENUM ('SEMESTER_1', 'SEMESTER_2', 'FULL_YEAR');

-- AlterTable
ALTER TABLE "CourseChoice" ADD COLUMN     "choiceOrder" INTEGER NOT NULL,
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "semester" "Semester" NOT NULL,
ADD COLUMN     "universityId" INTEGER NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "CourseChoice" ADD CONSTRAINT "CourseChoice_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
