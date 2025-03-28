import { TRPCError } from "@trpc/server";
import { Status, Year } from "@prisma/client";

export const applicationService = {
	createApplication: async (
		ctx: any,
		userId: string,
		abroadUniversityId: number,
		year: Year,
	) => {
		return await ctx.db.application.create({
			data: {
				userId,
				abroadUniversityId,
				status: Status.DRAFT,
				year,
			},
		});
	},

	addCourseChoices: async (
		ctx: any,
		applicationId: number,
		courses: Array<{ id: number }>,
	) => {
		// create course choices in parallel
		await Promise.all(
			courses.map(async (course) => {
				await ctx.db.courseChoice.create({
					data: {
						homeCourseId: course.id,
						applicationId,
					},
				});
			}),
		);
	},

	addAlternateRouteCourse: async (ctx: any, applicationId: number) => {
		const cs1fCourse = await ctx.db.course.findFirst({
			where: {
				name: "CS1F",
			},
		});
		if (!cs1fCourse) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "CS1F course not found",
			});
		}
		await ctx.db.courseChoice.create({
			data: {
				homeCourseId: cs1fCourse.id,
				applicationId,
			},
		});
	},

	addAdditionalCourse: async (
		ctx: any,
		applicationId: number,
		courseName: string,
	) => {
		const additionalCourse = await ctx.db.course.findFirst({
			where: {
				name: courseName,
			},
		});
		if (!additionalCourse) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Additional course not found",
			});
		}
		await ctx.db.courseChoice.create({
			data: {
				homeCourseId: additionalCourse.id,
				applicationId,
			},
		});
	},
	deleteApplication: async (ctx: any, applicationId: number) => {
		// remove course choices
		await ctx.db.courseChoice.deleteMany({
			where: {
				applicationId: applicationId,
			},
		});

		// delete messages
		await ctx.db.message.deleteMany({
			where: {
				applicationId: applicationId,
			},
		});

		// remove application
		await ctx.db.application.delete({
			where: {
				id: applicationId,
			},
		});
	},
};
