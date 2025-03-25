import ChoicesTable from "@/app/_components/choices-table/choices-table";
import { api } from "@/trpc/server";

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const slug = (await params).id;

	void api.applications.getAdmin.prefetch({
		applicationId: Number(slug),
	});

	return (
		<div className="container">
			<ChoicesTable applicationId={Number(slug)} admin={true} />
		</div>
	);
}
