import { Tooltip } from "antd";

export function shortenText(text: string | undefined, maxLength: number) {
	if (!text) {
		return null;
	}
	if (text.length <= maxLength) {
		return text;
	}

	return (
		<Tooltip title={text}>
			<span>{text.slice(0, maxLength)}...</span>
		</Tooltip>
	);
}
