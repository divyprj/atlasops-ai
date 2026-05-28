// ============================================================
// AtlasOps AI — Schema Detection & Column Mapping
// Auto-detect uploaded data structure and map to Booking type
// ============================================================

import { Booking } from "@/types";

// --- Types ---

export interface ColumnMapping {
  sourceHeader: string;
  targetField: keyof Booking | null;
  confidence: number; // 0-100
  detectedType: ColumnType;
  sampleValues: unknown[];
}

export type ColumnType = "string" | "number" | "date" | "enum" | "email" | "unknown";

export interface SchemaMapping {
  mappings: ColumnMapping[];
  overallConfidence: number;
  detectedDomain: string;
  unmappedColumns: string[];
  missingRequiredFields: string[];
  rowCount: number;
}

// --- Alias Dictionary ---
// Maps common CSV header names to Booking fields

const FIELD_ALIASES: Record<keyof Booking, string[]> = {
  id: ["id", "booking_id", "order_id", "transaction_id", "ref", "reference", "record_id"],
  customerId: ["customer_id", "client_id", "cust_id", "buyer_id", "user_id"],
  customerName: ["customer_name", "client_name", "name", "customer", "client", "buyer", "full_name", "buyer_name"],
  customerEmail: ["email", "customer_email", "client_email", "email_address", "mail"],
  agentId: ["agent_id", "rep_id", "salesperson_id", "employee_id", "staff_id"],
  agentName: ["agent_name", "agent", "rep", "salesperson", "representative", "assigned_to", "handled_by", "staff", "employee"],
  destination: ["destination", "city", "location", "place", "travel_destination", "dest", "to", "arrival_city"],
  region: ["region", "area", "zone", "territory", "state", "province", "country"],
  packageName: ["package_name", "package", "plan", "product", "service", "item", "offering", "product_name"],
  packageType: ["package_type", "type", "category", "segment", "class", "tier", "product_type"],
  status: ["status", "booking_status", "order_status", "state", "current_status"],
  paymentStatus: ["payment_status", "payment", "pay_status", "payment_state", "paid"],
  amount: ["amount", "total", "revenue", "price", "value", "booking_amount", "order_value", "total_amount", "sale_amount", "gross", "total_price"],
  profit: ["profit", "margin", "net", "net_revenue", "net_amount", "commission", "earnings", "net_profit"],
  bookingDate: ["booking_date", "date", "order_date", "created", "created_date", "purchase_date", "transaction_date", "booked_on", "booked_date"],
  travelDate: ["travel_date", "start_date", "departure", "departure_date", "check_in", "checkin", "service_date", "delivery_date"],
  returnDate: ["return_date", "end_date", "checkout", "check_out", "return", "completion_date"],
  pax: ["pax", "guests", "travelers", "people", "quantity", "qty", "count", "persons", "passengers", "headcount"],
  source: ["source", "channel", "medium", "referral_source", "acquisition", "lead_source", "utm_source", "origin"],
  createdAt: ["created_at", "created_on", "timestamp", "record_created"],
};

// Required fields for a functional analytics pipeline
const REQUIRED_FIELDS: (keyof Booking)[] = ["amount", "bookingDate", "status"];

// --- Column Type Detection ---

function inferColumnType(values: unknown[]): ColumnType {
  const nonNull = values.filter(v => v !== null && v !== undefined && v !== "");
  if (nonNull.length === 0) return "unknown";

  const sample = nonNull.slice(0, 50);

  // Check email
  const emailCount = sample.filter(v => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)).length;
  if (emailCount > sample.length * 0.7) return "email";

  // Check number
  const numCount = sample.filter(v => {
    if (typeof v === "number") return true;
    if (typeof v === "string") {
      const cleaned = v.replace(/[₹$,\s]/g, "");
      return !isNaN(Number(cleaned)) && cleaned !== "";
    }
    return false;
  }).length;
  if (numCount > sample.length * 0.8) return "number";

  // Check date
  const dateCount = sample.filter(v => {
    if (typeof v !== "string") return false;
    const d = new Date(v);
    if (!isNaN(d.getTime())) return true;
    // Common date patterns
    return /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$/.test(v);
  }).length;
  if (dateCount > sample.length * 0.7) return "date";

  // Check enum (low cardinality strings)
  if (typeof sample[0] === "string") {
    const unique = new Set(sample.map(v => String(v).toLowerCase().trim()));
    if (unique.size <= 10 && sample.length >= 20) return "enum";
  }

  return "string";
}

