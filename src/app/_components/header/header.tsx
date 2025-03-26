import UserAvatar from "./avatar";
import Breadcrumbs from "../breadcrumb";
import NotificationBell from "./notification-bell";
import { DropdownProvider } from "./dropdown-context";
import { Session } from "next-auth";

export default function Header({ session }: { session: Session }) {
	return (
		<div className="container flex w-full items-center justify-between border-b pr-3">
			<div className="flex w-full items-center justify-between">
				<div className="w-full flex-1">
					<Breadcrumbs />
				</div>
				<DropdownProvider>
					<div className="mb-3 flex h-6 items-center gap-2">
						<div className="flex h-10 w-10 items-center justify-center">
							{session?.user && <NotificationBell session={session} />}
						</div>
						{session?.user && <UserAvatar user={session?.user} />}
					</div>
				</DropdownProvider>
			</div>
		</div>
	);
}
