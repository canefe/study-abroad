"use client";
import Image from "next/image";
import Logo from "@/app/assets/logo.png";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import useNavData from "@/hooks/useNavData";
import { Session } from "next-auth";

// Menu items. That checks ROLE and displays the menu items accordingly

type AppSidebarProps = {
	session: Session;
};

export default function AppSidebar({ session }: AppSidebarProps) {
	const { filteredItems } = useNavData(session);
	// Group items by category
	const groupedItems = filteredItems.reduce((acc, item) => {
		if (!acc[item.category]) {
			acc[item.category] = [];
		}
		acc[item.category].push(item);
		return acc;
	}, {});

	return (
		<Sidebar>
			<SidebarHeader className="flex items-center bg-slate-100 p-6 text-black">
				<Image src={Logo} alt="Logo" width={220} height={40} />
				<h3 className="font-semibold">Study Abroad Portal</h3>
			</SidebarHeader>
			<SidebarContent>
				{Object.keys(groupedItems).map((category) => (
					<SidebarGroup key={category}>
						<SidebarGroupLabel>{category}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{groupedItems[category].map((item) => (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton asChild>
											<Link href={item.url}>
												<item.icon />
												<span>{item.title}</span>
												{item.suffix}
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>
		</Sidebar>
	);
}
