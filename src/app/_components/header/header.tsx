"use client";
import { Bell } from "lucide-react";
import UserAvatar from "../../dashboard/_sections/avatar";
import Breadcrumbs from "../../dashboard/_sections/breadcrumb";
import { Badge, Dropdown } from "antd";
import { api } from "@/trpc/react";
import NotificationBell from "./notification-bell";

export default function Header() {
	return (
		<div className="container flex w-full items-center justify-between border-b pr-3">
			<div className="flex w-full items-center justify-between">
				<div className="w-full flex-1">
					<Breadcrumbs />
				</div>
				<div className="mb-3 flex h-6 items-center gap-2">
					<div className="flex h-10 w-10 items-center justify-center">
						<NotificationBell />
					</div>
					<UserAvatar />
				</div>
			</div>
		</div>
	);
}
