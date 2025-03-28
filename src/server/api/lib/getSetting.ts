import { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export async function getSetting(db: PrismaClient, key: string) {
	const setting = await db.setting.findFirst({
		where: { key: key },
	});

	if (!setting) {
		return null;
	}

	return setting.value;
}
