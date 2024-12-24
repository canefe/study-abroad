import { BreadcrumbItem } from "@/components/ui/breadcrumb";
import { api } from "@/trpc/react";
import { clsx, type ClassValue } from "clsx";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { useCallback } from "react";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const capitalizeFirstLetter = (string: string) => {
	return string.charAt(0).toUpperCase() + string.slice(1);
};

export const getCourseNameById = (id: number, universityId: number) => {
	const course = api.courses.getCourses.useQuery({ id: universityId });

	return course.data?.find((course) => course.id === id)?.name;
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
