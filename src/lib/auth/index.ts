// A server-side only library for handling authentication and role based routing.

import { getServerAuthSession } from "@/server/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

const DASHBOARD_ROUTES = {
	ADMIN: "/admin/dashboard",
	STUDENT: "/dashboard",
};

export async function authenticateUser() {
	const session = await getServerAuthSession();

	// Redirect to the login page if the user is not logged in
	if (!session?.user) {
		redirect("/api/auth/signin");
	}

	return session;
}

export async function authorizeRole(requiredRole: Role) {
	const session = await authenticateUser();

	// Check if the user has the required role
	if (session.user.role !== requiredRole) {
		// Redirect to the dashboard based on the user's role
		return redirectToDashboard(session.user.role);
	}
	return session;
}

export async function redirectToDashboard(role?: Role) {
	// If no role provided, attempt to get the user's role
	if (!role) {
		const session = await authenticateUser();
		role = session.user.role;
	}
	console.log(role);

	// Redirect to the respective dashboard based on role
	const dashboardRoute = DASHBOARD_ROUTES[role];

	return () => redirect(dashboardRoute);
}
