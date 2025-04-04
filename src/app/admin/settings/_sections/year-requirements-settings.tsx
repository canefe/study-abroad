"use client";

import { useEffect, useState } from "react";
import {
	Button,
	Checkbox,
	ConfigProvider,
	Form,
	List,
	Select,
	Tooltip,
} from "antd";
import { Folder, X } from "lucide-react";
import { Year } from "@prisma/client";
import { yearToString } from "@/lib/utils";
import { useSettings } from "@/hooks/useSettings";
import { api } from "@/trpc/react";
import { useGetAbroadCoursesQuery } from "@/app/api/queries/application";
import toast from "react-hot-toast";

export default function YearRequirementsSettings() {
	// Selected year from the Year enum
	const [selectedYear, setSelectedYear] = useState<Year>(
		Year.SECOND_YEAR_JOINT_FIRST_SEMESTER,
	);

	// Get and update settings related to year requirements
	const { getSetting, setSetting } = useSettings();

	// Toggle state for showing the "add course" Select dropdown.
	const [toggledAlternateCourseSelect, setToggledAlternateCourseSelect] =
		useState(false);
	const [toggledAdditionalCourseSelect, setToggledAdditionalCourseSelect] =
		useState(false);

	// Parse the "year_requirements" setting saved as JSON string.
	const yearReqSetting = getSetting("year_requirements");
	const initialReqConfig = yearReqSetting
		? JSON.parse(yearReqSetting.value)
		: {};
	// Local state for the config; this would be updated on change.
	const [yearReqConfigState, setYearReqConfigState] =
		useState(initialReqConfig);

	// Retrieve current requirements for the selected year.
	const currentReq = yearReqConfigState[selectedYear] || {
		alternateCourses: [],
		additionalCourses: [],
		optionalCourses: false,
	};

	// Initialize local toggle state from the config.
	const [alternateToggle, setAlternateToggle] = useState(
		currentReq.alternateCourses.length > 0,
	);

	// Initialize local toggle state from the config.
	const [additionalToggle, setAdditionalToggle] = useState(
		currentReq.additionalCourses.length > 0,
	);

	useEffect(() => {
		setAlternateToggle(currentReq.alternateCourses.length > 0);
		setAdditionalToggle(currentReq.additionalCourses.length > 0);
		setToggledAlternateCourseSelect(false);
		setToggledAdditionalCourseSelect(false);
	}, [selectedYear, yearReqConfigState]);

	// Get home courses from existing query.
	const [universities] = api.universities.getList.useSuspenseQuery();
	const homeSetting = getSetting("home_university");
	const selectedUni = universities?.find(
		(uni) => uni.id.toString() === homeSetting?.value,
	);
	const { data: courses, isLoading } = useGetAbroadCoursesQuery(
		parseInt(homeSetting?.value as string) || 0,
	);

	// Utility to update config for the selected year and persist via setSetting.
	const updateYearReq = (newValues: Partial<typeof currentReq>) => {
		const updated = { ...currentReq, ...newValues };
		const newConfig = { ...yearReqConfigState, [selectedYear]: updated };
		setYearReqConfigState(newConfig);
		// Persist the updated config as a JSON string.
		setSetting("year_requirements", JSON.stringify(newConfig));
	};

	// Disable Requirement
	// call for example: updateYearReq({ additionalCourses: [] });
	const disableRequirement = (
		type: "alternateCourses" | "additionalCourses",
	) => {
		updateYearReq({ [type]: [] });
		toast.success(`Disabled ${type} requirement.`);
	};

	// Remove a course from the given type.
	const removeCourse = (
		type: "alternateCourses" | "additionalCourses",
		courseName: string,
	) => {
		const updatedCourses = currentReq[type].filter(
			(name: string) => name !== courseName,
		);
		updateYearReq({ [type]: updatedCourses });
		toast.success(
			`Removed course ${courses?.find((c) => c.name === courseName)?.name} from ${type}.`,
		);
	};

	// Add a course to the given type.
	const addCourseToRequirements = (
		type: "alternateCourses" | "additionalCourses",
		courseName: string,
	) => {
		if (!currentReq[type].includes(courseName)) {
			updateYearReq({ [type]: [...currentReq[type], courseName] });
		}
		toast.success(
			`Added course ${courses?.find((c) => c.name === courseName)?.name} to ${type}.`,
		);
	};

	return (
		<>
			<div>
				<p className="w-full text-xl font-medium">Year Requirements</p>
				<p className="text-sm text-gray-500">
					Here you can set additional conditions for each year.
				</p>
				<ul className="list-disc pl-4 text-sm text-gray-500">
					<li>
						Alternate Route courses are added if a student declares they are on
						the Alternate Route.
					</li>
					<li>
						Additional Courses are selected one at a time (by the student) and
						added to the matching.
					</li>
					<li>
						Optional Courses are noted; this adds a text area in the matching
						interface.
					</li>
				</ul>
			</div>
			<div className="flex h-full">
				{/* Year selector */}
				<div className="w-1/4 min-w-[200px] border-r pr-2">
					<p className="mb-2 text-lg font-medium">Select Year</p>
					<div className="flex flex-col gap-1">
						{Object.values(Year).map((year) => (
							<Button
								key={year}
								type={selectedYear === year ? "primary" : "text"}
								className="justify-start text-left"
								onClick={() => setSelectedYear(year)}
							>
								{yearToString(year)}
							</Button>
						))}
					</div>
				</div>

				{/* Requirements for the selected year */}
				<div className="flex flex-1 flex-col p-4">
					<h2 className="text-xl font-medium">{yearToString(selectedYear)}</h2>
					<div className="mt-4 space-y-4">
						{/* Alternate Route Section */}
						<div className="rounded-md border p-4">
							<div className="flex items-center justify-between">
								<Checkbox
									checked={alternateToggle}
									onChange={(e) => {
										const checked = e.target.checked;
										setAlternateToggle(checked);
										if (!checked) {
											disableRequirement("alternateCourses");
										}
									}}
								>
									Enable Alternate Route
								</Checkbox>
								{alternateToggle && (
									<Tooltip title="Add an existing course">
										<div className="relative">
											<Button
												type="default"
												icon={<Folder size={16} />}
												disabled={!selectedUni}
												size="small"
												onClick={() =>
													setToggledAlternateCourseSelect(
														!toggledAlternateCourseSelect,
													)
												}
											>
												Add Course
											</Button>
											{toggledAlternateCourseSelect && (
												<Select
													showSearch
													className="absolute left-0 right-0 top-9 z-10 mx-auto mt-1 w-fit"
													placeholder="Select an existing course to add"
													options={
														courses?.map((course) => ({
															label: course.name,
															value: course.name,
														})) || []
													}
													filterOption={(input, option) =>
														option
															? (option.label as string)
																	.toLowerCase()
																	.includes(input.toLowerCase())
															: false
													}
													open={true}
													onSelect={(value) => {
														addCourseToRequirements("alternateCourses", value);
														setToggledAlternateCourseSelect(false);
													}}
												/>
											)}
										</div>
									</Tooltip>
								)}
							</div>
							{currentReq.alternateCourses.length > 0 && (
								<ConfigProvider
									renderEmpty={() => <div>No alternate courses</div>}
								>
									<List
										className="mt-2"
										dataSource={currentReq.alternateCourses.map(
											(name: string) => {
												const course = courses?.find((c) => c.name === name);
												return { name: course ? course.name : name };
											},
										)}
										renderItem={(item: { name: string }) => (
											<List.Item className="flex items-center justify-between border-b p-2">
												<span>{item.name}</span>
												<X
													className="cursor-pointer text-red-500"
													onClick={() =>
														removeCourse("alternateCourses", item.name)
													}
												/>
											</List.Item>
										)}
									/>
								</ConfigProvider>
							)}
						</div>

						{/* Additional Courses Section */}
						<div className="rounded-md border p-4">
							<div className="flex items-center justify-between">
								<Checkbox
									checked={additionalToggle}
									onChange={(e) => {
										const checked = e.target.checked;
										setAdditionalToggle(checked);
										if (!checked) {
											// Clear the courses if unchecked.
											disableRequirement("additionalCourses");
										}
									}}
								>
									Enable Additional Courses
								</Checkbox>
								{additionalToggle && (
									<Tooltip title="Add an existing course">
										<div className="relative">
											<Button
												type="default"
												icon={<Folder size={16} />}
												disabled={!selectedUni}
												size="small"
												onClick={() =>
													setToggledAdditionalCourseSelect(
														!toggledAdditionalCourseSelect,
													)
												}
											>
												Add Course
											</Button>
											{toggledAdditionalCourseSelect && (
												<Select
													showSearch
													className="absolute left-0 right-0 top-9 z-10 mx-auto mt-1 w-fit"
													placeholder="Select an existing course to add"
													options={
														courses?.map((course) => ({
															label: course.name,
															value: course.name,
														})) || []
													}
													filterOption={(input, option) =>
														option
															? (option.label as string)
																	.toLowerCase()
																	.includes(input.toLowerCase())
															: false
													}
													open={true}
													onSelect={(value) => {
														addCourseToRequirements("additionalCourses", value);
														setToggledAdditionalCourseSelect(false);
													}}
												/>
											)}
										</div>
									</Tooltip>
								)}
							</div>
							{currentReq.additionalCourses.length > 0 && (
								<ConfigProvider
									renderEmpty={() => <div>No additional courses</div>}
								>
									<List
										className="mt-2"
										dataSource={currentReq.additionalCourses.map(
											(name: string) => {
												const course = courses?.find((c) => c.name === name);
												return { name: course ? course.name : name };
											},
										)}
										renderItem={(item: { name: string }) => (
											<List.Item className="flex items-center justify-between border-b p-2">
												<span>{item.name}</span>
												<X
													className="cursor-pointer text-red-500"
													onClick={() =>
														removeCourse("additionalCourses", item.name)
													}
												/>
											</List.Item>
										)}
									/>
								</ConfigProvider>
							)}
						</div>

						{/* Optional Courses Section */}
						<div className="rounded-md border p-4">
							<Checkbox
								checked={currentReq.optionalCourses}
								onChange={(e) => {
									updateYearReq({ optionalCourses: e.target.checked });
									switch (e.target.checked) {
										case true:
											toast.success("Enabled optional courses.");
											break;
										case false:
											toast.success("Disabled optional courses.");
											break;
									}
								}}
							>
								Enable Optional Courses
							</Checkbox>
							{currentReq.optionalCourses && (
								<p className="mt-2 text-sm text-gray-500">
									Optional courses will be noted.
								</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
