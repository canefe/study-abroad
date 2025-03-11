import { Card } from "antd";

export default function StatsCard({
	title,
	value,
	statClassName,
}: {
	title: string;
	value: number | string;
	statClassName?: string;
}) {
	return (
		<Card className={`flex items-center`}>
			<div className="text-sm">{title}</div>
			<div className={`text-3xl font-semibold ${statClassName}`}>{value}</div>
		</Card>
	);
}
