import "@/styles/globals.css";
import "antd/dist/reset.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { AntdRegistry } from "./_components/style-provider";

export const metadata: Metadata = {
	title: "UofG | Study Abroad Portal",
	description: "Study Abroad Portal for University of Glasgow",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${GeistSans.variable}`}>
			<body>
				<AntdRegistry>
					<TRPCReactProvider>{children}</TRPCReactProvider>
				</AntdRegistry>
			</body>
		</html>
	);
}
