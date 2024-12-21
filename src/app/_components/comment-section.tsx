import { Application } from "@prisma/client";
import { Button, Avatar, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import { application } from "express";
import crypto from "crypto";
import { useEffect, useRef, useState } from "react";
import Comment from "./comment";
import CommentForm from "./comment-form";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";

var relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

type CommentSectionProps = {
  messages: any;
  admin: boolean;
};
export default function CommentSection({
  messages,
  admin,
}: CommentSectionProps) {
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const commentFormRef = useRef<any>(null);

  // admin send feedback api
  const sendFeedbackApi = api.applications.feedback.useMutation({
    onSuccess: async () => {
      toast.success("Feedback sent successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // student send comment api
  const sendCommentApi = api.applications.comment.useMutation({
    onSuccess: async () => {
      toast.success("Comment sent successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const messagesClone = messages; // we clone it here we later use it when we are commenting to make it seem like the comment is being sent

  const handleReply = (id: number) => {
    if (replyTo === id) {
      setReplyTo(null);
    }
    setReplyTo(id);
  };

  const handleFormSubmit = (data: any) => {
    setReplyTo(null);
    if (admin) {
      sendFeedbackApi.mutate({
        applicationId: messagesClone[0].applicationId,
        comment: data.message,
        parentMessageId: replyTo,
      });
    } else {
      sendCommentApi.mutate({
        applicationId: messagesClone[0].applicationId,
        comment: data.message,
        parentMessageId: replyTo,
      });
    }
  };

  return (
    <div className="mt-5 flex flex-col justify-end">
      <h2 className="text-lg font-semibold">Feedback</h2>
      <div className="mt-2 flex w-full flex-col items-center justify-start gap-2">
        {messagesClone
          ?.filter((message) => message.parentId == null)
          .map((message) => (
            <Comment
              key={message.id}
              message={message}
              onReply={handleReply}
              replyTo={replyTo}
              onSubmit={handleFormSubmit}
              padding={1}
            />
          ))}
      </div>
    </div>
  );
}
