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
  // focus on the input field when the form is rendered
  useEffect(() => {
    document.getElementById("comment-input")?.focus();
  }, []);

  const handleFormSubmit = (data: FormData) => {
    // reset textarea
    document.getElementById("comment-input")!.value = "";
    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex w-full flex-col items-center gap-2"
    >
      <textarea
        id="comment-input"
        className="w-full rounded border-2 border-gray-300 p-2"
        placeholder="Write your reply here..."
        {...register("message")}
      ></textarea>
      <div className="flex w-full gap-2">
        <Button type="primary" htmlType="submit">
          Send
        </Button>
        <Button type="default" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
