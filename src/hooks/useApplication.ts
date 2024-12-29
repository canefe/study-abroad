import {
	useAddNewCourseMutation,
	useFlagCourseMutation,
	useSaveChoicesMutation,
	useSubmitApplicationMutation,
	useWithdrawApplicationMutation,
} from "@/app/api/mutations/application";
import {
	useGetAbroadCoursesQuery,
	useGetApplicationAdminQuery,
	useGetApplicationQuery,
} from "@/app/api/queries/application";
import { api } from "@/trpc/react";

type useApplicationProps = {
	applicationId: number;
	admin?: boolean;
};

export const useApplication = ({
	applicationId,
	admin,
}: useApplicationProps) => {
	const utils = api.useUtils();

	const { data: application, isLoading } = admin
		? useGetApplicationAdminQuery(applicationId)
		: useGetApplicationQuery(applicationId);

	const { data: abroadCourses, isLoading: isLoadingAbroadCourses } =
		useGetAbroadCoursesQuery(application?.abroadUniversityId || 0);

	const submitApplicationMutation = useSubmitApplicationMutation();
	const withdrawApplicationMutation = useWithdrawApplicationMutation();
	const addCourseMutation = useAddNewCourseMutation();
	const flagCourseMutation = useFlagCourseMutation();
	const saveChoicesMutation = useSaveChoicesMutation();

	const submitApplication = (applicationId: number) => {
		submitApplicationMutation.mutate({ applicationId });
	};

	const withdrawApplication = (applicationId: number) => {
		withdrawApplicationMutation.mutate({ applicationId });
	};

	const addCourse = (name: string, abroadUniversityId: number) => {
		addCourseMutation.mutate(
			{ name, abroadUniversityId },
			{
				onSuccess: () => {
					utils.courses.invalidate();
				},
			},
		);
	};

	const flagCourse = (courseId: number) => {
		flagCourseMutation.mutate(
			{ courseId },
			{
				onSuccess: () => {
					utils.courses.invalidate();
				},
			},
		);
	};

	return {
		application,
		isLoading,
		submitApplication,
		withdrawApplication,
		withdrawApplicationMutation,
		abroadCourses,
		isLoadingAbroadCourses,
		addCourse,
		flagCourse,
		saveChoices: saveChoicesMutation.mutate,
		saveChoicesMutation,
	};
};
