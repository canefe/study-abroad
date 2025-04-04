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
	// New mutations for verification and flagging
	const verifyCourseMutation = api.courses.verifyCourse.useMutation();
	const unverifyCourseMutation = api.courses.unverifyCourse.useMutation();
	const unflagCourseMutation = api.courses.unflagCourse.useMutation();

	const utils = api.useUtils();

	return {
		getHomeCourses: api.courses.getHomeCourses.useQuery,
		addCourseWithYear: async (
			name: string,
			universityId: number,
			year: Year,
			link?: string,
		) => {
			await toast.promise(
				addCourseWithYear.mutateAsync(
					{ name, universityId, year, link },
					{
						onSuccess: () => {
							utils.courses.invalidate();
						},
					},
				),
				{
					loading: "Adding course...",
					success: "Course added successfully",
					error: (error) => error.message,
				},
			);
		},
		deleteCourse: async (courseId: number) => {
			await toast.promise(deleteCourse.mutateAsync({ id: courseId }), {
				loading: "Deleting course...",
				success: "Course deleted successfully",
				error: "Failed to delete course",
			});
			utils.courses.invalidate();
		},
		setYearOfCourse: async (
			courseId: number,
			year: Year | undefined,
			remove = false,
		) => {
			await toast.promise(setYearOfCourse.mutateAsync({ id: courseId, year }), {
				loading: "Setting year...",
				success: remove
					? "Course removed from the year successfully"
					: "Course added to the year successfully",
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
		verifyCourse: async (courseId: number) => {
			await toast.promise(verifyCourseMutation.mutateAsync({ id: courseId }), {
				loading: "Verifying course...",
				success: "Course verified successfully",
				error: "Failed to verify course",
			});
			utils.courses.invalidate();
		},
		unverifyCourse: async (courseId: number) => {
			await toast.promise(
				unverifyCourseMutation.mutateAsync({ id: courseId }),
				{
					loading: "Unverifying course...",
					success: "Course unverified successfully",
					error: "Failed to unverify course",
				},
			);
			utils.courses.invalidate();
		},
		unflagCourse: async (courseId: number) => {
			await toast.promise(unflagCourseMutation.mutateAsync({ id: courseId }), {
				loading: "Unflagging course...",
				success: "Course unflagged successfully",
				error: "Failed to unflag course",
			});
			utils.courses.invalidate();
		},
	};
};
