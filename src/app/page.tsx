import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function Home() {
	const session = await getServerAuthSession();

	// redirect to /dashboard if user is logged in
	if (session?.user) {
		if (session?.user.role === "ADMIN") {
			redirect("/admin/dashboard");
		}
		redirect("/dashboard");
	} else {
		redirect("/api/auth/signin");
	}

	return (
		<HydrateClient>
			<main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#02466d] to-[#242650] text-white">
				<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
					<h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
						UofG Study Abroad Portal
					</h1>
					<div className="flex flex-col items-center gap-2">
						<div className="flex flex-col items-center justify-center gap-4">
							<p className="text-center text-2xl text-white">
								{session && (
									<span>
										Logged in as {session?.user?.name} {session?.user?.role}
									</span>
								)}
							</p>
							<Link
								href={session ? "/api/auth/signout" : "/api/auth/signin"}
								className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
							>
								{session ? "Sign out" : "Sign in"}
							</Link>
						</div>
					</div>
				</div>
			</main>
		</HydrateClient>
	);
}
