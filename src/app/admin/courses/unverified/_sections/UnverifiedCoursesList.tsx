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
import { useState } from "react";
import EditCourseModal from "../../_sections/edit-course-modal";

type ListProps = {
	filter?: [key: string, value: string];
};
export default function CoursesList({ filter }: ListProps) {
	const [editCourse, setEditCourse] = useState(false);
	const [course, setCourse] = useState<any>();
	const getCoursesApi = api.courses.getCourses;
	const { data, error } = getCoursesApi.useQuery({
		flagged: filter?.[0] === "flagged" ? filter[1] === "true" : undefined,
		verified: filter?.[0] === "verified" ? filter[1] === "true" : undefined,
	});
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
					{record?.link ? (
						<a
							href={record.link}
							target="_blank"
							rel="noreferrer"
							className="text-blue-500"
						>
							{name}
						</a>
					) : (
						<span>{name}</span>
					)}
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
					{record.flagged && (
						<li className="whitespace-nowrap">
							<div className='relative inline-block w-[100px] pr-5 after:absolute after:right-5 after:content-[""]'>
								{" "}
								<span className="font-semibold">Flagged:</span>{" "}
							</div>
							<div
								className="inline-block"
								style={{
									color: record.flagged ? "red" : "green",
								}}
							>
								{record.flagged ? "Yes" : "No"}
							</div>
						</li>
					)}
					<li className="whitespace-nowrap">
						<div className='relative inline-block w-[100px] pr-5 after:absolute after:right-5 after:content-[""]'>
							{" "}
							<span className="font-semibold">Verified:</span>{" "}
						</div>
						<div
							className="inline-block"
							style={{
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
							<div className="inline-block">{record.createdBy}</div>
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
						<Button
							className="text-orange-500"
							onClick={() => {
								setEditCourse(true);
								setCourse(record);
							}}
						>
							<Pen size={16} />
						</Button>
					</Tooltip>
				</div>
			),
		},
	];
	return (
		<div className="container">
			<Table
				dataSource={data}
				columns={columns}
				size="small"
				rowKey="id"
				pagination={{
					hideOnSinglePage: true,
				}}
			/>
			<EditCourseModal
				open={editCourse}
				setOpen={setEditCourse}
				course={course}
			/>
		</div>
	);
}
