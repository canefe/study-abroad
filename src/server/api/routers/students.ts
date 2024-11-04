import { z } from "zod";

import {
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

  getList: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany({
      where: {
        role: "ADMIN",
      },
    });
    return users;
  }),

  getStudent: protectedProcedure.query(async ({ input, ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: {
        id: input.id,
      },
    });
    return user;
  }),

  getSecretMessage: protectedProcedure.query(async ({ ctx }) => {
    const text =
      ctx.session.user.role === "ADMIN" ? "Hello admin!" : "Hello student!";
    return text;
  }),
});
