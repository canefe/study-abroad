"use client";

import { api } from "@/trpc/react";
import { Tag, Tooltip } from "antd";

export function SubmittedApplicationsCount() {
	const [applicationCount] =
		api.applications.getCount.useSuspenseQuery("SUBMITTED");
	return (
		<Tooltip title="Submitted Applications">
			<Tag color="blue" className="rounded-full">
				{applicationCount}
			</Tag>
		</Tooltip>
	);
}
