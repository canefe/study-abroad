import {
	useAddNewCourseMutation,
	useCreateApplicationMutation,
	useFlagCourseMutation,
	useRemoveApplicationMutation,
	useSubmitApplicationMutation,
	useWithdrawApplicationMutation,
	useAdminCreateApplicationMutation,
	useUpdateCourseChoicesMutation,
	useAskForReviseApplicationMutation,
	useApproveApplicationMutation,
} from "@/app/api/mutations/application";
import {
	useGetAbroadCoursesQuery,
	useGetApplicationAdminQuery,
	useGetApplicationQuery,
} from "@/app/api/queries/application";
import { api } from "@/trpc/react";
import { Prisma, Year } from "@prisma/client";
import toast from "react-hot-toast";

type useApplicationProps = {
	applicationId?: number;
	admin?: boolean;
};

export type ApplicationWithChoices = Prisma.ApplicationGetPayload<{
	include: {
		courseChoices: {
			include: {
				homeCourse: true;
				primaryCourse: true;
				alternativeCourse1: true;
				alternativeCourse2: true;
			};
		};
		abroadUniversity: true;
		user: true;
	};
}>;

export const useApplication = ({
	applicationId,
	admin,
}: useApplicationProps) => {
	const utils = api.useUtils();

	let application: ApplicationWithChoices | null | undefined;
	let isFetching = false;
	let isLoading = false;
	let abroadCourses: any = undefined;
	let isLoadingAbroadCourses = false;

	if (applicationId) {
		({
			data: application,
			isFetching,
			isLoading,
		} = admin
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
	const updateCourseChoicesMutation = useUpdateCourseChoicesMutation();

	const adminCreateApplicationMutation = useAdminCreateApplicationMutation();
	const approveApplicationMutation = useApproveApplicationMutation();
	const askForReviseApplicationMutation = useAskForReviseApplicationMutation();

	const createApplication = async (
		abroadUniversityId: number,
		year: Year,
		alternateRoute: boolean,
		additionalCourse: string,
	) => {
		return createApplicationMutation.mutateAsync({
			abroadUniversityId,
			year,
			alternateRoute,
			additionalCourse,
		});
	};

	const removeApplication = (applicationId: number) => {
		toast.promise(removeApplicationMutation.mutateAsync({ applicationId }), {
			loading: "Removing application...",
			success: "Application removed successfully",
			error: "Failed to remove application",
		});
	};

	const submitApplication = (applicationId: number) => {
		submitApplicationMutation.mutate(
			{ applicationId },
			{
				onSuccess: () => {
					utils.applications.invalidate();
				},
			},
		);
	};

	const withdrawApplication = (applicationId: number) => {
		withdrawApplicationMutation.mutate(
			{ applicationId },
			{
				onSuccess: () => {
					utils.applications.invalidate();
				},
			},
		);
	};

	const approveApplication = async (applicationId: number) => {
		await toast.promise(
			approveApplicationMutation.mutateAsync({ applicationId }),
			{
				loading: "Approving application...",
				success: "Application approved successfully",
				error: "Failed to approve application",
			},
		);
	};

	const askForReviseApplication = async (applicationId: number) => {
		await toast.promise(
			askForReviseApplicationMutation.mutateAsync({ applicationId }),
			{
				loading: "Asking for revision...",
				success: "Application revision requested successfully",
				error: "Failed to request application revision",
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
		alternateRoute?: boolean,
		additionalCourse?: string,
	) => {
		await toast.promise(
			adminCreateApplicationMutation.mutateAsync({
				userId,
				abroadUniversityId,
				year,
				alternateRoute,
				additionalCourse,
			}),
			{
				loading: "Creating application...",
				success: "Application created successfully",
				error: "Failed to create application",
			},
		);
	};

	// add couse to abroad courses
	const addCourse = async (
		name: string,
		abroadUniversityId: number,
		link?: string,
		description?: string,
	) => {
		await toast.promise(
			addCourseMutation.mutateAsync({
				name,
				abroadUniversityId,
				link,
				description,
			}),
			{
				loading: "Adding course...",
				success: "Course added successfully",
				error: "Failed to add course",
			},
		);
	};

	return {
		createApplication,
		createApplicationMutation,
		removeApplication,
		removeApplicationMutation,
		application,
		isLoading,
		isFetching,
		submitApplication,
		withdrawApplication,
		withdrawApplicationMutation,
		approveApplication,
		askForReviseApplication,
		abroadCourses,
		isLoadingAbroadCourses,
		addCourse,
		flagCourse,
		updateCourseChoices: updateCourseChoicesMutation.mutateAsync,
		updateCourseChoicesMutation,
		createApplicationAdmin,
		isPendingCreateAdmin: adminCreateApplicationMutation.isPending,
		isPendingCreate: createApplicationMutation.isPending,
	};
};
