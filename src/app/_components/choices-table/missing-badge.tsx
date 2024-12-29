import { Tooltip } from "antd";
import { FileWarning } from "lucide-react";

export default function MissingBadge() {
	return (
		<Tooltip
			title={
				<div>
					<p className="font-semibold">Missing</p>
					<ul className="list-inside list-disc">
						<li className="text-xs">
							This course is deleted or missing from the database.
						</li>
						<li className="text-xs">Please add the course again.</li>
					</ul>
				</div>
			}
		>
			<span className="inline-block whitespace-nowrap text-xs text-green-500">
				<FileWarning
					className="fill-yellow-300 text-yellow-500 hover:scale-110"
					size={16}
				/>
			</span>
		</Tooltip>
	);
}
