import { useGetSettingsQuery } from "@/app/api/queries/settings";

export const useSettings = () => {
	const { data: settings, isLoading } = useGetSettingsQuery();

	const getSetting = (settingKey: string) => {
		return settings?.find((setting) => setting.key === settingKey);
	};

	return {
		settings,
		isLoading,
		getSetting,
	};
};
