import ChoicesTable from "@/app/_components/choices-table";

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const slug = (await params).id;
	return (
		<div className="container">
			<ChoicesTable applicationId={Number(slug)} admin={true} />
		</div>
	);
}
