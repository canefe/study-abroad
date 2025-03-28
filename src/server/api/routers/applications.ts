import { z } from "zod";

import {
	adminProcedure,
	createTRPCRouter,
	protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Status, Year } from "@prisma/client";
import { getHomeUniversity } from "../lib/getHomeUniversity";
import { getSetting } from "../lib/getSetting";
import { getHomeCourses } from "../lib/getHomeCourses";
import { applicationService } from "../services/applicationService";

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
	getCount: adminProcedure
		.input(z.enum(["ALL", "SUBMITTED", "DRAFT", "REVISE", "APPROVED"]))
		.query(async ({ input, ctx }) => {
			const whereClause: any = {};
			if (input !== "ALL") {
				whereClause.status = input as Status;
			}
			const total = await ctx.db.application.count({
				where: whereClause,
			});
			return total;
		}),
	getAll: adminProcedure
		.input(
			z.object({
				q: z.string().optional(),
				page: z.number().default(1),
				pageSize: z.number().default(10),
				filter: z
					.enum(["ALL", "SUBMITTED", "DRAFT", "REVISE", "APPROVED"])
					.default("ALL"),
			}),
		)
		.query(async ({ input, ctx }) => {
			const { q, page, pageSize, filter } = input;
			const skip = (page - 1) * pageSize;

			// Construct the where clause
			const whereClause: any = {
				OR: [
					{ user: { name: { contains: q, mode: "insensitive" } } },
					{ user: { guid: { contains: q, mode: "insensitive" } } },
				],
			};

			// Conditionally add the status filter
			if (filter !== "ALL") {
				whereClause.status = filter as Status;
			}

			const applications = await ctx.db.application.findMany({
				where: whereClause,
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
					user: true,
				},
				skip,
				take: pageSize,
			});

			const total = await ctx.db.application.count({
				where: whereClause,
			});

			return {
				applications,
				total,
				totalPages: Math.ceil(total / pageSize),
				currentPage: page,
			};
		}),

	// takes in an abroad university id, creates an application with home university's courses count coursechoices
	create: protectedProcedure
		.input(
			z.object({
				abroadUniversityId: z.number(),
				year: z.enum([...Object.values(Year)] as [string, ...string[]]),
				alternateRoute: z.boolean().optional(),
				additionalCourse: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const session = ctx.session;

			const homeUniversityCourses = await getHomeCourses(
				ctx.db,
				input.year as Year,
			);

			if (!homeUniversityCourses) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Home university courses not found",
				});
			}

			// Check if count of applications is less than 3
			const applicationsCount = await ctx.db.application.count({
				where: {
					userId: session.user.id,
				},
			});
			const maxApplications = parseInt(
				(await getSetting(ctx.db, "max_applications")) || "3",
				10,
			);
			if (applicationsCount >= maxApplications) {
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

			// check if a deadline is set
			const deadline = await getSetting(ctx.db, "deadline_date");

			// if deadline is set, check if the current date is before the deadline
			if (deadline) {
				const deadlineDate = new Date(deadline);
				const currentDate = new Date();
				if (currentDate > deadlineDate) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Deadline has passed",
					});
				}
			}

			// create an application
			const application = await applicationService.createApplication(
				ctx,
				session.user.id,
				input.abroadUniversityId,
				input.year as Year,
			);

			// create course choices
			await applicationService.addCourseChoices(
				ctx,
				application.id,
				homeUniversityCourses,
			);

			// if alternate route is selected, add additional course (CS1F)
			// find CS1F home course first
			if (input.alternateRoute) {
				await applicationService.addAlternateRouteCourse(ctx, application.id);
			}
			// if additional course is selected, add additional course ( find the course first )
			if (input.additionalCourse) {
				await applicationService.addAdditionalCourse(
					ctx,
					application.id,
					input.additionalCourse,
				);
			}
			return { applicationId: application.id };
		}),

	// createAdmin takes in user, abroadUni
	createAdmin: adminProcedure
		.input(
			z.object({
				userId: z.string(),
				abroadUniversityId: z.number(),
				year: z.enum([...Object.values(Year)] as [string, ...string[]]),
				alternateRoute: z.boolean().optional(),
				additionalCourse: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const user = await ctx.db.user.findFirst({
				where: {
					id: input.userId,
				},
			});
			console.log(input.userId);
			if (!user) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				});
			}

			const homeUniversityId = await getHomeUniversity(ctx.db);

			const homeUniversityCourses = await ctx.db.course.findMany({
				where: {
					universityId: homeUniversityId,
					year: {
						has: input.year as Year,
					},
				},
			});

			// create an application
			const application = await applicationService.createApplication(
				ctx,
				user.id,
				input.abroadUniversityId,
				input.year as Year,
			);
			// create course choices
			await applicationService.addCourseChoices(
				ctx,
				application.id,
				homeUniversityCourses,
			);

			// if alternate route is selected, add CS1F course
			if (input.alternateRoute) {
				await applicationService.addAlternateRouteCourse(ctx, application.id);
			}

			// if additional course is selected, add it
			if (input.additionalCourse) {
				await applicationService.addAdditionalCourse(
					ctx,
					application.id,
					input.additionalCourse,
				);
			}
			return { applicationId: application.id };
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

			// delete application
			await applicationService.deleteApplication(ctx, application.id);
			return "Success";
		}),
	adminDelete: adminProcedure
		.input(z.object({ applicationId: z.number() }))
		.mutation(async ({ input, ctx }) => {
			await applicationService.deleteApplication(ctx, input.applicationId);
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
					status: Status.SUBMITTED,
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
					status: Status.DRAFT,
				},
			});
			return "Success";
		}),
	// same as function above, but for admin
});
