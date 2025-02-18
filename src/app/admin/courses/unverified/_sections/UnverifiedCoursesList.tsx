"use client";
import VerifiedBadge from "@/app/_components/choices-table/verified-badge";
import { useDeleteCourse } from "@/hooks/useCourses";
import { useVerifyCourse } from "@/hooks/useCourses";
import { yearToString } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Year } from "@prisma/client";
import { Button, Table, Tag, Tooltip } from "antd";
import { Pen, Trash } from "lucide-react";
import { title } from "process";

type ListProps = {
	filter?: [key: string, value: string];
};
export default function CoursesList({ filter }: ListProps) {
	const getCoursesApi = api.courses.getCourses;
	const { data, error } = getCoursesApi.useQuery({});
	const { verifyCourse, isLoading } = useVerifyCourse();
	const { deleteCourse } = useDeleteCourse();

	const handleVerify = async (courseId: number) => {
		await verifyCourse(courseId);
	};

	const handleDelete = async (courseId: number) => {
		await deleteCourse(courseId);
	};

	const columns = [
		{
			title: "Course Name",
			dataIndex: "name",
			key: "name",
			render: (name: string, record: any) => (
				<div className="flex flex-col gap-1">
					<span>{name}</span>
					<a
						href={record.link}
						target="_blank"
						rel="noreferrer"
						className="text-blue-500"
					>
						{record.link}
					</a>
				</div>
			),
		},
		{
			title: "University",
			dataIndex: ["university", "name"],
			key: "university",
		},
		{
			title: "Details",
			dataIndex: "year",
			key: "year",
			width: 500,
			render: (_, record) => (
				<>
					<li className="whitespace-nowrap">
						<div className='relative inline-block w-[100px] pr-5 after:absolute after:right-5 after:content-[""]'>
							{" "}
							<span className="font-semibold">Flagged:</span>{" "}
						</div>
						<div
							className="inline-block"
							style={{
								marginBottom: "1rem",
								color: record.flagged ? "red" : "green",
							}}
						>
							{record.flagged ? "Yes" : "No"}
						</div>
					</li>
					<li className="whitespace-nowrap">
						<div className='relative inline-block w-[100px] pr-5 after:absolute after:right-5 after:content-[""]'>
							{" "}
							<span className="font-semibold">Verified:</span>{" "}
						</div>
						<div
							className="inline-block"
							style={{
								marginBottom: "1rem",
								color: record.verified ? "green" : "orange",
							}}
						>
							{record.verified ? "Yes" : "No"}
						</div>
					</li>

					{record?.createdBy && (
						<li className="whitespace-nowrap">
							<div className='relative inline-block w-[100px] pr-5 after:absolute after:right-5 after:content-[""]'>
								{" "}
								<span className="font-semibold">Created By:</span>{" "}
							</div>
							<div className="inline-block" style={{ marginBottom: "1rem" }}>
								{record.createdBy}
							</div>
						</li>
					)}
					<li className="whitespace-nowrap">
						<div className='relative inline-block w-[100px] pr-5 after:absolute after:right-5 after:content-[""]'>
							{" "}
							<span className="font-semibold">Years:</span>{" "}
						</div>
						<div className="inline-block" style={{ marginBottom: "1rem" }}>
							<div className="grid w-fit grid-cols-1 gap-1">
								{record?.year.map((year, index) => (
									<Tag key={index}>{yearToString(year as Year)}</Tag>
								))}
							</div>
						</div>
					</li>
				</>
			),
		},
		{
			title: "Action",
			dataIndex: "",
			key: "",
			render: (_, record) => (
				<div className="flex gap-2">
					<Tooltip title="Delete">
						<Button
							className="text-red-500"
							onClick={() => handleDelete(record.id)}
						>
							<Trash size={16} />
						</Button>
					</Tooltip>
					<Tooltip title="Verify">
						<Button
							className="text-green-500"
							onClick={() => {
								handleVerify(record.id);
							}}
						>
							<VerifiedBadge hideTooltip />
						</Button>
					</Tooltip>
					<Tooltip title="Edit">
						<Button className="text-orange-500">
							<Pen size={16} />
						</Button>
					</Tooltip>
				</div>
			),
		},
	];
	return (
		<div className="container">
			<p className="text-gray-500">
				Unverified courses are courses that have been created by students but
				have not been verified by coordinators. Coordinators can review these
				courses if it is up to date and accurate.
			</p>
			<Table
				dataSource={data}
				columns={columns}
				size="small"
				rowKey="id"
				pagination={{
					hideOnSinglePage: true,
				}}
			/>
		</div>
	);
}
