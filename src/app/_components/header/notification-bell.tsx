"use client";
import { Bell } from "lucide-react";

import { Avatar, Badge, Dropdown, Popover } from "antd";
import { api } from "@/trpc/react";
import { useState } from "react";
import dayjs from "dayjs";
var relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

export default function NotificationBell() {
	const [notifications] = api.notifications.getList.useSuspenseQuery(void 0, {
		refetchInterval: 10000,
	});
	const unreadNotifications = notifications?.filter((n) => !n.read);
	const [clicked, setClicked] = useState(false);
	const [hovered, setHovered] = useState(false);

	const utils = api.useUtils();
	const markAsReadApi = api.notifications.markAsRead.useMutation({
		onSuccess: async () => {
			await utils.notifications.invalidate();
		},
		onError: (error) => {
			console.error(error);
		},
	});
	const markAllAsReadApi = api.notifications.markAllAsRead.useMutation({
		onSuccess: async () => {
			await utils.notifications.invalidate();
		},
		onError: (error) => {
			console.error(error);
		},
	});

	const hide = () => {
		setClicked(false);
		setHovered(false);
	};

	const handleHoverChange = (open: boolean) => {
		setHovered(open);
		setClicked(false);
	};

	const handleClickChange = (open: boolean) => {
		setHovered(false);
		setClicked(open);
	};

	const content = (
		<>
			<span className="p-2 text-lg font-bold">Notifications</span>
			<ul>
				{notifications?.map((n) => (
					<li
						className="border-b border-t bg-slate-100 p-2 hover:bg-slate-200"
						key={n.id}
					>
						<div className="flex gap-2">
							<Avatar>B</Avatar>
							<div>
								<div dangerouslySetInnerHTML={{ __html: n.message }} />
								<div className="flex items-center justify-between gap-2">
									<div className="text-xs text-gray-500">
										{dayjs(n.createdAt).fromNow()}
									</div>
									<span className="text-xs text-gray-500">
										{!n.read && (
											<span
												onClick={() => markAsReadApi.mutate({ id: n.id })}
												className="cursor-pointer text-blue-500"
											>
												Mark as read
											</span>
										)}
									</span>
									<span className="text-xs text-red-500">Delete</span>
								</div>
							</div>
						</div>
					</li>
				))}
			</ul>
		</>
	);

	return (
		<Popover
			style={{ width: 500 }}
			overlayInnerStyle={{ padding: 0 }}
			content={content}
			title=""
			trigger="hover"
			open={hovered}
			onOpenChange={handleHoverChange}
		>
			<Popover
				content={
					<div>
						{content}
						<a onClick={hide}>Close</a>
					</div>
				}
				style={{
					width: 500,
					padding: 0,
				}}
				overlayInnerStyle={{
					padding: 0,
				}}
				title=""
				trigger="click"
				open={clicked}
				onOpenChange={handleClickChange}
			>
				<Badge
					count={unreadNotifications?.length ?? 0}
					className="cursor-pointer duration-150 hover:scale-110"
				>
					<Bell size={24} />
				</Badge>
			</Popover>
		</Popover>
	);
}
