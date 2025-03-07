"use client";
import { useApplication } from "@/hooks/useApplication";
import { useSettings } from "@/hooks/useSettings";
import { yearToString } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Year } from "@prisma/client";
import { Button, Checkbox, Form, Modal, Popconfirm, Select } from "antd";
import { useState } from "react";

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

	const { createApplicationAdmin } = useApplication({});
	const { getSetting } = useSettings();

	const homeUniversitySetting = getSetting("home_university");

	const [universities] = api.universities.getList.useSuspenseQuery();
	const { data: users, isLoading } = api.students.getList.useQuery({
		q: search,
		page: page,
		pageSize: 10,
	});

	const onCreateApplication = async (
		user: string,
		abroadUniversityId: number,
		year: Year,
		alternateRoute?: boolean,
		additionalCourse?: string,
	) => {
		//add course
		if (!user) {
			return Promise.reject("User is required");
		}
		if (!universities?.find((uni) => uni.id === abroadUniversityId)) {
			return Promise.reject("University not found");
		}
		const application = await createApplicationAdmin(
			user,
			abroadUniversityId,
			year,
			alternateRoute,
			additionalCourse,
		);
		console.log(application);
	};

	const onFinish = (values: any) => {
		onCreateApplication(
			values.user,
			values.university,
			values.year,
			values.alternateRoute,
			values.additionalCourse,
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
						setSelectedYear(changedValues.year);
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
				{selectedYear === "SECOND_YEAR_JOINT_FULL_YEAR" ||
				selectedYear === "SECOND_YEAR_JOINT_FIRST_SEMESTER" ? (
					<Form.Item label="Additional Course" name="additionalCourse">
						<Select
							defaultValue="Select an additional course"
							className="w-full"
						>
							<Select.Option value="AF2">AF2</Select.Option>
							{/* semester 1 doesnt have WAD2 */}
							{selectedYear !== "SECOND_YEAR_JOINT_FIRST_SEMESTER" ? (
								<Select.Option value="WAD2">WAD2</Select.Option>
							) : null}
							<Select.Option value="CS1F">
								CS1F (if not already taken)
							</Select.Option>
						</Select>
					</Form.Item>
				) : null}
				{/* If the year is YEAR 2 FULL YEAR OR YEAR 2 SEMESTER 1 SHOW ALTERNATE ROUTE */}
				{selectedYear === "SECOND_YEAR_SINGLE_FULL_YEAR" ||
				selectedYear === "SECOND_YEAR_SINGLE_FIRST_SEMESTER" ? (
					<Form.Item
						label="Alternate Route"
						name="alternateRoute"
						valuePropName="checked"
					>
						<Checkbox>Alternate Route</Checkbox>
					</Form.Item>
				) : null}
				<Form.Item className="flex justify-end">
					<Button size={"large"} type="primary" htmlType="submit">
						Create Application
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	);
}
