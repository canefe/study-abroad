"use client";
import { api } from "@/trpc/react";
import {
	Avatar,
	Button,
	FloatButton,
	Popconfirm,
	Skeleton,
	Spin,
	Table,
	Tag,
	Tooltip,
} from "antd";
import {
	DndContext,
	DragEndEvent,
	DragOverlay,
	useDraggable,
	useDroppable,
} from "@dnd-kit/core";
import { useEffect, useRef, useState } from "react";
import { getCourseNameById, useCombinedRefs } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter, usePathname } from "next/navigation";
import {
	Cross,
	FileWarning,
	FlagIcon,
	FlagOff,
	Trash,
	Verified,
} from "lucide-react";
import { Cross1Icon } from "@radix-ui/react-icons";
import dayjs from "dayjs";
import CommentSection from "@/app/_components/comment-section";
import MobileChoicesTable from "../mobile-choices-table";
import VerifiedBadge from "./verified-badge";
import { shortenText } from "@/lib/textUtils";
import MissingBadge from "./missing-badge";

export default function ChoicesTable({
	applicationId,
	admin,
}: {
	applicationId: number;
	admin?: boolean;
}) {
	const application = admin
		? api.applications.getAdmin.useQuery(
				{ applicationId },
				{
					refetchOnWindowFocus: true,
					refetchInterval: 10000,
				},
			)
		: api.applications.get.useQuery(
				{
					applicationId: applicationId,
				},
				{
					refetchOnWindowFocus: true,
					refetchInterval: 10000,
				},
			);
	const applicationData = application.data;
	const user = api.students.me.useQuery();
	const userData = user.data || [];
	const submitApplicationApi = api.applications.submit.useMutation({
		onSuccess: async () => {
			// refresh courses
			await utils.applications.invalidate();
		},
	});
	const withdrawApplicationApi = api.applications.withdraw.useMutation({
		onSuccess: async () => {
			// refresh courses
			await utils.applications.invalidate();
		},
	});
	const addNewCourseApi = api.courses.addCourse.useMutation({
		onSuccess: async () => {
			// refresh courses
			await utils.courses.invalidate();
		},
	});
	const sendCommentApi = api.applications.comment.useMutation({
		onSuccess: async () => {
			// refresh courses
			await utils.applications.invalidate();
		},
	});
	const flagCourseApi = api.courses.flagCourse.useMutation({
		onSuccess: async () => {
			// refresh courses
			await utils.courses.invalidate();
		},
	});
	const abroadCoursesQuery = api.courses.getCourses.useQuery(
		{
			id: application.data?.abroadUniversityId || 0,
		},
		{
			refetchInterval: 10000,
		},
	);
	const [sidebarHeight, setSidebarHeight] = useState("auto"); // Sidebar height state
	const tableRef = useRef(null); // Reference to the table
	const [activeId, setActiveId] = useState(null);
	const pathname = usePathname();
	const [agreedToTerms, setAgreedToTerms] = useState(false); // State to track if the user has agreed to the terms of course creation to avoid multiple popups

	const utils = api.useUtils();
	const saveChoicesApi = api.choices.saveChoiceChanges.useMutation({
		onSuccess: async () => {
			// refresh courses
			await utils.courses.invalidate();
		},
		onError: (error) => {
			return Promise.reject(error);
		},
	});

	const handleDragStart = (event) => {
		setActiveId(event.active.id);
	};

	const [choices, setChoices] = useState({}); // Tracks the selected choices for each home course
	const [initialEffectRun, setInitialEffectRun] = useState(false); // this is to fix unsaved changes going away on application data refreshes
	const abroadCourses = abroadCoursesQuery.data || [];
	// Prepare the table data

	const dataSource =
		application.data?.courseChoices.map((choice) => ({
			id: choice.homeCourse.id,
			homeCourse: choice.homeCourse.name,
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
			render: (text, record) => <p className="font-semibold">{text}</p>,
		},
		...["1st Choice", "2nd Choice", "3rd Choice"].map((title, idx) => ({
			title,
			key: title.toLowerCase().replace(" ", ""),
			render: (_, record) => {
				const choiceType = ["primary", "alt1", "alt2"][idx];
				return (
					<ChoiceSlot
						id={`${record.id}-${choiceType}`}
						key={`${record.id}-${choiceType}`}
						choice={choices[record.id]?.[choiceType]}
						onDrop={(courseId) => {
							// check all choices to see if the course is already selected and remove it if it is
							console.log("Dropping choice", record.id, choiceType, courseId);
							handleChoiceUpdate(record.id, choiceType, courseId);
						}}
						onRemove={() => {
							console.log("Removing choice", record.id, choiceType);
							removeChoices(record.id, choiceType);
						}}
						universityId={application.data?.abroadUniversityId}
						flagged={
							abroadCourses.find(
								(course) => course.id === choices[record.id]?.[choiceType],
							)?.flagged
						}
						verified={
							abroadCourses.find(
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
				...prev[homeCourseId],
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

	// Filter out courses that are already selected
	const selectedCourseIds = new Set(
		Object.values(choices).flatMap((choice) => Object.values(choice) || []),
	);
	const availableAbroadCourses = abroadCourses.filter(
		(course) => !selectedCourseIds.has(course.id),
	);

	// update choices according to applications.courseChoices
	useEffect(() => {
		if (applicationData && !initialEffectRun) {
			const newChoices = {};
			applicationData.courseChoices?.forEach((choice) => {
				newChoices[choice.homeCourse.id] = {
					primary: choice.primaryCourse?.id,
					alt1: choice.alternativeCourse1?.id,
					alt2: choice.alternativeCourse2?.id,
				};
			});
			setChoices(newChoices);
			setInitialEffectRun(true);
		}
	}, [applicationData, initialEffectRun]);

	const updateSidebarHeight = () => {
		if (tableRef.current) {
			const tableHeight = tableRef.current.offsetHeight;
			setSidebarHeight(`${tableHeight}px`);
			console.log("Sidebar height updated to", tableHeight);
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
	}, [application.isLoading]);

	// save changed
	async function saveChanges() {
		// for every choices, mutate
		try {
			// list of promises
			const promises: Promise<void>[] = [];
			await Object.entries(choices).forEach(([homeCourseId, choice]) => {
				if (application.data) {
					promises.push(
						saveChoicesApi.mutateAsync({
							homeCourseId: parseInt(homeCourseId),
							abroadUniversityId: application.data.abroadUniversityId,
							primaryCourseId: (choice as any).primary,
							alternativeCourse1Id: (choice as any).alt1,
							alternativeCourse2Id: (choice as any).alt2,
						}),
					);
				}
			});
			// wait for all promises to resolve check if there is an error
			await Promise.all(promises);
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
			submitApplicationApi.mutate({
				applicationId: applicationId,
			});
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
					loading: "Saving changes...",
					success: "Changes saved successfully",
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

	const withdraw = async () => {
		withdrawApplicationApi.mutate({
			applicationId: applicationId,
		});
	};

	async function onWithdraw() {
		toast.promise(
			withdraw(),
			{
				loading: "Withdrawing...",
				success: "Withdrawn successfully",
				error: "Failed to withdraw",
			},
			{
				style: {
					minWidth: "250px",
				},
			},
		);
	}

	const saveDraft = async () => {
		const whatSaved =
			application.data?.status.toLowerCase() === "draft"
				? "Draft"
				: "Application";
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

	if (application.isLoading || abroadCoursesQuery.isLoading)
		return (
			<Skeleton
				active
				paragraph={{ rows: 5 }}
				title={{ width: "100%" }}
				className="w-full"
			/>
		);

	const onSend = async () => {
		//send feedback

		await sendCommentApi.mutateAsync({
			applicationId: applicationId,
			comment: "Feedback sent",
		});
	};

	const onAddCourse = async (name: string) => {
		//add course
		if (!name) {
			return Promise.reject("Course name is required");
		}
		if (abroadCourses.find((course) => course.name === name)) {
			return Promise.reject("Course already exists");
		}
		if (!application.data?.abroadUniversityId) {
			return Promise.reject("University not found");
		}
		await addNewCourseApi.mutateAsync({
			abroadUniversityId: application.data?.abroadUniversityId,
			name: name,
		});
	};

	const onFlagCourse = async (id: number) => {
		try {
			await flagCourseApi.mutateAsync({
				id: id,
			});
		} catch (error) {
			toast.error("Failed to flag course");
		}
	};

	return (
		<DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
			<div className="flex w-full flex-col items-center justify-between gap-2 md:flex-row">
				<h2 className="text-xl font-medium">
					{application.data?.abroadUniversity.name}
				</h2>
				<h2
					className="bg-gray-100 p-2 text-lg font-bold uppercase text-white"
					style={{
						backgroundColor:
							application.data?.status.toLocaleLowerCase() === "draft"
								? "#f6e05e"
								: application.data?.status.toLocaleLowerCase() === "submitted"
									? "#3182ce"
									: application.data?.status.toLocaleLowerCase() === "approved"
										? "#38a169"
										: "#e53e3e",
					}}
				>
					{application.data?.status}
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
							!saveChoicesApi.isSuccess && saveChoicesApi.isPending
						}
					>
						{application.data?.status.toLowerCase() === "draft"
							? "Save Draft"
							: "Update Application"}
					</Button>
					{/* Submit Button */}
					{application.data?.status.toLocaleLowerCase() !== "submitted" ? (
						<Button
							className="cursor-pointer"
							onClick={onSubmit}
							size="large"
							type={"dashed"}
							loading={
								// Show loading state if the mutation is in progress
								// utils.choices.saveChoiceChanges.isMutating returns boolean and number
								!saveChoicesApi.isSuccess && saveChoicesApi.isPending
							}
						>
							Submit
						</Button>
					) : (
						<Button
							className="cursor-pointer text-white"
							onClick={onWithdraw}
							size="large"
							type={"primary"}
							loading={
								// Show loading state if the mutation is in progress
								// utils.choices.saveChoiceChanges.isMutating returns boolean and number
								!withdrawApplicationApi.isSuccess &&
								withdrawApplicationApi.isPending
							}
						>
							Withdraw
						</Button>
					)}
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
							const name = prompt("Enter course name", "Course Name");
							if (name !== null) {
								if (!agreedToTerms) {
									setAgreedToTerms(true);
								}
								toast.promise(
									onAddCourse(name),
									{
										loading: "Adding course...",
										success: "Course added successfully",
										error: (err) => `${err.toString()}`,
									},
									{
										style: {
											minWidth: "250px",
										},
									},
								);
							}
						}}
						okText="I accept"
						cancelText="Cancel"
						placement="top"
					>
						<Button
							onClick={() => {
								if (!agreedToTerms) {
									return;
								}
								const name = prompt("Enter course name", "Course Name");
								if (name !== null) {
									toast.promise(
										onAddCourse(name),
										{
											loading: "Adding course...",
											success: "Course added successfully",
											error: (err) => `${err.toString()}`,
										},
										{
											style: {
												minWidth: "250px",
											},
										},
									);
								}
							}}
							className="cursor-pointer"
							size="large"
						>
							Add Course
						</Button>
					</Popconfirm>
				</div>
			</div>
			<div className="mt-4 flex flex-col space-x-5 md:flex-row">
				{/* Table for Home Courses */}
				<div ref={tableRef} className="h-fit flex-1">
					<Table
						size={"small"}
						className="hidden md:block"
						columns={columns}
						dataSource={filteredDataSource.sort((a, b) =>
							a.id > b.id ? 1 : -1,
						)}
						loading={application.isLoading || abroadCoursesQuery.isLoading}
						bordered
						pagination={false}
					/>
					{/* Mobile version of the table */}
					<div className="md:hidden">
						<MobileChoicesTable
							choices={
								application.data?.courseChoices.map((choice) => ({
									homeCourse: choice.homeCourse.name,
									firstChoice: choice.primaryCourse?.name || "No choice",
									secondChoice: choice.alternativeCourse1?.name || "No choice",
									thirdChoice: choice.alternativeCourse2?.name || "No choice",
								})) || []
							}
						/>
					</div>
				</div>
				{/* Sidebar for Available Courses */}
				<div>
					<div
						className="relative !z-0 w-52 overflow-auto rounded bg-gray-50 p-3"
						style={{ height: sidebarHeight }}
					>
						<div className="grid grid-cols-1 gap-2">
							{availableAbroadCourses.length === 0 && (
								<ul className="w-fit list-inside text-sm text-gray-500">
									<li>No courses available</li>
									<li>You can add a new course</li>
								</ul>
							)}
							{availableAbroadCourses.map((course) => (
								<div className="flex items-center gap-2">
									<DraggableCourse
										key={course.id}
										id={course.id}
										title={course.name}
										university={course.university.name}
										flagged={course.flagged}
										verified={course.verified}
									/>
									{course.flagged === false && !course.verified && (
										<Popconfirm
											title="Are you sure to flag this course?"
											description={
												<>
													<p>
														Please flag the course if it is unrelated to the
														university or if it is a mistake.
													</p>
												</>
											}
											onConfirm={() => {
												onFlagCourse(course.id);
											}}
											okText="Yes"
											cancelText="No"
										>
											<FlagIcon
												size={16}
												fill="#ef4444"
												className="w-fit cursor-pointer text-red-500 hover:text-red-700"
											/>
										</Popconfirm>
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
			<CommentSection
				messages={application.data?.messages}
				onSend={onSend}
				applicationId={applicationId}
				user={userData}
				admin={admin || false}
			/>
			<DragOverlay>
				{activeId ? (
					<DraggedCourse
						id={activeId}
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
		<div className="w-fit cursor-pointer bg-blue-100 p-5 shadow-lg">
			<h2 className="text-xl font-semibold">{title}</h2>
		</div>
	);
};

// Droppable and draggable choice slot
const ChoiceSlot = ({
	id,
	choice,
	onDrop,
	onRemove,
	universityId,
	flagged,
	verified,
}: {
	id: string;
	choice: number;
	onDrop: (courseId: number) => void;
	onRemove: () => void;
	universityId: number;
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

	const name =
		getCourseNameById(choice, universityId) ||
		(choice ? "Deleted course" : "No choice");

	return (
		<>
			{choice && (
				<Tooltip title="Remove choice">
					<Cross1Icon
						color="black"
						className="absolute right-0 top-0 cursor-pointer hover:scale-110"
						onClick={onRemove}
					/>
				</Tooltip>
			)}
			<div
				ref={combinedRef}
				style={isDraggable ? draggableStyle : undefined}
				className={`flex h-full w-full items-center justify-start gap-2 border-dashed p-1 ${
					isOver ? "border-green-500" : "border-gray-300"
				} ${!choice || (choice && isOver) ? "border-2" : ""}`}
				{...draggableAttributes}
			>
				<p
					className={`min-w-32 text-wrap ${choice ? "font-regular" : "text-red-500"}`}
				>
					{shortenText(name, 15)}
					{isOver ? " (Drop here)" : ""}
				</p>
				{flagged && !verified && (
					<FlagIcon
						size={16}
						className="w-fit cursor-pointer fill-red-500 text-red-500"
					/>
				)}
				{verified && <VerifiedBadge />}
				{choice && name === "Deleted course" && <MissingBadge />}
			</div>
		</>
	);
};

// Draggable course box
const DraggableCourse = ({
	id,
	title,
	university,
	flagged,
	verified,
}: {
	id: number;
	title: string;
	university: string;
	flagged: boolean;
	verified: boolean;
}) => {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id,
	});

	const style = transform
		? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
		: undefined;

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
			key={id}
			className="w-full flex-1 cursor-pointer bg-gray-200 p-3 hover:bg-blue-100"
		>
			<div className="flex items-center gap-2">
				<h2 className="text-sm font-semibold">{title}</h2>
				{flagged && !verified && (
					<Tooltip
						title={
							<div>
								<p className="font-semibold">Flagged</p>
								<ul className="list-inside list-disc">
									<li className="text-xs">
										This course has been flagged by a student.
									</li>
									<li className="text-xs">
										It could be an outdated course or a mistake.
									</li>
								</ul>
							</div>
						}
					>
						<div className="text-xs text-red-500">
							<FlagIcon className="fill-red-500 text-red-600" size={16} />
						</div>
					</Tooltip>
				)}
				{verified && <VerifiedBadge />}
			</div>
		</div>
	);
};
