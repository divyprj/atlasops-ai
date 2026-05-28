// ============================================================
// AtlasOps AI — Operational Insights (Generated from Data)
// All insights derived from booking analytics + anomaly engine
// ============================================================

import { AIInsight, OperationalAlert, ActivityItem } from "@/types";
import { bookings } from "./bookings";
import { generateInsights, OperationalInsight } from "@/lib/insight-engine";
import { detectOperationalAnomalies, computeOperationalRiskScore, Anomaly } from "@/lib/anomaly-engine";

// --- Generate insights from actual data ---
const generatedInsights = generateInsights(bookings);
const anomalies = detectOperationalAnomalies(bookings);
const riskScore = computeOperationalRiskScore(anomalies);

// Map OperationalInsight → AIInsight (legacy type)
function mapCategory(cat: OperationalInsight["category"]): AIInsight["category"] {
  const map: Record<string, AIInsight["category"]> = {
    revenue: "revenue", bookings: "operations", cancellations: "risk",
    agents: "performance", destinations: "growth", operations: "operations",
    customers: "growth",
  };
  return map[cat] || "operations";
}

// Convert generated insights to the AIInsight shape for page consumption
export const insights: AIInsight[] = [
  // Operational insights from data
  ...generatedInsights.map((ins, i) => ({
    id: ins.id,
    title: ins.title,
    description: ins.detail,
    severity: ins.severity as AIInsight["severity"],
    category: mapCategory(ins.category),
    metric: ins.metric || "",
    metricValue: ins.metricValue ?? 0,
    metricChange: ins.metricValue ?? 0,
    recommendation: "",
    timestamp: ins.timestamp,
    isNew: i < 4,
    source: ins.source.includes("Analytics") ? "ai" as const : "rule-based" as const,
  })),
  // Anomaly insights
  ...anomalies.slice(0, 8).map((anm, i) => ({
    id: anm.id,
    title: anm.title,
    description: anm.detail,
    severity: anm.severity as AIInsight["severity"],
    category: "anomaly" as const,
    metric: anm.metric,
    metricValue: anm.observedValue,
    metricChange: anm.deviation,
    recommendation: "",
    timestamp: anm.timestamp,
    isNew: i < 2,
    source: "anomaly-detection" as const,
  })),
];

// --- Operational Alerts (derived from anomalies) ---
export const operationalAlerts: OperationalAlert[] = [
  ...anomalies
    .filter(a => a.severity === "critical" || a.severity === "warning")
    .slice(0, 5)
    .map((a, i) => ({
      id: `ALR-${String(i + 1).padStart(3, "0")}`,
      title: a.title.length > 50 ? a.title.substring(0, 50) + "…" : a.title,
      description: a.detail.substring(0, 100),
      severity: a.severity as "critical" | "warning" | "info",
      timestamp: a.timestamp,
      acknowledged: i > 2,
      module: a.type === "refund_spike" ? "payments"
        : a.type === "cancel_anomaly" ? "operations"
        : a.type === "agent_deviation" ? "operations"
        : a.type === "suspicious_transaction" ? "fraud"
        : "data-quality" as string,
    })),
];

// --- Activity Feed (static — operational log) ---
export const activityFeed: ActivityItem[] = [
  { id: "ACT-001", type: "booking", title: "New Booking Confirmed", description: "Dubai Gold Pack 5N/6D — ₹1,45,000", timestamp: "2025-05-27T09:42:00Z", actor: "Priya Patel", metadata: { destination: "Dubai", amount: 145000 } },
  { id: "ACT-002", type: "cancellation", title: "Booking Cancelled", description: "Goa Beach Bliss 4N/5D — ₹18,000 (Refund initiated)", timestamp: "2025-05-27T09:28:00Z", actor: "System", metadata: { destination: "Goa", amount: 18000 } },
  { id: "ACT-003", type: "agent", title: "Agent Login", description: "Rahul Sharma started shift", timestamp: "2025-05-27T09:00:00Z", actor: "Rahul Sharma" },
  { id: "ACT-004", type: "booking", title: "Payment Received", description: "Maldives Resort Premium 4N/5D — ₹3,20,000", timestamp: "2025-05-27T08:55:00Z", actor: "Sneha Reddy", metadata: { destination: "Maldives", amount: 320000 } },
  { id: "ACT-005", type: "system", title: "Daily Report Generated", description: "Executive daily summary for May 26 is ready", timestamp: "2025-05-27T08:00:00Z", actor: "System" },
  { id: "ACT-006", type: "alert", title: "Health Check Completed", description: `Database health scan completed — Risk Score: ${riskScore}/100`, timestamp: "2025-05-27T07:30:00Z", actor: "System", metadata: { score: riskScore } },
  { id: "ACT-007", type: "booking", title: "New Booking Confirmed", description: "Thailand Explorer 5N/6D — ₹78,000", timestamp: "2025-05-27T07:15:00Z", actor: "Arjun Mehta", metadata: { destination: "Thailand", amount: 78000 } },
  { id: "ACT-008", type: "booking", title: "New Booking Confirmed", description: "Kerala Backwater Bliss 5N/6D — ₹42,000", timestamp: "2025-05-27T06:45:00Z", actor: "Kavya Nair", metadata: { destination: "Kerala", amount: 42000 } },
  { id: "ACT-009", type: "agent", title: "Performance Review Due", description: "Rohan Das — quarterly review scheduled", timestamp: "2025-05-26T18:00:00Z", actor: "HR System" },
  { id: "ACT-010", type: "cancellation", title: "Booking Cancelled", description: "Manali Snow Adventure 4N/5D — ₹12,500", timestamp: "2025-05-26T17:30:00Z", actor: "Vikram Singh", metadata: { destination: "Manali", amount: 12500 } },
];

// --- Summary (computed) ---
export const insightsSummary = {
  total: insights.length,
  critical: insights.filter(i => i.severity === "critical").length,
  warning: insights.filter(i => i.severity === "warning").length,
  positive: insights.filter(i => i.severity === "positive").length,
  info: insights.filter(i => i.severity === "info").length,
  newInsights: insights.filter(i => i.isNew).length,
  riskScore,
  anomalyCount: anomalies.length,
  byCategory: {
    revenue: insights.filter(i => i.category === "revenue").length,
    operations: insights.filter(i => i.category === "operations").length,
    performance: insights.filter(i => i.category === "performance").length,
    risk: insights.filter(i => i.category === "risk").length,
    growth: insights.filter(i => i.category === "growth").length,
    anomaly: insights.filter(i => i.category === "anomaly").length,
  },
};
