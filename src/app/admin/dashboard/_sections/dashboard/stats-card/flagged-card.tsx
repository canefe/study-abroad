"use client";
import { api } from "@/trpc/react";
import StatsCard from ".";
import { getFlaggedCoursesCount } from "@/lib/coursesUtils";

export default function FlaggedCoursesCard() {
	return (
		<StatsCard
			title="Flagged Courses"
			statClassName={getFlaggedCoursesCount() || 0 > 0 ? "text-red-500" : ""}
			value={getFlaggedCoursesCount() || 0}
		/>
	);
}
