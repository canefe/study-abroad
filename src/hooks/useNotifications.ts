import {
	useDeleteNotificationMutation,
	useMarkAllAsReadMutation,
	useMarkAsReadMutation,
	useMarkAsUnreadMutation,
	useMuteUserMutation,
	useUnmuteUserMutation,
} from "@/app/api/mutations/notifications";

export const useNotifications = () => {
	//const { data: notifications, isLoading } = useNotificationsQuery();

	const muteUserMutation = useMuteUserMutation();
	const unmuteUserMutation = useUnmuteUserMutation();
	const markAsReadMutation = useMarkAsReadMutation();
	const markAsUnreadMutation = useMarkAsUnreadMutation();
	const deleteNotificationMutation = useDeleteNotificationMutation();
	const markAllAsReadMutation = useMarkAllAsReadMutation();

	const markAsRead = (id: number) => {
		markAsReadMutation.mutate({ id });
	};

	const muteUser = (userId: string) => {
		muteUserMutation.mutate({ userId });
	};

	const unmuteUser = (userId: string) => {
		unmuteUserMutation.mutate({ userId });
	};

	const markAsUnread = (id: number) => {
		markAsUnreadMutation.mutate({ id });
	};

	const deleteNotification = (id: number) => {
		deleteNotificationMutation.mutate({ id });
	};

	const markAllAsRead = () => {
		markAllAsReadMutation.mutate();
	};

	return {
		muteUser,
		unmuteUser,
		markAsRead,
		markAsUnread,
		deleteNotification,
		deleteNotificationMutation,
		markAllAsRead,
	};
};
