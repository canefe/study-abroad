import {
	useAddCourseWithYearMutation,
	useDeleteCourseMutation,
	useEditCourseMutation,
	useSetYearOfCourseMutation,
} from "@/app/api/mutations/courses";
import { api } from "@/trpc/react";
import { Year } from "@prisma/client";
import toast from "react-hot-toast";

export const useCourses = () => {
	const addCourseWithYear = useAddCourseWithYearMutation();
	const deleteCourse = useDeleteCourseMutation();
	const setYearOfCourse = useSetYearOfCourseMutation();
	const editCourse = useEditCourseMutation();

	return {
		addCourseWithYear: async (
			name: string,
			universityId: number,
			year: Year,
			link?: string,
		) => {
			await toast.promise(
				addCourseWithYear.mutateAsync({ name, universityId, year, link }),
				{
					loading: "Adding course...",
					success: "Course added successfully",
					error: "Failed to add course",
				},
			);
		},
		deleteCourse: async (courseId: number) => {
			await toast.promise(deleteCourse.mutateAsync({ id: courseId }), {
				loading: "Deleting course...",
				success: "Course deleted successfully",
				error: "Failed to delete course",
			});
		},
		setYearOfCourse: async (courseId: number, year: Year | undefined) => {
			await toast.promise(setYearOfCourse.mutateAsync({ id: courseId, year }), {
				loading: "Setting year...",
				success: "Year set successfully",
				error: "Failed to set year",
			});
		},
		editCourse: async (
			id: number,
			name: string,
			year: Year[],
			universityId: number,
			link?: string,
		) => {
			await toast.promise(
				editCourse.mutateAsync({
					id,
					name,
					year,
					universityId,
					link,
				}),
				{
					loading: "Editing course...",
					success: "Course edited successfully",
					error: "Failed to edit course",
				},
			);
		},
	};
};

export const useVerifyCourse = () => {
	const verifyCourseApi = api.courses.verifyCourse.useMutation();
	const utils = api.useUtils();
	const verifyCourse = async (courseId: number) => {
		await toast.promise(verifyCourseApi.mutateAsync({ id: courseId }), {
			loading: "Verifying course...",
			success: "Course verified successfully",
			error: "Failed to verify course",
		});
		utils.courses.invalidate();
	};

	return { verifyCourse, isLoading: utils.courses.verifyCourse.isMutating };
};

export const useUnverifyCourse = () => {
	const unverifyCourseApi = api.courses.unverifyCourse.useMutation();
	const utils = api.useUtils();
	const unverifyCourse = async (courseId: number) => {
		await toast.promise(unverifyCourseApi.mutateAsync({ id: courseId }), {
			loading: "Unverifying course...",
			success: "Course unverified successfully",
			error: "Failed to unverify course",
		});
		utils.courses.invalidate();
	};

	return { unverifyCourse, isLoading: utils.courses.unverifyCourse.isMutating };
};

export const useUnflagCourse = () => {
	const unflagCourseApi = api.courses.unflagCourse.useMutation();
	const utils = api.useUtils();
	const unflagCourse = async (courseId: number) => {
		await toast.promise(unflagCourseApi.mutateAsync({ id: courseId }), {
			loading: "Unflagging course...",
			success: "Course unflagged successfully",
			error: "Failed to unflag course",
		});
		utils.courses.invalidate();
	};

	return { unflagCourse, isLoading: utils.courses.unflagCourse.isMutating };
};

export const useDeleteCourse = () => {
	const deleteCourseApi = api.courses.deleteCourse.useMutation();
	const utils = api.useUtils();
	const deleteCourse = async (courseId: number) => {
		await toast.promise(deleteCourseApi.mutateAsync({ id: courseId }), {
			loading: "Deleting course...",
			success: "Course deleted successfully",
			error: "Failed to delete course",
		});
		utils.courses.invalidate();
	};

	return { deleteCourse, isLoading: utils.courses.deleteCourse.isMutating };
};
