import crypto from "crypto";
// Function to generate a hash from a string
const generateHash = (input: string) => {
	return crypto.createHash("md5").update(input).digest("hex");
};

// Function to convert a hash to a color
const hashToColor = (hash: string) => {
	return `#${hash.slice(0, 6)}`;
};

// Function to generate a consistent color based on sender and timestamp
export const generateRandomColor = (sender: string, timestamp: string) => {
	const hash = generateHash(`${sender}-${timestamp}`);
	return hashToColor(hash);
};
