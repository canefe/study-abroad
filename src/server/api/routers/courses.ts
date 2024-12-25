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

	getStudent: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const user = await ctx.db.user.findUnique({
				where: {
					id: input.id,
				},
			});
			return user;
		}),

	getSecretMessage: protectedProcedure.query(async ({ ctx }) => {
		const text =
			ctx.session.user.role === "ADMIN" ? "Hello admin!" : "Hello student!";
		return text;
	}),
});
