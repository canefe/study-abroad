/********************************************************************
 * cseed.js
 * Revised seeding script:
 * 1) Loads "database_clone.json"
 * 2) Inserts data in order, building a mapping from each cloned
 *    application’s `cloneIndex` to its new auto-generated ID.
 * 3) Uses that mapping to update child records (courseChoices, messages)
 *    by replacing their `applicationCloneIndex` with the new `applicationId`.
 * 4) Strips out extra fields not defined in your Prisma schema.
 ********************************************************************/
import fs from "fs";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
	// 1) Load your cloned JSON data
	const data = JSON.parse(fs.readFileSync("database_clone.json", "utf-8"));

	/***************************************************************
	 * STEP 1: Insert Users
	 ***************************************************************/
	await prisma.user.createMany({
		data: data.users,
		skipDuplicates: true,
	});
	console.log("✅ Inserted Users");

	/***************************************************************
	 * STEP 2: Insert Universities
	 ***************************************************************/
	await prisma.university.createMany({
		data: data.universities,
		skipDuplicates: true,
	});
	console.log("✅ Inserted Universities");

	/***************************************************************
	 * STEP 3: Insert Applications (Auto-increment ID)
	 ***************************************************************/
	// Keep the original applications with their cloneIndex for mapping.
	const oldApplicationsWithClone = data.applications; // each has "cloneIndex"

	// Remove "id" and "cloneIndex" from the objects passed to createMany.
	const appCreateData = oldApplicationsWithClone.map(
		({ id, cloneIndex, ...app }) => app,
	);

	await prisma.application.createMany({
		data: appCreateData,
		skipDuplicates: false, // Make sure all records are inserted.
	});
	console.log("✅ Inserted Applications");

	// Fetch the newly inserted applications sorted by their auto-generated id.
	const newApplications = await prisma.application.findMany({
		orderBy: { id: "asc" },
	});

	// Build a mapping from cloneIndex to the new application id.
	// We assume that the order of newApplications (sorted by id) corresponds
	// one-to-one with oldApplicationsWithClone sorted by cloneIndex.
	const sortedOldApps = [...oldApplicationsWithClone].sort(
		(a, b) => a.cloneIndex - b.cloneIndex,
	);
	const applicationIdMap = {};
	for (let i = 0; i < sortedOldApps.length; i++) {
		const cloneKey = sortedOldApps[i].cloneIndex;
		applicationIdMap[cloneKey] = newApplications[i].id;
	}
	console.log("Application ID Map:", applicationIdMap);

	/***************************************************************
	 * STEP 4: Insert Courses
	 ***************************************************************/
	//const courseCreateData = data.courses.map(({ id, ...course }) => course);
	//await prisma.course.createMany({
	//data: courseCreateData,
	//skipDuplicates: true,
	//});
	//await prisma.courseChoice.deleteMany(); // Clear existing courseChoices
	//await prisma.course.deleteMany(); // Clear existing courses
	// prisma.$executeRawUnsafe(
	//	`TRUNCATE TABLE "Course" RESTART IDENTITY CASCADE;`,
	//);
	await prisma.course.createMany({
		data: data.courses,
		skipDuplicates: true,
	});
	console.log("✅ Inserted Courses");

	/***************************************************************
	 * STEP 5: Insert CourseChoices (Auto-increment ID)
	 ***************************************************************/
	// Each courseChoice should have an "applicationCloneIndex". Use it to map to the new applicationId.
	const courseChoiceCreateData = data.courseChoices.map(
		({ id, applicationCloneIndex, ...choice }) => ({
			...choice,
			applicationId: applicationIdMap[applicationCloneIndex],
		}),
	);
	await prisma.courseChoice.createMany({
		data: courseChoiceCreateData,
		skipDuplicates: false,
	});
	console.log("✅ Inserted CourseChoices");

	/***************************************************************
	 * STEP 6: Insert Messages (Auto-increment ID)
	 ***************************************************************/
	// Each message should have an "applicationCloneIndex". Use it for mapping.
	const messageCreateData = data.messages.map(
		({ id, applicationCloneIndex, ...msg }) => ({
			...msg,
			applicationId: applicationIdMap[applicationCloneIndex],
		}),
	);
	await prisma.message.createMany({
		data: messageCreateData,
		skipDuplicates: false,
	});
	console.log("✅ Inserted Messages");

	// If you need to insert notifications, apply a similar mapping for any foreign keys.

	console.log("🎉 Seeding completed successfully!");
}

main()
	.catch((error) => {
		console.error("❌ Seeding error:", error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
