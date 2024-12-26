import { getServerAuthSession } from "@/server/auth";
import VerifiedCoursesList from "./_sections/VerifiedCoursesList";

export default async function VerifiedCourses() {
	const session = await getServerAuthSession();
	return (
		<div className="container">
			<h1 className="text-xl">Verified Courses</h1>
			{session && <VerifiedCoursesList />}
		</div>
	);
}
