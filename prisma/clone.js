import fs from "fs";
import { faker } from "@faker-js/faker";
const Role = {
	STUDENT: "STUDENT",
	ADMIN: "ADMIN",
};

// Load the existing database export
const databaseExport = JSON.parse(
	fs.readFileSync("database_export.json", "utf-8"),
);

// Number of test users
const numUsers = 15;
/* 
7134571C@student.gla.ac ..

3058465K@student.gla.ac ..

2967132C@student.gla.ac ...

3850045H@student.gla.ac ...

1436938H@student.gla.ac ...

1637464S@student.gla.ac ..

8948620R@student.gla.ac ...

4047731R@student.gla.ac ..

1911120B@student.gla.ac ...

5645762B@student.gla.ac ...

5971840G@student.gla.ac ...

9998097M@student.gla.ac ..

4522005G@student.gla.ac ...

4732230K@student.gla.ac ...

8303290T@student.gla.ac ...
*/
const guids = [
	"7134571C",
	"3058465K",
	"2967132C",
	"3850045H",
	"1436938H",
	"1637464S",
	"8948620R",
	"4047731R",
	"1911120B",
	"5645762B",
	"5971840G",
	"9998097M",
	"4522005G",
	"4732230K",
	"8303290T",
];

function generateRandomUser() {
	const firstName = faker.person.firstName();
	const lastName = faker.person.lastName();
	const guid = guids.pop();
	return {
		id: faker.string.uuid(),
		name: `${firstName} ${lastName}`,
		email: `${guid}@student.gla.ac.uk`,
		role: Role.STUDENT,
		guid: guid,
	};
}

// Step 1: Generate 15 Users
const users = Array.from({ length: numUsers }, () => generateRandomUser());

// We'll use this counter to assign a unique clone index for each cloned application.
let cloneIndexCounter = 0;

// Step 2: Clone Applications for Each User
const applications = [];
users.forEach((user) => {
	// For each user, clone every application from the export.
	databaseExport.applications.forEach((app) => {
		applications.push({
			...app,
			id: undefined, // Remove the old id so the DB can auto-generate one.
			userId: user.id, // Assign to the new user.
			cloneIndex: cloneIndexCounter++, // Unique clone key for this cloned application.
		});
	});
});

// Step 4: Clone Courses (unchanged)
const courses = [];
const courseIdMap = new Map();
databaseExport.courses.forEach((course) => {
	const newCourse = {
		...course,
		id: undefined,
	};
	courses.push(newCourse);
	courseIdMap.set(course.id, newCourse.id);
});

const courseChoices = [];
applications.forEach((app) => {
	const originalChoices = databaseExport.courseChoices.filter(
		(choice) => choice.applicationId === 1,
	);

	originalChoices.forEach((choice) => {
		courseChoices.push({
			...choice,
			id: undefined, // Remove old id
			applicationId: app.id, // This will be updated via the clone mapping in cseed.js.
			userId: app.userId, // Ensure it belongs to the correct user.
			applicationCloneIndex: app.cloneIndex, // Pass the clone key for mapping.
		});
	});
});

// Step 5: Clone Messages for Each User
const messages = [];
applications.forEach((app) => {
	// Find the original messages linked to a specific application (e.g., id === 6)
	const originalMessages = databaseExport.messages.filter(
		(msg) => msg.applicationId === 1,
	);

	originalMessages.forEach((msg) => {
		messages.push({
			...msg,
			id: undefined, // Remove old id
			applicationId: app.id, // Will be updated via the clone mapping in cseed.js.
			senderId: "u2", // Keep Bob (Admin) as the sender.
			applicationCloneIndex: app.cloneIndex, // Pass the clone key for mapping.
		});
	});
});

// Step 6: Clone Notifications for Messages (if applicable)
// Here we assume notifications reference a message's id from the export.
// They will be re-mapped later, so we keep them as-is.
const notifications = [];
messages.forEach((msg) => {
	notifications.push({
		id: undefined,
		userId: msg.recipientId,
		message: msg.id, // Will need re-mapping after messages are inserted.
		read: false,
	});
});

// Add Bob, the coordinator user, with id "u2"
users.push({
	id: "u2",
	name: "Bob",
	email: "bob@example.com",
	role: Role.ADMIN,
	guid: "bob",
});

// Step 7: Generate the Final Database State
const newDatabaseState = {
	users,
	universities: databaseExport.universities, // Keep unchanged
	applications,
	courseChoices,
	courses,
	messages,
	notifications,
};

// Write the new database state to a JSON file
fs.writeFileSync(
	"database_clone.json",
	JSON.stringify(newDatabaseState, null, 2),
);

console.log(
	"✅ Cloned database state for 15 users saved as database_clone.json!",
);
