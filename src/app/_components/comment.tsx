import { message, Avatar, Tooltip, Tag, Button, Collapse } from "antd";
import dayjs from "dayjs";
import crypto from "crypto";
import relativeTime from "dayjs/plugin/relativeTime";
import CommentForm from "./comment-form";
import { forwardRef, useState } from "react";
import {
  ArrowBigDown,
  ArrowBigRight,
  CircleMinus,
  CirclePlus,
  MessageCircle,
  Trash,
} from "lucide-react";
import { getServerAuthSession } from "@/server/auth";

dayjs.extend(relativeTime);

type Message = {
  id: number;
  sender: {
    name: string;
    role: string;
    guid: string;
    id: number;
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
  replyUnder,
  replyTo,
  replying = false, // if the user is replying to a comment
  onDelete,
  onSubmit,
  onCancel,
  padding,
  userId,
}: {
  message: Message;
  parent?: string | null;
  onReply?: any;
  replyUnder?: number;
  replyTo?: number;
  replying?: boolean;
  onDelete?: any;
  onSubmit?: any;
  onCancel?: any;
  padding?: any;
  userId?: any;
}) => {
  const [hidden, setHidden] = useState(true);
  // Function to generate a hash from a string
  const generateHash = (input: string) => {
    return crypto.createHash("md5").update(input).digest("hex");
  };

  // Function to convert a hash to a color
  const hashToColor = (hash: string) => {
    return `#${hash.slice(0, 6)}`;
  };

  // Function to generate a consistent color based on sender and timestamp
  const generateRandomColor = (sender: string, timestamp: string) => {
    const hash = generateHash(`${sender}-${timestamp}`);
    return hashToColor(hash);
  };
  return (
    <>
      <div
        key={message.id}
        className={`relative flex w-full flex-col p-2 ${parent == null ? "" : ""}`}
        style={
          parent !== null
            ? {
                marginLeft: padding * 2,
              }
            : {
                borderColor: `${generateRandomColor(message.createdAt, message.createdAt)}`,
                backgroundImage: `linear-gradient(90deg, ${generateRandomColor(
                  message.createdAt,
                  message.createdAt,
                )} 0.25%, white 0%)`,
              }
        }
      >
        <div className="flex items-center gap-2">
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
          <p className="font-semibold">{message.sender.name}</p>
          <Tooltip
            title={dayjs(message.createdAt).format("YYYY-MM-DD HH:mm:ss")}
          >
            <p className="cursor-pointer text-gray-400">
              {dayjs(message.createdAt).fromNow()}
            </p>
          </Tooltip>
          <div className="flex items-center">
            <Tag>{message.sender.role}</Tag>
            {message.sender.role === "STUDENT" && (
              <Tag>{message.sender.guid}</Tag>
            )}
          </div>
          {message.replies?.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={() => setHidden(!hidden)}
                className="text-blue-500 hover:underline"
              >
                {hidden ? <CirclePlus size="16" /> : <CircleMinus size="16" />}
              </button>
            </div>
          )}
          {message.sender.id === userId && (
            <div className="flex justify-end">
              <button
                onClick={() => onDelete?.(message.id)}
                className="text-red-500 hover:underline"
              >
                <Trash size={"16"} />
              </button>
            </div>
          )}
        </div>
        <div className="p-2">{message.content}</div>
        {replyUnder === message.id && (
          <>
            <CommentForm
              onSubmit={onSubmit}
              onSend={onReply}
              onCancel={onCancel}
            />
          </>
        )}
        {replying === false &&
          message.replies?.length === 0 &&
          replyTo !== message.id &&
          message.parentId == null && (
            <div className="ml-2 flex">
              <button
                onClick={() => onReply?.(message.id, message.id)}
                className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
              >
                <MessageCircle
                  className="hover:fill-blue-700"
                  fill={"#3b82f6"}
                  size={16}
                />
                <span>Reply</span>
              </button>
            </div>
          )}
      </div>
      {message.replies?.length > 0 && hidden && (
        <div
          className="flex w-full items-start gap-2 bg-slate-50 p-2"
          style={
            parent !== null
              ? {
                  borderLeft: `4px solid ${generateRandomColor(parent, parent)}`,
                  marginLeft: padding * 2,
                }
              : {}
          }
        >
          <p className="text-gray-400">
            {message.replies?.length} Replies hidden
          </p>
        </div>
      )}
      {/** If last message */}

      {message.replies?.length > 0 && !hidden && (
        <div className="relative ml-2 w-full">
          {/* have a line till the last reply to signify the end of the thread */}
          <div
            className="absolute ml-1 h-full w-[1px] items-start"
            style={{
              backgroundColor: `${generateRandomColor(message.createdAt, message.createdAt)}`,
            }}
          ></div>
          {message.replies
            ?.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            )
            .map((reply) => (
              <Comment
                key={reply.id}
                message={reply}
                parent={message.createdAt}
                onReply={onReply}
                replyUnder={replyUnder}
                replyTo={replyTo}
                onSubmit={onSubmit}
                userId={userId}
                onCancel={onCancel}
                padding={padding + 1}
                onDelete={(id: number) => {
                  onDelete(id);
                }}
              />
            ))}
          <div className="ml-4 flex">
            <button
              onClick={() =>
                onReply?.(
                  message.id,
                  message.replies[message.replies.length - 1]?.id,
                )
              }
              className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
            >
              <MessageCircle
                className="hover:fill-blue-700"
                fill={"#3b82f6"}
                size={16}
              />
              <span>Reply</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Comment;
