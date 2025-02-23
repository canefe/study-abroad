"use client";
import { Button, Segmented } from "antd";
import { useState } from "react";
import { Plus } from "lucide-react";
import CreateCourseModal from "./_sections/create-course-modal";
import CoursesList from "./unverified/_sections/UnverifiedCoursesList";

export default function Courses() {
	const [selected, setSelected] = useState("all");
	const [createCourseModalVisible, setCreateCourseModalVisible] =
		useState(false);

	const options = [
		{
			label: "All",
			value: "all",
		},
		{
			label: "Flagged",
			value: "flagged",
		},
		{
			label: "Verified",
			value: "verified",
		},
		{
			label: "Unverified",
			value: "unverified",
		},
	];

	return (
		<div className="container flex flex-col gap-2">
			<h1 className="text-xl">Courses</h1>
			<div className="flex items-center justify-between gap-1">
				<Segmented
					size={"large"}
					options={options}
					onChange={(value) => setSelected(value)}
					value={selected}
					className="flex-1"
				/>

				<Button
					size={"large"}
					icon={<Plus />}
					type="primary"
					onClick={() => setCreateCourseModalVisible(true)}
				>
					Create Course
				</Button>
			</div>
			<CoursesList
				filter={
					selected === "all"
						? undefined
						: selected === "flagged"
							? ["flagged", "true"]
							: selected === "verified"
								? ["verified", "true"]
								: selected === "unverified"
									? ["verified", "false"]
									: undefined
				}
			/>
			<CreateCourseModal
				open={createCourseModalVisible}
				setOpen={setCreateCourseModalVisible}
			/>
		</div>
	);
}
