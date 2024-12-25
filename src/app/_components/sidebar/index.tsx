import {
	Calendar,
	ChevronDown,
	Flag,
	Home,
	Inbox,
	Search,
	Settings,
	ShieldQuestion,
	User,
	Verified,
} from "lucide-react";

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
import { getServerAuthSession } from "@/server/auth";
import { Tag } from "antd";
import { FlaggedCoursesCount } from "./courses-count";

// Menu items. That checks ROLE and displays the menu items accordingly
const items = [
	/* 
  ADMIN MENU ITEMS START
  */
	{
		title: "Home",
		url: "/admin/dashboard",
		icon: Home,
		role: "admin",
		category: "Main",
	},
	{
		title: "Students",
		url: "/admin/dashboard/students",
		icon: User,
		role: "admin",
		category: "Students",
	},
	{
		title: "Verified Courses",
		url: "/admin/dashboard/courses/verified",
		icon: Verified,
		role: "admin",
		category: "Courses",
	},
	{
		title: "Flagged Courses",
		url: "/admin/dashboard/courses/flagged",
		icon: Flag,
		role: "admin",
		suffix: (
			<Tag color="red" className="rounded-full">
				<FlaggedCoursesCount />
			</Tag>
		),
		category: "Courses",
	},
	{
		title: "Unverified Courses",
		url: "/admin/dashboard/courses/unverified",
		icon: ShieldQuestion,
		role: "admin",
		category: "Courses",
	},
	{
		title: "Settings",
		url: "#",
		icon: Settings,
		role: "admin",
		category: "General",
	},

	/* 
  ADMIN MENU ITEMS END
  */

	/*
  STUDENT MENU ITEMS START
  */
	{
		title: "Home",
		url: "/dashboard",
		icon: Home,
		role: "student",
		category: "Student",
	},
	/*
  STUDENT MENU ITEMS END
  */
];

export default async function AppSidebar() {
	const session = await getServerAuthSession();

	// remove menu items that are not allowed for the user
	const filteredItems = items.filter((item) => {
		if (item.role) {
			return item.role.toLowerCase() === session?.user.role.toLowerCase();
		}
		return true;
	});

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
			<SidebarHeader className="flex items-center p-6">
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
