import Link from "next/link";

const NOTIFICATION_TYPES = {
	NEW_MESSAGE_IN_APPLICATION: "NEW_MESSAGE_IN_APPLICATION",
	NEW_FEEDBACK_IN_APPLICATION: "NEW_FEEDBACK_IN_APPLICATION",
};

type Notification = {
	id: number;
	message: string;
	createdAt: Date;
	userId: string;
	read: boolean;
	senderId: string | null;
	sender: {
		name: string | null;
	} | null;
};

export const parseNotificationMessage = (n: Notification) => {
	// n.message=NEW_MESSAGE_IN_APPLICATION_1 -> senderName sent a new message in application 1
	// string into two halves, where end _[int] is seperated
	const [type, id] = n.message.split(/_(?=\d+$)/);
	const senderName = n.sender?.name || "Someone";

	switch (type) {
		case NOTIFICATION_TYPES.NEW_MESSAGE_IN_APPLICATION:
			return (
				<>
					<b>{senderName}</b> sent a new message in{" "}
					<Link className="text-blue-500" href={`/admin/applications/${id}`}>
						Application #{id}
					</Link>
				</>
			);
		case NOTIFICATION_TYPES.NEW_FEEDBACK_IN_APPLICATION:
			return (
				<>
					<b>{senderName}</b> sent a new feedback in{" "}
					<Link className="text-blue-500" href={`/my-choices/${id}`}>
						Application #{id}
					</Link>
				</>
			);
		default:
			return "Unknown notification";
	}
};
