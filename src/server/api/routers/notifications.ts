import { z } from "zod";

import {
	adminProcedure,
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";

export const notificationsRouter = createTRPCRouter({
	getList: publicProcedure.query(async ({ ctx }) => {
		const session = ctx.session;
		const notifications = await ctx.db.notification.findMany({
			where: {
				userId: session?.user.id,
			},
		});
		return notifications;
	}),
});
