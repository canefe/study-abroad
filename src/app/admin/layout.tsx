import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { api, HydrateClient } from "@/trpc/server";
import SharedLayout from "../_components/shared-layout";

export default async function DashboardLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const session = await getServerAuthSession();
	if (!session?.user) {
		redirect("/");
	}

	// check if the user is admin or not
	if (session?.user.role != "ADMIN") {
		redirect("/dashboard");
	}

	//

	if (session?.user) {
		void api.notifications.getList.prefetch();
		void api.settings.getList.prefetch();
		void api.students.getCount.prefetch();
		void api.applications.getAll.prefetch({
			q: "",
			page: 1,
			pageSize: 10,
			filter: "SUBMITTED",
		});

		void api.universities.getList.prefetch();
	}

	return (
		<HydrateClient>
			<SharedLayout session={session}>{children}</SharedLayout>
		</HydrateClient>
	);
}
