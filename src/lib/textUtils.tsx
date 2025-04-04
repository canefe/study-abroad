import { Tooltip } from "antd";

export function shortenText(
	text: string | undefined,
	maxLength: number,
	showTooltip: boolean = true,
) {
	if (!text) {
		return null;
	}
	if (text.length <= maxLength) {
		return text;
	}

	return (
		<Tooltip title={showTooltip && text}>
			<span>{text.slice(0, maxLength)}...</span>
		</Tooltip>
	);
}

export function AutoShortenText({
	text,
	maxChars = 30,
	showTooltip = true,
}: {
	text: string;
	maxChars?: number;
	showTooltip?: boolean;
}) {
	const shouldTruncate = text.length > maxChars;
	const displayText = shouldTruncate ? text.slice(0, maxChars) + "..." : text;

	return (
		<div
			style={{ width: "100%", overflow: "hidden", textOverflow: "ellipsis" }}
		>
			<Tooltip title={showTooltip && shouldTruncate ? text : ""}>
				<span style={{ whiteSpace: "nowrap" }}>{displayText}</span>
			</Tooltip>
		</div>
	);
}
