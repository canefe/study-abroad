"use client";
import { useCourses } from "@/hooks/useCourses";
import { yearToString } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Year } from "@prisma/client";
import { Button, Form, Input, Modal, Select } from "antd";

export default function CreateCourseModal({
	open,
	setOpen,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
}) {
	const { addCourseWithYear, deleteCourse } = useCourses();

	const [universities] = api.universities.getList.useSuspenseQuery();

	const onAddCourse = async (
		name: string,
		abroadUniversityId: number,
		year: Year,
		link: string,
	) => {
		//add course
		if (!name) {
			return Promise.reject("Course name is required");
		}
		if (!universities?.find((uni) => uni.id === abroadUniversityId)) {
			return Promise.reject("University not found");
		}
		await addCourseWithYear(name, abroadUniversityId, year, link);
		setOpen(false);
	};

	const onFinish = (values: any) => {
		onAddCourse(values.name, values.university, values.year, values.link);
	};

	// turn Year enum into an array of strings
	const Years = Object.values(Year).filter((year) => typeof year === "string");

	return (
		<Modal
			open={open}
			title="Create Course"
			onCancel={() => setOpen(false)}
			footer={null}
		>
			<Form layout="vertical" onFinish={onFinish}>
				<div className="flex gap-2">
					<Form.Item label="Course Name" name="name" className="w-full">
						<Input />
					</Form.Item>
					<Form.Item label="Year" name="year" className="w-full">
						<Select
							options={Years.map((year) => ({
								label: yearToString(year),
								value: year,
							}))}
						></Select>
					</Form.Item>
				</div>
				<Form.Item label="Course Link" name="link">
					<Input />
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
				<Form.Item className="flex justify-end">
					<Button size={"large"} type="primary" htmlType="submit">
						Create Course
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	);
}
