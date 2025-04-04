import { PrismaClient, Year } from "@prisma/client";
import { getHomeUniversity } from "./getHomeUniversity";

export async function getHomeCourses(db: PrismaClient, year?: Year) {
	const homeUniversityId = await getHomeUniversity(db);

	// Year is not required, so we can check if it's undefined or not
	const whereClause: any = {
		universityId: homeUniversityId,
	};

	if (year) {
		whereClause.year = {
			has: year,
		};
	}

	const homeCourses = await db.course.findMany({
		where: whereClause,
	});

	if (!homeCourses) {
		return null;
	}

	return homeCourses;
}
