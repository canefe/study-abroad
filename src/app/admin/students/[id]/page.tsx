export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const slug = (await params).id;
	return (
		<div className="container pl-16 pt-16">
			<h1>Student is {slug}</h1>
		</div>
	);
}
