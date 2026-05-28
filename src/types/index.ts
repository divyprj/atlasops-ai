// ============================================================
// AtlasOps AI — Core Type Definitions
// ============================================================

// --- KPI & Dashboard ---
export interface KPIMetric {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  change: number;
  changeType: "positive" | "negative" | "neutral";
  format: "currency" | "number" | "percentage" | "score";
  icon: string;
  sparklineData?: number[];
}

// --- Booking ---
export type BookingStatus = "confirmed" | "cancelled" | "pending" | "completed";
export type PaymentStatus = "paid" | "partial" | "refunded" | "pending";

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  agentId: string;
  agentName: string;
  destination: string;
  region: string;
  packageName: string;
  packageType: "domestic" | "international";
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  amount: number;
  profit: number;
  bookingDate: string;
  travelDate: string;
  returnDate: string;
  pax: number;
  source: "website" | "referral" | "agent" | "social" | "walk-in";
  createdAt: string;
}

// --- Travel Agent ---
export interface Agent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  region: string;
  joinDate: string;
  totalBookings: number;
  totalRevenue: number;
  conversionRate: number;
  avgResponseTime: number; // minutes
  cancellationRatio: number;
  customerSatisfaction: number; // 1-5
  performanceScore: number; // 0-100
  performanceTier: "elite" | "strong" | "average" | "needs_improvement";
  activeStatus: boolean;
  monthlyBookings: number[];
  monthlyRevenue: number[];
}

// --- Destination ---
export interface Destination {
  id: string;
  name: string;
  country: string;
  region: string;
  type: "domestic" | "international";
  totalBookings: number;
  totalRevenue: number;
  avgBookingValue: number;
  cancellationRate: number;
  growthRate: number;
  popularity: number; // 1-10
  seasonalPeak: string[];
  monthlyBookings: number[];
}

// --- Revenue ---
export interface RevenueDataPoint {
  date: string;
  revenue: number;
  bookings: number;
  cancellations: number;
  profit: number;
  domestic: number;
  international: number;
}

export interface RevenueSummary {
  totalRevenue: number;
  totalProfit: number;
  avgOrderValue: number;
  revenueGrowth: number;
  profitMargin: number;
  domesticRevenue: number;
  internationalRevenue: number;
}

// --- AI Insights ---
export type InsightSeverity = "critical" | "warning" | "info" | "positive";
export type InsightCategory = "revenue" | "operations" | "performance" | "risk" | "growth" | "anomaly";

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  severity: InsightSeverity;
  category: InsightCategory;
  metric?: string;
  metricValue?: number;
  metricChange?: number;
  recommendation?: string;
  timestamp: string;
  isNew: boolean;
  source: "ai" | "rule-based" | "anomaly-detection";
}

// --- Database Health ---
export type HealthStatus = "healthy" | "warning" | "critical" | "degraded";

export interface HealthMetric {
  id: string;
  name: string;
  value: number;
  maxValue: number;
  status: HealthStatus;
  description: string;
  lastChecked: string;
  trend: "improving" | "stable" | "degrading";
}

export interface AnomalyRecord {
  id: string;
  type: "duplicate" | "missing_value" | "suspicious_transaction" | "data_inconsistency" | "outlier";
  severity: "high" | "medium" | "low";
  table: string;
  field: string;
  description: string;
  recordId: string;
  detectedAt: string;
  resolved: boolean;
}

export interface DatabaseHealth {
  overallScore: number;
  status: HealthStatus;
  totalRecords: number;
  duplicatesDetected: number;
  missingValues: number;
  anomaliesDetected: number;
  dataConsistencyScore: number;
  lastFullScan: string;
  metrics: HealthMetric[];
  anomalies: AnomalyRecord[];
}

// --- Forecasting ---
export interface ForecastDataPoint {
  date: string;
  actual?: number;
  predicted: number;
  lowerBound: number;
  upperBound: number;
}

export interface ForecastSummary {
  metric: string;
  nextMonthPrediction: number;
  confidence: number;
  trend: "up" | "down" | "flat";
  seasonalFactor: string;
}

// --- Reports ---
export type ReportType = "daily" | "weekly" | "monthly" | "executive";
export type ReportStatus = "ready" | "generating" | "scheduled";

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  status: ReportStatus;
  generatedAt: string;
  period: string;
  metrics: {
    revenue: number;
    bookings: number;
    cancellations: number;
    growth: number;
  };
  downloadUrl?: string;
}

// --- Copilot ---
export interface CopilotMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

// --- Navigation ---
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  section?: string;
}

// --- Chart Data ---
export interface ChartDataPoint {
  [key: string]: string | number;
}

// --- Operational Alert ---
export interface OperationalAlert {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  timestamp: string;
  acknowledged: boolean;
  module: string;
}

// --- Activity Feed ---
export interface ActivityItem {
  id: string;
  type: "booking" | "cancellation" | "agent" | "system" | "alert";
  title: string;
  description: string;
  timestamp: string;
  actor?: string;
  metadata?: Record<string, string | number>;
}
