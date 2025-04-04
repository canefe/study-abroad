/*
  Warnings:

  - You are about to drop the column `schoolId` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `universityId` on the `CourseChoice` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `CourseChoice` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `CourseChoice` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `School` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `year` on table `Application` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `description` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "CourseChoice" DROP CONSTRAINT "CourseChoice_universityId_fkey";

-- DropForeignKey
ALTER TABLE "CourseChoice" DROP CONSTRAINT "CourseChoice_userId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_createdById_fkey";

-- DropForeignKey
ALTER TABLE "School" DROP CONSTRAINT "School_universityId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "schoolId",
ALTER COLUMN "year" SET NOT NULL;

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "schoolId",
ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CourseChoice" DROP COLUMN "universityId",
DROP COLUMN "userId",
DROP COLUMN "year";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
DROP COLUMN "image";

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "School";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "VerificationToken";
