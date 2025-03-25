import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function exportDatabase() {
	// Fetch data from all tables
	const users = await prisma.user.findMany();
	const universities = await prisma.university.findMany();
	const applications = await prisma.application.findMany();
	const courseChoices = await prisma.courseChoice.findMany();
	const courses = await prisma.course.findMany();
	const messages = await prisma.message.findMany();
	const notifications = await prisma.notification.findMany();

	// Organize into an object
	const data = {
		users,
		universities,
		applications,
		courseChoices,
		courses,
		messages,
		notifications,
	};

	// Write to JSON file
	fs.writeFileSync("database_export.json", JSON.stringify(data, null, 2));

	console.log("Database export completed!");
}

exportDatabase();
