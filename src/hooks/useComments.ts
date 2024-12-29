import {
	useDeleteCommentMutation,
	useSendCommentMutation,
	useSendFeedbackMutation,
} from "@/app/api/mutations/comments";
import { useGetCommentsQuery } from "@/app/api/queries/comments";

type useCommentsProps = {
	applicationId: number;
};

export const useComments = ({ applicationId }: useCommentsProps) => {
	const { data: comments, isLoading } = useGetCommentsQuery(applicationId);

	const sendCommentMutation = useSendCommentMutation();
	const sendFeedbackMutation = useSendFeedbackMutation();
	const deleteCommentMutation = useDeleteCommentMutation();

	return {
		comments,
		isLoading,
		sendComment: sendCommentMutation.mutate,
		sendFeedback: sendFeedbackMutation.mutate,
		deleteComment: deleteCommentMutation.mutate,
	};
};
