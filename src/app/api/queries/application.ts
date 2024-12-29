import { api } from "@/trpc/react";

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
