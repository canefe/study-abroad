import { api } from "@/trpc/react";
import toast from "react-hot-toast";

export const useSendCommentMutation = () => {
	const utils = api.useUtils();
	return api.comments.sendComment.useMutation({
		onSuccess: async () => {
			toast("Comment sent");
			utils.comments.invalidate();
		},
		onError: (error) => {
			console.error(error);
		},
	});
};

export const useSendFeedbackMutation = () => {
	const utils = api.useUtils();
	return api.comments.feedback.useMutation({
		onSuccess: async () => {
			toast("Feedback sent");
			utils.comments.invalidate();
		},
		onError: (error) => {
			console.error(error);
		},
	});
};

export const useDeleteCommentMutation = () => {
	const utils = api.useUtils();
	return api.comments.deleteComment.useMutation({
		onSuccess: async () => {
			toast("Comment deleted");
			utils.comments.invalidate();
		},
		onError: (error) => {
			console.error(error);
		},
	});
};
