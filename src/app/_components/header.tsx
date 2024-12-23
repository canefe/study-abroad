import { Bell } from "lucide-react";
import UserAvatar from "../dashboard/_sections/avatar";
import Breadcrumbs from "../dashboard/_sections/breadcrumb";
import { Badge } from "antd";

export default function Header() {
	return (
		<div className="container flex w-full items-center justify-between border-b pr-3">
			<div className="flex w-full items-center justify-between">
				<div className="w-full flex-1">
					<Breadcrumbs />
				</div>
				<div className="mb-3 flex items-center gap-4">
					<Badge
						count={5}
						className="cursor-pointer duration-150 hover:scale-110"
					>
						<Bell size={24} />
					</Badge>
					<UserAvatar />
				</div>
			</div>
		</div>
	);
}
