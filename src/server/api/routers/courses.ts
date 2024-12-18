import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const coursesRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getList: protectedProcedure.query(async ({ ctx }) => {
    // get the session from the context
    const session = ctx.session;
    // get user's coursechoices
    const courseChoices = await ctx.db.courseChoice.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        homeCourse: true,
        primaryCourse: true,
        alternativeCourse1: true,
        alternativeCourse2: true,
        abroadUniversity: true,
      },
    });
    return courseChoices;
  }),

  getCourses: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const course = await ctx.db.course.findMany({
        where: {
          universityId: input.id,
        },
        include: {
          university: true,
        },
      });
      console.log(course);
      return course;
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
