import { Avatar, Tooltip, Button } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import CommentForm from "./comment-form";
import { useState } from "react";
import {
	Bell,
	BellOff,
	CircleMinus,
	CirclePlus,
	MessageCircle,
	Trash,
} from "lucide-react";
import { generateRandomColor } from "@/lib/randomUtils";
import { useNotifications } from "@/hooks/useNotifications";
import { motion } from "framer-motion";

dayjs.extend(relativeTime);

type Message = {
	id: number;
	sender: {
		name: string;
		role: string;
		guid: string;
		id: number;
		mutedBy: { id: number }[];
	};
	content: string;
	createdAt: string;
	replies: Message[];
	parentId: number | null;
};

const Comment = ({
	message,
	parent = null, // time stamp of parent comment
	onReply,
	replyTo,
	replying = false, // if the user is replying to a comment
	onDelete,
	onSubmit,
	onCancel,
	padding,
	userId,
	showSenderInfo = true,
	lastComment,
}: {
	message: Message;
	parent?: string | null;
	onReply?: any;
	replyTo?: number;
	replying?: boolean;
	onDelete?: any;
	onSubmit?: any;
	onCancel?: any;
	padding?: any;
	userId?: any;
	showSenderInfo?: boolean;
	lastComment?: boolean;
}) => {
	const [hidden, setHidden] = useState(true);
	const [hover, setHover] = useState(false);

	const onHover = () => {
		setHover(true);
	};

	const { muteUser, unmuteUser } = useNotifications();

	let previousSenderId: number = -1;
	let previousCreatedAt: string = "";

	return (
		<>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1, transition: { duration: 0.5 } }}
				key={message.id}
				onClick={() => setHidden(!hidden)}
				onMouseEnter={() => onHover()}
				onMouseLeave={() => setHover(false)}
				className={`relative flex w-full flex-col pl-2 ${!showSenderInfo ? "" : "mt-2 py-1"} hover:bg-gray-100 ${parent == null ? "" : ""}`}
				style={
					parent !== null
						? {
								marginLeft: padding * 2,
								borderLeft: `2px solid ${generateRandomColor(parent, parent)}`,
							}
						: {
								borderColor: `${generateRandomColor(message.createdAt, message.createdAt)}`,
								borderLeft: `3px solid ${generateRandomColor(
									message.createdAt,
									message.createdAt,
								)}`,
							}
				}
			>
				<div className="flex items-center justify-end gap-2">
					{showSenderInfo && (
						<>
							<Avatar
								style={{
									backgroundColor: generateRandomColor(
										message.sender.name,
										message.sender.name,
									),
								}}
							>
								{message.sender.name?.charAt(0).toUpperCase()}
							</Avatar>
							<div className="flex flex-1 flex-col">
								<div className="flex items-center gap-2">
									<p className="font-semibold">{message.sender.name}</p>
									<Tooltip
										placement="top"
										title={dayjs(message.createdAt).format(
											"YYYY-MM-DD HH:mm:ss",
										)}
									>
										<p className="w-fit cursor-pointer text-xs text-gray-400">
											{dayjs(message.createdAt).fromNow()}
										</p>
									</Tooltip>
								</div>
								<div className="flex items-center gap-1 text-xs text-gray-400">
									<span>
										{message.sender.role === "ADMIN"
											? "Coordinator"
											: "Student"}
									</span>
									{message.sender.role === "STUDENT" && (
										<span>• {message.sender.guid}</span>
									)}
								</div>
							</div>
						</>
					)}
					<div className="flex items-center gap-1 pr-2">
						{message.sender.id === userId && hover && (
							<Tooltip title="Delete" placement="top">
								<div
									className={`flex justify-end ${!showSenderInfo ? "absolute bottom-0 right-2 top-0 z-20 my-auto" : ""}`}
								>
									<button
										onClick={() => onDelete?.(message.id)}
										className="text-red-500 hover:scale-110 hover:underline"
									>
										<Trash size={"16"} />
									</button>
								</div>
							</Tooltip>
						)}
						{hover && userId != message.sender?.id && (
							<Tooltip
								title={
									<>
										<p>
											{message.sender?.mutedBy?.find((mb) => mb.id === userId)
												? "Unmute"
												: "Mute"}{" "}
											notifications from
										</p>
										<p>{message.sender?.name}</p>
									</>
								}
							>
								<span
									onClick={
										message.sender?.mutedBy?.find((mb) => mb.id === userId)
											? () => unmuteUser(message.sender.id.toString())
											: () => muteUser(message.sender.id.toString())
									}
									className={`text-xs text-gray-500 ${!showSenderInfo ? "absolute bottom-0 right-2 top-0 z-20 my-auto" : ""}`}
								>
									<span className="cursor-pointer text-gray-500">
										{message.sender?.mutedBy?.find((mb) => mb.id === userId) ? (
											<BellOff size={16} />
										) : (
											<Bell size={16} />
										)}
									</span>
								</span>
							</Tooltip>
						)}
					</div>
				</div>

				<div className="relative flex items-center gap-1">
					{!showSenderInfo && hover && (
						<div className="absolute mt-2 flex items-center gap-2">
							<p className="w-fit cursor-pointer text-xs text-gray-400">
								{dayjs(message.createdAt).format("HH:mm")}
							</p>
						</div>
					)}
					<div
						className="pl-10"
						style={showSenderInfo ? { marginTop: "0.5rem" } : {}}
					>
						{message.content}
					</div>
				</div>
				{((lastComment && replyTo == message.parentId) ||
					(!lastComment &&
						replyTo === message.id &&
						message.replies.length === 0)) && (
					<div className="ml-8">
						<CommentForm
							onSubmit={onSubmit}
							onSend={onReply}
							onCancel={onCancel}
							replyTo={replyTo}
						/>
					</div>
				)}
				{((lastComment && replying === false && replyTo !== message.parentId) ||
					(!lastComment &&
						replying === false &&
						message.replies?.length === 0 &&
						replyTo !== message.id &&
						message.parentId == null)) && (
					<div className="ml-10 mt-2 flex">
						<Button
							size="small"
							onClick={() => {
								if (!lastComment) {
									onReply?.(message.id, message.id);
								} else {
									onReply?.(message.parentId, message.parentId);
								}
							}}
							className="flex items-center gap-1 text-xs text-blue-500"
						>
							<MessageCircle
								className="hover:fill-blue-700"
								fill={"#3b82f6"}
								size={16}
							/>
							<span>Reply</span>
						</Button>
					</div>
				)}
				{message.replies?.length > 0 && (
					<Tooltip title="Show replies" placement="top">
						<div className="absolute -bottom-1 -left-[0.7rem] flex justify-end">
							<button
								onClick={() => setHidden(!hidden)}
								className="text-blue-500 hover:scale-110 hover:underline"
							>
								{hidden ? (
									<CirclePlus fill="white" size="20" />
								) : (
									<CircleMinus fill="white" size="20" />
								)}
							</button>
						</div>
					</Tooltip>
				)}
			</motion.div>

			{/** If last message */}

			{message.replies?.length > 0 && !hidden && (
				<div className="relative ml-2 w-full">
					{message.replies
						?.sort(
							(a, b) =>
								new Date(a.createdAt).getTime() -
								new Date(b.createdAt).getTime(),
						)
						.map((reply) => {
							const showSenderInfo =
								reply.sender.id !== previousSenderId ||
								!dayjs(reply.createdAt).isSame(previousCreatedAt, "day");
							previousSenderId = reply.sender.id;
							previousCreatedAt = reply.createdAt;

							return (
								<Comment
									key={reply.id}
									message={reply}
									parent={message.createdAt}
									onReply={onReply}
									replyTo={replyTo}
									onSubmit={onSubmit}
									userId={userId}
									onCancel={onCancel}
									padding={padding + 1}
									onDelete={(id: number) => {
										onDelete(id);
									}}
									// if this reply last comment
									lastComment={
										reply.id === message.replies[message.replies.length - 1]?.id
									}
									showSenderInfo={showSenderInfo}
								/>
							);
						})}
				</div>
			)}
		</>
	);
};

export default Comment;
