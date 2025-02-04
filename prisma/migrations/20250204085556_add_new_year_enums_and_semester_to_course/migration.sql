/*
  Warnings:

  - The values [SECOND_YEAR,THIRD_YEAR] on the enum `Year` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Year_new" AS ENUM ('SECOND_YEAR_SINGLE_FULL_YEAR', 'SECOND_YEAR_SINGLE_FIRST_SEMESTER', 'SECOND_YEAR_SINGLE_SECOND_SEMESTER', 'SECOND_YEAR_JOINT_FULL_YEAR', 'SECOND_YEAR_JOINT_FIRST_SEMESTER', 'SECOND_YEAR_JOINT_SECOND_SEMESTER', 'THIRD_YEAR_SINGLE_FULL_YEAR', 'THIRD_YEAR_JOINT_FULL_YEAR');
ALTER TABLE "CourseChoice" ALTER COLUMN "year" TYPE "Year_new" USING ("year"::text::"Year_new");
ALTER TABLE "Application" ALTER COLUMN "year" TYPE "Year_new" USING ("year"::text::"Year_new");
ALTER TABLE "Course" ALTER COLUMN "year" TYPE "Year_new" USING ("year"::text::"Year_new");
ALTER TYPE "Year" RENAME TO "Year_old";
ALTER TYPE "Year_new" RENAME TO "Year";
DROP TYPE "Year_old";
COMMIT;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "semester" "Semester";
