import { FlaggedCoursesCount } from "@/app/_components/sidebar/courses-count";
import { Tag } from "antd";
import {
	Flag,
	Home,
	Paperclip,
	PlusCircle,
	Settings,
	ShieldQuestion,
	University,
	User,
	Verified,
} from "lucide-react";

export default function useNavData(session: any) {
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
			url: "/admin/students",
			icon: User,
			role: "admin",
			category: "General",
		},

		{
			title: "Universities",
			url: "/admin/universities",
			icon: University,
			role: "admin",
			category: "General",
		},
		{
			title: "Applications",
			url: "/admin/applications",
			icon: Paperclip,
			role: "admin",
			category: "General",
		},
		/* 
            Courses
        */
		{
			title: "Verified Courses",
			url: "/admin/courses/verified",
			icon: Verified,
			role: "admin",
			category: "Courses",
		},
		{
			title: "Flagged Courses",
			url: "/admin/courses/flagged",
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
			url: "/admin/courses/unverified",
			icon: ShieldQuestion,
			role: "admin",
			category: "Courses",
		},
		{
			title: "Create Course",
			url: "/admin/courses/create",
			icon: PlusCircle,
			role: "admin",
			category: "Courses",
		},
		{
			title: "Settings",
			url: "/admin/settings",
			icon: Settings,
			role: "admin",
			category: "Other",
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

	// remove menu items that are not allowed for the user
	const filteredItems = items.filter((item) => {
		if (item.role) {
			return item.role.toLowerCase() === session?.user.role.toLowerCase();
		}
		return true;
	});

	return { filteredItems };
}
