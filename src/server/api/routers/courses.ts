import { z } from "zod";

import {
	adminProcedure,
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { Year } from "@prisma/client";
import { getHomeCourses } from "../lib/getHomeCourses";

export const coursesRouter = createTRPCRouter({
	getAll: adminProcedure
		.input(
			z.object({
				filter: z.object({
					q: z.string().optional(),
					universities: z.array(z.number()).optional(),
					verified: z.boolean().optional(),
					flagged: z.boolean().optional(),
				}),
				page: z.number().default(1),
				pageSize: z.number().default(10),
			}),
		)
		.query(async ({ input, ctx }) => {
			const { page, pageSize } = input;
			const { filter } = input;
			const skip = (page - 1) * pageSize;

			// Construct the where clause
			const whereClause: any = {
				...(filter.q && {
					name: {
						contains: filter.q,
						mode: "insensitive",
					},
				}),
			};

			// Conditionally add the status filter
			if (filter.verified !== undefined) {
				whereClause.verified = filter.verified;
			}

			if (filter.flagged !== undefined) {
				whereClause.flagged = filter.flagged;
			}

			if (filter.universities && filter.universities.length > 0) {
				whereClause.universityId = {
					in: filter.universities.map((u) => u),
				};
			}

			const courses = await ctx.db.course.findMany({
				where: whereClause,
				include: {
					university: true,
				},
				skip,
				take: pageSize,
			});

			const total = await ctx.db.course.count({
				where: whereClause,
			});

			return {
				courses,
				total,
				totalPages: Math.ceil(total / pageSize),
				currentPage: page,
			};
		}),

	getCourses: protectedProcedure
		.input(
			z.object({
				universityId: z.number().optional(),
				flagged: z.boolean().optional(),
				verified: z.boolean().optional(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const course = await ctx.db.course.findMany({
				where: {
					...(input.universityId !== undefined && {
						universityId: input.universityId,
					}),
					...(input.flagged !== undefined && {
						flagged: input.flagged,
					}),
					...(input.verified !== undefined && {
						verified: input.verified,
					}),
				},
				include: {
					university: true,
				},
			});
			return course;
		}),

	getHomeCourses: protectedProcedure
		.input(
			z
				.object({
					year: z
						.enum([...Object.values(Year)] as [string, ...string[]])
						.optional(),
				})
				.optional(),
		)
		.query(async ({ input, ctx }) => {
			// get home university
			const homeCourses = await getHomeCourses(ctx.db, input?.year as Year);
			return homeCourses;
		}),

	// input: the abroad university id, name of the course creates an abroad course
	addCourse: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				abroadUniversityId: z.number(),
				link: z.string().optional(),
				description: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const course = await ctx.db.course.create({
				data: {
					name: input.name,
					universityId: input.abroadUniversityId,
					createdAt: new Date(),
					createdBy: ctx.session?.user.guid || ctx.session?.user.name,
					link: input.link,
					description: input.description,
				},
			});
			return course;
		}),

	// input: university id, and year as optional, name of the course
	addCourseToUniversity: adminProcedure
		.input(
			z.object({
				universityId: z.number(),
				year: z
					.enum([...Object.values(Year)] as [string, ...string[]])
					.optional(),
				name: z.string(),
				link: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			// check if a course with same name exists first
			const existingCourse = await ctx.db.course.findFirst({
				where: {
					name: input.name,
				},
			});

			if (existingCourse) {
				throw new Error("Course with same name already exists.");
			}

			const course = await ctx.db.course.create({
				data: {
					name: input.name,
					universityId: input.universityId,
					year: [input.year as Year],
					createdAt: new Date(),
					createdBy: ctx.session?.user.guid || ctx.session?.user.name,
					link: input.link,
				},
			});
			return course;
		}),

	flagCourse: protectedProcedure
		.input(z.object({ courseId: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const course = await ctx.db.course.update({
				where: {
					id: input.courseId,
				},
				data: {
					flagged: true,
				},
			});
			return course;
		}),

	unflagCourse: adminProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const course = await ctx.db.course.update({
				where: {
					id: input.id,
				},
				data: {
					flagged: false,
				},
			});
			return course;
		}),

	// input: the course id, verifies a course
	verifyCourse: adminProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const course = await ctx.db.course.update({
				where: {
					id: input.id,
				},
				data: {
					verified: true,
					flagged: false,
				},
			});
			return course;
		}),

	// input: the course id, unverifies a course
	unverifyCourse: adminProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const course = await ctx.db.course.update({
				where: {
					id: input.id,
				},
				data: {
					verified: false,
				},
			});
			return course;
		}),

	// input: the course id, deletes a course
	deleteCourse: adminProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => {
			// first delete the coursechoices that use this course
			await ctx.db.courseChoice.deleteMany({
				where: {
					homeCourseId: input.id,
				},
			});

			const course = await ctx.db.course.delete({
				where: {
					id: input.id,
				},
			});
			return course;
		}),
	setYearOfCourse: adminProcedure
		.input(
			z.object({
				id: z.number(),
				year: z
					.enum([...Object.values(Year)] as [string, ...string[]])
					.optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const course = await ctx.db.course.findUnique({
				where: {
					id: input.id,
				},
				select: {
					year: true,
				},
			});

			if (!course) {
				throw new Error("Course not found");
			}

			let updatedYears;
			if (input.year === undefined) {
				updatedYears = [];
			} else if (course.year.includes(input.year as Year)) {
				updatedYears = course.year.filter((y) => y !== input.year);
			} else {
				updatedYears = [...course.year, input.year as Year];
			}

			const updatedCourse = await ctx.db.course.update({
				where: {
					id: input.id,
				},
				data: {
					year: updatedYears,
				},
			});

			return updatedCourse;
		}),
	// Edit course name and year and university
	editCourse: adminProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string(),
				year: z
					.array(z.enum([...Object.values(Year)] as [string, ...string[]]))
					.optional(),
				universityId: z.number(),
				link: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const course = await ctx.db.course.update({
				where: {
					id: input.id,
				},
				data: {
					name: input.name,
					year: input.year?.map((y) => y as Year) || [],
					universityId: input.universityId,
					link: input.link,
				},
			});
			return course;
		}),

	//getCourseCount takes in optional enum "FLAGGED", "VERIFIED", "UNVERIFIED" and returns the count of courses
	getCourseCount: adminProcedure
		.input(
			z
				.object({
					filter: z.enum(["FLAGGED", "VERIFIED", "UNVERIFIED"]).optional(),
				})
				.optional(),
		)
		.query(async ({ input, ctx }) => {
			const whereClause: any = {};

			if (input?.filter === "FLAGGED") {
				whereClause.flagged = true;
			} else if (input?.filter === "VERIFIED") {
				whereClause.verified = true;
			} else if (input?.filter === "UNVERIFIED") {
				whereClause.verified = false;
			}

			const count = await ctx.db.course.count({
				where: whereClause,
			});

			return count;
		}),
});
