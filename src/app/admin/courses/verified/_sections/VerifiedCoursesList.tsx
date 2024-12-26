"use client";
import {
	useDeleteCourse,
	useUnflagCourse,
	useUnverifyCourse,
	useVerifyCourse,
} from "@/hooks/useCourses";
import { api } from "@/trpc/react";
import { Button, Table } from "antd";

export default function VerifiedCoursesList() {
	const getCoursesApi = api.courses.getVerifiedList;
	const { data, error } = getCoursesApi.useQuery();

	const { unverifyCourse } = useUnverifyCourse();
	const { deleteCourse } = useDeleteCourse();

	const handleUnverify = async (courseId: number) => {
		await unverifyCourse(courseId);
	};

	const handleDelete = async (courseId: number) => {
		await deleteCourse(courseId);
	};

	const columns = [
		{
			title: "Course Name",
			dataIndex: "name",
			key: "name",
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
					>
						Delete Course
					</Button>
					<Button
						className="text-yellow-500"
						onClick={() => handleUnverify(record.id)}
					>
						Unverify Course
					</Button>
				</div>
			),
		},
	];
	return (
		<div className="container">
			<p className="text-gray-500">
				Verified courses are courses that have been verified by coordinators.
				You can unverify a course if it is not up to date or accurate.
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
