"use client";
import { AutoComplete, Button, Table } from "antd";
import { api } from "@/trpc/react";
import Link from "next/link";
import ShortId from "@/app/_components/short-id";
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
				return (
					<div className="flex cursor-pointer items-center text-blue-500">
						{applications.length}
					</div>
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
					placeholder="Search for a student"
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
