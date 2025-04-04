"use client";
import { api } from "@/trpc/react";
import {
	Alert,
	AutoComplete,
	Button,
	Dropdown,
	Form,
	Input,
	Modal,
	Popconfirm,
	Popover,
	Skeleton,
	Table,
	Tooltip,
	Tour,
	TourProps,
} from "antd";
import {
	DndContext,
	DragOverlay,
	DragStartEvent,
	useDraggable,
	useDroppable,
} from "@dnd-kit/core";
import { useEffect, useRef, useState } from "react";
import {
	correctLink,
	getCourseNameById,
	useCombinedRefs,
	yearToString,
} from "@/lib/utils";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";
import {
	ExternalLink,
	FlagIcon,
	MessageCircleQuestion,
	PlusIcon,
	Verified,
	X,
} from "lucide-react";
import { Cross1Icon } from "@radix-ui/react-icons";
import CommentSection from "@/app/_components/comment-section";
import MobileChoicesTable from "../mobile-choices-table";
import VerifiedBadge from "./verified-badge";
import { shortenText } from "@/lib/textUtils";
import MissingBadge from "./missing-badge";
import { useComments } from "@/hooks/useComments";
import { useApplication } from "@/hooks/useApplication";
import FlaggedBadge from "./flagged-badge";
import { Course, Status, Year } from "@prisma/client";
import _ from "lodash";
import { motion } from "framer-motion";
import { Session } from "next-auth";
import { useSettings } from "@/hooks/useSettings";
import { statusColor } from "@/lib/randomUtils";
import TextArea from "antd/es/input/TextArea";
import CourseInfoPopover from "./course-info-popover";
import AbroadCoursesList from "./abroad-courses-list";

interface Choice {
	primary: number | null;
	alt1: number | null;
	alt2: number | null;
}

interface Choices {
	[homeCourseId: number]: Choice;
}

