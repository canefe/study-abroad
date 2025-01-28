"use client";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateRandomColor } from "@/lib/randomUtils";
import { api } from "@/trpc/react";
import { Avatar } from "antd";
import { useRouter } from "next/navigation";

export default function UserAvatar({ user }: { user: any }) {
	// next-navigation redirect
	const router = useRouter();
	const me = user;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Avatar
					size={32}
					className="border-2 text-base"
					style={{
						backgroundColor: generateRandomColor(
							me?.name || "black",
							me?.name || "black",
						),
					}}
				>
					{me.name.charAt(0).toUpperCase()}
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={async () => {
						router.push("/api/auth/signout");
					}}
				>
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
