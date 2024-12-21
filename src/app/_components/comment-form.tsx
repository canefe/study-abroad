import { useForm } from "react-hook-form";
import Comment from "./comment";
import { useEffect, useRef } from "react";
import { Button } from "antd";

type FormData = {
  message: string;
};

type CommentFormProps = {
  onSend: () => void;
  replyTo?: number;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
};

export default function CommentForm({
  onSend,
  replyTo,
  onSubmit,
  onCancel,
}: CommentFormProps) {
  const { register, handleSubmit } = useForm<FormData>();
  const commentRef = useRef<any>(null);

  // create fake message object to simulate a comment, 'ghost comment' it just to show the user that the comment is being sent
  const messaga = {
    id: 0,
    sender: {
      name: "You",
      role: "User",
      guid: "user",
    },
    content: "This is a ghost comment",
    parentId: replyTo,
    createdAt: new Date().toISOString(),
  };

  // focus on the input field when the form is rendered
  useEffect(() => {
    document.getElementById("comment-input")?.focus();
  }, []);

  const handleFormSubmit = (data: FormData) => {
    console.log(data);
    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex w-full items-center gap-2 bg-gray-200"
    >
      <textarea
        id="comment-input"
        className="w-full rounded border-2 border-gray-300 p-2"
        placeholder="Write your reply here..."
        {...register("message")}
      ></textarea>
      <Button type="primary" htmlType="submit">
        Send
      </Button>
      <Button type="default" onClick={onCancel}>
        Cancel
      </Button>
    </form>
  );
}
