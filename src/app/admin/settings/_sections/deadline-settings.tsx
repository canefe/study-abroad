"use client";

import { useSettings } from "@/hooks/useSettings";
import { Year } from "@prisma/client";
import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

export default function DeadlineSettings() {
	const [selectedYear, setSelectedYear] = useState<Year>();

	const selectRef = useRef<typeof Select>(null);

	const { getSetting, setSetting, setSettingMutation } = useSettings();

	const setting = getSetting("deadline_date", null);

	const changeDeadline = async (date: string) => {
		toast.promise(setSetting("deadline_date", date), {
			loading: "Setting deadline...",
			success: "Deadline set successfully",
			error: "Failed to set deadline",
		});
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-col items-start gap-2">
				<div className="">
					<p className="mt-4 w-full text-xl font-medium">Deadline</p>
					<p className="text-sm text-gray-500">
						Here you can set the deadline for the application process.
					</p>
					<DatePicker
						showTime
						// limit the date to be in the future
						//disabledDate={(current) =>
						//	current && current < dayjs().endOf("day")
						//}
						// set the date to the current value
						value={dayjs(setting?.value)}
						className="mt-2"
						onChange={(date) => {
							if (date) {
								changeDeadline(date.toISOString());
							}
						}}
					/>
				</div>
			</div>
		</div>
	);
}
