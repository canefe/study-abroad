import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const choicesRouter = createTRPCRouter({
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

  // Get a Home University and Abroad University
  createChoice: protectedProcedure
    .input(
      z.object({
        homeUniversityId: z.number(),
        abroadUniversityId: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // for every home university course, create a course choice
      const homeUniversityCourses = await ctx.db.course.findMany({
        where: {
          universityId: input.homeUniversityId,
        },
      });
      homeUniversityCourses.forEach(async (course) => {
        await ctx.db.courseChoice.create({
          data: {
            homeCourseId: course.id,
            userId: ctx.session.user.id,
            abroadUniversityId: input.abroadUniversityId,
            status: "PENDING",
            semester: "FULL_YEAR",
            year: 2024,
          },
        });
      });
      return "Success";
    }),

  // only change the choices and not other fields
  saveChoiceChanges: protectedProcedure
    .input(
      z.object({
        homeUniversityId: z.number(),
        abroadUniversityId: z.number(),
        primaryCourseId: z.number().nullable(),
        alternativeCourse1Id: z.number().nullable(),
        alternativeCourse2Id: z.number().nullable(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db.courseChoice.updateMany({
        where: {
          userId: ctx.session.user.id,
          homeCourse: {
            universityId: input.homeUniversityId,
          },
          abroadUniversityId: input.abroadUniversityId,
        },
        data: {
          primaryCourseId: input.primaryCourseId,
          alternativeCourse1Id: input.alternativeCourse1Id,
          alternativeCourse2Id: input.alternativeCourse2Id,
        },
      });
      return "Success";
    }),

  removeChoice: protectedProcedure
    .input(z.object({ abroadUniversityId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.courseChoice.deleteMany({
        where: {
          abroadUniversityId: input.abroadUniversityId,
        },
      });
      return "Success";
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
});
