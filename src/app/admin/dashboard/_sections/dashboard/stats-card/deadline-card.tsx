"use client";
import { useSettings } from "@/hooks/useSettings";
import StatsCard from ".";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export default function DeadlineCard() {
	const { getSetting } = useSettings();

	const deadline = getSetting("deadline_date", null);
	const day = dayjs(deadline?.value).fromNow();
	return <StatsCard title={`Deadline`} value={day} />;
}
