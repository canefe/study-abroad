"use client";

import { useGetAbroadCoursesQuery } from "@/app/api/queries/application";
import { useCourses } from "@/hooks/useCourses";
import { useSettings } from "@/hooks/useSettings";
import { yearToString } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Year } from "@prisma/client";
import { Button, List, Popconfirm, Select } from "antd";
import { X } from "lucide-react";
import { useState } from "react";

export default function HomeUniversitySettings() {
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
			<div className="flex flex-col items-center gap-2">
				<div className="grid w-full grid-cols-1 gap-2 xl:grid-cols-2">
					{Object.values(Year).map((year) => (
						<div key={year} className="col-span-1">
							<div className="flex items-center gap-2">
								<b>{yearToString(year)}</b>
								<Button
									type="default"
									disabled={!selectedUni}
									size="small"
									onClick={() => addCourse(year)}
								>
									Add Course
								</Button>
							</div>
							<List
								loading={isLoading}
								dataSource={courses?.filter((course) =>
									course.year.includes(year),
								)}
								renderItem={(course) => (
									<List.Item className="bg-gray-50">
										<span className="ml-4">{course.name}</span>
										<Popconfirm
											title={
												<>
													Are you sure?
													<p className="font-medium">
														This could delete applications that use this course.
													</p>
												</>
											}
											okText="Yes"
											cancelText="No"
											onConfirm={() => deleteCourse(course.id)}
										>
											<Button type="text" size="small" color="danger">
												<X color="red" />
											</Button>
										</Popconfirm>
									</List.Item>
								)}
							/>
							<Select
								showSearch
								className="w-full"
								placeholder="Select a course"
								options={courses?.map((course) => ({
									label: course.name,
									value: course.id,
								}))}
								showAction={["focus"]}
								onSelect={(value) => {
									setYearOfCourse(value as number, year);
								}}
							/>
						</div>
					))}
				</div>
			</div>
			{/* TODO: 2nd year, 3rd year course selection, select home uni*/}
		</div>
	);
}
