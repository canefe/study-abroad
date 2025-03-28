"use client";
import { api } from "@/trpc/react";
import StatsCard from ".";

export default function FlaggedCoursesCard() {
	const [flaggedCoursesCount] = api.courses.getCourseCount.useSuspenseQuery({
		filter: "FLAGGED",
	});
	return (
		<StatsCard
			title="Flagged Courses"
			statClassName={flaggedCoursesCount || 0 > 0 ? "text-red-500" : ""}
			value={flaggedCoursesCount || 0}
		/>
	);
}
