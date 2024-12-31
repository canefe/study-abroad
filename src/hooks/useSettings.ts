import { useSetSettingMutation } from "@/app/api/mutations/settings";
import { useGetSettingsQuery } from "@/app/api/queries/settings";
import { api } from "@/trpc/react";

export const useSettings = () => {
	const utils = api.useUtils();
	const { data: settings, isLoading } = useGetSettingsQuery();

	const setSettingMutation = useSetSettingMutation();

	const getSetting = (settingKey: string) => {
		return settings?.find((setting) => setting.key === settingKey);
	};

	const setSetting = async (settingKey: string, value: string) => {
		await setSettingMutation.mutateAsync({
			settingKey,
			value,
		});
		utils.settings.invalidate();
	};

	return {
		settings,
		isLoading,
		getSetting,
		setSetting,
		setSettingMutation,
	};
};
