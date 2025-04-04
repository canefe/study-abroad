import { api } from "@/trpc/react";
import { Year } from "@prisma/client";

export const useGetApplicationQuery = (applicationId: number) => {
	return api.applications.get.useQuery(
		{ applicationId },
		{
			refetchInterval: 10000,
			enabled: !!applicationId,
		},
	);
};

export const useGetApplicationAdminQuery = (applicationId: number) => {
	return api.applications.getAdmin.useQuery(
		{ applicationId },
		{
			refetchInterval: 10000,
			enabled: !!applicationId,
		},
	);
};
export const useGetAbroadCoursesQuery = (abroadUniversityId: number) => {
	return api.courses.getCourses.useQuery(
		{
			universityId: abroadUniversityId,
		},
		{
			enabled: !!abroadUniversityId,
		},
	);
};

export const useGetHomeCoursesQuery = (year?: Year[]) => {
	return api.courses.getHomeCourses.useQuery(
		{ year: year ? year.join(",") : undefined },
		{
			refetchInterval: 10000,
		},
	);
};
