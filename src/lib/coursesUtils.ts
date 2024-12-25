import { api } from "@/trpc/react";

export function getFlaggedCoursesCount() {
	const getCoursesApi = api.courses.getFlaggedList;
	const { data, error } = getCoursesApi.useQuery(undefined, {
		refetchInterval: 10000,
		refetchOnWindowFocus: true,
	});

	return data?.length;
}
