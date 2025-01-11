"use client";
import { shortenText } from "@/lib/textUtils";
import { Tooltip } from "antd";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";

type ShortIdProps = {
	id: string;
};
export default function ShortId({ id }: ShortIdProps) {
	const copyId = () => {
		if (typeof navigator !== "undefined") {
			if (navigator.clipboard) {
				navigator.clipboard.writeText(id);
				toast.success("ID copied to clipboard");
			} else {
				toast.error("Clipboard not supported");
			}
		}
	};

	return (
		<div className="flex items-center gap-1">
			<span className="text-gray-500" style={{}}>
				{shortenText(id, 10)}
			</span>
			<Tooltip title="Copy ID">
				<Copy
					size={12}
					className="cursor-pointer hover:scale-110"
					onClick={copyId}
				/>
			</Tooltip>
		</div>
	);
}
