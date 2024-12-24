import Link from "next/link";

export const parseNotificationMessage = (message: string) => {
	const regex = /\[link=(.*?)\](.*?)\[\/link\]/g;
	const parts = [];
	let lastIndex = 0;
	let match;

	// if the notification has [link=...] tags, parse them
	while ((match = regex.exec(message)) !== null) {
		const [fullMatch, url, text] = match;
		const index = match.index;

		if (index > lastIndex) {
			parts.push(message.slice(lastIndex, index));
		}

		parts.push(
			<Link className="text-blue-500" key={index} href={url || ""}>
				{text}
			</Link>,
		);

		lastIndex = index + fullMatch.length;
	}

	// Add remaining text after the last link
	if (lastIndex < message.length) {
		parts.push(message.slice(lastIndex));
	}

	return parts;
};
