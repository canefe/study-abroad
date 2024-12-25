import { z } from "zod";

import {
	adminProcedure,
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";

export const notificationsRouter = createTRPCRouter({
	getList: protectedProcedure.query(async ({ ctx }) => {
		const session = ctx.session;
		const notifications = await ctx.db.notification.findMany({
			where: {
				userId: session?.user.id,
			},
			include: {
				sender: {
					select: {
						name: true,
					},
				},
			},
		});
		return notifications;
	}),
	markAsRead: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const session = ctx.session;
			const notification = await ctx.db.notification.update({
				where: {
					id: input.id,
					userId: session?.user.id,
				},
				data: {
					read: true,
				},
			});
			return notification;
		}),
	markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
		const session = ctx.session;
		const notifications = await ctx.db.notification.updateMany({
			where: {
				userId: session?.user.id,
			},
			data: {
				read: true,
			},
		});
		return notifications;
	}),
	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const session = ctx.session;
			const notification = await ctx.db.notification.delete({
				where: {
					id: input.id,
					userId: session?.user.id,
				},
			});
			return notification;
		}),
});
