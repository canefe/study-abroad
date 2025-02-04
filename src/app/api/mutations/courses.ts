import { api } from "@/trpc/react";

export const useAddCourseWithYearMutation = () => {
	const utils = api.useUtils();
	return api.courses.addCourseToUniversity.useMutation({
		onSuccess: () => {
			utils.courses.invalidate();
		},
	});
};

export const useDeleteCourseMutation = () => {
	const utils = api.useUtils();
	return api.courses.deleteCourse.useMutation({
		onSuccess: () => {
			utils.courses.invalidate();
		},
	});
};

export const useSetYearOfCourseMutation = () => {
	const utils = api.useUtils();
	return api.courses.setYearOfCourse.useMutation({
		onSuccess: () => {
			utils.courses.invalidate();
		},
	});
};
