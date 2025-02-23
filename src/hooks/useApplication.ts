import {
	useAddNewCourseMutation,
	useCreateApplicationMutation,
	useFlagCourseMutation,
	useRemoveApplicationMutation,
	useSaveChoicesMutation,
	useSubmitApplicationMutation,
	useWithdrawApplicationMutation,
	useSaveChoicesAdminMutation,
	useAdminCreateApplicationMutation,
} from "@/app/api/mutations/application";
import {
	useGetAbroadCoursesQuery,
	useGetApplicationAdminQuery,
	useGetApplicationQuery,
} from "@/app/api/queries/application";
import { api } from "@/trpc/react";
import { Year } from "@prisma/client";
import toast from "react-hot-toast";

type useApplicationProps = {
	applicationId?: number;
	admin?: boolean;
};

export const useApplication = ({
	applicationId,
	admin,
}: useApplicationProps) => {
	const utils = api.useUtils();

	let application;
	let isLoading;
	let abroadCourses;
	let isLoadingAbroadCourses;

	if (applicationId) {
		({ data: application, isLoading } = admin
			? useGetApplicationAdminQuery(applicationId)
			: useGetApplicationQuery(applicationId));

		({ data: abroadCourses, isLoading: isLoadingAbroadCourses } =
			useGetAbroadCoursesQuery(application?.abroadUniversityId || 0));
	}

	const createApplicationMutation = useCreateApplicationMutation();
	const removeApplicationMutation = useRemoveApplicationMutation();
	const submitApplicationMutation = useSubmitApplicationMutation();
	const withdrawApplicationMutation = useWithdrawApplicationMutation();
	const addCourseMutation = useAddNewCourseMutation();
	const flagCourseMutation = useFlagCourseMutation();
	const saveChoicesMutation = admin
		? useSaveChoicesAdminMutation()
		: useSaveChoicesMutation();

	const adminCreateApplicationMutation = useAdminCreateApplicationMutation();

	const createApplication = (abroadUniversityId: number, year: Year) => {
		createApplicationMutation.mutate({ abroadUniversityId, year });
	};

	const removeApplication = (applicationId: number) => {
		removeApplicationMutation.mutate({ applicationId });
	};

	const submitApplication = (applicationId: number) => {
		submitApplicationMutation.mutate({ applicationId });
	};

	const withdrawApplication = (applicationId: number) => {
		withdrawApplicationMutation.mutate({ applicationId });
	};

	const addCourse = (
		name: string,
		abroadUniversityId: number,
		link: string,
	) => {
		addCourseMutation.mutate(
			{ name, abroadUniversityId, link },
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

	// admin
	const createApplicationAdmin = async (
		userId: string,
		abroadUniversityId: number,
		year: Year,
	) => {
		await toast.promise(
			adminCreateApplicationMutation.mutateAsync({
				userId,
				abroadUniversityId,
				year,
			}),
			{
				loading: "Creating application...",
				success: "Application created successfully",
				error: "Failed to create application",
			},
		);
	};

	return {
		createApplication,
		removeApplication,
		removeApplicationMutation,
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
		createApplicationAdmin,
	};
};
