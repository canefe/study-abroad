"use client";
import { Table, AutoComplete } from "antd";
import { api } from "@/trpc/react";
import { FC, Suspense } from "react";
import { z } from "zod";
const StatusEnum = z.enum(["ALL", "SUBMITTED", "DRAFT", "REVISE", "APPROVED"]);
type ApplicationTableProps = {
	search: string;
	handleSearch: (value: string) => void;
	page: number;
	selected: z.infer<typeof StatusEnum>;
	columns: any;
	setPage: (page: number) => void;
};

const ApplicationTable: FC<ApplicationTableProps> = ({
	search,
	handleSearch,
	page,
	selected,
	columns,
	setPage,
}) => {
	// Use suspense query inside the table component.
	const [applications] = api.applications.getAll.useSuspenseQuery(
		{
			q: search,
			page: page,
			pageSize: 10,
			filter: selected,
		},
		{
			refetchOnMount: true,
			refetchOnWindowFocus: true,
		},
	);

	return (
		<>
			<AutoComplete
				options={applications?.applications.map((application) => ({
					value: application.user?.name,
					label: application.user?.name,
				}))}
				value={search}
				onSearch={handleSearch}
				onSelect={handleSearch}
				placeholder="Search for a student by their name or GUID"
				className="w-full"
			/>
			<Table
				size="middle"
				dataSource={applications.applications}
				columns={columns}
				pagination={{
					current: page,
					onChange: setPage,
					total: applications.total,
				}}
			/>
		</>
	);
};

export default ApplicationTable;
