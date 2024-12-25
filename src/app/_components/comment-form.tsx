import { Controller, useForm } from "react-hook-form";
import Comment from "./comment";
import { useEffect, useRef } from "react";
import { Button } from "antd";

import { Input } from "antd";

const { TextArea } = Input;

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
	const { handleSubmit, control } = useForm<FormData>();
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
			className="m-2 flex w-full flex-col items-center gap-2"
		>
			<Controller
				name="message"
				control={control}
				render={({ field, fieldState }) => (
					<TextArea
						id="comment-input"
						{...field}
						className="w-full border-2 border-gray-300 p-2"
						autoSize
						placeholder="Write your reply here..."
					/>
				)}
			/>
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
