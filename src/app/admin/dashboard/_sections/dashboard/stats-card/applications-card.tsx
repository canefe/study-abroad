"use client";
import { api } from "@/trpc/react";
import StatsCard from ".";

export default function ApplicationsCard() {
	const [applications] = api.applications.getList.useSuspenseQuery();
	const filteredApplications = applications?.filter(
		(application) => application.status !== "DRAFT",
	);
	return (
		<StatsCard title="Applications" value={filteredApplications?.length} />
	);
}
