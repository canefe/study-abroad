"use client";
import { Form, Select, Checkbox } from "antd";
import { useSettings } from "@/hooks/useSettings";
import { Year } from "@prisma/client";
import { useCourses } from "@/hooks/useCourses";

type DynamicYearRequirementsProps = {
	selectedYear: Year | string;
};

export function DynamicYearRequirements({
	selectedYear,
}: DynamicYearRequirementsProps) {
	const { getSetting } = useSettings();
	const yearReqSetting = getSetting("year_requirements");
	const config = yearReqSetting ? JSON.parse(yearReqSetting.value) : {};
	const currentReq = config[selectedYear] || {
		alternateCourses: [],
		additionalCourses: [],
		optionalCourses: false,
	};

	return (
		<div className="flex gap-2">
			{currentReq.alternateCourses.length > 0 && (
				<Form.Item
					label="Alternate Route"
					name="alternateRoute"
					valuePropName="checked"
					className="w-full"
				>
					<Checkbox>Alternate Route</Checkbox>
				</Form.Item>
			)}
			{currentReq.additionalCourses.length > 0 && (
				<Form.Item
					label="Additional Course"
					name="additionalCourse"
					required
					className="w-full"
				>
					<Select defaultValue="Select an additional course" className="w-full">
						{currentReq.additionalCourses.map((course: string) => (
							<Select.Option key={course} value={course}>
								{course}
							</Select.Option>
						))}
					</Select>
				</Form.Item>
			)}
		</div>
	);
}
