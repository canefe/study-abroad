"use client";
import { useApplication } from "@/hooks/useApplication";
import { useSettings } from "@/hooks/useSettings";
import { parseNotificationMessage } from "@/lib/notificationUtils";
import { statusColor } from "@/lib/randomUtils";
import { shortenText } from "@/lib/textUtils";
import { yearToString } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Year } from "@prisma/client";
import {
	Button,
	Checkbox,
	Popconfirm,
	Select,
	Skeleton,
	Table,
	Tag,
	Tooltip,
	Tour,
	TourProps,
} from "antd";
import dayjs from "dayjs";
import { MessageCircleQuestion, Trash } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import CreateApplicationForm from "./_sections/create-application-form";

export default function Dashboard() {
	const [applications] = api.applications.getList.useSuspenseQuery();
	const [universities] = api.universities.getList.useSuspenseQuery();
	const [notifications] = api.notifications.getList.useSuspenseQuery(void 0, {
		refetchInterval: 5000,
	});

	// Tour
	const ref1 = useRef(null);
	const ref2 = useRef(null);
	const ref3 = useRef(null);
	const ref4 = useRef(null);
	const ref5 = useRef(null);

	const [open, setOpen] = useState<boolean>(false);

	const {
		createApplication,
		createApplicationMutation,
		removeApplication,
		removeApplicationMutation,
	} = useApplication({});

	const { getSetting } = useSettings();

	const homeUniversity = getSetting("home_university")?.value;

	const deadline = getSetting("deadline_date")?.value;

	const maxApplications = getSetting("max_applications")?.value || 3;

	const dummyApplications = [
		{
			id: 1,
			abroadUniversity: {
				name: "University of Melbourne",
				id: 1,
				location: "Melbourne, Australia",
			},
			status: "DRAFT",
			year: "SECOND_YEAR_SINGLE_FULL_YEAR",
			courseChoices: [],
		},
		{
			id: 2,
			abroadUniversity: {
				name: "University of Ottawa",
				id: 2,
				location: "Ottawa, Canada",
			},
			status: "SUBMITTED",
			year: "SECOND_YEAR_SINGLE_FULL_YEAR",
			courseChoices: [],
		},
		{
			id: 3,
			abroadUniversity: {
				name: "University of Helsinki",
				id: 3,
				location: "Helsinki, Finland",
			},
			status: "REVISE",
			year: "SECOND_YEAR_SINGLE_FULL_YEAR",
			courseChoices: [],
		},
	];

	// remove (home uni)
	let filteredUniversities = universities?.filter((university) => {
		return university.id !== parseInt(homeUniversity || "0");
	});

	if (!applications || !universities || !homeUniversity) {
		return <Skeleton active />;
	}

	// further filter universities to only show those that are not already chosen
	filteredUniversities = filteredUniversities?.filter((university) => {
		return !applications?.some((application) => {
			return application.abroadUniversityId === university.id;
		});
	});

	const steps: TourProps["steps"] = [
		{
			title: "Your University Applications",
			description: "You can view your existing university applications here.",
			target: () => ref1.current,
		},
		{
			title: "My Choices Page",
			description: (
				<>
					To access course-matching page, click the name of the university in
					your application section. <b>Do not click</b> now.
				</>
			),
			target: () => ref2.current,
		},
		{
			title: "Status of the Application",
			description: "This row shows the status of your applications.",
			target: () => ref3.current,
		},
		{
			title: "Delete Applications",
			description:
				"You can delete your applications by clicking the remove button.",
			target: () => ref4.current,
		},
		{
			title: "Create new Application",
			description:
				"You can create new applications by selecting a university from the dropdown.",
			target: () => ref5.current,
		},
	];

	const statusDescription = (status: string) => {
		switch (status) {
			case "DRAFT":
				return "Your application is saved as a draft and has not been submitted for review.";
			case "SUBMITTED":
				return "Your application has been submitted for review.";
			case "APPROVED":
				return "Your application has been approved";
			case "REVISE":
				return "Your application has been reviewed and needs to be revised.";
			default:
				return "Unknown status";
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex gap-2">
				<h1 className="text-3xl font-semibold">Dashboard</h1>
				<Tooltip title="Start Tour">
					<div onClick={() => setOpen(true)}>
						<MessageCircleQuestion
							size={32}
							className="cursor-pointer fill-blue-500 text-blue-200 hover:scale-110 hover:fill-blue-600 hover:text-blue-300"
						/>
					</div>
				</Tooltip>
			</div>
			<h2 className="text-xl font-medium text-red-600">
				⏰ Deadline for applications{" "}
				<Tooltip title={dayjs(deadline).format("DD/MM/YYYY")}>
					{dayjs(deadline).fromNow()}
				</Tooltip>
			</h2>
			<div className="flex w-full flex-col gap-2 md:flex-row">
				<Tour open={open} onClose={() => setOpen(false)} steps={steps} />
				<div className="flex w-full flex-col gap-2">
					<h2 className="text-xl font-semibold">Applications</h2>
					<div ref={ref1}>
						{(
							open ? dummyApplications.length === 0 : applications.length === 0
						) ? (
							<p className="text-gray-500">
								You have not made any applications yet.
							</p>
						) : (
							<Table
								//@ts-expect-error can't create dummyApplications
								dataSource={open ? dummyApplications : applications}
								size={"small"}
								pagination={false}
								columns={[
									{
										title: "#",
										dataIndex: "id",
										key: "id",
										render: (text, record) => (
											<span className="text-gray-400">{record.id}</span>
										),
									},
									{
										title: "University",
										dataIndex: ["abroadUniversity", "name"],
										key: "abroadUniversityname",
										render: (text, record) => (
											<Tooltip title="View Course Matching">
												<Link
													href={"/my-choices/" + record.id}
													ref={ref2}
													onClick={() => {
														if (open) {
															return;
														}
													}}
													className="w-fit bg-slate-100 p-1 hover:bg-slate-200"
												>
													{record.abroadUniversity.name}
												</Link>
											</Tooltip>
										),
									},
									{
										title: "Status",
										dataIndex: "status",
										key: "status",
										render: (text, record) => (
											<Tooltip title={statusDescription(record.status)}>
												<Tag ref={ref3} color={statusColor(record.status)}>
													{record.status}
												</Tag>
											</Tooltip>
										),
									},
									{
										title: "Year",
										dataIndex: "year",
										key: "year",
										render: (text, record) => (
											<div>
												<span className="block xl:hidden">
													{shortenText(yearToString(record.year as Year), 15)}
												</span>
												<span className="hidden xl:block">
													{yearToString(record.year as Year)}
												</span>
											</div>
										),
									},
									{
										title: "Action",
										key: "action",
										render: (text, record) => (
											<Tooltip title="Remove Application">
												<Popconfirm
													title={
														<>
															Are you sure you want to remove this application?
															<p className="font-semibold">
																This action cannot be undone.
															</p>
														</>
													}
													onConfirm={() => {
														if (open) {
															return;
														}
														removeApplication(record.id);
													}}
													okText="Yes"
													cancelText="No"
												>
													<Button
														loading={removeApplicationMutation.isPending}
														ref={ref4}
														type={"text"}
														danger
													>
														<Trash size={16} />
													</Button>
												</Popconfirm>
											</Tooltip>
										),
									},
								]}
							/>
						)}
					</div>
					<div className="my-5 border-b-2 border-t-2 border-gray-200"></div>
					{!deadline || dayjs().isAfter(dayjs(deadline)) ? (
						<p className="text-red-500">
							Due to the deadline being passed, you can no longer create new
							applications.
						</p>
					) : (
						<div ref={ref5} className="flex flex-col items-start gap-3">
							<h2 className="text-xl font-semibold">
								Create a new application
							</h2>
							<p>
								You can make up to {maxApplications} choices. You have made{" "}
								{applications.length} choices.
							</p>
							{open || applications.length < maxApplications ? (
								<CreateApplicationForm
									filteredUniversities={filteredUniversities}
									createApplication={createApplication}
									isPending={createApplicationMutation.isPending}
								/>
							) : (
								<p>You have made the maximum number of choices.</p>
							)}
						</div>
					)}
				</div>
				<div className="flex w-full flex-col gap-2">
					<h2 className="text-xl font-semibold">Latest Notifications</h2>
					{notifications.length === 0 && (
						<p className="text-gray-500">No notifications</p>
					)}
					{notifications.map((notification) => (
						<div
							key={notification.id}
							className="flex flex-col gap-2 rounded-md bg-slate-100 p-3"
						>
							<p className="font-semibold"></p>
							<p>{parseNotificationMessage(notification)}</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
