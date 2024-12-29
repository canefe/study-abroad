/*
  Warnings:

  - The `year` column on the `CourseChoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Year" AS ENUM ('SECOND_YEAR', 'THIRD_YEAR');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "year" "Year";

-- AlterTable
ALTER TABLE "CourseChoice" DROP COLUMN "year",
ADD COLUMN     "year" "Year";
