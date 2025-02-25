import { Button } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import Comment from "./comment";
import CommentForm from "./comment-form";
import toast from "react-hot-toast";
import { useComments } from "@/hooks/useComments";

const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

type CommentSectionProps = {
	messages: any;
	applicationId: number;
	admin: boolean;
	user: any;
};
export default function CommentSection({
	messages,
	applicationId,
	admin,
	user,
}: CommentSectionProps) {
	const [replyTo, setReplyTo] = useState<number | undefined>(undefined);
	const [showReply, setShowReply] = useState<boolean>(false);
	const [replyUnder, setReplyUnder] = useState<number | undefined>(undefined);

	const { sendComment, sendFeedback, deleteComment } = useComments({
		applicationId,
	});

	const messagesClone = messages; // we clone it here we later use it when we are commenting to make it seem like the comment is being sent

	const handleReply = (id: number, replyUnder: number) => {
		if (replyTo === id) {
			setReplyTo(undefined);
		}
		console.log("replyUnder", replyUnder);
		setReplyUnder(replyUnder);
		setReplyTo(id);
	};

	const handleCancel = () => {
		setReplyTo(undefined);
		setReplyUnder(undefined);
	};

	const onSendMessage = async (message: string) => {
		if (!user) {
			return;
		}
		if (message.trim() === "") {
			return Promise.reject("Message cannot be empty");
		}
		await sendComment({
			applicationId: applicationId,
			comment: message,
			parentMessageId: replyTo,
		});
	};

	const onSendFeedback = async (message: string) => {
		if (!user) {
			return;
		}
		if (message.trim() === "") {
			return Promise.reject("Message cannot be empty");
		}
		await sendFeedback({
			applicationId: applicationId,
			comment: message,
			parentMessageId: replyTo,
		});
	};

	const handleFormSubmit = (data: any) => {
		setReplyTo(undefined);
		setReplyUnder(undefined);
		setShowReply(false);
		if (admin) {
			toast.promise(onSendFeedback(data.message), {
				loading: "Sending feedback...",
				success: "Feedback sent successfully",
				error: (err) => err.toString(),
			});
		} else {
			toast.promise(onSendMessage(data.message), {
				loading: "Sending comment...",
				success: "Comment sent successfully",
				error: (err) => err.toString(),
			});
		}
	};

	return (
		<div className="mt-5 flex flex-col justify-end">
			<div className="flex items-center gap-2">
				<h2 className="text-lg font-semibold">Feedback</h2>
				<Button onClick={() => setShowReply(!showReply)}>New Topic</Button>
			</div>
			{showReply && (
				<CommentForm
					onSend={() => {}}
					replyTo={undefined}
					onSubmit={handleFormSubmit}
					onCancel={() => setShowReply(false)}
				/>
			)}
			<div className="mt-2 flex w-full flex-col items-center justify-start gap-2">
				{messagesClone
					?.filter((message) => message.parentId == null)
					.sort((a, b) => {
						return dayjs(a.createdAt).isBefore(dayjs(b.createdAt)) ? 1 : -1;
					})
					.map((message) => (
						<Comment
							key={message.id}
							message={message}
							onReply={handleReply}
							userId={user?.id}
							onCancel={handleCancel}
							onDelete={(id: number) => {
								deleteComment({ messageId: id });
							}}
							replyTo={replyTo}
							onSubmit={handleFormSubmit}
							padding={1}
						/>
					))}
			</div>
		</div>
	);
}
