import ChoicesTable from "@/app/_components/choices-table/choices-table";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function MyChoices({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const id = (await params).id;

	const application = await api.applications.get({
		applicationId: Number(id),
	});

	// if application is null then redirect to /dashboard/
	if (application === null) {
		redirect("/dashboard/");
	}

	return (
		<>
			<ChoicesTable applicationId={Number(id)} />
		</>
	);
}
