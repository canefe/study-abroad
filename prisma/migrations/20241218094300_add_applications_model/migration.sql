/*
  Warnings:

  - You are about to drop the column `abroadUniversityId` on the `CourseChoice` table. All the data in the column will be lost.
  - You are about to drop the column `feedback` on the `CourseChoice` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `CourseChoice` table. All the data in the column will be lost.
  - Added the required column `applicationId` to the `CourseChoice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CourseChoice" DROP CONSTRAINT "CourseChoice_abroadUniversityId_fkey";

-- DropForeignKey
ALTER TABLE "CourseChoice" DROP CONSTRAINT "CourseChoice_userId_fkey";

-- AlterTable
ALTER TABLE "CourseChoice" DROP COLUMN "abroadUniversityId",
DROP COLUMN "feedback",
DROP COLUMN "status",
ADD COLUMN     "applicationId" INTEGER NOT NULL,
ADD COLUMN     "universityId" INTEGER,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "abroadUniversityId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "feedback" TEXT,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CourseChoice" ADD CONSTRAINT "CourseChoice_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseChoice" ADD CONSTRAINT "CourseChoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseChoice" ADD CONSTRAINT "CourseChoice_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_abroadUniversityId_fkey" FOREIGN KEY ("abroadUniversityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
