import { api } from "@/trpc/react";

// get all settings
export const useSetSettingMutation = () => {
	return api.settings.set.useMutation();
};
