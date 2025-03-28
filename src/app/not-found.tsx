import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";

export default async function NotFound() {
	const session = await getServerAuthSession();

	// Redirect based on authentication status and role
	if (session?.user) {
		if (session.user.role === "ADMIN") {
			redirect("/admin/dashboard");
		} else {
			redirect("/dashboard");
		}
	} else {
		redirect("/api/auth/signin");
	}

	return null;
}
