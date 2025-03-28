"use client";
import { api } from "@/trpc/react";
import StatsCard from ".";

export default function StudentStatsCard() {
	const [studentCount] = api.students.getCount.useSuspenseQuery(undefined, {
		staleTime: 60 * 1000,
		refetchOnMount: false,
	});

	return <StatsCard title="Students" value={studentCount} />;
}
