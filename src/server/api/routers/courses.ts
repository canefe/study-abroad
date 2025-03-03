import { z } from "zod";

import {
	adminProcedure,
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { Year } from "@prisma/client";

export const coursesRouter = createTRPCRouter({
	hello: publicProcedure
		.input(z.object({ text: z.string() }))
		.query(({ input }) => {
			return {
				greeting: `Hello ${input.text}`,
			};
		}),

	getFlaggedList: adminProcedure.query(async ({ ctx }) => {
		// get the session from the context
		const courses = await ctx.db.course.findMany({
			where: {
				flagged: true,
			},
			include: {
				university: {
					select: {
						name: true,
					},
				},
			},
		});

		return courses;
	}),

	getVerifiedList: adminProcedure.query(async ({ ctx }) => {
		const courses = await ctx.db.course.findMany({
			where: {
				verified: true,
			},
			include: {
				university: {
					select: {
						name: true,
					},
				},
			},
		});

		return courses;
	}),

	getUnverifiedList: adminProcedure.query(async ({ ctx }) => {
		const courses = await ctx.db.course.findMany({
			where: {
				verified: false,
			},
			include: {
				university: {
					select: {
						name: true,
					},
				},
			},
		});

		return courses;
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

	// input: the abroad university id, name of the course creates an abroad course
	addCourse: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				abroadUniversityId: z.number(),
				link: z.string().optional(),
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
					.enum([...Object.values(Year)] as [string, ...string[]])
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
					year: input.year ? [input.year as Year] : [],
					universityId: input.universityId,
					link: input.link,
				},
			});
			return course;
		}),
});
