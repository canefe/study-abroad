import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { util } from "zod";

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
	const utils = api.useUtils();
	return api.courses.addCourse.useMutation({
		onSuccess: () => {
			utils.courses.invalidate();
		},
	});
};

export const useFlagCourseMutation = () => {
	return api.courses.flagCourse.useMutation();
};

export const useUpdateCourseChoicesMutation = () => {
	const utils = api.useUtils();
	return api.applications.updateCourseChoices.useMutation({
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

export const useApproveApplicationMutation = () => {
	const utils = api.useUtils();
	return api.applications.approve.useMutation({
		onSuccess: () => {
			utils.applications.invalidate();
			utils.courses.invalidate();
		},
	});
};
export const useAskForReviseApplicationMutation = () => {
	const utils = api.useUtils();
	return api.applications.revise.useMutation({
		onSuccess: () => {
			utils.applications.invalidate();
		},
	});
};
