import { z } from "zod";

import {
	adminProcedure,
	createTRPCRouter,
	protectedProcedure,
} from "@/server/api/trpc";

export const choicesRouter = createTRPCRouter({
	// only change the choices and not other fields
	saveChoiceChanges: protectedProcedure
		.input(
			z.object({
				applicationId: z.number(),
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
					applicationId: input.applicationId,
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

	// admin save choices of a student
	saveChoicesAdmin: adminProcedure
		.input(
			z.object({
				applicationId: z.number(),
				homeCourseId: z.number(),
				primaryCourseId: z.number().nullable(),
				alternativeCourse1Id: z.number().nullable(),
				alternativeCourse2Id: z.number().nullable(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const result = await ctx.db.courseChoice.updateMany({
				where: {
					applicationId: input.applicationId,
					homeCourseId: input.homeCourseId,
				},
				data: {
					primaryCourseId: input.primaryCourseId,
					alternativeCourse1Id: input.alternativeCourse1Id,
					alternativeCourse2Id: input.alternativeCourse2Id,
				},
			});
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
