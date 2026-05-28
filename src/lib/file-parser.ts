// ============================================================
// AtlasOps AI — File Parser Layer
// Client-side parsing for CSV, XLSX, and PDF
// ============================================================

import Papa from "papaparse";

// --- Types ---

export interface ParseResult {
  headers: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  sampleRows: Record<string, unknown>[];
  warnings: string[];
}

export interface PDFResult {
  text: string;
  pageCount: number;
  extractedMetrics: Record<string, string>;
}

export type SupportedFileType = "csv" | "xlsx" | "pdf" | "unknown";

// --- File Type Detection ---

export function detectFileType(file: File): SupportedFileType {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "csv" || file.type === "text/csv") return "csv";
  if (ext === "xlsx" || ext === "xls" || file.type.includes("spreadsheet")) return "xlsx";
  if (ext === "pdf" || file.type === "application/pdf") return "pdf";
  return "unknown";
}

// --- CSV Parser ---

export function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, unknown>[];
        const warnings: string[] = [];

        if (results.errors.length > 0) {
          warnings.push(`${results.errors.length} parsing warning(s) — rows may contain malformed data`);
        }

        resolve({
          headers,
          rows,
          rowCount: rows.length,
          sampleRows: rows.slice(0, 5),
          warnings,
        });
      },
      error: (err) => reject(new Error(`CSV parse failed: ${err.message}`)),
    });
  });
}

// --- XLSX Parser ---

export async function parseXLSX(file: File): Promise<ParseResult> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("XLSX file contains no sheets");

  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  const warnings: string[] = [];

  if (workbook.SheetNames.length > 1) {
    warnings.push(`${workbook.SheetNames.length} sheets detected — using first sheet: "${sheetName}"`);
  }

  return {
    headers,
    rows,
    rowCount: rows.length,
    sampleRows: rows.slice(0, 5),
    warnings,
  };
}

// --- PDF Parser ---

export async function parsePDF(file: File): Promise<PDFResult> {
  const pdfjsLib = await import("pdfjs-dist");

  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    fullText += pageText + "\n";
  }

  // Extract metric-like patterns from text
  const extractedMetrics: Record<string, string> = {};
  const metricPatterns = [
    { key: "Revenue", pattern: /(?:revenue|total\s*revenue)[:\s]*[₹$]?\s*([\d,.]+(?:\s*(?:Cr|L|K|M|B))?)/i },
    { key: "Bookings", pattern: /(?:bookings?|orders?|transactions?)[:\s]*([\d,]+)/i },
    { key: "Cancel Rate", pattern: /(?:cancel(?:lation)?\s*rate)[:\s]*([\d.]+\s*%?)/i },
    { key: "Profit", pattern: /(?:profit|net\s*income)[:\s]*[₹$]?\s*([\d,.]+(?:\s*(?:Cr|L|K|M|B))?)/i },
    { key: "Margin", pattern: /(?:margin|profit\s*margin)[:\s]*([\d.]+\s*%?)/i },
    { key: "Customers", pattern: /(?:customers?|clients?)[:\s]*([\d,]+)/i },
    { key: "Growth", pattern: /(?:growth|yoy|year.over.year)[:\s]*([\d.]+\s*%?)/i },
  ];

  for (const { key, pattern } of metricPatterns) {
    const match = fullText.match(pattern);
    if (match) extractedMetrics[key] = match[1].trim();
  }

  return {
    text: fullText.trim(),
    pageCount: pdf.numPages,
    extractedMetrics,
  };
}

// --- Unified Parser ---

export async function parseFile(file: File): Promise<{ type: SupportedFileType; result: ParseResult | PDFResult }> {
  const type = detectFileType(file);

  switch (type) {
    case "csv":
      return { type, result: await parseCSV(file) };
    case "xlsx":
      return { type, result: await parseXLSX(file) };
    case "pdf":
      return { type, result: await parsePDF(file) };
    default:
      throw new Error(`Unsupported file type: ${file.name}`);
  }
}

// --- Type Guard ---

export function isParseResult(result: ParseResult | PDFResult): result is ParseResult {
  return "headers" in result && "rows" in result;
}

export function isPDFResult(result: ParseResult | PDFResult): result is PDFResult {
  return "text" in result && "pageCount" in result;
}
