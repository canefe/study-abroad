import { PrismaClient, Year } from "@prisma/client";
import { getHomeUniversity } from "./getHomeUniversity";

export async function getHomeCourses(db: PrismaClient, year: Year) {
	const homeUniversityId = await getHomeUniversity(db);

	const homeCourses = await db.course.findMany({
		where: {
			universityId: homeUniversityId,
			year: {
				has: year,
			},
		},
	});

	if (!homeCourses) {
		return null;
	}

	return homeCourses;
}
