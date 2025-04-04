"use client";
import { AutoComplete, Button, Table, Tooltip, Tag } from "antd";
import { api } from "@/trpc/react";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { debounce } from "lodash";
import { Filter } from "lucide-react";
import { statusColor } from "@/lib/randomUtils";

export default function StudentList() {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [users] = api.students.getList.useSuspenseQuery({
		q: search,
		page: page,
		pageSize: 10,
	});

	const handleSearch = debounce((value: string) => {
		setSearch(value);
		setPage(1);
	}, 500);

	const renderApplicationTags = (applications: any[]) => {
		if (applications.length > 2) {
			const firstThree = applications.slice(0, 2).map((application: any) => (
				<Tag color={statusColor(application.status)} key={application.id}>
					{application.abroadUniversity?.name || "N/A"} - {application.status}
				</Tag>
			));
			const remaining = applications.length - 2;
			return (
				<>
					{firstThree}
					<Tag>... {remaining} more applications</Tag>
				</>
			);
		}

		return applications.map((application: any) => (
			<Tag color={statusColor(application.status)} key={application.id}>
				{application.abroadUniversity?.name || "N/A"} - {application.status}
			</Tag>
		));
	};

	const renderApplications = (applications: any[], guid: string) => {
		const hasApplications = applications.length > 0;
		if (!hasApplications)
			return <span className="text-gray-500">No Applications</span>;
		return (
			<div className="flex items-center gap-1">
				<Tooltip title="View Applications">
					<Link
						href={"/admin/applications?status=all&q=" + guid}
						className="flex cursor-pointer items-center text-blue-500"
					>
						{renderApplicationTags(applications)}
					</Link>
				</Tooltip>
			</div>
		);
	};

	const columns = [
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "GUID",
			dataIndex: "guid",
			key: "guid",
		},
		{
			title: "Applications",
			key: "applications",
			dataIndex: "applications",
			render: (applications: any, record: any) => {
				return renderApplications(applications, record.guid);
			},
		},
	];

	return (
		<div className="flex w-full flex-col gap-2">
			<h1 className="text-xl">Students</h1>
			<div className="flex items-center gap-2">
				<AutoComplete
					options={users?.users.map((user) => ({
						value: user.name,
						label: user.name,
					}))}
					onSearch={handleSearch}
					onSelect={handleSearch}
					placeholder="Search for a student by their name or GUID"
					className="w-full"
				/>
				<Button type="default" icon={<Filter size={16} />} className="w-fit">
					Filter
				</Button>
			</div>
			<Table
				size="small"
				dataSource={users?.users}
				pagination={{
					total: users?.total,
					pageSize: 10,
					current: page,
					onChange(page, pageSize) {
						setPage(page);
					},
				}}
				columns={columns}
				//loading={!users || isLoading}
			/>
		</div>
	);
}
