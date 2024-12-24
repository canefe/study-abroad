"use client";
import { Bell, Trash } from "lucide-react";

import { Avatar, Badge, Dropdown, Popover } from "antd";
import { api } from "@/trpc/react";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { motion, useAnimation } from "framer-motion";
import { parseNotificationMessage } from "@/lib/notificationUtils";
var relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

export default function NotificationBell() {
	const [notifications] = api.notifications.getList.useSuspenseQuery(void 0, {
		refetchInterval: 5000,
	});
	const unreadNotifications = notifications?.filter((n) => !n.read);
	const [clicked, setClicked] = useState(false);
	const [hovered, setHovered] = useState(false);
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
						toast.custom(
							(t) => (
								<div className="flex items-center gap-2 bg-slate-100 p-2">
									<div>{parseNotificationMessage(n.message)}</div>
									<div>{dayjs(n.createdAt).fromNow()}</div>
								</div>
							),
							{
								duration: 5000,
								icon: <Bell size={24} />,
								style: {
									color: "black",
								},
							},
						);
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
				{notifications?.length === 0 && (
					<li className="p-2 text-center">No notifications</li>
				)}
				{notifications?.map((n) => (
					<li
						className="border-b border-t bg-slate-100 p-2 hover:bg-slate-200"
						key={n.id}
					>
						<div className="flex gap-2">
							<Avatar>B</Avatar>
							<div>
								{parseNotificationMessage(n.message)}
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
									<span
										className="cursor-pointer text-xs text-red-500"
										onClick={() => {
											onDelete(n.id);
										}}
									>
										<Trash size={16} />
									</span>
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
				<motion.div animate={controls}>
					<Badge
						count={unreadNotifications?.length ?? 0}
						className="cursor-pointer duration-150 hover:scale-110"
					>
						<Bell size={24} />
					</Badge>
				</motion.div>
			</Popover>
		</Popover>
	);
}
