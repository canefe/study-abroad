"use client";
import { Table } from "antd";
import { api } from "@/trpc/react";
import Link from "next/link";

export default function ApplicationList() {
	const [applications] = api.applications.getAll.useSuspenseQuery();
	const utils = api.useUtils();

	const columns = [
		{
			title: "#",
			dataIndex: "id",
			key: "id",
			render: (id: string) => <span className="text-gray-500">{id}</span>,
		},
		{
			title: "Student",
			dataIndex: ["user", "name"],
			key: "name",
			render: (name: string) => <span>{name}</span>,
		},
		{
			title: "GUID",
			dataIndex: ["user", "guid"],
			key: "guid",
			render: (guid: string) => (
				<Link href={`/admin/students/${guid}`} className="text-blue-500">
					{guid}
				</Link>
			),
		},
		{
			title: "University",
			dataIndex: ["abroadUniversity", "name"],
			key: "university",
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status: string) => {
				return <span style={{ color: "red" }}>{status}</span>;
			},
		},
		{
			title: "Actions",
			key: "actions",
			render: (record: any) => {
				return (
					<Link
						href={`/admin/applications/${record.id}`}
						className="text-blue-500"
					>
						View
					</Link>
				);
			},
		},
	];

	return (
		<div className="w-full">
			<Table
				size={"middle"}
				dataSource={applications}
				columns={columns}
				loading={!applications}
			/>
		</div>
	);
}