// --- Header Matching ---

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function findBestMatch(header: string): { field: keyof Booking; confidence: number } | null {
  const normalized = normalizeHeader(header);

  // Exact match against aliases
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const alias of aliases) {
      if (normalized === alias) {
        return { field: field as keyof Booking, confidence: 95 };
      }
    }
  }

  // Partial match (header contains alias or vice versa)
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const alias of aliases) {
      if (normalized.includes(alias) || alias.includes(normalized)) {
        return { field: field as keyof Booking, confidence: 75 };
      }
    }
  }

  // Word overlap match
  const headerWords = normalized.split("_").filter(w => w.length > 2);
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const alias of aliases) {
      const aliasWords = alias.split("_").filter(w => w.length > 2);
      const overlap = headerWords.filter(w => aliasWords.includes(w));
      if (overlap.length > 0 && overlap.length >= aliasWords.length * 0.5) {
        return { field: field as keyof Booking, confidence: 60 };
      }
    }
  }

  return null;
}

// --- Domain Detection ---

function detectDomain(headers: string[]): string {
  const normalized = headers.map(normalizeHeader).join(" ");

  const domains: { name: string; keywords: string[] }[] = [
    { name: "Travel Operations", keywords: ["destination", "travel", "booking", "pax", "hotel", "flight", "package", "tour"] },
    { name: "E-Commerce", keywords: ["product", "cart", "sku", "shipping", "order", "item", "catalog"] },
    { name: "Financial Services", keywords: ["transaction", "account", "balance", "interest", "loan", "credit"] },
    { name: "Healthcare", keywords: ["patient", "diagnosis", "treatment", "hospital", "doctor", "medical"] },
    { name: "Real Estate", keywords: ["property", "listing", "rent", "lease", "tenant", "building"] },
    { name: "Logistics", keywords: ["shipment", "tracking", "warehouse", "delivery", "carrier", "route"] },
    { name: "HR Operations", keywords: ["employee", "department", "salary", "leave", "attendance", "hire"] },
    { name: "Sales Operations", keywords: ["lead", "deal", "pipeline", "prospect", "conversion", "funnel"] },
  ];

  let bestDomain = "Business Operations";
  let bestScore = 0;

  for (const domain of domains) {
    const score = domain.keywords.filter(kw => normalized.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestDomain = domain.name;
    }
  }

  return bestDomain;
}

// --- Schema Detection ---

export function detectSchema(
  headers: string[],
  rows: Record<string, unknown>[]
): SchemaMapping {
  const sampleRows = rows.slice(0, 100);
  const usedFields = new Set<string>();

  const mappings: ColumnMapping[] = headers.map(header => {
    const sampleValues = sampleRows.map(r => r[header]).filter(v => v !== undefined);
    const detectedType = inferColumnType(sampleValues);
    const match = findBestMatch(header);

    // Avoid duplicate field mappings
    let targetField: keyof Booking | null = null;
    let confidence = 0;

    if (match && !usedFields.has(match.field)) {
      targetField = match.field;
      confidence = match.confidence;
      usedFields.add(match.field);
    }

    return {
      sourceHeader: header,
      targetField,
      confidence,
      detectedType,
      sampleValues: sampleValues.slice(0, 3),
    };
  });

  // Compute unmapped and missing
  const unmappedColumns = mappings
    .filter(m => m.targetField === null)
    .map(m => m.sourceHeader);

  const mappedFields = new Set(mappings.map(m => m.targetField).filter(Boolean));
  const missingRequiredFields = REQUIRED_FIELDS.filter(f => !mappedFields.has(f));

  // Overall confidence
  const mappedCount = mappings.filter(m => m.targetField !== null).length;
  const avgConfidence = mappedCount > 0
    ? mappings.filter(m => m.targetField !== null).reduce((s, m) => s + m.confidence, 0) / mappedCount
    : 0;

  const requiredCoverage = (REQUIRED_FIELDS.length - missingRequiredFields.length) / REQUIRED_FIELDS.length;
  const overallConfidence = Math.round(avgConfidence * 0.6 + requiredCoverage * 100 * 0.4);

  return {
    mappings,
    overallConfidence,
    detectedDomain: detectDomain(headers),
    unmappedColumns,
    missingRequiredFields,
    rowCount: rows.length,
  };
}

// --- Map to Bookings ---

