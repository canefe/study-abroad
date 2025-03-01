"use client";
import { api } from "@/trpc/react";
import StatsCard from ".";

export default function SubmittedApplicationsCard() {
	const [applications] = api.applications.getList.useSuspenseQuery();
	const filteredApplications = applications?.filter(
		(application) => application.status === "SUBMITTED",
	);
	return (
		<StatsCard
			title="Submitted Applications"
			value={filteredApplications?.length}
		/>
	);
}
