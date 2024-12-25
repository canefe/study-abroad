import { getServerAuthSession } from "@/server/auth";

export default async function Applications() {
	const session = await getServerAuthSession();
	return (
		<div className="container">
			<h1>Applications</h1>
		</div>
	);
}
