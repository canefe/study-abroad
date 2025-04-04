import { faker } from "@faker-js/faker";
import { PrismaClient, Role, Year } from "@prisma/client";

const prisma = new PrismaClient();

const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomCourseName = (universityId) => {
	const prefixes = [
		"Advanced",
		"Intro to",
		"Intermediate",
		"Network",
		"Web",
		"Mobile",
		"Cloud",
		"Cyber",
		"Software",
		"Computer",
		"Digital",
	];

	const suffixes = [
		"Programming",
		"Algorithms",
		"Data Structures",
		"Design",
		"Security",
		"Engineering",
		"Development",
		"Systems",
		"Applications",
	];

	return `C10${universityId} - ${randomElement(prefixes)} ${randomElement(suffixes)}`;
};

async function generateRandomCourses(universityId) {
	const courses: any = [];
	for (let i = 0; i < 5; i++) {
		let name;
		let course;
		do {
			name = randomCourseName(universityId);
			// check if course already exists
			course = await prisma.course.findFirst({
				where: { name, universityId },
			});
			if (course) {
				console.log(`Course ${name} already exists`);
			}
		} while (course);
		courses.push({
			universityId,
			name,
			year: [],
		});
	}
	await prisma.course.createMany({
		data: courses,
		skipDuplicates: true,
	});
	console.log(
		`Created ${courses.length} courses for university ID ${universityId}`,
	);
}

/*const sortedUniversities = universities.sort((a, b) => a.id - b.id);
for (const university of sortedUniversities) {
	const uni = await prisma.university.findFirst({
		where: { name: university.name },
	});
	if (uni) {
		console.log(`Generating random courses for #${uni.id} ${uni.name}`);
		await generateRandomCourses(uni.id);
	}
}
*/
// guid is 7 random numbers and surname first letter

function generateRandomUser() {
	const firstName = faker.person.firstName();
	const lastName = faker.person.lastName();
	const guid = `${faker.number.int({ min: 1000000, max: 9999999 })}${lastName[0]}`;
	return {
		id: faker.string.uuid(),
		name: `${firstName} ${lastName}`,
		email: `${guid}@student.gla.ac.uk`,
		role: Role.STUDENT,
		guid: guid,
	};
}

// Create 100 random users
const randomUsers = Array.from({ length: 3 }, generateRandomUser);
await prisma.user.createMany({
	data: randomUsers,
	skipDuplicates: true,
});
