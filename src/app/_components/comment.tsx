import { message, Avatar, Tooltip, Tag, Button } from "antd";
import dayjs from "dayjs";
import crypto from "crypto";
import relativeTime from "dayjs/plugin/relativeTime";
import CommentForm from "./comment-form";
import { forwardRef, useState } from "react";
import { ArrowBigDown, ArrowBigRight } from "lucide-react";

dayjs.extend(relativeTime);

type Message = {
  id: number;
  sender: {
    name: string;
    role: string;
    guid: string;
  };
  content: string;
  createdAt: string;
  replies: Message[];
};

const Comment = forwardRef(
  (
    {
      message,
      parent = null, // time stamp of parent comment
      onReply,
      replyTo,
      replying = false, // if the user is replying to a comment
      register,
      onSubmit,
      onCancel,
      padding,
    }: {
      message: Message;
      parent?: string | null;
      onReply?: any;
      replyTo?: number;
      replying?: boolean;
      register?: any;
      onSubmit?: any;
      onCancel?: any;
      padding?: any;
    },
    ref,
  ) => {
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
          className="flex w-full flex-col gap-2 rounded bg-slate-50 p-2"
          style={
            parent !== null
              ? {
                  borderLeft: `4px solid ${generateRandomColor(parent, parent)}`,
                  marginLeft: padding * 10,
                }
              : {}
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
            <Tag>{message.sender.role}</Tag>
            {message.sender.role === "STUDENT" && (
              <Tag>{message.sender.guid}</Tag>
            )}
            {message.replies?.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={() => setHidden(!hidden)}
                  className="text-blue-500 hover:underline"
                >
                  {hidden ? <ArrowBigRight /> : <ArrowBigDown />}
                </button>
              </div>
            )}
          </div>
          <div className="bg-gray-100 p-2">{message.content}</div>
          {replyTo === message.id && (
            <>
              <CommentForm
                onSubmit={onSubmit}
                onSend={onReply}
                onCancel={onCancel}
              />
            </>
          )}
          {replying === false && replyTo !== message.id && (
            <div className="flex">
              <button
                onClick={() => onReply?.(message.id)}
                className="text-blue-500 hover:underline"
              >
                Reply
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
                    marginLeft: padding * 10,
                  }
                : {}
            }
          >
            <p className="text-gray-400">
              {message.replies?.length} Replies hidden
            </p>
          </div>
        )}
        {message.replies?.length > 0 && !hidden && (
          <>
            {message.replies?.map((reply) => (
              <Comment
                key={reply.id}
                message={reply}
                parent={message.createdAt}
                onReply={onReply}
                replyTo={replyTo}
                onSubmit={onSubmit}
                onCancel={onCancel}
                padding={padding + 10}
              />
            ))}
          </>
        )}
      </>
    );
  },
);

export default Comment;
