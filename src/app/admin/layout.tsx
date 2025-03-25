import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/app/_components/header/header";
import AppSidebar from "@/app/_components/sidebar";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

import { Toaster } from "react-hot-toast";
import { api, HydrateClient } from "@/trpc/server";

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
		//void api.applications.getCount.prefetch("SUBMITTED");
		//void api.applications.getCount.prefetch("ALL");
		void api.settings.getList.prefetch();
		void api.students.me.prefetch();
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
			<SidebarProvider>
				<AppSidebar />
				<main className="flex w-full flex-col items-center px-4 py-6">
					{session?.user && <Header />}
					<div className="mt-4 flex w-full items-center justify-center">
						{session?.user && <div className="container">{children}</div>}
					</div>
				</main>
			</SidebarProvider>
			<Toaster />
		</HydrateClient>
	);
}
