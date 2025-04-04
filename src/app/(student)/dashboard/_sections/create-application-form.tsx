import { DynamicYearRequirements } from "@/app/_components/dynamic-year-requirements";
import { yearToString } from "@/lib/utils";
import { Year } from "@prisma/client";
import { Button, Checkbox, Form, Input, Select } from "antd";
import toast from "react-hot-toast";
import { z } from "zod";
import { useWatch } from "antd/es/form/Form";

const createApplicationSchema = z.object({
	university: z.number({ invalid_type_error: "University is required" }),
	year: z.string().min(1, "Year is required"),
	alternateRoute: z.boolean().optional(),
	additionalCourse: z.string().nullable(),
});

type CreateApplicationFormProps = {
	filteredUniversities: { id: number; name: string }[]; // Adjust type as needed.
	createApplication: any;
	isPending: boolean;
};

export default function CreateApplicationForm({
	filteredUniversities,
	createApplication,
	isPending,
}: CreateApplicationFormProps) {
	const [form] = Form.useForm();

	// useWatch will re-render when the 'year' value changes.
	const selectedYear = useWatch("year", form);

	const onFinish = async (values: z.infer<typeof createApplicationSchema>) => {
		// if additionalCourse does not exist, set it to null
		if (!values.additionalCourse) {
			values.additionalCourse = null;
		}
		// Validate form values with Zod.
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
			toast.error("Please fill in all required fields correctly.");
			return;
		}
		// Call the create application function with form values.
		createApplication(
			result.data.university,
			result.data.year as Year,
			result.data.alternateRoute || false,
			result.data.additionalCourse ?? undefined,
		);
	};

	return (
		<Form
			form={form}
			onFinish={onFinish}
			layout="vertical"
			initialValues={{
				alternateRoute: false,
				additionalCourse: null,
			}}
			className="w-full"
		>
			<div className="flex w-full items-center gap-2">
				<Form.Item
					label="University"
					name="university"
					className="w-full"
					rules={[{ required: true, message: "University is required" }]}
				>
					<Select
						showSearch
						placeholder="Select a university"
						filterOption={(input, option) =>
							String(option?.value ?? "")
								.toLowerCase()
								.includes(input.toLowerCase())
						}
					>
						{filteredUniversities?.map((university) => (
							<Select.Option key={university.id} value={university.id}>
								{university.name}
							</Select.Option>
						))}
					</Select>
				</Form.Item>
				<Form.Item
					label="Year"
					name="year"
					className="w-full"
					rules={[{ required: true, message: "Year is required" }]}
				>
					<Select
						placeholder="Select a year"
						options={Object.values(Year).map((year) => ({
							label: yearToString(year),
							value: year,
						}))}
					/>
				</Form.Item>
			</div>
			{/* Pass in the currently selected year from Form values */}
			{selectedYear && <DynamicYearRequirements selectedYear={selectedYear} />}
			<Form.Item>
				<Button type="primary" htmlType="submit" loading={isPending}>
					Create Application
				</Button>
			</Form.Item>
		</Form>
	);
}
