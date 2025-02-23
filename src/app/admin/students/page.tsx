import { getServerAuthSession } from "@/server/auth";
import StudentList from "./_sections/students-list";

export default async function Students() {
	const session = await getServerAuthSession();
	return <div className="container">{session && <StudentList />}</div>;
}
