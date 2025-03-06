"use client";
import { useCourses } from "@/hooks/useCourses";
import { yearToString } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Course, Year } from "@prisma/client";
import { Button, Form, Input, Modal, Select } from "antd";
import { useEffect } from "react";

export default function EditCourseModal({
	open,
	setOpen,
	course,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	course: Course | undefined;
}) {
	const { editCourse } = useCourses();

	const [universities] = api.universities.getList.useSuspenseQuery();

	const [form] = Form.useForm();
	useEffect(() => {
		if (course) {
			form.setFieldsValue({
				name: course.name,
				year: course.year,
				link: course.link,
				university: course.universityId,
			});
		} else {
			form.resetFields(); // Clear fields when no course is selected
		}
	}, [course, form]);
	// change years, university, name, link
	const onFinish = (values: any) => {
		editCourse(
			course!.id,
			values.name,
			values.year,
			values.university,
			values.link,
		);
		setOpen(false);
	};

	// turn Year enum into an array of strings
	const Years = Object.values(Year).filter((year) => typeof year === "string");

	// re render on course change
	if (course) {
		return (
			<Modal
				open={open}
				title="Edit Course"
				onCancel={() => setOpen(false)}
				footer={null}
			>
				<Form form={form} layout="vertical" onFinish={onFinish}>
					<div className="flex gap-2">
						<Form.Item label="Course Name" name="name" className="w-full">
							<Input defaultValue={course?.name} />
						</Form.Item>
						<Form.Item label="Year" name="year" className="w-full">
							<Select
								mode="multiple"
								defaultValue={course?.year}
								options={Years.map((year) => ({
									label: yearToString(year),
									value: year,
								}))}
							></Select>
						</Form.Item>
					</div>
					<Form.Item label="Course Link" name="link">
						<Input defaultValue={course?.link as string} />
					</Form.Item>

					<Form.Item label="University" name="university">
						<Select
							showSearch
							defaultValue={course?.universityId}
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
							Update Course
						</Button>
					</Form.Item>
				</Form>
			</Modal>
		);
	}
}
