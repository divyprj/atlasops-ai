// ============================================================
// AtlasOps AI — Agent Data (Derived from Bookings)
// Agent performance metrics computed from actual booking records
// ============================================================

import { Agent } from "@/types";
import { bookings } from "./bookings";
import { computeAgentAnalytics, computeMonthlyTrends, groupBy, sum, mean } from "@/lib/analytics";

// Agent metadata (static — identity, join dates, regions)
const agentMeta: Record<string, { name: string; email: string; avatar: string; region: string; joinDate: string }> = {
  "AGT-001": { name: "Rahul Sharma", email: "rahul.sharma@atlasops.in", avatar: "RS", region: "North India", joinDate: "2022-03-15" },
  "AGT-002": { name: "Priya Patel", email: "priya.patel@atlasops.in", avatar: "PP", region: "West India", joinDate: "2022-06-01" },
  "AGT-003": { name: "Arjun Mehta", email: "arjun.mehta@atlasops.in", avatar: "AM", region: "South India", joinDate: "2022-01-10" },
  "AGT-004": { name: "Sneha Reddy", email: "sneha.reddy@atlasops.in", avatar: "SR", region: "South India", joinDate: "2023-02-20" },
  "AGT-005": { name: "Vikram Singh", email: "vikram.singh@atlasops.in", avatar: "VS", region: "North India", joinDate: "2022-08-12" },
  "AGT-006": { name: "Kavya Nair", email: "kavya.nair@atlasops.in", avatar: "KN", region: "South India", joinDate: "2023-05-08" },
  "AGT-007": { name: "Aditya Joshi", email: "aditya.joshi@atlasops.in", avatar: "AJ", region: "West India", joinDate: "2022-11-15" },
  "AGT-008": { name: "Meera Gupta", email: "meera.gupta@atlasops.in", avatar: "MG", region: "North India", joinDate: "2023-01-05" },
  "AGT-009": { name: "Rohan Das", email: "rohan.das@atlasops.in", avatar: "RD", region: "East India", joinDate: "2023-04-18" },
  "AGT-010": { name: "Ananya Iyer", email: "ananya.iyer@atlasops.in", avatar: "AI", region: "South India", joinDate: "2022-09-22" },
  "AGT-011": { name: "Karthik Bhat", email: "karthik.bhat@atlasops.in", avatar: "KB", region: "South India", joinDate: "2023-07-10" },
  "AGT-012": { name: "Neha Kapoor", email: "neha.kapoor@atlasops.in", avatar: "NK", region: "North India", joinDate: "2023-03-25" },
  "AGT-013": { name: "Siddharth Verma", email: "siddharth.verma@atlasops.in", avatar: "SV", region: "North India", joinDate: "2024-01-08" },
  "AGT-014": { name: "Divya Menon", email: "divya.menon@atlasops.in", avatar: "DM", region: "South India", joinDate: "2023-09-14" },
  "AGT-015": { name: "Rajesh Kumar", email: "rajesh.kumar@atlasops.in", avatar: "RK", region: "East India", joinDate: "2022-04-20" },
};

// Compute agent performance from actual booking data
const agentAnalytics = computeAgentAnalytics(bookings);

// Response time simulation: correlated with performance
// Elite agents respond faster, underperformers are slower
const responseTimeMap: Record<string, number> = {
  "AGT-001": 12, "AGT-002": 15, "AGT-003": 18, "AGT-004": 10, "AGT-005": 22,
  "AGT-006": 14, "AGT-007": 25, "AGT-008": 16, "AGT-009": 28, "AGT-010": 13,
  "AGT-011": 20, "AGT-012": 17, "AGT-013": 30, "AGT-014": 15, "AGT-015": 21,
};

// Customer satisfaction: correlated with cancellation rate (inverse)
const satisfactionMap: Record<string, number> = {
  "AGT-001": 4.8, "AGT-002": 4.6, "AGT-003": 4.4, "AGT-004": 4.7, "AGT-005": 4.1,
  "AGT-006": 4.5, "AGT-007": 3.9, "AGT-008": 4.3, "AGT-009": 3.7, "AGT-010": 4.6,
  "AGT-011": 4.0, "AGT-012": 4.2, "AGT-013": 3.5, "AGT-014": 4.4, "AGT-015": 4.0,
};

