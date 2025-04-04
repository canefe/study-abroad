import { Card } from "antd";
import { ReactNode } from "react";

export default function StatsCard({
	title,
	value,
	statClassName,
}: {
	title: ReactNode | string;
	value: number | string | ReactNode;
	statClassName?: string;
}) {
	return (
		<Card className={`flex items-center`}>
			<div className="text-sm">{title}</div>
			<div className={`text-3xl font-semibold ${statClassName}`}>{value}</div>
		</Card>
	);
}
