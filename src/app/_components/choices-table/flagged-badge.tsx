import { Tooltip } from "antd";
import { Flag } from "lucide-react";

export default function FlaggedBadge() {
	return (
		<Tooltip
			title={
				<div>
					<p className="font-semibold">Flagged</p>
					<ul className="list-inside list-disc">
						<li className="text-xs">
							This course has been flagged by a student.
						</li>
						<li className="text-xs">
							It could be an outdated course or a mistake.
						</li>
					</ul>
				</div>
			}
		>
			<span className="inline-block whitespace-nowrap text-xs text-green-500">
				<Flag
					size={16}
					fill="#ef4444"
					className="w-fit cursor-pointer text-red-500 hover:text-red-700"
				/>
			</span>
		</Tooltip>
	);
}
