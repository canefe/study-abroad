"use client";
import { Bell, Eye, EyeClosed, Trash } from "lucide-react";

import { Avatar, Badge, Button, Dropdown, Popover, Spin, Tooltip } from "antd";
import { api } from "@/trpc/react";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { motion, useAnimation } from "framer-motion";
import { parseNotificationMessage } from "@/lib/notificationUtils";
import { generateRandomColor } from "@/lib/randomUtils";
var relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

export default function NotificationBell() {
	const [notifications] = api.notifications.getList.useSuspenseQuery(void 0, {
		refetchInterval: 5000,
	});
	const unreadNotifications = notifications?.filter((n) => !n.read);
	const [clicked, setClicked] = useState(false);
	const [cachedNotifications, setCachedNotifications] = useState<
		undefined | typeof notifications
	>(undefined);

	const controls = useAnimation();

	useEffect(() => {
		// on first load dont animate
		if (cachedNotifications === undefined) {
			setCachedNotifications(notifications);
			return;
		}
		// compare cached animations with the new one, if there is a new one animate not if existing one is removed
		if (cachedNotifications?.length < notifications?.length) {
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
	}, [unreadNotifications.length, controls]);

	const utils = api.useUtils();
	const markAsReadApi = api.notifications.markAsRead.useMutation({
		onSuccess: async () => {
			await utils.notifications.invalidate();
		},
		onError: (error) => {
			console.error(error);
		},
	});
	const markAsUnreadApi = api.notifications.markAsUnread.useMutation({
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
	const deleteApi = api.notifications.delete.useMutation({
		onSuccess: async () => {
			await utils.notifications.invalidate();
		},
		onError: (error) => {
			console.error(error);
		},
	});

	const onDelete = async (id: number) => {
		await deleteApi.mutate({ id });
	};

	const hide = () => {
		setClicked(false);
	};

	const handleClickChange = (open: boolean) => {
		setClicked(open);
	};

	const content = (
		<div className="flex flex-col justify-between gap-2 p-2">
			<span className="p-2 text-lg font-bold">Notifications</span>
			<ul className="h-full w-full flex-1">
				{notifications?.length === 0 && (
					<li className="p-2 text-center">No notifications</li>
				)}
				{notifications
					?.sort((a, b) => b.createdAt - a.createdAt)
					.map((n) => (
						<li
							className="border-b border-t bg-slate-50 p-2 hover:bg-slate-200"
							key={n.id}
							onClick={() => {
								if (!n.read) markAsReadApi.mutate({ id: n.id });
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
											{markAsReadApi.isPending || markAsUnreadApi.isPending ? (
												<Spin size="small" />
											) : (
												<Tooltip
													title={n.read ? "Mark as unread" : "Mark as read"}
												>
													<span className="text-xs text-gray-500">
														{!n.read ? (
															<span
																onClick={() =>
																	markAsReadApi.mutate({ id: n.id })
																}
																className="cursor-pointer text-blue-500"
															>
																<Eye size={16} />
															</span>
														) : (
															<span
																onClick={() =>
																	markAsUnreadApi.mutate({ id: n.id })
																}
																className="cursor-pointer text-gray-500"
															>
																<EyeClosed size={16} />
															</span>
														)}
													</span>
												</Tooltip>
											)}
											{deleteApi.isPending ? (
												<Spin size="small" />
											) : (
												<Tooltip title="Delete">
													<span
														className="cursor-pointer text-xs text-red-500"
														onClick={() => {
															onDelete(n.id);
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
			<Button className="w-full">
				<span
					className="cursor-pointer text-red-500"
					onClick={() => markAllAsReadApi.mutate()}
				>
					Mark all as read
				</span>
			</Button>
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
			placement={"left"}
			title=""
			trigger="click"
			open={clicked}
			onOpenChange={handleClickChange}
		>
			<motion.div animate={controls} className="h-6 w-6">
				<Badge
					count={unreadNotifications?.length ?? 0}
					className="cursor-pointer duration-150 hover:scale-110"
				>
					<Bell size={24} fill={clicked ? "black" : "white"} />
				</Badge>
			</motion.div>
		</Popover>
	);
}
