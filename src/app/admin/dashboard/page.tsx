import { getServerSession } from "next-auth";
import StudentStatsCard from "./_sections/dashboard/stats-card/student-card";
import ApplicationsCard from "./_sections/dashboard/stats-card/applications-card";
import SubmittedApplicationsCard from "./_sections/dashboard/stats-card/submitted-applications-card";
import FlaggedCoursesCard from "./_sections/dashboard/stats-card/flagged-card";
import DeadlineCard from "./_sections/dashboard/stats-card/deadline-card";

export default async function Dashboard() {
	const session = await getServerSession();

	return (
		<div className="container flex flex-col gap-4">
			<div className="rounded bg-gray-200 p-2">
				<h1 className="text-xl">Welcome, {session?.user.name}</h1>
				<h2 className="text-lg">{"School of Computing Science"}</h2>
			</div>
			<DeadlineCard />

			<div className="grid grid-cols-4 gap-4">
				<SubmittedApplicationsCard />
				<FlaggedCoursesCard />
				<ApplicationsCard />
				<StudentStatsCard />
			</div>
		</div>
	);
}
