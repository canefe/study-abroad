import { getServerAuthSession } from "@/server/auth";
import ApplicationList from "./_sections/application-list";

export default async function Applications() {
	const session = await getServerAuthSession();
	return (
		<div className="container">
			<ApplicationList />
		</div>
	);
}
