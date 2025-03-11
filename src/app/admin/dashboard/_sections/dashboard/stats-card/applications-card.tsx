"use client";
import { api } from "@/trpc/react";
import StatsCard from ".";

export default function ApplicationsCard() {
	const [applicationCount] = api.applications.getCount.useSuspenseQuery("ALL");
	return <StatsCard title="Applications" value={applicationCount} />;
}
