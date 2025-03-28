// src/types/next-auth.d.ts
import { Session } from "next-auth";

// Re-export the extended session type
export type UserSession = Session & {
	user: {
		id: string;
		role: "ADMIN" | "STUDENT";
		guid: string;
		name?: string | null;
		email?: string | null;
		image?: string | null;
	};
};
