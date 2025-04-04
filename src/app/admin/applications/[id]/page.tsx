import ChoicesTable from "@/app/_components/choices-table/choices-table";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await getServerAuthSession();
	if (!session) {
		return null;
	}

	const slug = (await params).id;

	void api.applications.getAdmin.prefetch({
		applicationId: Number(slug),
	});

	return (
		<div className="container">
			<ChoicesTable
				session={session}
				applicationId={Number(slug)}
				admin={true}
			/>
		</div>
	);
}
