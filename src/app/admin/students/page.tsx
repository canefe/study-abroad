import { getServerAuthSession } from "@/server/auth";
import StudentList from "./_sections/students-list";
import { api } from "@/trpc/server";

export default async function Students() {
	const session = await getServerAuthSession();
	if (session?.user) {
		void api.students.getList.prefetch({
			q: "",
			page: 1,
			pageSize: 10,
		});
	}
	return <div className="container">{session && <StudentList />}</div>;
}
