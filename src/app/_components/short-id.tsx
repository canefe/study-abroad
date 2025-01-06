import { shortenText } from "@/lib/textUtils";
import { Tooltip } from "antd";
import { Copy } from "lucide-react";

type ShortIdProps = {
	id: string;
};
export default function ShortId({ id }: ShortIdProps) {
	const copyId = () => {
		navigator.clipboard.writeText(id);
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
