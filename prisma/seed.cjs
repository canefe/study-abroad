// prisma/seed.js
const { PrismaClient, Year } = require("@prisma/client");
const { faker } = require("@faker-js/faker");
const prisma = new PrismaClient();
const { Role } = require("@prisma/client");

async function main() {
	// Create Universities
	const universities = [
		{ name: "University of Glasgow", location: "United Kingdom" },
		{ name: "Deakin University", location: "Australia" },
		{ name: "Queensland Uni. of Technology", location: "Australia" },
		{ name: "Macquarie University", location: "Australia" },
		{ name: "Uni. of Western Australia", location: "Australia" },
		{ name: "University of Queensland", location: "Australia" },
		{ name: "University of Melbourne", location: "Australia" },
		{ name: "University of Sydney", location: "Australia" },
		{ name: "University of New South Wales", location: "Australia" },
		{ name: "University of Adelaide", location: "Australia" },
		{ name: "Monash University", location: "Australia" },
		{ name: "Paris Lodron Universitt Salzburg", location: "Austria" },
		{ name: "Universit Libre de Bruxelles", location: "Belgium" },
		{ name: "University of Ottawa", location: "Canada" },
		{ name: "Dalhousie University", location: "Canada" },
		{ name: "University of Calgary", location: "Canada" },
		{ name: "University of British Columbia", location: "Canada" },
		{ name: "U of British Columbia Okanagan", location: "Canada" },
		{ name: "University of Toronto", location: "Canada" },
		{ name: "Simon Fraser University", location: "Canada" },
		{ name: "Queen's University", location: "Canada" },
		{ name: "McGill University", location: "Canada" },
		{ name: "Pontificia Univ.Catolica Chile", location: "Chile" },
		{ name: "Univ.of Nottingham Ningbo Campus", location: "China" },
		{ name: "Aarhus Universitet", location: "Denmark" },
		{ name: "University of Helsinki", location: "Finland" },
		{ name: "Universit Aix-Marseille", location: "France" },
		{ name: "Eberhard Karls Universitat Tubingen", location: "Germany" },
		{ name: "Johannes-Gutenberg-Universitat Mainz", location: "Germany" },
		{
			name: "National and Kapodistrian University of Athens",
			location: "Greece",
		},
		{ name: "University of Hong Kong", location: "Hong Kong" },
		{ name: "Chinese Univ of Hong Kong", location: "Hong Kong" },
		{
			name: "HKUST - Hong Kong University of Science and Technology",
			location: "Hong Kong",
		},
		{ name: "Sapienza University of Rome", location: "Italy" },
		{ name: "Keio University", location: "Japan" },
		{ name: "Waseda University", location: "Japan" },
		{ name: "Kyoto University", location: "Japan" },
		{ name: "Hitotsubashi University", location: "Japan" },
		{ name: "University of Tokyo", location: "Japan" },
		{ name: "Yonsei University", location: "Korea, Republic of" },
		{ name: "Korea University", location: "Korea, Republic of" },
		{ name: "Seoul National University", location: "Korea, Republic of" },
		{ name: "Uni of Nottingham Malaysia", location: "Malaysia" },
		{ name: "Tecnologico de Monterrey", location: "Mexico" },
		{ name: "Radboud Universiteit Nijmegen", location: "Netherlands" },
		{ name: "Universiteit van Amsterdam", location: "Netherlands" },
		{ name: "University of Auckland", location: "New Zealand" },
		{ name: "University of Otago", location: "New Zealand" },
		{ name: "Universidade de Lisboa", location: "Portugal" },
		{ name: "University of Bucharest", location: "Romania" },
		{ name: "Singapore Management University", location: "Singapore" },
		{ name: "National Univ.of Singapore", location: "Singapore" },
		{ name: "Nanyang Technological Univ.", location: "Singapore" },
		{ name: "Universidad Autonoma de Madrid", location: "Spain" },
		{ name: "Stockholms Universitet", location: "Sweden" },
		{ name: "Universite de Lausanne", location: "Switzerland" },
		{ name: "National Taiwan Normal Uni", location: "Taiwan" },
		{ name: "University of Vermont", location: "United States" },
		{ name: "Bentley University", location: "United States" },
		{ name: "State Univ. of New York Albany", location: "United States" },
		{ name: "University of California", location: "United States" },
		{ name: "Uni of Wisconsin Madison", location: "United States" },
		{ name: "University of Virginia", location: "United States" },
		{ name: "University of Texas at Austin", location: "United States" },
		{ name: "U.of North Carolina-Chapel Hill", location: "United States" },
		{ name: "University of Florida", location: "United States" },
		{ name: "University of Alabama", location: "United States" },
		{ name: "Radford University", location: "United States" },
		{ name: "Miami University OH", location: "United States" },
		{ name: "Uni of Massachusetts Amherst", location: "United States" },
		{ name: "University of Oklahoma", location: "United States" },
		{ name: "University of Miami, Florida", location: "United States" },
		{ name: "American University", location: "United States" },
		{ name: "University of Alaska Fairbanks", location: "United States" },
		{ name: "Boston College", location: "United States" },
		{ name: "University of Minnesota", location: "United States" },
		{ name: "University of Denver", location: "United States" },
	];

	await prisma.university.createMany({
		data: universities.map((university) => ({
			name: university.name,
			location: university.location,
		})),
		skipDuplicates: true,
	});

	// Retrieve the ID of the "University of Glasgow"
	const glasgowUniversity = await prisma.university.findFirst({
		where: { name: "University of Glasgow" },
	});

	if (!glasgowUniversity) {
		throw new Error("University of Glasgow not found");
	}

	// Set the home university setting to the ID of the "University of Glasgow"
	await prisma.setting.upsert({
		where: { key: "home_university" },
		update: { value: glasgowUniversity.id.toString() },
		create: {
			key: "home_university",
			value: glasgowUniversity.id.toString(),
		},
	});

	await prisma.setting.upsert({
		where: { key: "deadline_date" },
		// set to one month from now
		update: {
			value: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
		},
		create: {
			key: "deadline_date",
			value: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
		},
	});

	// Generate default home courses for each year
	await prisma.course.createMany({
		data: [
			{
				universityId: glasgowUniversity.id,
				name: "IOOP",
				year: [
					Year.SECOND_YEAR_SINGLE_FULL_YEAR,
					Year.SECOND_YEAR_SINGLE_FIRST_SEMESTER,
					Year.SECOND_YEAR_JOINT_FULL_YEAR,
					Year.SECOND_YEAR_JOINT_FIRST_SEMESTER,
				],
			},
			{
				universityId: glasgowUniversity.id,
				name: "AF2",
				year: [
					Year.SECOND_YEAR_SINGLE_FULL_YEAR,
					Year.SECOND_YEAR_SINGLE_FIRST_SEMESTER,
				],
			},
			{
				universityId: glasgowUniversity.id,
				name: "NOSE2",
				year: [
					Year.SECOND_YEAR_SINGLE_FULL_YEAR,
					Year.SECOND_YEAR_JOINT_FULL_YEAR,
					Year.SECOND_YEAR_JOINT_FIRST_SEMESTER,
					Year.SECOND_YEAR_SINGLE_FIRST_SEMESTER,
				],
			},
			{
				universityId: glasgowUniversity.id,
				name: "ADS2",
				year: [
					Year.SECOND_YEAR_SINGLE_FULL_YEAR,
					Year.SECOND_YEAR_SINGLE_SECOND_SEMESTER,
					Year.SECOND_YEAR_JOINT_FULL_YEAR,
					Year.SECOND_YEAR_JOINT_SECOND_SEMESTER,
				],
			},
			{
				universityId: glasgowUniversity.id,
				name: "OOSE2",
				year: [
					Year.SECOND_YEAR_SINGLE_FULL_YEAR,
					Year.SECOND_YEAR_SINGLE_SECOND_SEMESTER,
					Year.SECOND_YEAR_JOINT_FULL_YEAR,
					Year.SECOND_YEAR_JOINT_SECOND_SEMESTER,
				],
			},
			{
				universityId: glasgowUniversity.id,
				name: "WAD2",
				year: [
					Year.SECOND_YEAR_SINGLE_FULL_YEAR,
					Year.SECOND_YEAR_SINGLE_SECOND_SEMESTER,
					Year.SECOND_YEAR_JOINT_FULL_YEAR,
					Year.SECOND_YEAR_JOINT_SECOND_SEMESTER,
				],
			},
			{
				universityId: glasgowUniversity.id,
				name: "CS1F",
			},
			/*
			3rd year single honours full year
Match all of ALG1, SP, HCSDE, DF, PSD, TP

 
3rd year joint honours full year
Match all of ALG1, SP, PSD, TP
			*/
			{
				universityId: glasgowUniversity.id,
				name: "ALG1",
				year: [
					Year.THIRD_YEAR_SINGLE_FULL_YEAR,
					Year.THIRD_YEAR_JOINT_FULL_YEAR,
				],
			},
			{
				universityId: glasgowUniversity.id,
				name: "SP",
				year: [
					Year.THIRD_YEAR_SINGLE_FULL_YEAR,
					Year.THIRD_YEAR_JOINT_FULL_YEAR,
				],
			},
			{
				universityId: glasgowUniversity.id,
				name: "HCSDE",
				year: [Year.THIRD_YEAR_SINGLE_FULL_YEAR],
			},
			{
				universityId: glasgowUniversity.id,
				name: "DF",
				year: [Year.THIRD_YEAR_SINGLE_FULL_YEAR],
			},
			{
				universityId: glasgowUniversity.id,
				name: "PSD",
				year: [
					Year.THIRD_YEAR_SINGLE_FULL_YEAR,
					Year.THIRD_YEAR_JOINT_FULL_YEAR,
				],
			},
			{
				universityId: glasgowUniversity.id,
				name: "TP",
				year: [
					Year.THIRD_YEAR_SINGLE_FULL_YEAR,
					Year.THIRD_YEAR_JOINT_FULL_YEAR,
				],
			},
		],
		skipDuplicates: true,
	});
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
		const courses = [];
		for (let i = 0; i < 25; i++) {
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

	const sortedUniversities = universities.sort((a, b) => a.id - b.id);
	for (const university of sortedUniversities) {
		const uni = await prisma.university.findFirst({
			where: { name: university.name },
		});
		if (uni) {
			//console.log(`Generating random courses for #${uni.id} ${uni.name}`);
			//await generateRandomCourses(uni.id);
		}
	}
	// guid is 7 random numbers and surname first letter

	// a random user generator
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
	//const randomUsers = Array.from({ length: 20 }, generateRandomUser);
	//await prisma.user.createMany({
	//	data: randomUsers,
	//	skipDuplicates: true,
	//});

	// Create Users
	await prisma.user.createMany({
		data: [
			{
				id: "u1",
				name: "Alice",
				email: "alice@example.com",
				role: "STUDENT",
				guid: "1234567A",
			},
			{ id: "u2", name: "Bob", email: "bob@example.com", role: "ADMIN" },
		],
		skipDuplicates: true,
	});

	// Create Pre-defined Evaluation-ready state. (with applications and all)
}

main()
	.then(() => console.log("Seed data created"))
	.catch((e) => console.error(e))
	.finally(async () => await prisma.$disconnect());
