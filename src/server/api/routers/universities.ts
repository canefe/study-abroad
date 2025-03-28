import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const universitiesRouter = createTRPCRouter({
	getList: protectedProcedure.query(async ({ ctx }) => {
		// get all universities
		const universities = await ctx.db.university.findMany({});
		return universities;
	}),
});
