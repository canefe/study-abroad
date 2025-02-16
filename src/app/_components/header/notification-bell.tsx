"use client";
import { Bell, BellOff, Eye, EyeClosed, MailOpen, Trash } from "lucide-react";

import { Avatar, Badge, Button, Dropdown, Popover, Spin, Tooltip } from "antd";
import { api } from "@/trpc/react";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { motion, useAnimation } from "framer-motion";
import { parseNotificationMessage } from "@/lib/notificationUtils";
import { generateRandomColor } from "@/lib/randomUtils";
import { useNotifications } from "@/hooks/useNotifications";

import { useDropdown } from "./dropdown-context";

const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

export default function NotificationBell() {
	const [notifications] = api.notifications.getList.useSuspenseQuery(void 0, {
		refetchInterval: 5000,
	});
	const [user] = api.students.me.useSuspenseQuery();
	const copyNotifications = [...notifications];
	const unreadNotifications = notifications?.filter((n) => !n.read);
	const [cachedNotifications, setCachedNotifications] = useState<
		undefined | typeof notifications
	>(undefined);

	const { openDropdown, toggleDropdown } = useDropdown();

	const {
		muteUser,
		unmuteUser,
		markAsRead,
		markAsUnread,
		deleteNotification,
		deleteNotificationMutation,
		markAllAsRead,
	} = useNotifications();

	const controls = useAnimation();

	useEffect(() => {
		// on first load dont animate
		if (cachedNotifications === undefined) {
			setCachedNotifications(notifications);
			return;
		}
		setCachedNotifications(notifications);
		// compare cached animations with the new one, if there is a new one animate not if existing one is removed
		if (cachedNotifications?.length < (notifications?.length ?? 0)) {
			if (unreadNotifications?.length > 0) {
				controls.start({
					scale: [1, 1.1, 1],
					x: [0, -10, 10, -10, 10, 0],
					transition: {
						duration: 0.5,
					},
				});
				// get the different notifications and toast them
				const newNotifications = notifications?.filter(
					(n) => !cachedNotifications?.some((cn) => cn.id === n.id),
				);
				console.log(newNotifications);
				console.log(cachedNotifications);
				if (newNotifications) {
					newNotifications.forEach((n) => {
						toast((t) => (
							<div className="flex flex-col items-center gap-2 p-2">
								<div>{parseNotificationMessage(n)}</div>
								<span className="text-xs text-gray-500">
									{dayjs(n.createdAt).fromNow()}
								</span>
							</div>
						));
					});
				}
			}
		} else {
			setCachedNotifications(notifications);
		}
	}, [notifications, controls]);

	const handleClickChange = (open: boolean) => {
		if (open) {
			toggleDropdown("bell");
		} else {
			toggleDropdown(null);
		}
	};

	const content = (
		<div className="flex flex-col justify-between gap-2 p-2">
			<div className="flex w-full items-center justify-between p-2 pt-3">
				<span className="text-lg font-bold">Notifications</span>
				<Tooltip title="Mark all as read">
					<MailOpen
						size={24}
						className="cursor-pointer hover:text-orange-500"
						onClick={() => markAllAsRead()}
					/>
				</Tooltip>
			</div>
			<ul className="h-full w-full flex-1">
				{notifications?.length === 0 && (
					<li className="p-2 text-center">No notifications</li>
				)}
				{copyNotifications
					?.sort((a, b) => b.createdAt - a.createdAt)
					.map((n) => (
						<li
							className="border-b border-t bg-slate-50 p-2 hover:bg-slate-200"
							key={n.id}
							onClick={() => {
								if (!n.read) markAsRead(n.id);
							}}
						>
							<div className="flex w-full gap-2">
								<Avatar
									style={{
										backgroundColor: n.sender?.name
											? generateRandomColor(n.sender.name, n.sender.name)
											: "gray",
										minWidth: 36,
										minHeight: 36,
									}}
								>
									{n.sender?.name?.charAt(0).toUpperCase() || "!"}
								</Avatar>
								<div className="text-sm">
									{parseNotificationMessage(n)}
									<div className="flex items-center justify-between gap-2">
										<div className="text-xs text-gray-500">
											{dayjs(n.createdAt).fromNow()}
										</div>
										<div className="flex items-center gap-2">
											{n.senderId != null && (
												<Tooltip
													title={
														<>
															<p>
																{n.sender?.mutedBy?.find(
																	(mb) => mb.id === user.id,
																)
																	? "Unmute"
																	: "Mute"}{" "}
																notifications from
															</p>
															<p>{n.sender?.name}</p>
														</>
													}
												>
													<span
														onClick={
															n.sender?.mutedBy?.find((mb) => mb.id === user.id)
																? () => unmuteUser(n.senderId || "")
																: () => muteUser(n.senderId || "")
														}
														className="text-xs text-gray-500"
													>
														<span className="cursor-pointer text-gray-500">
															{n.sender?.mutedBy?.find(
																(mb) => mb.id === user.id,
															) ? (
																<BellOff size={16} />
															) : (
																<Bell size={16} />
															)}
														</span>
													</span>
												</Tooltip>
											)}
											<Tooltip
												title={n.read ? "Mark as unread" : "Mark as read"}
											>
												<span className="text-xs text-gray-500">
													{!n.read ? (
														<span
															onClick={() => {
																markAsRead(n.id);
																// change copyNotifications to update the UI
																copyNotifications.find(
																	(cn) => cn.id === n.id,
																)!.read = true;
															}}
															className="cursor-pointer text-blue-500"
														>
															<Eye size={16} />
														</span>
													) : (
														<span
															onClick={() => {
																markAsUnread(n.id);
																// change copyNotifications to update the UI
																copyNotifications.find(
																	(cn) => cn.id === n.id,
																)!.read = false;
															}}
															className="cursor-pointer text-gray-500"
														>
															<EyeClosed size={16} />
														</span>
													)}
												</span>
											</Tooltip>
											{deleteNotificationMutation.isPending ? (
												<Spin size="small" />
											) : (
												<Tooltip title="Delete">
													<span
														className="cursor-pointer text-xs text-red-500"
														onClick={() => {
															deleteNotification(n.id);
														}}
													>
														<Trash size={16} />
													</span>
												</Tooltip>
											)}
										</div>
									</div>
								</div>
							</div>
						</li>
					))}
			</ul>
		</div>
	);

	return (
		<Popover
			content={<div>{content}</div>}
			style={{
				width: 100,
				padding: 0,
				marginTop: 10,
			}}
			overlayInnerStyle={{
				padding: 0,
				width: 375,
				height: 575,
			}}
			placement={"bottom"}
			title=""
			trigger="click"
			open={openDropdown === "bell"}
			onOpenChange={handleClickChange}
		>
			<motion.div animate={controls} className="h-6 w-6">
				<Badge
					count={unreadNotifications?.length ?? 0}
					className="cursor-pointer duration-150 hover:scale-110"
				>
					<Bell size={24} fill={openDropdown === "bell" ? "black" : "white"} />
				</Badge>
			</motion.div>
		</Popover>
	);
}
