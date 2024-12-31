import { z } from "zod";
import {
	adminProcedure,
	createTRPCRouter,
	protectedProcedure,
} from "@/server/api/trpc";

export const settingsRouter = createTRPCRouter({
	getList: protectedProcedure.query(async ({ ctx }) => {
		const settings = await ctx.db.setting.findMany({});
		console.log(settings);
		return settings;
	}),
	get: protectedProcedure
		.input(z.object({ settingKey: z.string() }))
		.query(async ({ input, ctx }) => {
			const setting = await ctx.db.setting.findFirst({
				where: {
					key: input.settingKey,
				},
			});
			return setting;
		}),
	set: adminProcedure
		.input(z.object({ settingKey: z.string(), value: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const setting = await ctx.db.setting.upsert({
				where: {
					key: input.settingKey,
				},
				update: {
					value: input.value,
				},
				create: {
					key: input.settingKey,
					value: input.value,
				},
			});

			return setting;
		}),
});
