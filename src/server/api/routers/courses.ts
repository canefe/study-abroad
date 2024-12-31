import { z } from "zod";

import {
	adminProcedure,
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";

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
		.input(z.object({ universityId: z.number() }))
		.query(async ({ input, ctx }) => {
			const course = await ctx.db.course.findMany({
				where: {
					universityId: input.universityId,
				},
				include: {
					university: true,
				},
			});
			return course;
		}),

	// input: the abroad university id, name of the course creates an abroad course
	addCourse: protectedProcedure
		.input(z.object({ name: z.string(), abroadUniversityId: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const course = await ctx.db.course.create({
				data: {
					name: input.name,
					universityId: input.abroadUniversityId,
					createdAt: new Date(),
					createdBy: ctx.session.user.guid || ctx.session.user.name,
				},
			});
			return course;
		}),

	// input: university id, and year as optional, name of the course
	addCourseToUniversity: adminProcedure
		.input(
			z.object({
				universityId: z.number(),
				year: z.enum(["SECOND_YEAR", "THIRD_YEAR"]).optional(),
				name: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const course = await ctx.db.course.create({
				data: {
					name: input.name,
					universityId: input.universityId,
					year: input.year,
					createdAt: new Date(),
					createdBy: ctx.session.user.guid || ctx.session.user.name,
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
			const course = await ctx.db.course.delete({
				where: {
					id: input.id,
				},
			});
			return course;
		}),
});
