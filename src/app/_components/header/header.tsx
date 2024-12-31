import { getServerAuthSession } from "@/server/auth";
import UserAvatar from "../avatar";
import Breadcrumbs from "../breadcrumb";
import NotificationBell from "./notification-bell";

export default async function Header() {
	const session = getServerAuthSession();

	return (
		<div className="container flex w-full items-center justify-between border-b pr-3">
			<div className="flex w-full items-center justify-between">
				<div className="w-full flex-1">
					<Breadcrumbs />
				</div>
				<div className="mb-3 flex h-6 items-center gap-2">
					<div className="flex h-10 w-10 items-center justify-center">
						{(await session) && <NotificationBell />}
					</div>
					<UserAvatar />
				</div>
			</div>
		</div>
	);
}
