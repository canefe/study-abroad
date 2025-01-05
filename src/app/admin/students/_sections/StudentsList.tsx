"use client";
import { Table } from "antd";
import { api } from "@/trpc/react";
import Link from "next/link";

export default function StudentList() {
	const [users] = api.students.getList.useSuspenseQuery();
	const utils = api.useUtils();

	const columns = [
		{
			title: "#",
			dataIndex: "id",
			key: "id",
			render: (id) => <span className="text-gray-400">{id}</span>,
		},
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "GUID",
			dataIndex: "guid",
			key: "guid",
			render: (guid: string) => (
				<Link href={`/admin/students/${guid}`} className="text-blue-500">
					{guid}
				</Link>
			),
		},
		{
			title: "Applications",
			dataIndex: "applications",
			key: "applications",
			render: (applications: any) => {
				return applications.map((application: any) => {
					return (
						<div key={application.id}>
							{application.status === "SUBMITTED" ? (
								<Link
									href={`/admin/applications/${application.id}`}
									className="text-blue-500"
								>
									{application.abroadUniversity.name}
								</Link>
							) : (
								application.abroadUniversity.name + " (Draft)"
							)}
						</div>
					);
				});
			},
		},
	];

	return (
		<div className="w-full">
			<Table
				size="small"
				dataSource={users}
				columns={columns}
				loading={!users}
			/>
		</div>
	);
}
