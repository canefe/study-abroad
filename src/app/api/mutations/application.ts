import { api } from "@/trpc/react";

export const useSubmitApplicationMutation = () => {
	return api.applications.submit.useMutation();
};

export const useWithdrawApplicationMutation = () => {
	return api.applications.withdraw.useMutation();
};

export const useAddNewCourseMutation = () => {
	return api.courses.addCourse.useMutation();
};

export const useFlagCourseMutation = () => {
	return api.courses.flagCourse.useMutation();
};

export const useSaveChoicesMutation = () => {
	return api.choices.saveChoiceChanges.useMutation();
};
