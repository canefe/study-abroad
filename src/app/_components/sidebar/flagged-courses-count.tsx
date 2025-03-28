"use client";
import { api } from "@/trpc/react";
import { Tooltip, Tag } from "antd";

export function FlaggedCoursesCount() {
	const [flaggedCoursesCount] = api.courses.getCourseCount.useSuspenseQuery({
		filter: "FLAGGED",
	});
	return (
		<Tooltip title="Flagged Courses">
			<Tag color="red" className="rounded-full">
				{flaggedCoursesCount}
			</Tag>
		</Tooltip>
	);
}
