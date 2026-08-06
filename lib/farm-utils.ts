import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { Rabbit } from "./types";

export type ExportRow = Record<string, string | number>;

export const money = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

export const shortDate = (value: string) =>
  new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));

export const daysUntil = (value: string) =>
  Math.ceil(
    (new Date(`${value}T12:00:00`).getTime() -
      new Date("2026-08-06T12:00:00").getTime()) /
      86400000,
  );

export const age = (birth: string) => {
  const months = Math.max(
    0,
    Math.floor(
      (new Date("2026-08-06").getTime() - new Date(birth).getTime()) /
        2629800000,
    ),
  );
  return months >= 12
    ? `${Math.floor(months / 12)}y ${months % 12}m`
    : `${months}m`;
};

export const rabbitRows = (items: Rabbit[]): ExportRow[] =>
  items.map((rabbit) => ({
    ID: rabbit.id,
    Tag: rabbit.tag,
    Name: rabbit.name,
    Breed: rabbit.breed,
    Sex: rabbit.sex,
    Status: rabbit.status,
    Purpose: rabbit.purpose,
    "Date of birth": rabbit.dateOfBirth,
    "Weight (kg)": rabbit.weightKg,
    Cage: rabbit.cage,
    Color: rabbit.color,
    Acquired: rabbit.acquiredDate,
    Notes: rabbit.notes,
  }));

export function exportExcel(rows: ExportRow[], name: string) {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rows);
  sheet["!cols"] = Object.keys(rows[0] ?? { Record: "" }).map(() => ({
    wch: 20,
  }));
  XLSX.utils.book_append_sheet(workbook, sheet, name.slice(0, 31));
  XLSX.writeFile(
    workbook,
    `dauson-${name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
}

export function exportPdf(rows: ExportRow[], title: string) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const columns = Object.keys(rows[0] ?? { Record: "No records" }).slice(0, 9);
  doc.setFillColor(15, 70, 59);
  doc.rect(0, 0, 842, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(19);
  doc.text(`Dauson Farm · ${title}`, 34, 32);
  doc.setFontSize(9);
  doc.text(
    `Generated 06 Aug 2026  •  ${rows.length} records  •  Farm management archive`,
    34,
    50,
  );
  autoTable(doc, {
    head: [columns],
    body: rows.map((row) => columns.map((key) => String(row[key] ?? "—"))),
    startY: 88,
    styles: { fontSize: 8, cellPadding: 5, textColor: [46, 54, 49] },
    headStyles: {
      fillColor: [226, 238, 231],
      textColor: [15, 70, 59],
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [248, 250, 248] },
    margin: { left: 34, right: 34 },
  });
  doc.save(
    `dauson-${title.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}
