import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export const useCreateApplicationMutation = () => {
	const utils = api.useUtils();
	return api.applications.create.useMutation({
		onSuccess: () => {
			utils.applications.getList.invalidate();
		},
	});
};

export const useRemoveApplicationMutation = () => {
	const utils = api.useUtils();
	return api.applications.remove.useMutation({
		onSuccess: () => {
			utils.applications.getList.invalidate();
		},
	});
};

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
	const utils = api.useUtils();
	return api.choices.saveChoiceChanges.useMutation({
		onSuccess: () => {
			utils.applications.invalidate();
		},
	});
};

export const useSaveChoicesAdminMutation = () => {
	const utils = api.useUtils();
	return api.choices.saveChoicesAdmin.useMutation({
		onSuccess: () => {
			utils.applications.invalidate();
		},
	});
};

// admin
export const useAdminCreateApplicationMutation = () => {
	const utils = api.useUtils();
	const router = useRouter();
	return api.applications.createAdmin.useMutation({
		onSuccess: (data) => {
			utils.applications.getList.invalidate();
			router.push(`/admin/applications/${data.applicationId}`);
		},
	});
};
