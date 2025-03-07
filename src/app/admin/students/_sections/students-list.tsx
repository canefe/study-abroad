"use client";
import { AutoComplete, Button, Table } from "antd";
import { api } from "@/trpc/react";
import Link from "next/link";
import { useState } from "react";
import { debounce } from "lodash";
import { Filter } from "lucide-react";

export default function StudentList() {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const { data: users, isLoading } = api.students.getList.useQuery({
		q: search,
		page: page,
		pageSize: 10,
	});

	const handleSearch = debounce((value: string) => {
		setSearch(value);
		setPage(1);
	}, 500);

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
			dataIndex: "applications",
			key: "applications",
			render: (applications: any, record: any) => {
				return (
					<Link
						href={"/admin/applications?status=all&q=" + record.guid}
						className="flex cursor-pointer items-center text-blue-500"
					>
						{applications.length}
					</Link>
				);
			},
		},
	];

	return (
		<div className="flex w-full flex-col gap-2">
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
				loading={!users || isLoading}
			/>
		</div>
	);
}
