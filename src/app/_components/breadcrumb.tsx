"use client";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
	const pathname = usePathname();

	const admin = pathname.includes("admin");

	const homePath = admin ? "/admin/dashboard" : "/dashboard";

	const breadcrumbs = useBreadcrumbs();

	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem key="homess">
					<Link href={homePath}>Home</Link>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
			</BreadcrumbList>
		</Breadcrumb>
	);
}
