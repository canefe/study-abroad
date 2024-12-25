import { z } from "zod";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";

export const choicesRouter = createTRPCRouter({
	getList: protectedProcedure.query(async ({ ctx }) => {
		// get the session from the context
		const session = ctx.session;
		// get user's coursechoices
		const courseChoices = await ctx.db.courseChoice.findMany({
			where: {
				userId: session.user.id,
			},
			include: {
				homeCourse: true,
				primaryCourse: true,
				alternativeCourse1: true,
				alternativeCourse2: true,
			},
		});
		return courseChoices;
	}),

	// only change the choices and not other fields
	saveChoiceChanges: protectedProcedure
		.input(
			z.object({
				homeCourseId: z.number(),
				abroadUniversityId: z.number(),
				primaryCourseId: z.number().nullable(),
				alternativeCourse1Id: z.number().nullable(),
				alternativeCourse2Id: z.number().nullable(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			console.log("     ");
			console.log("=====================================");
			console.log("STARTING MUTATION SAVE CHOICE CHANGES");
			console.log(input);
			const result = await ctx.db.courseChoice.updateMany({
				where: {
					userId: ctx.session.user.id,
					homeCourseId: input.homeCourseId,
				},
				data: {
					primaryCourseId: input.primaryCourseId,
					alternativeCourse1Id: input.alternativeCourse1Id,
					alternativeCourse2Id: input.alternativeCourse2Id,
				},
			});
			console.log(result);
			console.log("=====================================");
			console.log("     ");
			return result;
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
			console.log(course);
			return course;
		}),
});
