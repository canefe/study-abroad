import { Tooltip } from "antd";
import { Verified } from "lucide-react";

export default function VerifiedBadge() {
	return (
		<Tooltip
			title={
				<div>
					<p className="font-semibold">Verified</p>
					<ul className="list-inside list-disc">
						<li className="text-xs">
							This course has been verified by a coordinator.
						</li>
						<li className="text-xs">It is up to date and accurate.</li>
					</ul>
				</div>
			}
		>
			<span className="inline-block whitespace-nowrap text-xs text-green-500">
				<Verified
					className="fill-green-300 text-green-500 hover:scale-110"
					size={16}
				/>
			</span>
		</Tooltip>
	);
}
