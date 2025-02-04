/*
  Warnings:

  - Changed the column `year` on the `Course` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.

*/
-- AlterTable
ALTER TABLE "Course"
ALTER COLUMN "year" TYPE "Year"[] USING ARRAY["year"];
