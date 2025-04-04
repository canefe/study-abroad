import "dotenv/config"; // loads .env into process.env

/*
This file seeds the database with current School of Computing Science study abroad requirements such as:
* Dynamic Year Requirements
* Available Host Universities
* Home Courses assigned to each year
* Default settings for the application
* bob@example.com - Co-ordinator account
* alice@example.com - Test Student account

!This seed can be used in production, but test accounts should be removed before deployment. 
!(Assuming University of Glasgow SSO is used)
*/

import { PrismaClient, Role, Year } from "@prisma/client";
import dayjs from "dayjs";

// prisma/seed.js
const prisma = new PrismaClient();

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

	// Deadline Date for Applications setting
	// Set to three months from now
	// This is the date when applications can not be made anymore
	await prisma.setting.upsert({
		where: { key: "deadline_date" },
		update: {
			value: dayjs().add(3, "month").toISOString(),
		},
		create: {
			key: "deadline_date",
			value: dayjs().add(3, "month").toISOString(),
		},
	});

	// Max Applications Per Student setting
	// Set to 3 by default
	// This is the maximum number of applications a student can make
	await prisma.setting.upsert({
		where: { key: "max_applications" },
		update: { value: "3" },
		create: { key: "max_applications", value: "3" },
	});

	// Generate default home courses for each year
	await prisma.course.createMany({
		data: [
			{
				universityId: glasgowUniversity.id,
				name: "IOOP",
				description:
					"This course extends students' experience in programming using a strongly typed language and strengthens their problem solving skills. Students will learn the ideas that underpin object-oriented programming and will apply those concepts in developing small and medium sized software systems. Students will also learn to select and re-use existing software components and libraries, and will gain experience in concurrent programming and elementary graphical user-interface (GUI) development.",
				year: [
					Year.SECOND_YEAR_SINGLE_FULL_YEAR,
					Year.SECOND_YEAR_SINGLE_FIRST_SEMESTER,
					Year.SECOND_YEAR_JOINT_FULL_YEAR,
					Year.SECOND_YEAR_JOINT_FIRST_SEMESTER,
				],
				verified: true,
			},
			{
				universityId: glasgowUniversity.id,
				name: "AF2",
				description:
					"To introduce the foundational mathematics needed for Computing Science; To make students proficient in their use; To show how they can be applied to advantage in understanding computational phenomena.",
				year: [
					Year.SECOND_YEAR_SINGLE_FULL_YEAR,
					Year.SECOND_YEAR_SINGLE_FIRST_SEMESTER,
				],
				verified: true,
			},
			{
				universityId: glasgowUniversity.id,
				name: "NOSE2",
				description:
					"The course will introduce students to essential topics in computer networks and operating systems. It has a focus on the underlying concepts, design, and operation of the Internet, and on the role, basic features, and principles of computer operating systems. ",
				year: [
					Year.SECOND_YEAR_SINGLE_FULL_YEAR,
					Year.SECOND_YEAR_JOINT_FULL_YEAR,
					Year.SECOND_YEAR_JOINT_FIRST_SEMESTER,
					Year.SECOND_YEAR_SINGLE_FIRST_SEMESTER,
				],
				verified: true,
			},
			{
				universityId: glasgowUniversity.id,
				name: "ADS2",
				description:
					"To familiarise students with fundamental data types and data structures used in programming, with the design and analysis of algorithms for the manipulation of such structures, and to provide practice in the implementation and use of these structures and algorithms in a Java context.",
				year: [
					Year.SECOND_YEAR_SINGLE_FULL_YEAR,
					Year.SECOND_YEAR_SINGLE_SECOND_SEMESTER,
					Year.SECOND_YEAR_JOINT_FULL_YEAR,
					Year.SECOND_YEAR_JOINT_SECOND_SEMESTER,
				],
				verified: true,
			},
			{
				universityId: glasgowUniversity.id,
				name: "OOSE2",
				description:
					"This course introduces the basic concepts of software engineering. Students will learn methods for the design, implementation, testing and documentation of larger object-oriented programs, and will also develop program comprehension and design skills by studying and extending existing programs.",
				year: [
					Year.SECOND_YEAR_SINGLE_FULL_YEAR,
					Year.SECOND_YEAR_SINGLE_SECOND_SEMESTER,
					Year.SECOND_YEAR_JOINT_FULL_YEAR,
					Year.SECOND_YEAR_JOINT_SECOND_SEMESTER,
				],
				verified: true,
			},
			{
				universityId: glasgowUniversity.id,
				name: "WAD2",
				description:
					"The aim of this course is to provide students with a comprehensive overview of web application development. It will provide students with the skills to design and develop distributed web applications in a disciplined manner, using a range of tools and technologies. It will also strengthen their understanding of the context and rationale of distributed systems. ",
				year: [
					Year.SECOND_YEAR_SINGLE_FULL_YEAR,
					Year.SECOND_YEAR_SINGLE_SECOND_SEMESTER,
					Year.SECOND_YEAR_JOINT_FULL_YEAR,
					Year.SECOND_YEAR_JOINT_SECOND_SEMESTER,
				],
				verified: true,
			},
			{
				universityId: glasgowUniversity.id,
				name: "CS1F",
				description:
					"The aim of the CS1F course is to give students an understanding of human-computer interaction (styles of interaction, requirements for an interactive system in relation to the nature of the tasks being supported, issues in the design of interactive systems, critical assessment of designs); the ways in which databases contribute to the management of large amounts of data, the professional and ethical issues raised by the existence of databases and networks.",
				verified: true,
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
				description:
					"To develop the student's skills in the design and analysis of algorithms; To study algorithms for a range of important standard problems; To introduce the student to the theory of NP-completeness together with its practical implications;To make the student aware of fundamental concepts of computability.",
				year: [
					Year.THIRD_YEAR_SINGLE_FULL_YEAR,
					Year.THIRD_YEAR_JOINT_FULL_YEAR,
				],
				verified: true,
			},
			{
				universityId: glasgowUniversity.id,
				name: "SP",
				description:
					"This course aims to introduce students to low-level systems programming. It focusses on programming in an unmanaged environment, where data layout matters, and where performance is critical. This might include operating systems kernels, device drivers, low-level networking code, or other areas where the software-machine interface becomes critical.",
				year: [
					Year.THIRD_YEAR_SINGLE_FULL_YEAR,
					Year.THIRD_YEAR_JOINT_FULL_YEAR,
				],
				verified: true,
			},
			{
				universityId: glasgowUniversity.id,
				name: "HCSDE",
				description:
					"The aims of the course are: to offer students the opportunity to become familiar with one of the most important interaction paradigms; to enable students to become skilled in the use of techniques and tools for modelling, implementing and evaluating interactive systems; to enable students to apply the theories, techniques and tools presented in the course via challenging exercises which combine design, implementation and evaluation.",
				year: [Year.THIRD_YEAR_SINGLE_FULL_YEAR],
				verified: true,
			},
			{
				universityId: glasgowUniversity.id,
				name: "DF",
				description:
					"This course will cover computational approaches to working with numerical data on a large scale. Computation on arrays of continuous variables underpins machine learning, information retrieval, data analytics, computer vision and signal processing. This course will cover vectorised operations on numerical arrays, fundamental stochastic and probabilistic methods and scientific visualisation.",
				year: [Year.THIRD_YEAR_SINGLE_FULL_YEAR],
				verified: true,
			},
			{
				universityId: glasgowUniversity.id,
				name: "PSD",
				description:
					"Introduce students to modern software development methods and techniques for building and maintaining large systems; Prepare students to apply these methods and techniques presented to them in the context of an extended group-based software development exercise; Make the students aware of the professional, social and ethical dimensions of software development; Instil in the students a professional attitude towards software development.",
				year: [
					Year.THIRD_YEAR_SINGLE_FULL_YEAR,
					Year.THIRD_YEAR_JOINT_FULL_YEAR,
				],
				verified: true,
			},
			{
				universityId: glasgowUniversity.id,
				name: "TP",
				description:
					"This course gives students the experience of working on a substantial team based software project. The course provides the opportunity to apply the principles, practices and tools learned during the associated Professional Software Development (H) course.",
				year: [
					Year.THIRD_YEAR_SINGLE_FULL_YEAR,
					Year.THIRD_YEAR_JOINT_FULL_YEAR,
				],
				verified: true,
			},
		],
		skipDuplicates: true,
	});

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

	const defaultYearRequirements = {
		SECOND_YEAR_SINGLE_FULL_YEAR: {
			// If on alternate route, match CS1F
			alternateCourses: ["CS1F"],
			additionalCourses: [],
			optionalCourses: false,
		},
		SECOND_YEAR_SINGLE_FIRST_SEMESTER: {
			// For Single S1, match one of AF2 or CS1F
			alternateCourses: [],
			additionalCourses: ["AF2", "CS1F"],
			optionalCourses: false,
		},
		SECOND_YEAR_SINGLE_SECOND_SEMESTER: {
			alternateCourses: [],
			additionalCourses: [],
			optionalCourses: false,
		},
		SECOND_YEAR_JOINT_FULL_YEAR: {
			// For Joint Full Year, match one of AF2, WAD2, or CS1F
			alternateCourses: [],
			additionalCourses: ["AF2", "WAD2", "CS1F"],
			optionalCourses: false,
		},
		SECOND_YEAR_JOINT_FIRST_SEMESTER: {
			// For Joint S1, match one of AF2 or CS1F
			alternateCourses: [],
			additionalCourses: ["AF2", "CS1F"],
			optionalCourses: false,
		},
		SECOND_YEAR_JOINT_SECOND_SEMESTER: {
			alternateCourses: [],
			additionalCourses: [],
			optionalCourses: false,
		},
		THIRD_YEAR_SINGLE_FULL_YEAR: {
			// For Third Year Single Full Year, just note that optional CS courses can be added
			alternateCourses: [],
			additionalCourses: [],
			optionalCourses: true,
		},
		THIRD_YEAR_JOINT_FULL_YEAR: {
			// For Third Year Joint Full Year, optional CS courses are noted to reach half the credit load
			alternateCourses: [],
			additionalCourses: [],
			optionalCourses: true,
		},
	};

	// only create if not exists
	await prisma.setting.upsert({
		where: { key: "year_requirements" },
		update: {
			value: JSON.stringify(defaultYearRequirements),
		},
		create: {
			key: "year_requirements",
			value: JSON.stringify(defaultYearRequirements),
		},
	});
}

main()
	.then(() => console.log("Seed data created"))
	.catch((e) => console.error(e))
	.finally(async () => await prisma.$disconnect());
