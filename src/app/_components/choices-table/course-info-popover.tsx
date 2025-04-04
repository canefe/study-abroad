import { Popover } from "antd";
import { ExternalLink } from "lucide-react";
import { Course } from "@prisma/client";
import { correctLink } from "@/lib/utils";
export default function CourseInfoPopover({
	course,
	children,
}: {
	course?: Course;
	children: React.ReactNode;
}) {
	if (!course) return <>{children}</>;
	return (
		<Popover
			content={
				<div className="flex flex-col gap-1">
					<p>
						<strong>Course Name</strong>
					</p>
					<p>{course?.name}</p>
					<p>
						<strong>Course Aims</strong>
					</p>
					<p>
						{course?.description || (
							<span className="text-gray-500">No description available</span>
						)}
					</p>
					{course?.flagged && (
						<p className="text-red-500">
							<strong>Flagged:</strong> Yes
						</p>
					)}
					{course?.verified && (
						<p className="text-green-500">
							<strong>Verified:</strong> Yes
						</p>
					)}
					{course?.link ? (
						<a
							className="flex items-center gap-1"
							href={correctLink(course?.link)}
							target="_blank"
							rel="noreferrer"
						>
							<ExternalLink size={16} className="order-last" />
							<strong>Course Link</strong>
						</a>
					) : (
						<p>
							<strong>Course Link:</strong>{" "}
							<span className="text-gray-500">Not available</span>
						</p>
					)}
				</div>
			}
			trigger={"hover"}
			autoAdjustOverflow={true}
			placement="top"
			destroyTooltipOnHide
			className="w-fit"
			overlayInnerStyle={{
				maxHeight: "300px",
				minWidth: "400px",
				maxWidth: "400px",
				overflowY: "auto",
				backgroundColor: "white",
			}}
			style={{ zIndex: 9999 }}
			onOpenChange={() => {}}
		>
			{children}
		</Popover>
	);
}
