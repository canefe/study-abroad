import { test, expect } from "vitest";
import { appRouter } from "@/server/api/root";
import { createCallerFactory } from "@/server/api/trpc";
import { createInnerTRPCContext } from "@/server/api/trpc"; // if defined separately
import { beforeEach } from "node:test";
import { db } from "@/server/db";
import { TRPCError } from "@trpc/server";

test("applications.getAll is denied for STUDENT role", async () => {
	const ctx = createInnerTRPCContext({
		session: {
			user: {
				id: "123",
				name: "John Doe",
				role: "STUDENT",
				guid: "abc-123",
			},
			expires: "2025-12-31T00:00:00.000Z",
		},
	});

	// create caller using factory
	const caller = createCallerFactory(appRouter)(ctx);

	await expect(caller.applications.getAll({})).rejects.toMatchObject({
		code: "FORBIDDEN",
	});
});

test("applications.getAll is allowed for ADMIN role", async () => {
	const ctx = createInnerTRPCContext({
		session: {
			user: {
				id: "123",
				name: "John Doe",
				role: "ADMIN",
				guid: "abc-123",
			},
			expires: "2025-12-31T00:00:00.000Z",
		},
	});
});

test("applications.create does not allow creating an application if the user already has one to the same host university", async () => {
	const ctx = createInnerTRPCContext({
		session: {
			user: {
				id: "123",
				name: "John Doe",
				role: "STUDENT",
				guid: "abc-123",
			},
			expires: "2025-12-31T00:00:00.000Z",
		},
	});

	// create caller using factory
	const caller = createCallerFactory(appRouter)(ctx);

	await expect(
		caller.applications.create({
			abroadUniversityId: 1,
			year: "SECOND_YEAR_SINGLE_FULL_YEAR",
		}),
	).rejects.toThrowError("User already has an application to this university");
});
