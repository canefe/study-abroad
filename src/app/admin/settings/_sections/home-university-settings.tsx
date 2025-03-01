"use client";

import { useGetAbroadCoursesQuery } from "@/app/api/queries/application";
import { useCourses } from "@/hooks/useCourses";
import { useSettings } from "@/hooks/useSettings";
import { yearToString } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Year } from "@prisma/client";
import { Button, ConfigProvider, List, Select, Tooltip } from "antd";
import { Folder, Plus, X } from "lucide-react";
import { useRef, useState } from "react";

export default function HomeUniversitySettings() {
	const [selectedYear, setSelectedYear] = useState<Year>(
		Year.SECOND_YEAR_JOINT_FIRST_SEMESTER,
	);
	const [toggled, setToggled] = useState(false);

	const selectRef = useRef<typeof Select>(null);

	const { getSetting, setSetting, setSettingMutation } = useSettings();

	const [universities] = api.universities.getList.useSuspenseQuery();

	const setting = getSetting("home_university");

	const selectedUni = universities?.find(
		(uni) => uni.id.toString() === setting?.value,
	);

	const { addCourseWithYear, deleteCourse, setYearOfCourse } = useCourses();

	const { data: courses, isLoading } = useGetAbroadCoursesQuery(
		parseInt(setting?.value as string) || 0,
	);

	// Function to add a course
	function addCourse(year: Year) {
		const name = prompt("Enter course name");
		if (name) {
			addCourseWithYear(name, parseInt(setting?.value || "0"), year);
		}
	}

	return (
		<>
			<div className="flex flex-col gap-2">
				<p className="mt-4 w-full text-xl font-medium">Home University</p>
				<p className="text-sm text-gray-500">
					Set home university for the application process.
				</p>
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
					showSearch
					filterOption={(input, option) =>
						option
							? option.label.toLowerCase().includes(input.toLowerCase())
							: false
					}
				/>
			</div>

			<p className="mt-4 w-full text-xl font-medium">Home Courses</p>
			<p className="text-sm text-gray-500">
				In here you can manage the home courses for the selected year.
			</p>
			<div className="flex h-full">
				{/* year selector */}
				<div className="w-1/4 min-w-[200px] border-r pr-2">
					<p className="mb-2 text-lg font-medium">Select Year</p>
					<div className="flex flex-col gap-1">
						{Object.values(Year).map((year) => (
							<Button
								key={year}
								type={selectedYear === year ? "primary" : "text"}
								block
								className="justify-start text-left"
								onClick={() => setSelectedYear(year)}
							>
								{yearToString(year)}
							</Button>
						))}
					</div>
				</div>

				{/* courses for the year */}
				<div className="flex flex-1 flex-col p-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-medium">
							{yearToString(selectedYear)}
						</h2>
						<div className="flex gap-2">
							<Tooltip title="Add an existing course">
								<div className="relative">
									<Button
										type="default"
										icon={<Folder size={16} />}
										disabled={!selectedUni}
										size="small"
										onClick={() => setToggled(!toggled)}
									>
										Add Course
									</Button>
									{toggled && (
										<Select
											showSearch
											className="absolute left-0 right-0 top-5 z-10 mx-auto mt-1 w-fit"
											placeholder="Select an existing course to add"
											options={courses?.map((course) => ({
												label: course.name,
												value: course.id,
											}))}
											open={selectedYear != undefined}
											showAction={["focus"]}
											onSelect={(value) => {
												setYearOfCourse(value as number, selectedYear);
												setToggled(false);
											}}
										/>
									)}
								</div>
							</Tooltip>
							<Tooltip title="Create new course">
								<Button
									type="default"
									icon={<Plus size={16} />}
									disabled={!selectedUni}
									size="small"
									onClick={() => addCourse(selectedYear)}
								>
									Create Course
								</Button>
							</Tooltip>
						</div>
					</div>

					{/* courses List */}
					<ConfigProvider renderEmpty={() => <div>No courses</div>}>
						<List
							loading={isLoading}
							dataSource={courses?.filter((course) =>
								course.year.includes(selectedYear),
							)}
							renderItem={(course) => (
								<li className="m-0 my-1 flex w-full justify-between border-b p-2">
									<span className="ml-4">{course.name}</span>
									<Tooltip title="Remove course from year">
										<X
											color="red"
											className="mr-2 cursor-pointer hover:scale-110 hover:text-blue-500"
											onClick={() => setYearOfCourse(course.id, undefined)}
										/>
									</Tooltip>
								</li>
							)}
						/>
					</ConfigProvider>
				</div>
			</div>
		</>
	);
}
