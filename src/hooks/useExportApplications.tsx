import { yearToString } from "@/lib/utils";
import { api } from "@/trpc/react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export function useExportApplications() {
	const utils = api.useUtils();

	const exportApplications = async (status: any, search: string) => {
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
			const row: Record<string, string | null> = {
				ApplicationID: app.id.toString(),
				Student: app.user.name,
				GUID: app.user.guid,
				University: app.abroadUniversity.name,
				Year: yearToString(app.year!),
				Status: app.status,
			};

			return row;
		});

		const courseChoicesData: Record<string, string | null>[] = [];
		data.applications.forEach((app) => {
			let first = false;
			const last = false;
			app.courseChoices.forEach((course, index) => {
				courseChoicesData.push({
					ApplicationID: !first || last ? app.id.toString() : "",
					Student: !first || last ? app.user.name : null,
					GUID: !first || last ? app.user.guid : null,
					University: !first || last ? app.abroadUniversity.name : null,
					Year: !first || last ? yearToString(app.year!) : null,
					HomeCourse: course.homeCourse?.name || "No course",
					"1st Choice": course.primaryCourse?.name || "No choice",
					"2nd Choice": course.alternativeCourse1?.name || "No choice",
					"3rd Choice": course.alternativeCourse2?.name || "No choice",
				});
				first = true;
			});
			// Add gaps between each application
			courseChoicesData.push({
				ApplicationID: null,
				Student: null,
				GUID: null,
				University: null,
				Year: null,
				HomeCourse: null,
				"1st Choice": null,
				"2nd Choice": null,
				"3rd Choice": null,
			});
		});

		// Generate Excel file
		const workbook = XLSX.utils.book_new();

		// Main sheet
		const mainWorksheet = XLSX.utils.json_to_sheet(worksheetData);

		// Set column widths based on content
		const mainColumnWidths = Object.keys(worksheetData[0] || {}).map((key) => ({
			wch: Math.max(
				key.length,
				...worksheetData.map((row) => row[key]?.toString().length || 0),
			),
		}));
		mainWorksheet["!cols"] = mainColumnWidths;

		XLSX.utils.book_append_sheet(workbook, mainWorksheet, "Applications");

		// Course choices sheet
		const courseChoicesWorksheet = XLSX.utils.json_to_sheet(courseChoicesData);
		const courseChoicesColumnWidths = Object.keys(
			courseChoicesData[0] || {},
		).map((key) => ({
			wch: Math.max(
				key.length,
				...courseChoicesData.map((row) => row[key]?.toString().length || 0),
			),
		}));
		courseChoicesWorksheet["!cols"] = courseChoicesColumnWidths;

		// Apply background color to the first row (header row) in the main sheet
		Object.keys(mainWorksheet).forEach((cell) => {
			if (cell.match(/^A1|B1|C1|D1|E1/)) {
				// Adjust based on the number of columns
				mainWorksheet[cell].s = {
					fill: {
						patternType: "solid",
						fgColor: { rgb: "D9EAD3" }, // Light green background
					},
				};
			}
		});

		// Apply background color to the first row (header row) in the course choices sheet
		Object.keys(courseChoicesWorksheet).forEach((cell) => {
			if (cell.match(/^A1|B1|C1|D1|E1|F1/)) {
				// Adjust based on the number of columns
				courseChoicesWorksheet[cell].s = {
					fill: {
						patternType: "solid",
						fgColor: { rgb: "FCE5CD" }, // Light orange background
					},
				};
			}
		});
		XLSX.utils.book_append_sheet(
			workbook,
			courseChoicesWorksheet,
			"Course Choices",
		);

		// Convert to file and download
		const excelBuffer = XLSX.write(workbook, {
			bookType: "xlsx",
			type: "array",
		});
		const blob = new Blob([excelBuffer], {
			type: "application/octet-stream",
		});
		const timestamp = new Date().toISOString().split("T")[0];
		const fileName = `applications_${status || "ALL"}_${timestamp}.xlsx`;

		saveAs(blob, fileName);
	};

	return { exportApplications };
}
