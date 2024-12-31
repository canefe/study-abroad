"use client";

import { useGetAbroadCoursesQuery } from "@/app/api/queries/application";
import { useCourses } from "@/hooks/useCourses";
import { useSettings } from "@/hooks/useSettings";
import { api } from "@/trpc/react";
import { Year } from "@prisma/client";
import { Button, List, Select } from "antd";
import { X } from "lucide-react";

export default function HomeUniversitySettings() {
	const { getSetting, setSetting, setSettingMutation } = useSettings();

	const [universities] = api.universities.getList.useSuspenseQuery();

	const setting = getSetting("home_university");

	const selectedUni = universities?.find(
		(uni) => uni.id.toString() === setting?.value,
	);

	const { addCourseWithYear, deleteCourse } = useCourses();

	const { data: courses, isLoading } = useGetAbroadCoursesQuery(
		parseInt(setting?.value) || 0,
	);

	const secondYearCourses = courses?.filter(
		(course) => course.year === "SECOND_YEAR",
	);

	const thirdYearCourses = courses?.filter(
		(course) => course.year === "THIRD_YEAR",
	);

	function addCourse(year: Year) {
		const name = prompt("Enter course name");
		if (name) {
			addCourseWithYear(name, parseInt(setting?.value || "0"), year);
		}
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-col gap-2">
				<b>Home University</b>
				<Select
					value={selectedUni?.name}
					options={universities.map((uni) => ({
						label: uni.name,
						value: uni.id,
					}))}
					loading={!universities || setSettingMutation.isPending}
					className="w-1/2"
					onChange={(value) => {
						setSetting("home_university", value.toString());
					}}
				/>
			</div>
			<div className="flex items-center gap-2">
				<div className="flex w-full flex-col gap-2">
					<div className="flex items-center gap-2">
						<b>2nd Year Course Selection</b>
						<Button
							type="default"
							disabled={!selectedUni}
							size="small"
							onClick={() => addCourse("SECOND_YEAR")}
						>
							Add Course
						</Button>
					</div>
					<List
						loading={isLoading}
						dataSource={secondYearCourses}
						renderItem={(course) => (
							<List.Item>
								<span>{course.name}</span>
								<Button
									type="text"
									size="small"
									color="danger"
									onClick={() => deleteCourse(course.id)}
								>
									<X color="red" />
								</Button>
							</List.Item>
						)}
					/>
				</div>
				<div className="flex w-full flex-col gap-2">
					<div className="flex items-center gap-2">
						<b>3rd Year Course Selection</b>
						<Button
							type="default"
							disabled={!selectedUni}
							size="small"
							onClick={() => addCourse("THIRD_YEAR")}
						>
							Add Course
						</Button>
					</div>
					<List
						loading={isLoading}
						dataSource={thirdYearCourses}
						renderItem={(course) => (
							<List.Item>
								<span>{course.name}</span>
								<Button
									type="text"
									size="small"
									color="danger"
									onClick={() => deleteCourse(course.id)}
								>
									<X color="red" />
								</Button>
							</List.Item>
						)}
					/>
				</div>
			</div>
			{/* TODO: 2nd year, 3rd year course selection, select home uni*/}
		</div>
	);
}
