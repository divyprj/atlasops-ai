// ============================================================
// AtlasOps AI — Database Health Mock Data
// ============================================================

import { DatabaseHealth, HealthMetric, AnomalyRecord } from "@/types";

const healthMetrics: HealthMetric[] = [
  { id: "HM-001", name: "Record Integrity", value: 98.2, maxValue: 100, status: "healthy", description: "Percentage of records passing all validation rules", lastChecked: "2025-05-27T09:00:00Z", trend: "stable" },
  { id: "HM-002", name: "Referential Consistency", value: 96.8, maxValue: 100, status: "healthy", description: "Foreign key relationships validated across all tables", lastChecked: "2025-05-27T09:00:00Z", trend: "stable" },
  { id: "HM-003", name: "Duplicate Detection", value: 94.1, maxValue: 100, status: "warning", description: "Percentage of unique records (no duplicates detected)", lastChecked: "2025-05-27T09:00:00Z", trend: "degrading" },
  { id: "HM-004", name: "Data Completeness", value: 97.4, maxValue: 100, status: "healthy", description: "Percentage of required fields populated", lastChecked: "2025-05-27T09:00:00Z", trend: "stable" },
  { id: "HM-005", name: "Schema Compliance", value: 99.1, maxValue: 100, status: "healthy", description: "Records matching expected data types and formats", lastChecked: "2025-05-27T09:00:00Z", trend: "improving" },
  { id: "HM-006", name: "Temporal Consistency", value: 95.6, maxValue: 100, status: "warning", description: "Date fields logical consistency (booking < travel < return)", lastChecked: "2025-05-27T09:00:00Z", trend: "degrading" },
  { id: "HM-007", name: "Anomaly Rate", value: 97.8, maxValue: 100, status: "healthy", description: "Percentage of transactions within normal statistical bounds", lastChecked: "2025-05-27T09:00:00Z", trend: "stable" },
  { id: "HM-008", name: "Index Performance", value: 92.3, maxValue: 100, status: "warning", description: "Query performance based on index utilization", lastChecked: "2025-05-27T09:00:00Z", trend: "degrading" },
];

const anomalies: AnomalyRecord[] = [
  { id: "ANM-001", type: "duplicate", severity: "medium", table: "customers", field: "email", description: "Duplicate customer email: aarav.sharma@email.com — 3 records with same email, different customer IDs", recordId: "CUS-00142, CUS-01287, CUS-03421", detectedAt: "2025-05-27T08:45:00Z", resolved: false },
  { id: "ANM-002", type: "duplicate", severity: "high", table: "bookings", field: "booking_reference", description: "Duplicate booking reference BKG-01847 found with different amounts (₹45,000 vs ₹48,500)", recordId: "BKG-01847", detectedAt: "2025-05-27T08:30:00Z", resolved: false },
  { id: "ANM-003", type: "suspicious_transaction", severity: "high", table: "bookings", field: "amount", description: "Booking amount ₹8,50,000 exceeds 3σ threshold for Dubai packages (mean: ₹1,45,000, σ: ₹65,000)", recordId: "BKG-02341", detectedAt: "2025-05-27T07:15:00Z", resolved: false },
  { id: "ANM-004", type: "missing_value", severity: "medium", table: "customers", field: "phone_number", description: "12 customer records missing phone numbers — created via walk-in channel", recordId: "Multiple", detectedAt: "2025-05-27T06:00:00Z", resolved: false },
  { id: "ANM-005", type: "data_inconsistency", severity: "high", table: "bookings", field: "travel_date", description: "Travel date (2024-02-15) is before booking date (2025-05-20) — likely data entry error", recordId: "BKG-02456", detectedAt: "2025-05-26T22:30:00Z", resolved: false },
  { id: "ANM-006", type: "suspicious_transaction", severity: "high", table: "bookings", field: "ip_address", description: "3 bookings from IP 103.42.xx.xx in 12 minutes — different customer names, same destination (Dubai)", recordId: "BKG-02389, BKG-02390, BKG-02391", detectedAt: "2025-05-26T20:15:00Z", resolved: false },
  { id: "ANM-007", type: "outlier", severity: "medium", table: "agents", field: "cancellation_ratio", description: "Agent AGT-013 cancellation ratio (14.2%) is 2.4σ above mean (7.8%)", recordId: "AGT-013", detectedAt: "2025-05-26T18:00:00Z", resolved: false },
  { id: "ANM-008", type: "duplicate", severity: "low", table: "destinations", field: "name", description: "Near-duplicate destination entries: 'Goa' and 'North Goa' may represent same destination", recordId: "DST-001, DST-013", detectedAt: "2025-05-26T15:30:00Z", resolved: true },
  { id: "ANM-009", type: "missing_value", severity: "low", table: "bookings", field: "return_date", description: "8 confirmed bookings missing return_date field", recordId: "Multiple", detectedAt: "2025-05-26T12:00:00Z", resolved: false },
  { id: "ANM-010", type: "data_inconsistency", severity: "medium", table: "payments", field: "status", description: "15 bookings marked as 'completed' but payment status is 'pending' — possible sync issue", recordId: "Multiple", detectedAt: "2025-05-26T09:45:00Z", resolved: false },
  { id: "ANM-011", type: "suspicious_transaction", severity: "medium", table: "bookings", field: "profit_margin", description: "Booking BKG-01923 shows 45% profit margin — significantly above category average of 18%", recordId: "BKG-01923", detectedAt: "2025-05-25T21:00:00Z", resolved: true },
  { id: "ANM-012", type: "outlier", severity: "low", table: "bookings", field: "pax_count", description: "Booking for 12 pax on domestic Goa package — unusually large group for this package type", recordId: "BKG-02102", detectedAt: "2025-05-25T16:30:00Z", resolved: true },
];

