"use client";

import { useGetAbroadCoursesQuery } from "@/app/api/queries/application";
import { useCourses } from "@/hooks/useCourses";
import { useSettings } from "@/hooks/useSettings";
import { yearToString } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Year } from "@prisma/client";
import {
	Button,
	ConfigProvider,
	List,
	Popconfirm,
	Select,
	Tooltip,
} from "antd";
import { Folder, Plus, PlusSquare, X } from "lucide-react";
import { useRef, useState } from "react";

export default function HomeUniversitySettings() {
	const [selectedYear, setSelectedYear] = useState<Year>();

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

	// categorize courses by year
	function addCourse(year: Year) {
		const name = prompt("Enter course name");
		if (name) {
			addCourseWithYear(name, parseInt(setting?.value || "0"), year);
		}
	}

	function changeSelectedYear(year: Year) {
		if (selectedYear == year) {
			setSelectedYear(undefined);
		} else {
			selectRef.current?.Option;
			setSelectedYear(year);
		}
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-col gap-2">
				<p className="mt-4 w-full text-xl font-medium">Home University</p>
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
			<div className="flex flex-col items-center gap-2">
				<p className="mt-4 w-full text-xl font-medium">Home Courses</p>
				<div className="grid w-full grid-cols-1 gap-2 xl:grid-cols-3">
					{Object.values(Year).map((year) => (
						<div key={year} className="col-span-1">
							<div className="relative z-10 flex items-center gap-2">
								<span className="font-medium">{yearToString(year)}</span>
								<Tooltip title="Create new course">
									<Button
										type="default"
										disabled={!selectedUni}
										size="small"
										onClick={() => addCourse(year)}
									>
										<Plus />
									</Button>
								</Tooltip>
								<Tooltip title="Add an existing course">
									<Button
										type={selectedYear == year ? "primary" : "default"}
										disabled={!selectedUni}
										size="small"
										onClick={() => changeSelectedYear(year)}
									>
										<Folder />
									</Button>
								</Tooltip>
								{selectedYear == year && (
									<Select
										showSearch
										className="absolute left-0 right-0 top-5 mx-auto mt-1 w-fit"
										placeholder="Select an existing course to add"
										options={courses?.map((course) => ({
											label: course.name,
											value: course.id,
										}))}
										open={selectedYear != undefined}
										showAction={["focus"]}
										onSelect={(value) => {
											setYearOfCourse(value as number, year);
											setSelectedYear(undefined);
										}}
									/>
								)}
							</div>
							<ConfigProvider renderEmpty={() => <div>No courses</div>}>
								<List
									loading={isLoading}
									dataSource={courses?.filter((course) =>
										course.year.includes(year),
									)}
									renderItem={(course) => (
										<List.Item className="my-1 rounded-lg bg-gray-50">
											<span className="ml-4">{course.name}</span>
											<Popconfirm
												title={
													<>
														Are you sure?
														<p className="font-medium">
															This could delete applications that use this
															course.
														</p>
													</>
												}
												okText="Yes"
												cancelText="No"
												onConfirm={() => setYearOfCourse(course.id, undefined)}
											>
												<Button type="text" size="small" color="danger">
													<X color="red" />
												</Button>
											</Popconfirm>
										</List.Item>
									)}
								/>
							</ConfigProvider>
						</div>
					))}
				</div>
			</div>
			{/* TODO: 2nd year, 3rd year course selection, select home uni*/}
		</div>
	);
}
