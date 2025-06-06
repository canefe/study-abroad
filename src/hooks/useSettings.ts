import { useSetSettingMutation } from "@/app/api/mutations/settings";
import { useGetSettingsQuery } from "@/app/api/queries/settings";
import { api } from "@/trpc/react";

export const useSettings = () => {
	const utils = api.useUtils();
	const [settings] = useGetSettingsQuery();

	const setSettingMutation = useSetSettingMutation();

	const getSetting = (settingKey: string, fallback?: any) => {
		return settings?.find((setting) => setting.key === settingKey) || fallback;
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
		getSetting,
		setSetting,
		setSettingMutation,
	};
};
