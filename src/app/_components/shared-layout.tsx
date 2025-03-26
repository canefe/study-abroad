"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "react-hot-toast";
import Header from "./header/header";
import AppSidebar from "./sidebar";
import TransitionProvider from "./transition-provider";
import type { ReactNode } from "react";
import { Session } from "next-auth";

type Props = {
	children: ReactNode;
	session: Session;
};

export default function SharedLayout({ children, session }: Props) {
	return (
		<>
			<SidebarProvider>
				<AppSidebar session={session} />
				<main className="flex w-full flex-col items-center px-4 py-6">
					{session?.user && <Header session={session} />}
					<div className="mt-4 flex w-full items-center justify-center">
						{session?.user && (
							<TransitionProvider>{children}</TransitionProvider>
						)}
					</div>
				</main>
			</SidebarProvider>
			<Toaster />
		</>
	);
}
