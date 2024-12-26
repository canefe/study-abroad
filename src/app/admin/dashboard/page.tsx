import { api } from "@/trpc/server";
import { Card } from "antd";
import { getServerSession } from "next-auth";
import StudentStatsCard from "./_sections/dashboard/stats-card/student-card";
import ApplicationsCard from "./_sections/dashboard/stats-card/applications-card";
import VerifiedApplicationsCard from "./_sections/dashboard/stats-card/verified-applications-card";
import FlaggedCourses from "./courses/flagged/page";
import FlaggedCoursesCard from "./_sections/dashboard/stats-card/flagged-card";

export default async function Dashboard() {
	const session = await getServerSession();

	void api.students.getList.prefetch();

	return (
		<div className="container flex flex-col gap-4">
			<div className="rounded bg-gray-200 p-2">
				<h1 className="text-xl">Welcome, {session?.user.name}</h1>
				<h2 className="text-lg">
					{session?.user.school || "School of Computer Science"}
				</h2>
			</div>
			<div className="grid grid-cols-4 gap-4">
				<StudentStatsCard />
				<ApplicationsCard />
				<VerifiedApplicationsCard />
				<FlaggedCoursesCard />
			</div>
		</div>
	);
}
