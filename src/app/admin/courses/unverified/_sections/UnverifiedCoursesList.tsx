"use client";
import { useDeleteCourse } from "@/hooks/useCourses";
import { useVerifyCourse } from "@/hooks/useCourses";
import { api } from "@/trpc/react";
import { Button, Table } from "antd";

export default function UnverifiedCoursesList() {
	const getCoursesApi = api.courses.getUnverifiedList;
	const { data, error } = getCoursesApi.useQuery();
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
				<div className="grid grid-cols-2 gap-2">
					<Button
						className="text-red-500"
						onClick={() => handleDelete(record.id)}
					>
						Delete
					</Button>
					<Button
						className="text-green-500"
						onClick={() => {
							handleVerify(record.id);
						}}
					>
						Verify Course
					</Button>
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
