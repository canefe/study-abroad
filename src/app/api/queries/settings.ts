import { api } from "@/trpc/react";

// get all settings
export const useGetSettingsQuery = () => {
	return api.settings.getList.useSuspenseQuery(undefined, {
		refetchInterval: 5000,
	});
};

// get specific setting
export const useGetSettingQuery = (settingKey: string) => {
	return api.settings.get.useQuery(
		{ settingKey },
		{
			enabled: !!settingKey,
		},
	);
};
