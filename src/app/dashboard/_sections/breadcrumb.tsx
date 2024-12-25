"use client";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
	const pathname = usePathname();

	const breadcrumbs = useBreadcrumbs();

	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<Link href="/">Home</Link>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				{breadcrumbs}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
