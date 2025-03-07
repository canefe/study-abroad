"use client";
import ApplicationList from "./_sections/application-list";
import { useSearchParams } from "next/navigation";
import { Status } from "@prisma/client";

export default async function Applications() {
	const searchParams = useSearchParams();
	// get ?q query parameter
	const q = searchParams.get("q") || "";
	const status = searchParams.get("status") || "";
	return (
		<div className="container">
			<ApplicationList
				searchParams={{
					q,
					status: status as Status,
				}}
			/>
		</div>
	);
}
