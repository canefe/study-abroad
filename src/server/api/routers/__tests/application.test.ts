import { test, expect } from "vitest";
import { appRouter } from "@/server/api/root";
import { createCallerFactory } from "@/server/api/trpc";
import { createInnerTRPCContext } from "@/server/api/trpc";
import { db } from "@/server/db";
import { Year } from "@prisma/client";

test("applications.getAll is denied for STUDENT role", async () => {
	const ctx = createInnerTRPCContext({
		session: {
			user: {
				id: "123",
				name: "John Doe",
				role: "STUDENT",
				guid: "abc-123",
			},
			expires: "2025-12-31T00:00:00.000Z",
		},
	});

	// create caller using factory
	const caller = createCallerFactory(appRouter)(ctx);

	await expect(caller.applications.getAll({})).rejects.toMatchObject({
		code: "FORBIDDEN",
	});
});

test("applications.getAll is allowed for ADMIN role", async () => {
	const ctx = createInnerTRPCContext({
		session: {
			user: {
				id: "123",
				name: "John Doe",
				role: "ADMIN",
				guid: "abc-123",
			},
			expires: "2025-12-31T00:00:00.000Z",
		},
	});

	// create caller using factory
	const caller = createCallerFactory(appRouter)(ctx);

	// Expect not to throw error
	await expect(caller.applications.getAll({})).resolves.toBeDefined();
});

test("applications.create fails with invalid year format", async () => {
	const ctx = createInnerTRPCContext({
		session: {
			user: {
				id: "123",
				name: "John Doe",
				role: "STUDENT",
				guid: "abc-123",
			},
			expires: "2025-12-31T00:00:00.000Z",
		},
	});

	const caller = createCallerFactory(appRouter)(ctx);

	// Get a valid university ID
	const hostUniversityId = await db.university
		.findFirst({
			select: { id: true },
		})
		.then((university) => university?.id);

	if (!hostUniversityId) {
		throw new Error("No university found");
	}

	await expect(
		caller.applications.create({
			abroadUniversityId: hostUniversityId,
			year: "INVALID_YEAR",
		}),
	).rejects.toThrow();
});

test("applications.create does not allow creating an application if the user already has one to the same host university", async () => {
	// First ensure the user exists in the database
	const userId = "test-user-123";

	// Create or find a user - you may need to adjust this based on your schema
	const user = await db.user.upsert({
		where: { id: userId },
		update: {},
		create: {
			id: userId,
			name: "Test User",
			guid: "test-guid-123",
			role: "STUDENT",
			// Add any other required fields
		},
	});

	const ctx = createInnerTRPCContext({
		session: {
			user: {
				id: userId,
				name: user.name,
				role: "STUDENT",
				guid: user.guid!,
			},
			expires: "2025-12-31T00:00:00.000Z",
		},
	});

	const caller = createCallerFactory(appRouter)(ctx);

	// Get a valid university ID
	const hostUniversityId = await db.university
		.findFirst({
			select: { id: true },
		})
		.then((university) => university?.id);

	if (!hostUniversityId) {
		throw new Error("No university found");
	}

	await expect(
		caller.applications.create({
			abroadUniversityId: hostUniversityId,
			year: "SECOND_YEAR_SINGLE_FULL_YEAR",
		}),
	).rejects.toMatchObject({
		message: expect.stringContaining("Application already exists"),
		code: "FORBIDDEN",
	});
});

test("applications.get allows a student to access their own application", async () => {
	// Create a user ID that exists in the database
	const userId = "existing-user-123"; // You'll need a user that exists in your test DB

	// First ensure the user exists
	await db.user.upsert({
		where: { id: userId },
		update: {},
		create: {
			id: userId,
			name: "Existing Student",
			guid: "existing-guid",
			role: "STUDENT",
			// Add any other required fields
		},
	});

	const ctx = createInnerTRPCContext({
		session: {
			user: {
				id: userId,
				name: "Existing Student",
				role: "STUDENT",
				guid: "existing-guid",
			},
			expires: "2025-12-31T00:00:00.000Z",
		},
	});

	const caller = createCallerFactory(appRouter)(ctx);

	// Find an existing application for this user
	let application = await db.application.findFirst({
		where: { userId },
	});

	// If no application exists, create one
	if (!application) {
		const universityId = await db.university
			.findFirst({
				select: { id: true },
			})
			.then((university) => university?.id);

		if (!universityId) {
			throw new Error("No university found");
		}

		application = await db.application.create({
			data: {
				userId,
				abroadUniversityId: universityId,
				year: "SECOND_YEAR_SINGLE_FULL_YEAR",
				status: "DRAFT",
				// Add any other required fields
			},
		});
	}

	// Should be able to access their own application
	await expect(
		caller.applications.get({ applicationId: application.id }),
	).resolves.toBeDefined();
});

