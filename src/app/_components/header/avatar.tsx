"use client";

import { generateRandomColor } from "@/lib/randomUtils";
import { Avatar, Button, Popover } from "antd";
import { useRouter } from "next/navigation";
import { useDropdown } from "./dropdown-context";
import { motion, useAnimation } from "framer-motion";

export default function UserAvatar({ user }: { user: any }) {
	// next-navigation redirect
	const router = useRouter();
	const me = user;
	const { openDropdown, toggleDropdown } = useDropdown();
	const redirect = () => {
		router.push("/api/auth/signout");
	};
	const handleClickChange = (open: boolean) => {
		if (open) {
			return toggleDropdown("avatar");
		}
		toggleDropdown(undefined);
	};
	const controls = useAnimation();
	return (
		<Popover
			content={
				<div className="flex h-full flex-col justify-between gap-2 p-2">
					<div className="flex h-full w-full flex-col justify-between gap-2 p-2 pt-3">
						<span className="text-lg font-bold">My Account</span>
						<Button onClick={redirect}>Log out</Button>
					</div>
				</div>
			}
			style={{
				width: 100,
				padding: 0,
				marginTop: 10,
			}}
			overlayInnerStyle={{
				padding: 0,
				width: 375,
			}}
			placement={"bottom"}
			title=""
			trigger="click"
			open={openDropdown === "avatar"}
			onOpenChange={handleClickChange}
		>
			<motion.div animate={controls} className="">
				<Avatar
					size={32}
					className="cursor-pointer border-2 text-base duration-150 hover:scale-110 focus:border-0"
					style={{
						backgroundColor: generateRandomColor(
							me?.name || "black",
							me?.name || "black",
						),
					}}
				>
					{me.name.charAt(0).toUpperCase()}
				</Avatar>
			</motion.div>
		</Popover>
	);
}
