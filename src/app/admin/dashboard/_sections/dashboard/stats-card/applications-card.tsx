"use client";
import { api } from "@/trpc/react";
import StatsCard from ".";

export default function ApplicationsCard() {
	const [applications] = api.applications.getAll.useSuspenseQuery();
	const filteredApplications = applications?.filter(
		(application) => application.status !== "DRAFT",
	);
	return (
		<StatsCard title="Applications" value={filteredApplications?.length} />
	);
}
