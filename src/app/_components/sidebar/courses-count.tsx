"use client";

import { getFlaggedCoursesCount } from "@/lib/coursesUtils";

export function FlaggedCoursesCount() {
	return <>{getFlaggedCoursesCount()}</>;
}
