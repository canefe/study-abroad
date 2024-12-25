import { getServerAuthSession } from "@/server/auth";
import FlaggedCoursesList from "./_sections/FlaggedCoursesList";

export default async function FlaggedCourses() {
	const session = await getServerAuthSession();
	return (
		<div className="container">
			<h1 className="text-xl">Flagged Courses</h1>
			{session && <FlaggedCoursesList />}
		</div>
	);
}
