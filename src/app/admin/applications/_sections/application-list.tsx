"use client";
import {
	AutoComplete,
	Button,
	Popconfirm,
	Segmented,
	Table,
	Tooltip,
} from "antd";
import { api } from "@/trpc/react";
import Link from "next/link";
import { Download, Eye, Link2, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { debounce } from "lodash";
import { z } from "zod";
import CreateApplicationModal from "./create-application-modal";
import { useExportApplications } from "@/hooks/useExportApplications";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StatusEnum = z.enum(["ALL", "SUBMITTED", "DRAFT", "REVISE", "APPROVED"]);
type Status = z.infer<typeof StatusEnum>;
type SearchParams = {
	q: string;
	status: Status | "";
};

export default function ApplicationList({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	const [search, setSearch] = useState(searchParams.q);
	const [page, setPage] = useState(1);
	const utils = api.useUtils();
	const [selected, setSelected] = useState<Status>(
		searchParams.status !== ""
			? (searchParams.status.toUpperCase() as Status)
			: "SUBMITTED",
	);
	const [newApplicationModalVisible, setNewApplicationModalVisible] =
		useState(false);
	const { data: applications, isLoading } = api.applications.getAll.useQuery({
		q: search,
		page: page,
		pageSize: 10,
		filter: selected,
	});

	const deleteApplication = api.applications.adminDelete.useMutation();
	const handleDelete = async (id: number) => {
		await deleteApplication.mutate(
			{
				applicationId: id,
			},
			{
				onSuccess: () => {
					utils.applications.invalidate();
				},
			},
		);
	};

	const { exportApplications } = useExportApplications();

	const handleSearch = debounce((value: string) => {
		setSearch(value);
		setPage(1);
	}, 500);

	const statusColor = (status: string) => {
		switch (status) {
			case "SUBMITTED":
				return "orange";
			case "DRAFT":
				return "blue";
			case "REVISE":
				return "red";
			case "APPROVED":
				return "green";
			default:
				return "red";
		}
	};

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
				return <span style={{ color: statusColor(status) }}>{status}</span>;
			},
		},
		{
			title: "Actions",
			key: "actions",
			render: (record: any) => {
				return (
					<div className="flex items-center gap-1">
						<Tooltip title="View">
							<Button className="text-blue-500">
								<Link
									href={`/admin/applications/${record.id}`}
									className="text-blue-500"
								>
									<Eye size={16} />
								</Link>
							</Button>
						</Tooltip>

						<Tooltip title="Delete">
							<Popconfirm
								title="Are you sure you want to delete this application?"
								onConfirm={() => handleDelete(record.id)}
							>
								<Button className="text-red-500">
									<Trash size={16} />
								</Button>
							</Popconfirm>
						</Tooltip>
					</div>
				);
			},
		},
	];

	const options = [
		{
			label: "All",
			value: "ALL",
		},
		{
			label: "Submitted",
			value: "SUBMITTED",
		},
		{
			label: "Revise",
			value: "REVISE",
		},
		{
			label: "Draft",
			value: "DRAFT",
		},
		{
			label: "Approved",
			value: "APPROVED",
		},
	];
	return (
		<div className="container flex flex-col gap-2">
			<h1 className="text-xl">Applications</h1>
			<div className="flex items-center justify-between gap-1">
				<Segmented
					size={"large"}
					options={options}
					onChange={(value) => setSelected(value as Status)}
					value={selected}
					className="flex-1"
				/>

				<Button
					size={"large"}
					icon={<Plus />}
					type="primary"
					onClick={() => setNewApplicationModalVisible(true)}
				>
					New Application
				</Button>
				<Button
					size={"large"}
					icon={<Download />}
					type="default"
					onClick={() => exportApplications(selected, search)}
				>
					Export
				</Button>
			</div>
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
				size={"middle"}
				dataSource={applications?.applications}
				columns={columns}
				loading={!applications}
				pagination={{
					current: page,
					onChange: (page) => setPage(page),
					total: applications?.total,
				}}
			/>
			<CreateApplicationModal
				open={newApplicationModalVisible}
				setOpen={setNewApplicationModalVisible}
			/>
		</div>
	);
}
