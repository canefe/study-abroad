"use client";
import { api } from "@/trpc/react";
import StatsCard from ".";

export default function StudentStatsCard() {
	const [students] = api.students.getList.useSuspenseQuery();

	return <StatsCard title="Students" value={students?.length} />;
}
