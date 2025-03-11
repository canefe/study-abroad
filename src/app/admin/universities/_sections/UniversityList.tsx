"use client";
import { AutoComplete, Button, Table } from "antd";
import { api } from "@/trpc/react";
import { Filter, Pen, Trash } from "lucide-react";

export default function StudentList() {
	const [universities] = api.universities.getList.useSuspenseQuery();

	const columns = [
		{
			title: "#",
			dataIndex: "id",
			key: "id",
			render: (id: string) => <span className="text-gray-500">{id}</span>,
		},
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Location",
			dataIndex: "location",
			key: "location",
		},
		{
			title: "Action",
			key: "action",
			render: (record: any) => {
				return (
					<div className="flex items-center gap-1">
						<button onClick={() => {}} className="text-blue-500">
							<Pen size={16} />
						</button>
						<button onClick={() => {}} className="text-red-500">
							<Trash size={16} />
						</button>
					</div>
				);
			},
		},
	];

	return (
		<div className="flex w-full flex-col gap-2">
			<h1 className="text-xl">Universities</h1>
			<div className="flex items-center gap-2">
				<AutoComplete
					placeholder="Search for an university"
					options={universities?.map((university) => ({
						value: university.name,
						label: university.name,
					}))}
					className="w-full"
				/>
				<Button type="default" icon={<Filter size={16} />} className="w-fit">
					Filter
				</Button>
			</div>
			<Table
				size="small"
				dataSource={universities}
				columns={columns}
				loading={!universities}
			/>
		</div>
	);
}
