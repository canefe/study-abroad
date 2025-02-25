import { api } from "@/trpc/react";
import toast from "react-hot-toast";

export const useMuteUserMutation = () => {
	const utils = api.useUtils();
	return api.notifications.mute.useMutation({
		onSuccess: async () => {
			await utils.notifications.invalidate();
			toast("Muted notifications from user");
			await utils.comments.invalidate();
		},
		onError: (error) => {
			console.error(error);
		},
	});
};

export const useUnmuteUserMutation = () => {
	const utils = api.useUtils();
	return api.notifications.unmute.useMutation({
		onSuccess: async () => {
			await utils.notifications.invalidate();
			toast("Unmuted notifications from user");
			await utils.comments.invalidate();
		},
		onError: (error) => {
			console.error(error);
		},
	});
};

export const useMarkAsReadMutation = () => {
	const utils = api.useUtils();
	return api.notifications.markAsRead.useMutation({
		onSuccess: async () => {
			await utils.notifications.invalidate();
		},
		onError: (error) => {
			console.error(error);
		},
	});
};

export const useDeleteNotificationMutation = () => {
	const utils = api.useUtils();
	return api.notifications.delete.useMutation({
		onSuccess: async () => {
			await utils.notifications.invalidate();
			toast("Deleted notification");
		},
		onError: (error) => {
			console.error(error);
		},
	});
};

// mark all read
export const useMarkAllAsReadMutation = () => {
	const utils = api.useUtils();
	return api.notifications.markAllAsRead.useMutation({
		onSuccess: async () => {
			await utils.notifications.invalidate();
			toast("Marked all notifications as read");
		},
		onError: (error) => {
			console.error(error);
		},
	});
};

// unread
export const useMarkAsUnreadMutation = () => {
	const utils = api.useUtils();
	return api.notifications.markAsUnread.useMutation({
		onSuccess: async () => {
			await utils.notifications.invalidate();
		},
		onError: (error) => {
			console.error(error);
		},
	});
};
