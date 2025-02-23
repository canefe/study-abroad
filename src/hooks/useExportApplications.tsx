import { api } from "@/trpc/react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { type Status } from "@/path/to/your/component";

export function useExportApplications() {
	const utils = api.useUtils();

	const exportApplications = async (status: Status, search: string) => {
		// Fetch applications with course choices
		const data = await utils.applications.getAll.fetch({
			filter: status,
			q: search,
			page: 1,
			pageSize: 1000,
		});

		// Determine the maximum number of courses in any application
		const maxCourses = Math.max(
			...data.applications.map((app) => app.courseChoices.length),
		);

		// Generate structured data for export
		const worksheetData = data.applications.map((app) => {
			const row: Record<string, string> = {
				ApplicationID: app.id.toString(),
				Student: app.user.name,
				GUID: app.user.guid,
				University: app.abroadUniversity.name,
				Status: app.status,
			};

			// Loop through courses and assign them dynamically
			app.courseChoices.forEach((course, index) => {
				row[`HomeCourse_${index + 1}`] = course.homeCourse || "No course";
				row[`FirstChoice_${index + 1}`] =
					course.primaryCourse?.name || "No choice";
				row[`SecondChoice_${index + 1}`] =
					course.alternativeCourse1?.name || "No choice";
				row[`ThirdChoice_${index + 1}`] =
					course.alternativeCourse2?.name || "No choice";
			});

			// Fill remaining columns if some applications have fewer courses
			for (let i = app.courseChoices.length; i < maxCourses; i++) {
				row[`HomeCourse_${i + 1}`] = "No course";
				row[`FirstChoice_${i + 1}`] = "No choice";
				row[`SecondChoice_${i + 1}`] = "No choice";
				row[`ThirdChoice_${i + 1}`] = "No choice";
			}

			return row;
		});

		// Generate Excel file
		const worksheet = XLSX.utils.json_to_sheet(worksheetData);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

		// Convert to file and download
		const excelBuffer = XLSX.write(workbook, {
			bookType: "xlsx",
			type: "array",
		});
		const blob = new Blob([excelBuffer], {
			type: "application/octet-stream",
		});

		saveAs(blob, `applications_${status}.xlsx`);
	};

	return { exportApplications };
}
