import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const studentsRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getList: protectedProcedure.query(async ({ ctx }) => {
    const session = ctx.session;
    if (session.user.role !== "ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view all students",
      });
    }
    const users = await ctx.db.user.findMany({
      where: {
        role: "STUDENT",
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
