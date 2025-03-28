import { redirectToDashboard } from "@/lib/auth";

export default async function Home() {
	const redirect = await redirectToDashboard();

	redirect();

	return null;
}
