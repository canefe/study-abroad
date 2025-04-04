import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { studentsRouter } from "./routers/students";
import { coursesRouter } from "./routers/courses";
import { universitiesRouter } from "./routers/universities";
import { applicationsRouter } from "./routers/applications";
import { notificationsRouter } from "./routers/notifications";
import { commentsRouter } from "./routers/comment";
import { settingsRouter } from "./routers/settings";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	students: studentsRouter,
	courses: coursesRouter,
	universities: universitiesRouter,
	applications: applicationsRouter,
	notifications: notificationsRouter,
	comments: commentsRouter,
	settings: settingsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
