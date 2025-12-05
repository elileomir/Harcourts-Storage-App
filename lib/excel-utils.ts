import * as XLSX from "xlsx";

export const exportToExcel = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[],
  fileName: string,
  sheetName: string = "Sheet1"
) => {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Append worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
