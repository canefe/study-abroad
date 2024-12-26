import { Card } from "antd";

export default function StatsCard({
	title,
	value,
}: {
	title: string;
	value: number;
}) {
	return (
		<Card className="flex items-center">
			<div className="text-sm">{title}</div>
			<div className="text-3xl font-semibold">{value}</div>
		</Card>
	);
}
