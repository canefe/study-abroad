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
						mutedBy: {
							select: {
								id: true,
							},
						},
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
	markAsUnread: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const session = ctx.session;
			const notification = await ctx.db.notification.update({
				where: {
					id: input.id,
					userId: session?.user.id,
				},
				data: {
					read: false,
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
	// mute notifications from specific user (this is individual for each user)
	mute: protectedProcedure
		.input(z.object({ userId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const session = ctx.session;
			try {
				await ctx.db.user.update({
					where: {
						id: session?.user.id,
					},
					data: {
						mutedUsers: {
							connect: {
								id: input.userId,
							},
						},
					},
				});
			} catch (error) {
				console.error;
				return error;
			}

			return true;
		}),
	// unmute notifications from specific user (this is individual for each user)
	unmute: protectedProcedure
		.input(z.object({ userId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const session = ctx.session;
			await ctx.db.user.update({
				where: {
					id: session?.user.id,
				},
				data: {
					mutedUsers: {
						disconnect: {
							id: input.userId,
						},
					},
				},
			});

			return true;
		}),
});
