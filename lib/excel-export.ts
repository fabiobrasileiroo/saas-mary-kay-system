import * as XLSX from "xlsx"

export function exportToExcel(data: any[], fileName: string) {
  // Convert the data to a worksheet
  const worksheet = XLSX.utils.json_to_sheet(data)

  // Create a new workbook and append the worksheet
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")

  // Generate the Excel file as a binary string
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

  // Convert the binary string to a Blob
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

  // Create a download link and trigger the download
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", `${fileName}.xlsx`)
  document.body.appendChild(link)
  link.click()

  // Clean up
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

