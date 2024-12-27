import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function Courses() {
	const session = await getServerAuthSession();

	// redirect
	redirect("/admin/courses/verified");
	return (
		<div className="container">
			<h1>Courses</h1>
		</div>
	);
}
