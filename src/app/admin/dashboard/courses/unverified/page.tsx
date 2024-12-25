import { getServerAuthSession } from "@/server/auth";
import UnverifiedCoursesList from "./_sections/UnverifiedCoursesList";

export default async function UnverifiedCourses() {
	const session = await getServerAuthSession();
	return (
		<div className="container">
			<h1 className="text-xl">Unverified Courses</h1>
			{session && <UnverifiedCoursesList />}
		</div>
	);
}