export function mapToBookings(
  rows: Record<string, unknown>[],
  mappings: ColumnMapping[]
): Booking[] {
  const fieldMap = new Map<keyof Booking, string>();
  for (const m of mappings) {
    if (m.targetField) {
      fieldMap.set(m.targetField, m.sourceHeader);
    }
  }

  const get = (row: Record<string, unknown>, field: keyof Booking): unknown => {
    const header = fieldMap.get(field);
    return header ? row[header] : undefined;
  };

  let idCounter = 0;

  return rows.map((row) => {
    idCounter++;
    const amount = toNumber(get(row, "amount")) || 0;
    const profit = toNumber(get(row, "profit")) || Math.round(amount * 0.21);
    const bookingDate = toDateString(get(row, "bookingDate")) || "2025-01-01";
    const travelDate = toDateString(get(row, "travelDate")) || bookingDate;
    const returnDate = toDateString(get(row, "returnDate")) || travelDate;

    return {
      id: toString(get(row, "id")) || `ING-${String(idCounter).padStart(5, "0")}`,
      customerId: toString(get(row, "customerId")) || `CUST-${String((idCounter % 500) + 1).padStart(4, "0")}`,
      customerName: toString(get(row, "customerName")) || `Customer ${(idCounter % 500) + 1}`,
      customerEmail: toString(get(row, "customerEmail")) || `customer${(idCounter % 500) + 1}@example.com`,
      agentId: toString(get(row, "agentId")) || `AGT-${String((idCounter % 10) + 1).padStart(3, "0")}`,
      agentName: toString(get(row, "agentName")) || `Agent ${(idCounter % 10) + 1}`,
      destination: toString(get(row, "destination")) || "Unknown",
      region: toString(get(row, "region")) || "Unknown",
      packageName: toString(get(row, "packageName")) || "Standard Package",
      packageType: normalizePackageType(get(row, "packageType")),
      status: normalizeStatus(get(row, "status")),
      paymentStatus: normalizePaymentStatus(get(row, "paymentStatus")),
      amount,
      profit,
      bookingDate,
      travelDate,
      returnDate,
      pax: toNumber(get(row, "pax")) || 2,
      source: normalizeSource(get(row, "source")),
      createdAt: toDateString(get(row, "createdAt")) || new Date().toISOString(),
    };
  });
}

// --- Value Normalizers ---

function toString(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const cleaned = v.replace(/[₹$,\s]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

function toDateString(v: unknown): string {
  if (!v) return "";
  const s = String(v).trim();
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }
  // Try common formats
  const parts = s.split(/[-/]/);
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number);
    // DD/MM/YYYY
    if (a > 12 && c > 100) return new Date(c, b - 1, a).toISOString().split("T")[0];
    // MM/DD/YYYY
    if (a <= 12 && c > 100) return new Date(c, a - 1, b).toISOString().split("T")[0];
    // YYYY/MM/DD
    if (a > 100) return new Date(a, b - 1, c).toISOString().split("T")[0];
  }
  return "";
}

function normalizeStatus(v: unknown): Booking["status"] {
  const s = String(v || "").toLowerCase().trim();
  if (s === "cancelled" || s === "canceled" || s === "cancel") return "cancelled";
  if (s.includes("complet") || s === "done" || s === "fulfilled" || s === "delivered") return "completed";
  if (s.includes("confirm") || s === "active" || s === "approved" || s === "booked") return "confirmed";
  if (s.includes("pend") || s === "processing" || s === "hold" || s === "waiting") return "pending";
  if (s.includes("refund")) return "cancelled"; // Only after all other checks
  // Default based on common patterns
  return "confirmed";
}

function normalizePaymentStatus(v: unknown): Booking["paymentStatus"] {
  const s = String(v || "").toLowerCase().trim();
  if (s.includes("refund")) return "refunded";
  if (s.includes("partial") || s === "deposit") return "partial";
  if (s.includes("paid") || s === "complete" || s === "success" || s === "settled") return "paid";
  return "pending";
}

function normalizePackageType(v: unknown): Booking["packageType"] {
  const s = String(v || "").toLowerCase().trim();
  if (s.includes("intl") || s.includes("international") || s.includes("foreign") || s.includes("overseas")) return "international";
  return "domestic";
}

function normalizeSource(v: unknown): Booking["source"] {
  const s = String(v || "").toLowerCase().trim();
  if (s.includes("web") || s.includes("online") || s.includes("site")) return "website";
  if (s.includes("referr") || s.includes("word")) return "referral";
  if (s.includes("social") || s.includes("facebook") || s.includes("instagram") || s.includes("twitter")) return "social";
  if (s.includes("walk") || s.includes("store") || s.includes("office") || s.includes("branch")) return "walk-in";
  if (s.includes("agent") || s.includes("direct") || s.includes("phone") || s.includes("call")) return "agent";
  return "website";
}
