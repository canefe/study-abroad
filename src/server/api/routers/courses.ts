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
		.input(z.object({ id: z.number() }))
		.query(async ({ input, ctx }) => {
			const course = await ctx.db.course.findMany({
				where: {
					universityId: input.id,
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
				},
			});
			return course;
		}),

	flagCourse: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const course = await ctx.db.course.update({
				where: {
					id: input.id,
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
