import { api } from "@/trpc/react";

// get all comments of an application
export const useGetCommentsQuery = (applicationId: number) => {
	return api.comments.getList.useQuery(
		{ applicationId },
		{
			enabled: !!applicationId,
		},
	);
};
