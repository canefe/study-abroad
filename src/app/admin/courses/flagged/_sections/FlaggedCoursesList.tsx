"use client";
import VerifiedBadge from "@/app/_components/choices-table/verified-badge";
import {
	useDeleteCourse,
	useUnflagCourse,
	useUnverifyCourse,
	useVerifyCourse,
} from "@/hooks/useCourses";
import { api } from "@/trpc/react";
import { Button, Table } from "antd";
import { FlagOffIcon, Trash } from "lucide-react";

export default function FlaggedCoursesList() {
	const getCoursesApi = api.courses.getFlaggedList;
	const { data, error } = getCoursesApi.useQuery();

	const { verifyCourse } = useVerifyCourse();
	const { unverifyCourse } = useUnverifyCourse();
	const { unflagCourse } = useUnflagCourse();
	const { deleteCourse } = useDeleteCourse();

	const handleVerify = async (courseId: number) => {
		await verifyCourse(courseId);
	};

	const handleUnverify = async (courseId: number) => {
		await unverifyCourse(courseId);
	};

	const handleUnflag = async (courseId: number) => {
		await unflagCourse(courseId);
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
			title: "Created by",
			dataIndex: ["createdBy"],
			key: "createdBy",
		},
		{
			title: "Action",
			dataIndex: "",
			key: "",
			render: (_, record) => (
				<div className="grid grid-cols-3 gap-2">
					<Button
						className="text-red-500"
						onClick={() => handleDelete(record.id)}
						icon={
							<Trash
								size={16}
								fill="#ef4444"
								className="w-fit cursor-pointer text-red-500 hover:text-red-700"
							/>
						}
					>
						Delete
					</Button>
					<Button
						className="text-blue-500"
						onClick={() => handleUnflag(record.id)}
						icon={
							<FlagOffIcon
								size={16}
								fill="#ef4444"
								className="w-fit cursor-pointer text-red-500 hover:text-red-700"
							/>
						}
					>
						Unflag
					</Button>
					<Button
						className="text-green-500"
						onClick={() => handleVerify(record.id)}
						icon={<VerifiedBadge />}
					>
						Verify
					</Button>
				</div>
			),
		},
	];
	return (
		<div className="container">
			<p className="text-gray-500">
				Flagged courses are courses that have been reported by users.
				Coordinators should review these courses and determine whether they
				should be deleted or unflagged.
			</p>
			<Table
				size={"small"}
				dataSource={data}
				columns={columns}
				rowKey="id"
				pagination={{
					hideOnSinglePage: true,
				}}
			/>
		</div>
	);
}