export default function ChoicesTable({
	applicationId,
	admin,
	session,
}: {
	applicationId: number;
	admin?: boolean;
	session: Session;
}) {
	const {
		application,
		isLoading,
		isFetching,
		abroadCourses,
		isLoadingAbroadCourses,
		submitApplication,
		withdrawApplication,
		withdrawApplicationMutation,
		approveApplication,
		askForReviseApplication,
		addCourse,
		updateCourseChoices,
		updateCourseChoicesMutation,
		flagCourse,
	} = useApplication({
		applicationId,
		admin,
	});

	const { getSetting } = useSettings();

	// Parse the "year_requirements" setting saved as JSON string.
	const yearReqSetting = getSetting("year_requirements");
	const initialReqConfig = yearReqSetting
		? JSON.parse(yearReqSetting.value)
		: {};
	// Local state for the config; this would be updated on change.
	const [yearReqConfigState, setYearReqConfigState] =
		useState(initialReqConfig);

	const userData = session.user;

	const { comments } = useComments({ applicationId });

	const [sidebarHeight, setSidebarHeight] = useState(200); // Sidebar height state
	const tableRef = useRef<HTMLDivElement>(null); // Reference to the table
	const sidebarRef = useRef<HTMLDivElement>(null); // Reference to the sidebar
	const [activeId, setActiveId] = useState<number | null>(null);

	const pathname = usePathname();
	const [tourOpen, setTourOpen] = useState(false); // State to track if the tour is open
	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(Number(event.active.id));
	};

	const ref1 = useRef(null);
	const ref2 = useRef(null);
	const ref3 = useRef(null);
	const ref4 = useRef(null);

	const [initialChoices, setInitialChoices] = useState<Choices | undefined>(
		undefined,
	); // this is to fix unsaved changes going away on application data refreshes
	const [choices, setChoices] = useState<Choices>({}); // Tracks the selected choices for each home course

	// Note textarea state
	const [note, setNote] = useState<string | undefined>(undefined);

	// Show alert if someone has modified the application
	const [showAlert, setShowAlert] = useState(false);

	// Get the current year from the application.
	const currentReq = application?.year
		? yearReqConfigState[application.year] || { optionalCourses: false }
		: { optionalCourses: false };
	// Prepare the table data
	const dataSource =
		application?.courseChoices.map((choice) => ({
			id: choice.homeCourse.id,
			homeCourse: choice.homeCourse,
		})) || [];

	// dont display duplicate homeCourse
	const filteredDataSource = dataSource.filter(
		(course, index, self) =>
			index === self.findIndex((t) => t.homeCourse === course.homeCourse),
	);

	// only clientside, it will be added  on the choiceSlot component singular removal from choices
	const removeChoices = async (homeCourseId: number, slot: string) => {
		// remove all choices related to the university
		handleChoiceUpdate(homeCourseId, slot, null);
	};

	// Columns for the table
	const columns = [
		{
			title: "Home Course",
			dataIndex: "homeCourse",
			key: "homeCourse",
			onHeaderCell: (column) => ({
				ref: ref1,
			}),
			render: (course: Course, record: any) => (
				<CourseInfoPopover course={record.homeCourse}>
					{" "}
					<p className="font-semibold">{course.name}</p>
				</CourseInfoPopover>
			),
		},
		...["1st Choice", "2nd Choice", "3rd Choice"].map((title, idx) => ({
			title,
			key: title.toLowerCase().replace(" ", ""),
			height: 700,
			render: (_, record) => {
				const choiceType = ["primary", "alt1", "alt2"][idx];
				return (
					<ChoiceSlot
						id={`${record.id}-${choiceType}`}
						key={`${record.id}-${choiceType}`}
						//@ts-expect-error to-do
						choice={choices[record.id]?.[choiceType]}
						course={abroadCourses?.find(
							//@ts-expect-error it just works
							(course) => course.id === choices[record.id]?.[choiceType],
						)}
						courseName={
							abroadCourses?.find(
								(course) => course.id === choices[record.id]?.[choiceType!],
							)?.name
						}
						link={
							abroadCourses?.find(
								(course) => course.id === choices[record.id]?.[choiceType!],
							)?.link
						}
						onDrop={(courseId) => {
							// check all choices to see if the course is already selected and remove it if it is
							console.log("Dropping choice", record.id, choiceType, courseId);
							handleChoiceUpdate(record.id, choiceType, courseId);
						}}
						onRemove={() => {
							console.log("Removing choice", record.id, choiceType);
							//@ts-expect-error it just works
							removeChoices(record.id, choiceType);
						}}
						universityId={application?.abroadUniversityId}
						flagged={
							abroadCourses?.find(
								//@ts-expect-error it just works
								(course) => course.id === choices[record.id]?.[choiceType],
							)?.flagged
						}
						verified={
							abroadCourses?.find(
								//@ts-expect-error it just works
								(course) => course.id === choices[record.id]?.[choiceType],
							)?.verified
						}
					/>
				);
			},
		})),
	];

	// Handle drag-and-drop updates
	const handleChoiceUpdate = (homeCourseId, choiceType, abroadCourseId) => {
		console.log("Updating choice", homeCourseId, choiceType, abroadCourseId);
		setChoices((prev) => ({
			...prev,
			[homeCourseId]: {
				primary: prev[homeCourseId]?.primary ?? null,
				alt1: prev[homeCourseId]?.alt1 ?? null,
				alt2: prev[homeCourseId]?.alt2 ?? null,
				[choiceType]: abroadCourseId,
			},
		}));
		console.log(choices);
	};

	// Handle drag-end events
	const handleDragEnd = ({ active, over }) => {
		setActiveId(null);
		if (!over) return;
		const [homeCourseId, choiceType] = over.id.split("-");
		// check all choices to see if the course is already selected and remove it if it is or swap if it is
		Object.entries(choices).forEach(([courseId, choice]) => {
			if (choice.primary === active.id) {
				handleChoiceUpdate(courseId, "primary", null);
			}
			if (choice.alt1 === active.id) {
				handleChoiceUpdate(courseId, "alt1", null);
			}
			if (choice.alt2 === active.id) {
				handleChoiceUpdate(courseId, "alt2", null);
			}
		});
		handleChoiceUpdate(homeCourseId, choiceType, active.id);
		updateSidebarHeight();
	};

	// a function that updates client-side choices and sends a request to the server to update the choices
	const updateChoices = async () => {
		const newChoices = {};
		application?.courseChoices?.forEach((choice) => {
			newChoices[choice.homeCourse.id] = {
				primary: choice.primaryCourse?.id ?? null,
				alt1: choice.alternativeCourse1?.id ?? null,
				alt2: choice.alternativeCourse2?.id ?? null,
			};
		});
		setChoices(newChoices);
		setInitialChoices(newChoices);
		setShowAlert(false);
		console.log("updated initial choices");
	};

	// update choices according to applications.courseChoices at initial page load
	useEffect(() => {
		if (application && !initialChoices) {
			updateChoices();
		}
	}, [application, initialChoices]);

	useEffect(() => {
		// freshly fetched choices from the server
		const freshChoices = {};
		application?.courseChoices?.forEach((choice) => {
			freshChoices[choice.homeCourse.id] = {
				primary: choice.primaryCourse?.id ?? null,
				alt1: choice.alternativeCourse1?.id ?? null,
				alt2: choice.alternativeCourse2?.id ?? null,
			};
		});

		// set every null in choices (clientside var) back to undefined, so that it can be compared to freshChoices
		const tempChoices = {};
		Object.entries(choices).forEach(([homeCourseId, choice]) => {
			tempChoices[homeCourseId] = {
				primary: choice.primary,
				alt1: choice.alt1,
				alt2: choice.alt2,
			};
		});

		if (
			choices !== undefined &&
			initialChoices !== undefined &&
			!_.isEqual(freshChoices, tempChoices) &&
			!_.isEqual(freshChoices, initialChoices) &&
			!_.isEqual(initialChoices, tempChoices)
		) {
			setShowAlert(true);
			console.log(tempChoices);
			console.log(freshChoices);
			console.log(tempChoices !== initialChoices);
			console.log(initialChoices);
		} else {
			// only if there are no unsaved changes, update the choices with the fresh choices
			if (_.isEqual(tempChoices, initialChoices)) {
				updateChoices();
			} else if (
				_.isEqual(tempChoices, freshChoices) &&
				!_.isEqual(tempChoices, initialChoices)
			) {
				updateChoices();
			}
		}
	}, [application?.courseChoices]);
	const updateSidebarHeight = () => {
		if (tableRef.current) {
			const tableHeight = tableRef.current.offsetHeight;
			setSidebarHeight(tableHeight);
			if (sidebarRef?.current) {
				sidebarRef.current.style.height = `${tableHeight}px`;
			}
		}
	};

	useEffect(() => {
		// Update height on initial render
		updateSidebarHeight();

		// Update height on window resize
		window.addEventListener("resize", updateSidebarHeight);

		return () => window.removeEventListener("resize", updateSidebarHeight);
	}, []);

	// fix when routing distrupts sidebar height

	useEffect(() => {
		const handleRouteChange = () => {
			// Delay the height update to wait for DOM rendering
			setTimeout(() => {
				updateSidebarHeight();
			}, 2000); // Adjust the delay as needed
		};

		handleRouteChange(); // Trigger on initial load
	}, [pathname]); // Trigger when the route changes

	// when application load updateSidebarHeight
	useEffect(() => {
		updateSidebarHeight();
	}, [isLoading]);

	// Replace your current saveChanges function with something like this:
	async function saveChanges() {
		try {
			await updateCourseChoices({
				applicationId: application!.id,
				choices: Object.entries(choices).map(([homeCourseId, choice]) => ({
					homeCourseId: parseInt(homeCourseId, 10),
					primaryCourseId: choice.primary ?? null,
					alternativeCourse1Id: choice.alt1 ?? null,
					alternativeCourse2Id: choice.alt2 ?? null,
				})),
				note: note,
			});
			return Promise.resolve();
		} catch (error) {
			console.log("Error saving choices", error);
			return Promise.reject("Failed to save choices");
		}
	}

	// Function to validate choices before submitting
	function validateChoices() {
		// Check if all choices are filled
		console.log("Choices filled:");
		if (Object.keys(choices).length === 0) {
			return false;
		}
		if (
			Object.values(choices).some((choice) => Object.values(choice).length < 3)
		) {
			return false;
		}
		const isChoicesFilled = Object.values(choices).every(
			(choice) =>
				choice.primary !== null && choice.alt1 !== null && choice.alt2 !== null,
		);
		// also check if they are undefined
		if (
			Object.values(choices).some(
				(choice) =>
					choice.primary === undefined ||
					choice.alt1 === undefined ||
					choice.alt2 === undefined,
			)
		) {
			return false;
		}
		// log every choice and their values
		console.log(choices);

		return isChoicesFilled;
	}

	// Function to submit the choices
	const submit = async () => {
		if (await validateChoices()) {
			submitApplication(applicationId);
		} else {
			toast.error("Please fill all choices before submitting");
		}
	};

	async function onSubmit() {
		if (await validateChoices()) {
			// Submit the choices
			toast.promise(
				submit(),
				{
					loading: "Submitting...",
					success: "Application submitted successfully",
					error: (err) => `${err.toString()}`,
				},
				{
					style: {
						minWidth: "250px",
					},
				},
			);
		} else {
			// Show error message
			toast.error("Please fill all choices before submitting");
		}
	}

	const saveDraft = async () => {
		const whatSaved =
			application?.status.toLowerCase() === "draft" ? "Draft" : "Application";
		await toast.promise(
			saveChanges(),
			{
				loading: `Saving ${whatSaved}...`,
				success: `${whatSaved} saved successfully`,
				error: (err) => `${err?.toString() || "Failed to save"}`,
			},
			{
				style: {
					minWidth: "250px",
				},
			},
		);
	};

	if (isLoading || isLoadingAbroadCourses)
		return (
			<Skeleton
				active
				paragraph={{ rows: 5 }}
				title={{ width: "100%" }}
				className="w-full"
			/>
		);

	const tourSteps: TourProps["steps"] = [
		{
			title: "Your Home Courses",
			description: "These are your home courses",
			target: () => ref1.current,
		},
		{
			title: "Available Abroad Courses",
			description:
				"These are the courses available in the abroad university. You may also add a new course",
			target: () => ref2.current,
		},
		{
			title: "Your Choices",
			description: "Drag and drop to select your choices",
			target: () => ref3.current,
		},
		{
			title: "Submit",
			description: "Submit your choices",
			target: () => ref4.current,
		},
	];

	return (
		<DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
			<div className="flex w-full flex-col items-center justify-between gap-2 md:flex-row">
				<div className="div flex items-center gap-1">
					<h2 className="text-xl font-medium">
						{application?.abroadUniversity.name} -{" "}
						{(application && yearToString(application.year)) || "Unknown year"}
						<Tour
							open={tourOpen}
							onClose={() => setTourOpen(false)}
							steps={tourSteps}
						/>
					</h2>
					<Tooltip title="Start Tour">
						<div
							className="flex items-center justify-center"
							onClick={() => setTourOpen(true)}
						>
							<MessageCircleQuestion
								size={24}
								className="size-6 cursor-pointer fill-blue-500 text-blue-200 hover:scale-110 hover:fill-blue-600 hover:text-blue-300"
							/>
						</div>
					</Tooltip>
				</div>
				{application?.user ? (
					/* Co-ordinator is viewing the application */
					<h2>
						{application?.user?.name} -{" "}
						{application?.user?.guid || "GUID not found"}
					</h2>
				) : (
					/* User is the owner of the application */
					<h2>
						{userData.name} - {userData.guid || "GUID not found"}
					</h2>
				)}
				<h2
					className="bg-gray-100 p-2 text-lg font-bold uppercase text-white"
					style={{
						backgroundColor: (application
							? statusColor(application?.status)
							: "#000") as string,
					}}
				>
					{application?.status}
				</h2>
				<div className="flex gap-2">
					{/* Save Draft Button */}
					<Button
						className="cursor-pointer"
						onClick={saveDraft}
						type={"primary"}
						size="large"
						loading={
							// Show loading state if the mutation is in progress
							// utils.choices.saveChoiceChanges.isMutating returns boolean and number
							!updateCourseChoicesMutation.isSuccess &&
							updateCourseChoicesMutation.isPending
						}
					>
						{application?.status === Status.DRAFT
							? "Save Draft"
							: "Update Application"}
					</Button>
					{/* Submit Button */}
					{application?.status.toLocaleLowerCase() !== "submitted" ? (
						<Button
							className="cursor-pointer"
							onClick={onSubmit}
							size="large"
							type={"dashed"}
							loading={
								// Show loading state if the mutation is in progress
								// utils.choices.saveChoiceChanges.isMutating returns boolean and number
								!updateCourseChoicesMutation.isSuccess &&
								updateCourseChoicesMutation.isPending
							}
						>
							Submit
						</Button>
					) : (
						<Button
							className="cursor-pointer"
							onClick={() => withdrawApplication(applicationId)}
							size="large"
							type={"dashed"}
							loading={
								// Show loading state if the mutation is in progress
								// utils.choices.saveChoiceChanges.isMutating returns boolean and number
								!withdrawApplicationMutation.isSuccess &&
								withdrawApplicationMutation.isPending
							}
						>
							Withdraw
						</Button>
					)}
					{/* Co-ordinator Actions Dropdown */}
					{admin && (
						<Dropdown
							menu={{
								items: [
									{
										label: (
											<Tooltip
												title={
													application?.status !== Status.SUBMITTED
														? "You can only approve submitted applications."
														: "This action will approve the application and mark all courses as verified."
												}
											>
												Approve
											</Tooltip>
										),
										key: "approve",
										disabled: application?.status !== Status.SUBMITTED,
										icon: <Verified size={16} />,
										onClick: () => approveApplication(applicationId),
									},
									{
										label: (
											<Tooltip
												title={
													application?.status !== Status.SUBMITTED
														? "You can only ask for revise submitted applications."
														: "This action will reject the application and set the status to revise."
												}
											>
												Ask for Revise
											</Tooltip>
										),
										key: "reject",
										disabled: application?.status !== Status.SUBMITTED,
										icon: <X size={16} />,
										onClick: () => askForReviseApplication(applicationId),
									},
								],
							}}
							trigger={["click"]}
							placement="bottomRight"
							className="cursor-pointer"
						>
							<Button
								className="cursor-pointer"
								size="large"
								type={"text"}
								icon={<ExternalLink size={16} />}
							>
								Actions
							</Button>
						</Dropdown>
					)}
				</div>
			</div>
			<div className="my-2 flex flex-col gap-2">
				{/* Alert for unsaved changes */}
				{!_.isEqual(choices, initialChoices) && (
					<Alert type="warning" showIcon closable message={"Unsaved changes"} />
				)}
				{/* Alert for someone has updated the application */}
				{showAlert && (
					<Alert
						type="error"
						showIcon
						closable
						message={
							<>
								This application has been updated by another user. You have
								unsaved progress. You can lose your changes if you refresh the
								page.
								<p>
									<a
										href={
											admin
												? `/admin/applications/${applicationId}`
												: `/my-choices/${applicationId}`
										}
										className="underline"
										target="_blank"
										rel="noreferrer"
									>
										{" "}
										Click here to see the changes in a new tab without losing
										your changes.
									</a>
								</p>
							</>
						}
					/>
				)}
			</div>
			<div className="flex items-start gap-2">
				<div className="flex-1">
					{/* Table for Home Courses */}
					<div className="flex flex-col space-x-5 md:flex-row">
						{/* Table for Home Courses */}
						<motion.div
							ref={tableRef}
							className="flex h-fit flex-1 flex-col gap-2"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1, transition: { duration: 0.5 } }}
						>
							<Table
								size={"small"}
								className="hidden md:block"
								// @ts-expect-error it just works
								columns={columns}
								dataSource={filteredDataSource.sort((a, b) =>
									a.id > b.id ? 1 : -1,
								)}
								bordered
								pagination={false}
							/>
							{/* Mobile version of the table */}
							<div className="md:hidden">
								<MobileChoicesTable
									choices={
										application?.courseChoices.map((choice) => ({
											homeCourse: choice.homeCourse.name,
											firstChoice: choice.primaryCourse?.name || "No choice",
											secondChoice:
												choice.alternativeCourse1?.name || "No choice",
											thirdChoice:
												choice.alternativeCourse2?.name || "No choice",
										})) || []
									}
								/>
							</div>
						</motion.div>
					</div>
					{currentReq.optionalCourses && (
						<div className="my-2 flex flex-col gap-1">
							<h1 className="text-lg font-medium">Optional Courses</h1>
							<p className="text-sm text-gray-500">
								You can note down any optional courses you want to take in the
								abroad university.
							</p>
							<TextArea
								className="h-full min-h-10"
								defaultValue={application?.note || ""}
								onChange={(e) => {
									setNote(e.target.value);
								}}
							/>
						</div>
					)}
					<CommentSection
						messages={comments}
						applicationId={applicationId}
						user={userData}
						admin={admin || false}
					/>
				</div>
				<AbroadCoursesList
					abroadCourses={abroadCourses}
					application={application}
					removeChoices={removeChoices}
					choices={choices}
					addCourse={addCourse}
					flagCourse={flagCourse}
					sidebarHeight={sidebarHeight}
					sidebarRef={sidebarRef}
				/>
			</div>

			<DragOverlay>
				{activeId ? (
					<DraggedCourse
						title={
							abroadCourses.find((course) => course.id === activeId)?.name ||
							"Unknown"
						}
					/>
				) : null}
			</DragOverlay>
		</DndContext>
	);
}

