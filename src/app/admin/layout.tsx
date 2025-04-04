import { api, HydrateClient } from "@/trpc/server";
import SharedLayout from "../_components/shared-layout";
import { authorizeRole } from "@/lib/auth";

export default async function AdminLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const sessionOrRedirect = await authorizeRole("ADMIN");

	// if a function is returned, it means we should redirect
	if (typeof sessionOrRedirect === "function") {
		sessionOrRedirect();
		return null;
	}

	const session = sessionOrRedirect;

	if (session.user) {
		void api.notifications.getList.prefetch();
		void api.settings.getList.prefetch();
		void api.settings.get.prefetch({ settingKey: "deadline_date" });
		void api.students.getCount.prefetch();
		void api.applications.getAll.prefetch({
			q: "",
			page: 1,
			pageSize: 10,
			filter: "SUBMITTED",
		});
		void api.applications.getCount.prefetch("ALL");
		void api.applications.getCount.prefetch("SUBMITTED");
		void api.courses.getCourseCount.prefetch();
		void api.courses.getCourseCount.prefetch({ filter: "FLAGGED" });

		void api.universities.getList.prefetch();
	}

	return (
		<HydrateClient>
			<SharedLayout session={session}>{children}</SharedLayout>
		</HydrateClient>
	);
}
