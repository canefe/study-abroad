import { BreadcrumbItem } from "@/components/ui/breadcrumb";
import { api } from "@/trpc/react";
import { clsx, type ClassValue } from "clsx";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { useCallback } from "react";
import { Year } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const capitalizeFirstLetter = (string: string) => {
	return string.charAt(0).toUpperCase() + string.slice(1);
};

export const getCourseNameById = (id: number, universityId: number) => {
	const course = api.courses.getCourses.useQuery({ universityId });

	return course.data?.find((course) => course.id === id)?.name;
};

// Year Enum to string
export const yearToString = (year: Year) => {
	switch (year) {
		case Year.SECOND_YEAR_SINGLE_FULL_YEAR:
			return "2nd Year Single Honours (Full Year)";
		case Year.SECOND_YEAR_JOINT_FULL_YEAR:
			return "2nd Year Joint Honours (Full Year)";
		case Year.SECOND_YEAR_SINGLE_FIRST_SEMESTER:
			return "2nd Year Single Honours (Semester 1)";
		case Year.SECOND_YEAR_JOINT_FIRST_SEMESTER:
			return "2nd Year Joint Honours (Semester 1)";
		case Year.SECOND_YEAR_SINGLE_SECOND_SEMESTER:
			return "2nd Year Single Honours (Semester 2)";
		case Year.SECOND_YEAR_JOINT_SECOND_SEMESTER:
			return "2nd Year Joint Honours (Semester 2)";
		case Year.THIRD_YEAR_SINGLE_FULL_YEAR:
			return "3rd Year Single Honours (Full Year)";
		case Year.THIRD_YEAR_JOINT_FULL_YEAR:
			return "3rd Year Joint Honours (Full Year)";
		default:
			return "Unknown";
	}
};

export function useCombinedRefs(...refs) {
	return useCallback((node) => {
		refs.forEach((ref) => {
			if (typeof ref === "function") {
				ref(node);
			} else if (ref) {
				ref.current = node;
			}
		});
	}, refs);
}

// Link Correctifier if starting with www. -> add https://
export const correctLink = (link: string | undefined) => {
	if (!link) return undefined;
	if (link.startsWith("www.")) {
		return `https://${link}`;
	}
	return link;
};
