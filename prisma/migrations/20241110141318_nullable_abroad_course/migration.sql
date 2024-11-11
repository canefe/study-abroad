-- DropForeignKey
ALTER TABLE "CourseChoice" DROP CONSTRAINT "CourseChoice_abroadCourseId_fkey";

-- AlterTable
ALTER TABLE "CourseChoice" ALTER COLUMN "abroadCourseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CourseChoice" ADD CONSTRAINT "CourseChoice_abroadCourseId_fkey" FOREIGN KEY ("abroadCourseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
