"use client";
import { SubmittedApplicationsCount } from "@/app/_components/sidebar/applications-count";
import { FlaggedCoursesCount } from "@/app/_components/sidebar/flagged-courses-count";
import SubmittedApplicationsCard from "@/app/admin/dashboard/_sections/dashboard/stats-card/submitted-applications-card";
import { Tag } from "antd";
import {
	Book,
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
import { Session } from "next-auth";

export default function useNavData(session: Session) {
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
			title: "Applications",
			url: "/admin/applications",
			icon: Paperclip,
			role: "admin",
			category: "General",
			suffix: <SubmittedApplicationsCount />,
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
		/* 
            Courses
        */
		{
			title: "Courses",
			url: "/admin/courses/",
			icon: Book,
			role: "admin",
			category: "Courses",
			suffix: <FlaggedCoursesCount />,
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
