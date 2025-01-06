import { z } from "zod";

import {
	adminProcedure,
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";

export const studentsRouter = createTRPCRouter({
	hello: publicProcedure
		.input(z.object({ text: z.string() }))
		.query(({ input }) => {
			return {
				greeting: `Hello ${input.text}`,
			};
		}),

	me: protectedProcedure.query(async ({ ctx }) => {
		return ctx.session.user;
	}),

	getList: adminProcedure
		.input(
			z.object({
				q: z.string().optional(),
				page: z.number().default(1),
				pageSize: z.number().default(10),
			}),
		)
		.query(async ({ input, ctx }) => {
			const { q, page, pageSize } = input;
			const skip = (page - 1) * pageSize;
			const users = await ctx.db.user.findMany({
				where: {
					role: "STUDENT",
					OR: [
						{ name: { contains: q, mode: "insensitive" } },
						{ guid: { contains: q, mode: "insensitive" } },
					],
				},
				include: {
					applications: {
						include: {
							//courseChoices: true,
							abroadUniversity: true,
						},
					},
				},
				skip,
				take: pageSize,
			});
			const total = await ctx.db.user.count({
				where: {
					role: "STUDENT",
					OR: [
						{ name: { contains: q, mode: "insensitive" } },
						{ guid: { contains: q, mode: "insensitive" } },
					],
				},
			});

			return {
				users,
				total,
				totalPages: Math.ceil(total / pageSize),
				currentPage: page,
			};
		}),

	getStudent: adminProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const user = await ctx.db.user.findUnique({
				where: {
					id: input.id,
				},
			});
			return user;
		}),
});
