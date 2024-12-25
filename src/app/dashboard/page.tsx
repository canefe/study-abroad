"use client";
import { api } from "@/trpc/react";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import {
	Button,
	Popconfirm,
	Select,
	Table,
	Tag,
	Tooltip,
	Tour,
	TourProps,
} from "antd";
import { MessageCircleQuestion } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

export default function Dashboard() {
	const [applications] = api.applications.getList.useSuspenseQuery();
	const [universities] = api.universities.getList.useSuspenseQuery();
	const [selectedUni, setSelectedUni] = useState("");

	const dummyApplications = [
		{
			id: 1,
			abroadUniversity: {
				name: "University of Edinburgh",
			},
			status: "DRAFT",
		},
		{
			id: 2,
			abroadUniversity: {
				name: "University of St Andrews",
			},
			status: "PENDING",
		},
		{
			id: 3,
			abroadUniversity: {
				name: "University of Aberdeen",
			},
			status: "ACCEPTED",
		},
	];

	const utils = api.useUtils();
	const createChoicesApi = api.applications.create.useMutation({
		onSuccess: async () => {
			// refresh courses
			toast.success("Application created successfully");
			await utils.applications.invalidate();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
	const removeChoicesApi = api.applications.remove.useMutation({
		onSuccess: async () => {
			// refresh courses
			await utils.applications.invalidate();
		},
	});

	// remove University of Glasgow (home uni)
	let filteredUniversities = universities?.filter((university) => {
		return university.name !== "University of Glasgow";
	});

	if (!applications || !universities) {
		return <div>Loading...</div>;
	}

	// further filter universities to only show those that are not already chosen
	filteredUniversities = filteredUniversities?.filter((university) => {
		return !applications?.some((application) => {
			return application.abroadUniversityId === university.id;
		});
	});

	function createChoices() {
		// selected uni
		if (selectedUni == "" || selectedUni == "Select a university") {
			toast.error("Please select a university");
			return;
		}

		createChoicesApi.mutate({
			abroadUniversityId: universities.find(
				(university) => university.name === selectedUni,
			).id,
		});
	}

	const removeApplication = async (applicationId: number) => {
		await removeChoicesApi.mutate({
			applicationId: applicationId,
		});
	};

	function removeChoices(applicationId: number) {
		// remove all choices related to the university
		toast.promise(removeApplication(applicationId), {
			loading: "Removing application...",
			success: "Application removed successfully",
			error: "Failed to remove application",
		});
	}

	// Tour
	const ref1 = useRef(null);
	const ref2 = useRef(null);
	const ref3 = useRef(null);
	const ref4 = useRef(null);
	const ref5 = useRef(null);

	const [open, setOpen] = useState<boolean>(false);

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

	return (
		<div>
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
			<div className="flex w-full flex-col gap-2 md:flex-row">
				<Tour open={open} onClose={() => setOpen(false)} steps={steps} />
				<div className="mt-10 flex w-full flex-col gap-2">
					<h2 className="text-xl font-semibold">University Choices</h2>
					<div ref={ref1}>
						{(
							open ? dummyApplications.length === 0 : applications.length === 0
						) ? (
							<p>You have not made any choices yet.</p>
						) : (
							<Table
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
													href={"/dashboard/my-choices/" + record.id}
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
											<Tag
												ref={ref3}
												color={
													record.status === "DRAFT"
														? "blue"
														: record.status === "PENDING"
															? "orange"
															: record.status === "ACCEPTED"
																? "green"
																: "red"
												}
											>
												{record.status}
											</Tag>
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
														removeChoices(record.id);
													}}
													okText="Yes"
													cancelText="No"
												>
													<Button
														loading={removeChoicesApi.isPending}
														ref={ref4}
														type="primary"
														danger
													>
														Remove
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
					{open || applications.length < 3 ? (
						<div
							ref={ref5}
							className="flex flex-col items-start gap-3 md:w-2/3"
						>
							<p>
								You can make up to 3 choices. You have made{" "}
								{applications.length} choices.
							</p>
							<Select
								showSearch
								defaultValue={"Select a university"}
								className="w-full"
								filterOption={(input, option) =>
									String(option?.value ?? "")
										.toLowerCase()
										.includes(input.toLowerCase())
								}
								onSelect={(value) => {
									setSelectedUni(value);
								}}
							>
								{filteredUniversities?.map((university) => (
									<Select.Option key={university.id} value={university.name}>
										{university.name}
									</Select.Option>
								))}
							</Select>
							<Button onClick={createChoices}>Create new Choices</Button>
						</div>
					) : (
						<p>You have made the maximum number of choices.</p>
					)}
				</div>
				<div className="mt-10 flex w-full flex-col gap-2">
					<h2 className="text-xl font-semibold">Latest Announcements</h2>
					{[1, 2, 3].map((feedback) => (
						<div
							key={feedback}
							className="flex flex-col gap-2 rounded-md bg-slate-100 p-3"
						>
							<p className="font-semibold">Feedback {feedback}</p>
							<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
