import { z } from "zod";

import {
	adminProcedure,
	createTRPCRouter,
	protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const applicationsRouter = createTRPCRouter({
	getList: protectedProcedure.query(async ({ ctx }) => {
		const session = ctx.session;
		const applications = await ctx.db.application.findMany({
			where: {
				userId: session?.user?.id,
			},
			include: {
				courseChoices: true,
				abroadUniversity: true,
			},
		});
		return applications;
	}),
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const session = ctx.session;
		// check if user is admin
		if (session.user.role === "ADMIN") {
			const applications = await ctx.db.application.findMany({
				include: {
					courseChoices: true,
					abroadUniversity: true,
					user: true,
				},
			});
			return applications;
		}
		// return 403 if user is not admin
		return new Response("Forbidden", { status: 403 });
	}),
	// takes in an abroad university id, creates an application with home university's courses count coursechoices
	create: protectedProcedure
		.input(
			z.object({
				abroadUniversityId: z.number(),
				year: z.enum(["SECOND_YEAR", "THIRD_YEAR"]),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const session = ctx.session;
			const homeUniversitySetting = await ctx.db.setting.findFirst({
				where: {
					key: "home_university",
				},
			});

			if (!homeUniversitySetting) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Home university not set",
				});
			}

			const homeUniversityCourses = await ctx.db.course.findMany({
				where: {
					universityId: parseInt(homeUniversitySetting?.value),
					year: input.year,
				},
			});

			// Check if count of applications is less than 3
			const applicationsCount = await ctx.db.application.count({
				where: {
					userId: session.user.id,
				},
			});
			if (applicationsCount >= 3) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Maximum number of applications reached",
				});
			}

			// if abroadUniversityId already has an application, return 403
			const existingApplication = await ctx.db.application.findFirst({
				where: {
					userId: session.user.id,
					abroadUniversityId: input.abroadUniversityId,
				},
			});
			if (existingApplication) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Application already exists",
				});
			}
			// create an application
			const application = await ctx.db.application.create({
				data: {
					userId: session.user.id,
					abroadUniversityId: input.abroadUniversityId,
					status: "DRAFT",
					year: input.year,
				},
			});
			// create course choices
			homeUniversityCourses.forEach(async (course) => {
				await ctx.db.courseChoice.create({
					data: {
						homeCourseId: course.id,
						userId: session.user.id,
						applicationId: application.id,
						semester: "FULL_YEAR",
						year: input.year,
					},
				});
			});
			return "Success";
		}),
	// remove an application. Also removes all course choices related to the application
	remove: protectedProcedure
		.input(z.object({ applicationId: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const session = ctx.session;
			// check if user is owner of application
			const application = await ctx.db.application.findFirst({
				where: {
					id: input.applicationId,
					userId: session.user.id,
				},
			});

			if (!application) {
				return new Response("Forbidden", { status: 403 });
			}

			// remove course choices
			await ctx.db.courseChoice.deleteMany({
				where: {
					applicationId: input.applicationId,
				},
			});

			// delete messages
			await ctx.db.message.deleteMany({
				where: {
					applicationId: input.applicationId,
				},
			});

			// remove application
			await ctx.db.application.delete({
				where: {
					id: input.applicationId,
				},
			});
			return "Success";
		}),
	get: protectedProcedure
		.input(z.object({ applicationId: z.number() }))
		.query(async ({ input, ctx }) => {
			const session = ctx.session;
			const application = await ctx.db.application.findFirst({
				where: {
					id: input.applicationId,
					userId: session.user.id,
				},
				include: {
					courseChoices: {
						include: {
							homeCourse: true,
							primaryCourse: true,
							alternativeCourse1: true,
							alternativeCourse2: true,
						},
					},
					abroadUniversity: true,
				},
			});
			return application;
		}),
	getAdmin: adminProcedure
		.input(z.object({ applicationId: z.number() }))
		.query(async ({ input, ctx }) => {
			const application = await ctx.db.application.findFirst({
				where: {
					id: input.applicationId,
				},
				include: {
					courseChoices: {
						include: {
							homeCourse: true,
							primaryCourse: true,
							alternativeCourse1: true,
							alternativeCourse2: true,
						},
					},
					user: true,
					abroadUniversity: true,
				},
			});
			return application;
		}),
	submit: protectedProcedure
		.input(z.object({ applicationId: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const session = ctx.session;
			// check if user is owner of application
			const application = await ctx.db.application.findFirst({
				where: {
					id: input.applicationId,
					userId: session.user.id,
				},
			});

			if (!application) {
				return new Response("Forbidden", { status: 403 });
			}

			// update application status
			await ctx.db.application.update({
				where: {
					id: input.applicationId,
				},
				data: {
					status: "SUBMITTED",
				},
			});
			return "Success";
		}),
	withdraw: protectedProcedure
		.input(z.object({ applicationId: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const session = ctx.session;
			// check if user is owner of application
			const application = await ctx.db.application.findFirst({
				where: {
					id: input.applicationId,
					userId: session.user.id,
				},
			});

			if (!application) {
				return new Response("Forbidden", { status: 403 });
			}

			// update application status
			await ctx.db.application.update({
				where: {
					id: input.applicationId,
				},
				data: {
					status: "DRAFT",
				},
			});
			return "Success";
		}),
	// same as function above, but for admin
});
