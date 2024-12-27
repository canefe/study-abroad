import {
	BreadcrumbItem,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { capitalizeFirstLetter } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function useBreadcrumbs() {
	const pathname = usePathname();

	function generateBreadcrumb(pathName: string) {
		const formatBreadcrumb = (breadcrumb: string) => {
			return capitalizeFirstLetter(breadcrumb.replace(/-/g, " "));
		};

		const fullUrl = pathName as string;

		if (!fullUrl) {
			return null;
		}
		const paths = pathName.split("/");
		const indexSkip = paths.includes("admin") ? 3 : 2;
		const prefix = paths.includes("admin") ? "admin/" : "dashboard/";

		// custom breadcrumb for My choices page

		if (paths.includes("my-choices")) {
			return (
				<>
					<BreadcrumbItem>
						<Link href={pathname}>My Choices</Link>
					</BreadcrumbItem>
				</>
			);
		}

		if (paths.includes("applications")) {
			return (
				<>
					<BreadcrumbItem>
						<Link href={pathname}>Applications</Link>
					</BreadcrumbItem>
				</>
			);
		}

		if (paths.includes("courses")) {
			return (
				<>
					<BreadcrumbItem>
						<Link href={pathname}>Courses</Link>
					</BreadcrumbItem>
				</>
			);
		}

		// if path is /students/[id] then
		// return breadcrumb as Students > [id] (id is a random number)
		//  use regex for dynamic routes
		if (paths.includes("students")) {
			// check last two elements are Students and a string that is 278551A
			const regex = /students\/[a-zA-Z0-9]+$/;
			const lastElement = paths[paths.length - 1];
			const pathToStudents = paths.slice(0, paths.length - 1).join("/");
			if (regex.test(fullUrl)) {
				return (
					<>
						<BreadcrumbItem>
							<Link href={pathToStudents}>Students</Link>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>{formatBreadcrumb(lastElement)}</BreadcrumbItem>
					</>
				);
			}
		}

		return paths.map((path, index) => {
			if (index < indexSkip) {
				return null;
			}
			return (
				<>
					<BreadcrumbItem key={index}>
						<Link href={`/${prefix}${path}`}>{formatBreadcrumb(path)}</Link>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
				</>
			);
		});
	}

	return generateBreadcrumb(pathname);
}
