/*
  Warnings:

  - You are about to drop the column `abroadCourseId` on the `CourseChoice` table. All the data in the column will be lost.
  - You are about to drop the column `choiceOrder` on the `CourseChoice` table. All the data in the column will be lost.
  - You are about to drop the column `universityId` on the `CourseChoice` table. All the data in the column will be lost.
  - Added the required column `abroadUniversityId` to the `CourseChoice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CourseChoice" DROP CONSTRAINT "CourseChoice_abroadCourseId_fkey";

-- DropForeignKey
ALTER TABLE "CourseChoice" DROP CONSTRAINT "CourseChoice_universityId_fkey";

-- AlterTable
ALTER TABLE "CourseChoice" DROP COLUMN "abroadCourseId",
DROP COLUMN "choiceOrder",
DROP COLUMN "universityId",
ADD COLUMN     "abroadUniversityId" INTEGER NOT NULL,
ADD COLUMN     "alternativeCourse1Id" INTEGER,
ADD COLUMN     "alternativeCourse2Id" INTEGER,
ADD COLUMN     "primaryCourseId" INTEGER;

-- AddForeignKey
ALTER TABLE "CourseChoice" ADD CONSTRAINT "CourseChoice_abroadUniversityId_fkey" FOREIGN KEY ("abroadUniversityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseChoice" ADD CONSTRAINT "CourseChoice_primaryCourseId_fkey" FOREIGN KEY ("primaryCourseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseChoice" ADD CONSTRAINT "CourseChoice_alternativeCourse1Id_fkey" FOREIGN KEY ("alternativeCourse1Id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseChoice" ADD CONSTRAINT "CourseChoice_alternativeCourse2Id_fkey" FOREIGN KEY ("alternativeCourse2Id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
