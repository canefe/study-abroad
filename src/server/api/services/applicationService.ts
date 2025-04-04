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

	applyRequirements: async (
		ctx: any,
		{
			applicationId,
			alternateRoute,
			additionalCourse,
		}: {
			applicationId: number;
			alternateRoute: boolean;
			additionalCourse?: string;
		},
	) => {
		// Retrieve the application to obtain its year.
		const application = await ctx.db.application.findUnique({
			where: { id: applicationId },
		});
		if (!application) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Application not found",
			});
		}
		const year: string = application.year; // assuming year stored as string (matching enum)

		// Retrieve the year_requirements setting.
		const settingRecord = await ctx.db.setting.findUnique({
			where: { key: "year_requirements" },
		});
		if (!settingRecord) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Year requirements setting not found",
			});
		}
		const yearReqConfig = JSON.parse(settingRecord.value);
		const yearConfig = yearReqConfig[year];
		if (!yearConfig) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: `No configuration found for year ${year}`,
			});
		}

		// Process alternate route: add course choices for each course in alternateCourses.
		if (
			alternateRoute &&
			yearConfig.alternateCourses &&
			Array.isArray(yearConfig.alternateCourses)
		) {
			for (const courseCode of yearConfig.alternateCourses) {
				const course = await ctx.db.course.findUnique({
					where: { name: courseCode },
				});
				if (course) {
					await ctx.db.courseChoice.create({
						data: {
							homeCourseId: course.id,
							applicationId,
						},
					});
				}
			}
		}

		// Process additional course: look it up by name and add if provided.
		if (additionalCourse) {
			const course = await ctx.db.course.findUnique({
				where: { name: additionalCourse },
			});
			if (course) {
				await ctx.db.courseChoice.create({
					data: {
						homeCourseId: course.id,
						applicationId,
					},
				});
			} else {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Additional course "${additionalCourse}" not found`,
				});
			}
		}
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
