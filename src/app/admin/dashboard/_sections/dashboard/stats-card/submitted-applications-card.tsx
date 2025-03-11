"use client";
import { api } from "@/trpc/react";
import StatsCard from ".";

export default function SubmittedApplicationsCard() {
	const [applicationCount] =
		api.applications.getCount.useSuspenseQuery("SUBMITTED");
	return <StatsCard title="Submitted Applications" value={applicationCount} />;
}
