"use client";
import { api } from "@/trpc/react";
import StatsCard from ".";

export default function StudentStatsCard() {
	const [studentCount] = api.students.getCount.useSuspenseQuery();

	return <StatsCard title="Students" value={studentCount} />;
}
