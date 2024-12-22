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
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [showReply, setShowReply] = useState<boolean>(false);
  const utils = api.useUtils();
  // admin send feedback api
  const sendFeedbackApi = api.applications.feedback.useMutation({
    onSuccess: async () => {
      toast.success("Feedback sent successfully");
      utils.applications.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // student send comment api
  const sendCommentApi = api.applications.comment.useMutation({
    onSuccess: async () => {
      utils.applications.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteCommentApi = api.applications.deleteComment.useMutation({
    onSuccess: async () => {
      toast.success("Comment deleted successfully");
      utils.applications.invalidate();
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

  const onSendMessage = async (message: string) => {
    if (!user) {
      return;
    }
    if (message.trim() === "") {
      return;
    }
    // add artifical delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await sendCommentApi.mutate({
      applicationId: applicationId,
      comment: message,
      parentMessageId: replyTo,
    });
  };

  const handleFormSubmit = (data: any) => {
    setReplyTo(null);
    setShowReply(false);
    if (admin) {
      sendFeedbackApi.mutate({
        applicationId: applicationId,
        comment: data.message,
        parentMessageId: replyTo,
      });
    } else {
      toast.promise(onSendMessage(data.message), {
        loading: "Sending comment...",
        success: "Comment sent successfully",
        error: "Failed to send comment",
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
          replyTo={null}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowReply(false)}
        />
      )}
      <div className="mt-2 flex w-full flex-col items-center justify-start gap-2">
        {messagesClone
          ?.filter((message) => message.parentId == null)
          .map((message) => (
            <Comment
              key={message.id}
              message={message}
              onReply={handleReply}
              userId={user?.id}
              onDelete={(id: number) => {
                deleteCommentApi.mutate({ messageId: id });
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
