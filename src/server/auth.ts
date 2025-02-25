import { PrismaAdapter } from "@auth/prisma-adapter";
import {
	getServerSession,
	type DefaultSession,
	type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import DiscordProvider from "next-auth/providers/discord";

import { env } from "@/env";
import { db } from "@/server/db";
import Credentials from "next-auth/providers/credentials";
import { User } from "@prisma/client";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
			// ...other properties
			// role: UserRole;
			role: "ADMIN" | "STUDENT";
			guid: string;
		} & DefaultSession["user"];
	}

	interface User {
		//   // ...other properties
		//   // role: UserRole;
		role: "ADMIN" | "STUDENT";
		guid: string;
	}
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
	session: {
		strategy: "jwt",
	},
	callbacks: {
		async jwt({ token, user }) {
			// When a user logs in for the first time, add their data to the token
			if (user) {
				token.id = user.id;
				token.role = user.role;
				token.guid = user.guid;
			}
			return token;
		},
		session: ({ session, token }) => ({
			...session,
			user: {
				...session.user,
				id: token.id,
				role: token.role,
				guid: token.guid,
			},
		}),
	},
	adapter: PrismaAdapter(db) as Adapter,
	providers: [
		DiscordProvider({
			clientId: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET,
		}),
		Credentials({
			// You can specify which fields should be submitted, by adding keys to the `credentials` object.
			// e.g. domain, username, password, 2FA token, etc.
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			authorize: async (credentials, req) => {
				console.log("Authorizing user");
				let user: User | null = null;
				// Get user from your database
				user = await db.user.findFirst({
					where: {
						email: credentials?.email,
					},
				});

				if (!user) {
					console.log("User not found");
					return null;
				}

				if (user.role !== "ADMIN" && user.role !== "STUDENT") {
					console.log("Invalid role");
					return null;
				}

				console.log("User found");
				console.log(user);

				return {
					...user,
					role: user.role as "ADMIN" | "STUDENT",
					guid: user.guid as string,
				};
			},
		}),

		/**
		 * ...add more providers here.
		 *
		 * Most other providers require a bit more work than the Discord provider. For example, the
		 * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
		 * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
		 *
		 * @see https://next-auth.js.org/providers/github
		 */
	],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
