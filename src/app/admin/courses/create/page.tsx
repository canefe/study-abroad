"use client";
import { useCourses } from "@/hooks/useCourses";
import { api } from "@/trpc/react";
import { Button, Form, Input, Select } from "antd";

export default function CreateCoursePage() {
	const { addCourseWithYear, deleteCourse } = useCourses();

	const [universities] = api.universities.getList.useSuspenseQuery();

	const onAddCourse = async (
		name: string,
		abroadUniversityId: number,
		link: string,
	) => {
		//add course
		if (!name) {
			return Promise.reject("Course name is required");
		}
		if (!universities?.find((uni) => uni.id === abroadUniversityId)) {
			return Promise.reject("University not found");
		}
		await addCourseWithYear(name, abroadUniversityId, "SECOND_YEAR", link);
	};

	const onFinish = (values: any) => {
		onAddCourse(values.name, values.university, values.link);
	};

	return (
		<div>
			<h1>Create Course</h1>

			<Form layout="vertical" onFinish={onFinish}>
				<Form.Item label="Course Name" name="name">
					<Input />
				</Form.Item>
				<Form.Item label="Course Link" name="link">
					<Input />
				</Form.Item>
				<Form.Item label="Year" name="year">
					<Select></Select>
				</Form.Item>
				<Form.Item label="University" name="university">
					<Select
						showSearch
						filterOption={(input, option) =>
							String(option?.label ?? "")
								.toLowerCase()
								.includes(input.toLowerCase())
						}
						options={universities?.map((uni) => ({
							label: uni.name,
							value: uni.id,
						}))}
					></Select>
				</Form.Item>
				<Form.Item>
					<Button type="primary" htmlType="submit">
						Create Course
					</Button>
				</Form.Item>
			</Form>
		</div>
	);
}