export const databaseHealth: DatabaseHealth = {
  overallScore: 91.8,
  status: "warning",
  totalRecords: 127458,
  duplicatesDetected: 47,
  missingValues: 32,
  anomaliesDetected: anomalies.filter(a => !a.resolved).length,
  dataConsistencyScore: 96.2,
  lastFullScan: "2025-05-27T09:00:00Z",
  metrics: healthMetrics,
  anomalies,
};

export const healthHistory = [
  { date: "2025-05-01", score: 94.2, duplicates: 18, anomalies: 4 },
  { date: "2025-05-04", score: 94.0, duplicates: 20, anomalies: 5 },
  { date: "2025-05-07", score: 93.8, duplicates: 22, anomalies: 4 },
  { date: "2025-05-10", score: 93.5, duplicates: 25, anomalies: 6 },
  { date: "2025-05-13", score: 93.1, duplicates: 28, anomalies: 5 },
  { date: "2025-05-16", score: 92.8, duplicates: 32, anomalies: 7 },
  { date: "2025-05-19", score: 92.4, duplicates: 38, anomalies: 6 },
  { date: "2025-05-22", score: 92.0, duplicates: 42, anomalies: 8 },
  { date: "2025-05-25", score: 91.8, duplicates: 47, anomalies: 9 },
  { date: "2025-05-27", score: 91.8, duplicates: 47, anomalies: 9 },
];

export const tableHealthStatus = [
  { table: "bookings", records: 102450, health: 96.8, issues: 8, lastAudit: "2025-05-27T09:00:00Z" },
  { table: "customers", records: 18234, health: 94.2, issues: 15, lastAudit: "2025-05-27T09:00:00Z" },
  { table: "agents", records: 15, health: 99.5, issues: 1, lastAudit: "2025-05-27T09:00:00Z" },
  { table: "destinations", records: 12, health: 98.0, issues: 1, lastAudit: "2025-05-27T09:00:00Z" },
  { table: "payments", records: 98540, health: 93.5, issues: 18, lastAudit: "2025-05-27T09:00:00Z" },
  { table: "cancellations", records: 8207, health: 97.2, issues: 3, lastAudit: "2025-05-27T09:00:00Z" },
];
