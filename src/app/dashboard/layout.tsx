import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/app/_components/header/header";
import AppSidebar from "@/app/_components/sidebar";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { api, HydrateClient } from "@/trpc/server";
import SharedLayout from "../_components/shared-layout";

export default async function DashboardLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const session = await getServerAuthSession();
	// if no user at all, redirect to login
	if (!session?.user) {
		redirect("/");
	}

	// check if the user is admin or not
	if (session?.user.role == "ADMIN") {
		redirect("/admin/dashboard");
	}

	if (session?.user) {
		void api.notifications.getList.prefetch();
		void api.applications.getList.prefetch();
		void api.universities.getList.prefetch();
	}

	return (
		<HydrateClient>
			<SharedLayout session={session}>{children}</SharedLayout>
		</HydrateClient>
	);
}
