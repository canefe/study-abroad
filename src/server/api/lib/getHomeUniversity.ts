import { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export async function getHomeUniversity(db: PrismaClient) {
	const setting = await db.setting.findFirst({
		where: { key: "home_university" },
	});

	if (!setting) {
		// create the setting, set to the first university available if any.
		const university = await db.university.findFirst({
			where: {
				name: "University of Glasgow",
			},
			select: {
				id: true,
			},
		});

		if (!university) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "No universities available",
			});
		}

		await db.setting.create({
			data: {
				key: "home_university",
				value: university.id.toString(),
			},
		});

		return university.id;
	}

	return parseInt(setting.value);
}
