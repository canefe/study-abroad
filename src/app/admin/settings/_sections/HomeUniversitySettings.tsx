"use client";

import { useSettings } from "@/hooks/useSettings";

export default function HomeUniversitySettings() {
	const { getSetting } = useSettings();

	const setting = getSetting("home_university");

	return (
		<div>
			<h1>Home University Settings</h1>
			<p>{setting?.value}</p>

			{/* TODO: 2nd year, 3rd year course selection, select home uni*/}
		</div>
	);
}
