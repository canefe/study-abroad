// exportApplications.ts
import { api } from "@/trpc/react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export async function exportApplications(
	utils: ReturnType<typeof api.useUtils>,
	status: Status,
	search: string,
) {
	const data = await api.applications.getAll.useQuery({
		filter: status,
		q: search,
		page: 1,
		pageSize: 1000, // Adjust as needed for exporting all data
	});

	const worksheetData = data?.map((app) => ({
		ID: app.id,
		Student: app.user.name,
		GUID: app.user.guid,
		University: app.abroadUniversity.name,
		Status: app.status,
	}));

	const worksheet = XLSX.utils.json_to_sheet(worksheetData);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

	const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
	const blob = new Blob([excelBuffer], {
		type: "application/octet-stream",
	});

	saveAs(blob, `applications_${status}.xlsx`);
}
