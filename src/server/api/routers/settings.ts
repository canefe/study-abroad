import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";

export const settingsRouter = createTRPCRouter({
	getList: adminProcedure.query(async ({ ctx }) => {
		const settings = await ctx.db.setting.findMany({});

		return settings;
	}),
	get: adminProcedure
		.input(z.object({ settingKey: z.string() }))
		.query(async ({ input, ctx }) => {
			const setting = await ctx.db.setting.findFirst({
				where: {
					key: input.settingKey,
				},
			});
			return setting;
		}),
});
