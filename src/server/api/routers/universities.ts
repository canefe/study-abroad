import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const universitiesRouter = createTRPCRouter({
  getList: protectedProcedure.query(async ({ ctx }) => {
    // get the session from the context
    const session = ctx.session;
    // get user's coursechoices
    const courseChoices = await ctx.db.university.findMany({});
    return courseChoices;
  }),
});
