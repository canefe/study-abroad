// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Create Universities
  await prisma.university.createMany({
    data: [
      { id: 1, name: "University of Glasgow", location: "Glasgow, Scotland" },
      { id: 2, name: "Harvard University", location: "Cambridge, MA" },
    ],
  });

  // Create Courses
  await prisma.course.createMany({
    data: [
      { id: 1, name: "Intro to Psychology", universityId: 1 },
      { id: 2, name: "Advanced Calculus", universityId: 1 },
      { id: 3, name: "Psychology 101", universityId: 2 },
      { id: 4, name: "Calculus II", universityId: 2 },
    ],
  });

  // Create Users
  await prisma.user.createMany({
    data: [
      { id: "u1", name: "Alice", email: "alice@example.com", role: "STUDENT" },
      { id: "u2", name: "Bob", email: "bob@example.com", role: "ADMIN" },
    ],
  });

  // Create CourseChoices
  await prisma.courseChoice.createMany({
    data: [
      { userId: "u1", homeCourseId: 1, abroadCourseId: 3, status: "pending" },
      { userId: "u1", homeCourseId: 2, abroadCourseId: 4, status: "approved" },
    ],
  });
}

main()
  .then(() => console.log("Seed data created"))
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
