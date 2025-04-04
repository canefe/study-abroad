import { correctLink } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import {
	AutoComplete,
	Popconfirm,
	Button,
	Modal,
	Form,
	Tooltip,
	Input,
} from "antd";
import { PlusIcon, FlagIcon, ExternalLink } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import FlaggedBadge from "./flagged-badge";
import VerifiedBadge from "./verified-badge";
import CourseInfoPopover from "./course-info-popover";
import { Course } from "@prisma/client";
import { z } from "zod";
import { AutoShortenText } from "@/lib/textUtils";

type AbroadCourseListProps = {
	abroadCourses: Course[];
	application: any;
	addCourse: any;
	removeChoices: (homeCourseId: number, type: string) => void;
	flagCourse: (courseId: number) => void;
	choices: Record<string, any>;
	sidebarRef?: React.RefObject<HTMLDivElement>;
	sidebarHeight?: number;
};

// Zod schema for the form
const addCourseSchema = z.object({
	name: z.string().min(5, "Course name must be at least 5 characters"),
	link: z.string(),
	description: z
		.string()
		.min(10, "Course description must be at least 10 characters"),
});

export default function AbroadCoursesList({
	abroadCourses,
	application,
	addCourse,
	removeChoices,
	flagCourse,
	choices,
	sidebarRef,
	sidebarHeight,
}: AbroadCourseListProps & { ref2?: React.RefObject<HTMLDivElement> }) {
	const [addCourseModalOpen, setAddCourseModalOpen] = useState(false); // State to track if the add course modal is open
	const [agreedToTerms, setAgreedToTerms] = useState(false); // State to track if the user has agreed to the terms of course creation to avoid multiple popups
	const [searchCourse, setSearchCourse] = useState("");

	const onAddCourse = async (values: z.infer<typeof addCourseSchema>) => {
		// validate
		const result = addCourseSchema.safeParse(values);
		if (!result.success) {
			toast.error(result.error.message);
			return;
		}
		// add course
		const { name, link, description } = values;
		await addCourse(name, application.abroadUniversityId, link, description);
		setAddCourseModalOpen(false);
	};

	const handleSearch = (value) => {
		setSearchCourse(value);
	};

	// Filter out courses that are already selected
	const selectedCourseIds = new Set(
		Object.values(choices).flatMap((choice) => Object.values(choice) || []),
	);

	const availableAbroadCourses = abroadCourses?.filter(
		(course) => !selectedCourseIds.has(course.id),
	);

	const searchedCourses = availableAbroadCourses?.filter((course) =>
		course.name.toLowerCase().includes(searchCourse.toLowerCase()),
	);

	const removeAllChoices = () => {
		// remove all choices
		Object.keys(choices).forEach((homeCourseId) => {
			removeChoices(parseInt(homeCourseId), "primary");
			removeChoices(parseInt(homeCourseId), "alt1");
			removeChoices(parseInt(homeCourseId), "alt2");
		});
	};

	return (
		<div ref={sidebarRef} className="max-w-xl lg:min-w-72">
			<div
				className="relative !z-0 hidden transform overflow-hidden rounded bg-gray-100 p-3 transition-all duration-500 ease-in-out md:block"
				ref={sidebarRef}
				style={{
					height: 500,
					maxHeight:
						(sidebarHeight && sidebarHeight >= 500 ? sidebarHeight : 500) - 100,
				}}
			>
				<h2>
					Abroad Courses{" "}
					<span className="text-sm font-normal text-gray-500">
						({availableAbroadCourses?.length || 0})
					</span>
				</h2>
				<div className="sticky top-0 my-2 flex items-center gap-1">
					<AutoComplete
						options={searchedCourses?.map((course) => ({
							value: course.name,
							label: course.name,
						}))}
						onSearch={handleSearch}
						placeholder="Search course"
						className="w-full"
						placement={"topLeft"}
					/>
					{/* Add a New Course Button */}
					<Popconfirm
						title="Adding a new course"
						disabled={agreedToTerms}
						description={
							<>
								<p>Before adding a course you must accept these terms:</p>
								<ul className="list-inside list-decimal">
									<li>Course must be related to the university</li>
									<li>Course must be available in the university</li>
									<li>Course must be a valid course</li>
								</ul>
							</>
						}
						onConfirm={() => {
							setAddCourseModalOpen(true);
							setAgreedToTerms(true);
						}}
						okText="I accept"
						cancelText="Cancel"
						placement="top"
					>
						<Button
							onClick={() => {
								if (agreedToTerms) setAddCourseModalOpen(true);
							}}
							className="cursor-pointer"
						>
							<PlusIcon size={16} />
						</Button>
					</Popconfirm>
				</div>
				<div
					className="ease-in-outpb-4 flex transform flex-col gap-2 overflow-y-scroll pt-2 transition-all duration-500"
					style={{
						minHeight: 300,
						maxHeight: sidebarHeight! - 200,
						overflowY: "auto",
					}}
				>
					<Modal
						title="Add New Course"
						open={addCourseModalOpen}
						onCancel={() => setAddCourseModalOpen(false)}
						onClose={() => setAddCourseModalOpen(false)}
						footer={null}
					>
						<Form
							layout="vertical"
							onFinish={(values) => {
								onAddCourse(values);
							}}
						>
							<Form.Item
								layout={"vertical"}
								label="Course Name"
								name="name"
								rules={[
									{
										required: true,
										message: "Please enter a course name",
									},
									{
										min: 5,
										message: "Course name must be at least 5 characters",
									},
								]}
								required
							>
								<Input placeholder="Course Name" />
							</Form.Item>
							<Form.Item
								layout={"vertical"}
								label="Course Description"
								name="description"
								rules={[
									{
										required: true,
										message: "Please enter a course description",
									},
									{
										min: 10,
										message:
											"Course description must be at least 10 characters",
									},
								]}
							>
								<Input.TextArea
									placeholder="Course Description"
									rows={4}
									maxLength={300}
								/>
							</Form.Item>
							<Form.Item
								layout={"vertical"}
								label="Course Link"
								name="link"
								required
								rules={[
									{
										type: "url",
										message: "Please enter a valid URL",
									},
								]}
							>
								<Input placeholder="Course Link" />
							</Form.Item>
							<Form.Item label={null}>
								<Button type="primary" htmlType="submit">
									Submit
								</Button>
							</Form.Item>
						</Form>
					</Modal>
					{availableAbroadCourses?.length === 0 && (
						<ul className="w-fit list-inside text-sm text-gray-500">
							<li>No abroad courses available</li>
							<li>You can add a new course</li>
						</ul>
					)}
					{searchedCourses?.map((course) => (
						<div key={course.id} className="flex items-center gap-2">
							<DraggableCourse course={course} />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

// Draggable course box
export const DraggableCourse = ({ course }: { course: Course }) => {
	const { id, name, flagged, verified } = course;

	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: course.id,
	});

	const style = transform
		? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
		: undefined;

	return (
		<CourseInfoPopover course={course}>
			<div
				ref={setNodeRef}
				style={style}
				{...listeners}
				{...attributes}
				key={id}
				className={`w-full flex-1 cursor-pointer ${flagged && "bg-red-200"} ${verified && "bg-green-200"} bg-gray-200 p-3 hover:bg-blue-100`}
			>
				<div className="flex items-center gap-2">
					<h2 className="text-sm font-semibold">
						<AutoShortenText text={name} maxChars={25} showTooltip={false} />
					</h2>
					{flagged && !verified && <FlaggedBadge />}
					{verified && <VerifiedBadge />}
				</div>
			</div>
		</CourseInfoPopover>
	);
};