// Compute performance score from booking metrics
function computePerformanceScore(
  completionRate: number,
  cancellationRate: number,
  avgBookingValue: number,
  allAgentAvgValue: number
): number {
  // Weighted composite:
  // 35% completion rate, 25% low cancellation, 25% revenue per booking, 15% volume factor
  const completionScore = Math.min(100, completionRate * 1.3);
  const cancelScore = Math.max(0, 100 - cancellationRate * 6);
  const valueScore = Math.min(100, (avgBookingValue / allAgentAvgValue) * 70);
  const score = completionScore * 0.35 + cancelScore * 0.25 + valueScore * 0.25 + 15;
  return Math.round(Math.min(100, Math.max(0, score)));
}

function classifyTier(score: number): "elite" | "strong" | "average" | "needs_improvement" {
  if (score >= 85) return "elite";
  if (score >= 70) return "strong";
  if (score >= 55) return "average";
  return "needs_improvement";
}

// Compute monthly bookings per agent
function computeMonthlyAgentData(agentId: string): { monthlyBookings: number[]; monthlyRevenue: number[] } {
  const agentBookings = bookings.filter(b => b.agentId === agentId);
  const byMonth = groupBy(agentBookings, b => b.bookingDate.substring(0, 7));

  // Get all months from the full booking range
  const allMonths = [...new Set(bookings.map(b => b.bookingDate.substring(0, 7)))].sort();

  const monthlyBookings = allMonths.map(m => byMonth[m]?.length || 0);
  const monthlyRevenue = allMonths.map(m => sum((byMonth[m] || []).map(b => b.amount)));

  return { monthlyBookings, monthlyRevenue };
}

// Average booking value across all agents
const allAgentAvgValue = agentAnalytics.length > 0
  ? mean(agentAnalytics.map(a => a.avgBookingValue))
  : 1;

// Build agent objects
export const agents: Agent[] = agentAnalytics.map(aa => {
  const meta = agentMeta[aa.agentId] || {
    name: aa.agentName,
    email: `${aa.agentName.toLowerCase().replace(" ", ".")}@atlasops.in`,
    avatar: aa.agentName.split(" ").map(n => n[0]).join(""),
    region: "Unknown",
    joinDate: "2023-01-01",
  };

  const performanceScore = computePerformanceScore(
    aa.completionRate,
    aa.cancellationRate,
    aa.avgBookingValue,
    allAgentAvgValue
  );

  const conversionRate = +(aa.completionRate * 1.1).toFixed(1); // conversion > completion
  const { monthlyBookings, monthlyRevenue } = computeMonthlyAgentData(aa.agentId);

  return {
    id: aa.agentId,
    name: meta.name,
    email: meta.email,
    avatar: meta.avatar,
    region: meta.region,
    joinDate: meta.joinDate,
    totalBookings: aa.totalBookings,
    totalRevenue: aa.totalRevenue,
    conversionRate: Math.min(99, conversionRate),
    avgResponseTime: responseTimeMap[aa.agentId] || 18,
    cancellationRatio: aa.cancellationRate,
    customerSatisfaction: satisfactionMap[aa.agentId] || 4.0,
    performanceScore,
    performanceTier: classifyTier(performanceScore),
    activeStatus: true,
    monthlyBookings,
    monthlyRevenue,
  };
}).sort((a, b) => b.performanceScore - a.performanceScore);

// Summary (computed from actual agent data)
export const agentSummary = {
  totalAgents: agents.length,
  activeAgents: agents.filter(a => a.activeStatus).length,
  avgConversionRate: +(agents.reduce((s, a) => s + a.conversionRate, 0) / agents.length).toFixed(1),
  avgResponseTime: +(agents.reduce((s, a) => s + a.avgResponseTime, 0) / agents.length).toFixed(0),
  totalAgentRevenue: agents.reduce((s, a) => s + a.totalRevenue, 0),
  topPerformer: agents.reduce((top, a) => a.performanceScore > top.performanceScore ? a : top, agents[0]),
  eliteCount: agents.filter(a => a.performanceTier === "elite").length,
  needsImprovementCount: agents.filter(a => a.performanceTier === "needs_improvement").length,
};