const DraggedCourse = ({ title }) => {
	return (
		<div className="w-fit cursor-pointer bg-blue-100 px-4 py-2 shadow-lg">
			<h2 className="text-base font-semibold">{title}</h2>
		</div>
	);
};

// Droppable and draggable choice slot
const ChoiceSlot = ({
	id,
	choice,
	course,
	courseName,
	link,
	description,
	onDrop,
	onRemove,
	universityId,
	flagged,
	verified,
}: {
	id: string;
	choice: number;
	course?: Course;
	courseName?: string;
	link?: string;
	description?: string;
	onDrop: (courseId: number) => void;
	onRemove: () => void;
	universityId: number | undefined;
	flagged?: boolean;
	verified?: boolean;
}) => {
	const { isOver, setNodeRef: setDroppableRef } = useDroppable({ id });

	const {
		attributes,
		listeners,
		setNodeRef: setDraggableRef,
		transform,
	} = useDraggable({ id: choice });

	const isDraggable = !!choice;
	const draggableStyle = transform
		? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
		: undefined;

	const combinedRef = useCombinedRefs(setDraggableRef, setDroppableRef);
	const draggableAttributes = isDraggable
		? { ...attributes, ...listeners }
		: {};

	const name = courseName || (choice ? "Deleted course" : "No choice");

	return (
		<div className="">
			{choice && (
				<Tooltip title="Remove choice">
					<Cross1Icon
						color="red"
						className="absolute bottom-0 right-3 top-0 my-auto cursor-pointer hover:scale-110"
						onClick={onRemove}
					/>
				</Tooltip>
			)}

			<CourseInfoPopover course={course}>
				<div
					ref={combinedRef}
					style={isDraggable ? draggableStyle : undefined}
					className={`flex h-full w-full items-center justify-start gap-2 border-dashed p-1 ${
						isOver ? "border-green-500" : "border-gray-300"
					} ${!choice || (choice && isOver) ? "border-2" : ""} ${flagged ? "bg-red-50" : ""} ${verified ? "bg-green-50" : ""}`}
					{...draggableAttributes}
				>
					{flagged && !verified && <FlaggedBadge />}
					{verified && <VerifiedBadge />}
					{choice && name === "Deleted course" && <MissingBadge />}
					<p
						className={`min-w-32 text-wrap ${choice ? "font-regular" : "text-red-500"}`}
					>
						{shortenText(name, 50, false)}
						{isOver ? " (Drop here)" : ""}
					</p>
				</div>
			</CourseInfoPopover>
		</div>
	);
};