test("applications.get prevents a student from accessing another student's application", async () => {
	const userId = "student-123";

	// Ensure user exists
	await db.user.upsert({
		where: { id: userId },
		update: {},
		create: {
			id: userId,
			name: "Student One",
			guid: "student-guid-123",
			role: "STUDENT",
			// Add any other required fields
		},
	});

	const ctx = createInnerTRPCContext({
		session: {
			user: {
				id: userId,
				name: "Student One",
				role: "STUDENT",
				guid: "student-guid-123",
			},
			expires: "2025-12-31T00:00:00.000Z",
		},
	});

	const caller = createCallerFactory(appRouter)(ctx);

	// Find or create an application from another student
	const otherUserId = "other-student-456";
	await db.user.upsert({
		where: { id: otherUserId },
		update: {},
		create: {
			id: otherUserId,
			name: "Other Student",
			guid: "other-student-guid",
			role: "STUDENT",
			// Add any other required fields
		},
	});

	let otherApplication = await db.application.findFirst({
		where: { userId: otherUserId },
	});

	if (!otherApplication) {
		const universityId = await db.university
			.findFirst({
				select: { id: true },
			})
			.then((university) => university?.id);

		if (!universityId) {
			throw new Error("No university found");
		}

		otherApplication = await db.application.create({
			data: {
				userId: otherUserId,
				abroadUniversityId: universityId,
				year: "SECOND_YEAR_SINGLE_FULL_YEAR",
				status: "DRAFT",
				// Add any other required fields
			},
		});
	}

	// Should not be able to access another student's application
	await expect(
		caller.applications.get({ applicationId: otherApplication.id }),
	).rejects.toMatchObject({
		message: expect.stringContaining("Application not found"),
		code: "NOT_FOUND",
	});
});

test("applications.updateCourseChoices allows a student to update their own application", async () => {
	// Create a user ID that exists in the database
	const userId = "update-user-123";

	// Ensure user exists
	await db.user.upsert({
		where: { id: userId },
		update: {},
		create: {
			id: userId,
			name: "Update Test User",
			guid: "update-test-guid",
			role: "STUDENT",
			// Add any other required fields
		},
	});

	const ctx = createInnerTRPCContext({
		session: {
			user: {
				id: userId,
				name: "Update Test User",
				role: "STUDENT",
				guid: "update-test-guid",
			},
			expires: "2025-12-31T00:00:00.000Z",
		},
	});

	const caller = createCallerFactory(appRouter)(ctx);

	// Find or create an application for this user
	let applicationId;
	applicationId = await db.application
		.findFirst({
			where: { userId },
			select: { id: true, courseChoices: true },
		})
		.then((application) => application?.id);

	if (!applicationId) {
		const universityId = await db.university
			.findFirst({
				where: {
					name: { not: "University of Glasgow" },
				},
				select: { id: true },
			})
			.then((university) => university?.id);

		if (!universityId) {
			throw new Error("No university found");
		}

		applicationId = await caller.applications
			.create({
				abroadUniversityId: universityId,
				year: Year.SECOND_YEAR_SINGLE_FULL_YEAR,
			})
			.then((application) => application.application.id);
	}

	// Get the application with course choices
	const application = await db.application.findFirst({
		where: { id: applicationId },
		select: { id: true, courseChoices: true, abroadUniversityId: true },
	});

	if (!application?.abroadUniversityId) {
		throw new Error("No university found");
	}

	// get initial course choices (copy from application.courseChoices)
	const initialCourseChoices = application.courseChoices;

	if (!initialCourseChoices.length) {
		throw new Error("No course choices found");
	}

	// Make student create a host university course
	const hostUniversityCourse = await caller.courses.addCourse({
		name: "Host University Course " + Math.random(),
		abroadUniversityId: application?.abroadUniversityId,
		description: "A course at the host university",
		link: "https://example.com",
	});

	expect(hostUniversityCourse).toBeDefined();
	// Pick a random course choice from the initial course choices
	const randomCourseChoice = initialCourseChoices[0];

	if (!randomCourseChoice) {
		throw new Error("No course choices found");
	}

	randomCourseChoice.primaryCourseId = hostUniversityCourse.id;

	// Should be able to update their own application
	await expect(
		caller.applications.updateCourseChoices({
			applicationId: application.id,
			choices: [randomCourseChoice],
		}),
	).resolves.toBeDefined();
});

test("applications.getAdmin is allowed for ADMIN role but denied for STUDENT role", async () => {
	// First create an application to test with
	const testUserId = "admin-test-user";

	// Ensure user exists
	await db.user.upsert({
		where: { id: testUserId },
		update: {},
		create: {
			id: testUserId,
			name: "Admin Test User",
			guid: "admin-test-guid",
			role: "STUDENT",
			// Add any other required fields
		},
	});

	// Create an application if none exists
	let testApplication = await db.application.findFirst({
		select: { id: true },
	});

	if (!testApplication) {
		const universityId = await db.university
			.findFirst({
				select: { id: true },
			})
			.then((university) => university?.id);

		if (!universityId) {
			throw new Error("No university found");
		}

		testApplication = await db.application.create({
			data: {
				userId: testUserId,
				abroadUniversityId: universityId,
				year: "SECOND_YEAR_SINGLE_FULL_YEAR",
				status: "DRAFT",
				// Add any other required fields
			},
		});
	}

	// Test with STUDENT role first
	const studentCtx = createInnerTRPCContext({
		session: {
			user: {
				id: "student-tester",
				name: "Student Tester",
				role: "STUDENT",
				guid: "student-tester-guid",
			},
			expires: "2025-12-31T00:00:00.000Z",
		},
	});

	const studentCaller = createCallerFactory(appRouter)(studentCtx);

	// Student should not be able to use getAdmin
	await expect(
		studentCaller.applications.getAdmin({
			applicationId: testApplication.id,
		}),
	).rejects.toMatchObject({
		code: "FORBIDDEN",
	});

	// Now test with ADMIN role
	const adminCtx = createInnerTRPCContext({
		session: {
			user: {
				id: "admin-tester",
				name: "Admin User",
				role: "ADMIN",
				guid: "admin-tester-guid",
			},
			expires: "2025-12-31T00:00:00.000Z",
		},
	});

	const adminCaller = createCallerFactory(appRouter)(adminCtx);

	// Admin should be able to use getAdmin
	await expect(
		adminCaller.applications.getAdmin({
			applicationId: testApplication.id,
		}),
	).resolves.toBeDefined();
});
