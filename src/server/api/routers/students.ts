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

	getList: adminProcedure.query(async ({ ctx }) => {
		const users = await ctx.db.user.findMany({
			where: {
				role: "STUDENT",
			},
			include: {
				applications: {
					include: {
						//courseChoices: true,
						abroadUniversity: true,
					},
				},
			},
		});
		return users;
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
