"use client";
import { api } from "@/trpc/react";
import StatsCard from ".";

export default function VerifiedApplicationsCard() {
	const [applications] = api.applications.getList.useSuspenseQuery();
	const filteredApplications = applications?.filter(
		(application) => application.status === "VERIFIED",
	);
	return (
		<StatsCard
			title="Verified Applications"
			value={filteredApplications?.length}
		/>
	);
}
