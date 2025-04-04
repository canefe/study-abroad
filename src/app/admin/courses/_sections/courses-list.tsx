"use client";
import VerifiedBadge from "@/app/_components/choices-table/verified-badge";
import { yearToString } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Year } from "@prisma/client";
import {
	AutoComplete,
	Button,
	Popconfirm,
	Select,
	Table,
	Tag,
	Tooltip,
} from "antd";
import {
	Flag,
	FlagOffIcon,
	FolderX,
	PauseIcon,
	Pen,
	StopCircle,
	Trash,
} from "lucide-react";
import { title } from "process";
import { useState } from "react";
import EditCourseModal from "./edit-course-modal";
import { useCourses } from "@/hooks/useCourses";
import { debounce } from "lodash";

type ListProps = {
	filter?: [key: string, value: string];
};
type CourseStatus = "flagged" | "verified";

export default function CoursesList({ filter }: ListProps) {
	const [universities] = api.universities.getList.useSuspenseQuery();

	const [editCourse, setEditCourse] = useState(false);
	const [course, setCourse] = useState<any>();
	const [search, setSearch] = useState("");
	const [universityFilter, setUniversityFilter] = useState<number[]>([]);
	const [page, setPage] = useState(1);
	const utils = api.useUtils();
	const { data: courses } = api.courses.getAll.useQuery({
		filter: {
			q: search,
			universities: universityFilter,
			flagged: filter?.[0] === "flagged" ? filter[1] === "true" : undefined,
			verified: filter?.[0] === "verified" ? filter[1] === "true" : undefined,
		},
		page: page,
		pageSize: 10,
	});

	const handleSearch = debounce((value: string) => {
		setSearch(value);
		setPage(1);
	}, 500);

	const handleUniversityFilter = debounce((value: number[]) => {
		setUniversityFilter(value);
		setPage(1);
	}, 500);

	const { verifyCourse, deleteCourse, unverifyCourse, unflagCourse } =
		useCourses();

	const handleVerify = async (courseId: number) => {
		await verifyCourse(courseId);
	};

	const handleDelete = async (courseId: number) => {
		await deleteCourse(courseId);
	};

	const handleUnverify = async (courseId: number) => {
		await unverifyCourse(courseId);
	};

	const handleUnflag = async (courseId: number) => {
		await unflagCourse(courseId);
	};

	const columns = [
		{
			title: "Course Name",
			dataIndex: "name",
			key: "name",
			render: (name: string, record: any) => (
				<div className="flex flex-col gap-1">
					{record?.link ? (
						<a
							href={
								record.link.startsWith("http://") ||
								record.link.startsWith("https://")
									? record.link
									: `http://${record.link}`
							}
							target="_blank"
							rel="noreferrer"
							className="text-blue-500"
						>
							{name}
						</a>
					) : (
						<span>{name}</span>
					)}
				</div>
			),
		},
		{
			title: "University",
			dataIndex: ["university", "name"],
			key: "university",
		},
		{
			title: "Details",
			dataIndex: "year",
			key: "year",
			width: 500,
			render: (_, record) => (
				<>
					{record.flagged && (
						<li className="whitespace-nowrap">
							<div className='relative inline-block w-[100px] pr-5 after:absolute after:right-5 after:content-[""]'>
								{" "}
								<span className="font-semibold">Flagged:</span>{" "}
							</div>
							<div
								className="inline-block"
								style={{
									color: record.flagged ? "red" : "green",
								}}
							>
								{record.flagged ? "Yes" : "No"}
							</div>
						</li>
					)}
					<li className="whitespace-nowrap">
						<div className='relative inline-block w-[100px] pr-5 after:absolute after:right-5 after:content-[""]'>
							{" "}
							<span className="font-semibold">Verified:</span>{" "}
						</div>
						<div
							className="inline-block"
							style={{
								color: record.verified ? "green" : "orange",
							}}
						>
							{record.verified ? "Yes" : "No"}
						</div>
					</li>

					{record?.createdBy && (
						<li className="whitespace-nowrap">
							<div className='relative inline-block w-[100px] pr-5 after:absolute after:right-5 after:content-[""]'>
								{" "}
								<span className="font-semibold">Created By:</span>{" "}
							</div>
							<div className="inline-block">{record.createdBy}</div>
						</li>
					)}
					<li className="whitespace-nowrap">
						<div className='relative inline-block w-[100px] pr-5 after:absolute after:right-5 after:content-[""]'>
							{" "}
							<span className="font-semibold">Years:</span>{" "}
						</div>
						<div className="inline-block" style={{ marginBottom: "1rem" }}>
							<div className="grid w-fit grid-cols-1 gap-1">
								{record?.year.map((year, index) => (
									<Tag key={index}>{yearToString(year as Year)}</Tag>
								))}
							</div>
						</div>
					</li>
				</>
			),
		},
		{
			title: "Action",
			dataIndex: "",
			key: "",
			render: (_, record) => (
				<div className="flex gap-2">
					<Tooltip title="Delete">
						<Popconfirm
							title="Are you sure to delete this course?"
							onConfirm={() => handleDelete(record.id)}
							okText="Yes"
							cancelText="No"
							placement="top"
							className="w-fit"
						>
							<Button className="text-red-500">
								<Trash size={16} />
							</Button>
						</Popconfirm>
					</Tooltip>
					{!record.verified ? (
						<Tooltip title="Verify">
							<Button
								className="text-green-500"
								onClick={() => {
									handleVerify(record.id);
								}}
							>
								<VerifiedBadge hideTooltip />
							</Button>
						</Tooltip>
					) : (
						<Tooltip title="Unverify">
							<Button
								className="text-orange-500"
								onClick={() => {
									handleUnverify(record.id);
								}}
							>
								<FolderX size={16} />
							</Button>
						</Tooltip>
					)}
					{record.flagged ? (
						<Tooltip title="Unflag">
							<Button
								className="text-blue-500"
								onClick={() => handleUnflag(record.id)}
							>
								<FlagOffIcon
									size={16}
									fill="#ef4444"
									className="cursor-pointer text-red-500 hover:text-red-700"
								/>
							</Button>
						</Tooltip>
					) : (
						<Tooltip title="Flag">
							<Button
								className="text-red-500"
								onClick={() => handleUnflag(record.id)}
							>
								<Flag size={16} />
							</Button>
						</Tooltip>
					)}
					<Tooltip title="Edit">
						<Button
							className="text-orange-500"
							onClick={() => {
								setEditCourse(true);
								setCourse(record);
							}}
						>
							<Pen size={16} />
						</Button>
					</Tooltip>
				</div>
			),
		},
	];
	return (
		<div className="container">
			<div className="flex items-center gap-2">
				<AutoComplete
					options={courses?.courses.map((course) => ({
						value: course.name,
						label: course.name,
					}))}
					onSearch={handleSearch}
					onSelect={handleSearch}
					placeholder="Search for a course by its name"
					className="w-full"
				/>
				{/* University Filter */}
				<Select
					showSearch
					mode="multiple"
					maxTagCount={"responsive"}
					placeholder="Select a university"
					filterOption={(input, option) =>
						String(option?.value ?? "")
							.toLowerCase()
							.includes(input.toLowerCase())
					}
					style={{ width: 300 }}
					onChange={handleUniversityFilter}
					options={universities?.map((university) => ({
						label: university.name,
						value: university.id,
					}))}
					className="w-1/3"
				></Select>
			</div>
			<Table
				dataSource={courses?.courses}
				className="mt-2"
				columns={columns}
				size="small"
				rowKey="id"
				loading={!courses}
				pagination={{
					current: page,
					onChange: (page) => setPage(page),
					total: courses?.total,
				}}
			/>
			<EditCourseModal
				open={editCourse}
				setOpen={setEditCourse}
				course={course}
			/>
		</div>
	);
}
