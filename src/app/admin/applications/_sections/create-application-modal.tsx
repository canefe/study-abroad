"use client";
import { DynamicYearRequirements } from "@/app/_components/dynamic-year-requirements";
import { useApplication } from "@/hooks/useApplication";
import { useSettings } from "@/hooks/useSettings";
import { yearToString } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Year } from "@prisma/client";
import { Button, Checkbox, Form, Modal, Popconfirm, Select } from "antd";
import { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

export default function CreateApplicationModal({
	open,
	setOpen,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
}) {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [selectedYear, setSelectedYear] = useState<string | undefined>(
		undefined,
	);

	// form
	const [form] = Form.useForm();

	const { createApplicationAdmin, isPendingCreateAdmin } = useApplication({});
	const { getSetting } = useSettings();

	const homeUniversitySetting = getSetting("home_university");

	const [universities] = api.universities.getList.useSuspenseQuery();
	const { data: users, isLoading } = api.students.getList.useQuery({
		q: search,
		page: page,
		pageSize: 10,
	});

	const createApplicationSchema = z.object({
		user: z.string().min(1, "Student is required"),
		university: z.number({ invalid_type_error: "University is required" }),
		year: z.string().min(1, "Year is required"),
		alternateRoute: z.boolean().optional(),
		additionalCourse: z.string().nullable(),
	});

	const onFinish = async (values: z.infer<typeof createApplicationSchema>) => {
		// reset form errors
		const fieldsError = form.getFieldsError();
		form.setFields(fieldsError.map(({ name }) => ({ name, errors: [] })));
		// If there is no additional course, set it to null
		if (!values.additionalCourse) {
			values.additionalCourse = null;
		}
		// Parse and validate values with Zod.
		const result = createApplicationSchema.safeParse(values);
		if (!result.success) {
			console.error(result.error.flatten());

			form.setFields(
				Object.entries(result.error.formErrors.fieldErrors).map(
					([name, errors]) => ({
						name,
						errors: errors as string[],
					}),
				),
			);
			toast.error("Please fill all required fields");
			return;
		}
		// If valid, call your create/submit function.
		createApplicationAdmin(
			result.data.user,
			result.data.university,
			result.data.year as Year,
			result.data.alternateRoute,
			result.data.additionalCourse ?? undefined,
		);
	};

	// turn Year enum into an array of strings
	const Years = Object.values(Year).filter((year) => typeof year === "string");

	return (
		<Modal
			open={open}
			title="Create Application"
			onCancel={() => setOpen(false)}
			footer={null}
		>
			<Form
				form={form}
				layout="vertical"
				onFinish={onFinish}
				onValuesChange={(changedValues) => {
					if (changedValues.year) {
						// clear additional course and alternate route if year changes
						setSelectedYear(changedValues.year);
						form.setFieldsValue({
							alternateRoute: false,
							additionalCourse: undefined,
						});
					}
				}}
			>
				<div className="flex flex-col">
					<Form.Item label="Student" name="user" className="w-full">
						<Select
							showSearch
							//filterOptino setSearch
							filterOption={(input, option) =>
								String(option?.label ?? "")
									.toLowerCase()
									.includes(input.toLowerCase())
							}
							onSearch={setSearch}
							loading={isLoading}
							notFoundContent={isLoading ? "Loading..." : "No students found"}
							options={users?.users.map((user) => ({
								label: user.name,
								value: user.id,
							}))}
						></Select>
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
				<Form.Item label="University" name="university">
					<Select
						showSearch
						filterOption={(input, option) =>
							String(option?.label ?? "")
								.toLowerCase()
								.includes(input.toLowerCase())
						}
						//exclude home university
						options={universities
							?.filter(
								(uni) =>
									uni.id.toString() !==
									homeUniversitySetting?.value?.toString(),
							)
							.map((uni) => ({
								label: uni.name,
								value: uni.id,
							}))}
					></Select>
				</Form.Item>
				{selectedYear && (
					<DynamicYearRequirements selectedYear={selectedYear} />
				)}
				<Form.Item className="flex justify-end">
					<Button
						size={"large"}
						type="primary"
						htmlType="submit"
						loading={isPendingCreateAdmin}
					>
						Create Application
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	);
}
