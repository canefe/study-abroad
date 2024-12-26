"use client";
import { api } from "@/trpc/react";
import StatsCard from ".";
import { getFlaggedCoursesCount } from "@/lib/coursesUtils";

export default function FlaggedCoursesCard() {
	return (
		<StatsCard title="Flagged Courses" value={getFlaggedCoursesCount() || 0} />
	);
}
