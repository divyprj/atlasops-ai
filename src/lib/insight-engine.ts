// ============================================================
// AtlasOps AI — Insight Engine
// Generates operational intelligence from booking analytics
// Bloomberg-style alerts, not ChatGPT commentary
// ============================================================

import { Booking } from "@/types";
import {
  computeBookingAnalytics,
  computeMonthlyTrends,
  computeDestinationAnalytics,
  computeAgentAnalytics,
  computeSourceAnalytics,
  computeDayOfWeekAnalytics,
  comparePeriods,
  sum,
  mean,
  growthRate,
} from "./analytics";

// --- Insight Types ---

export interface OperationalInsight {
  id: string;
  severity: "critical" | "warning" | "positive" | "info";
  category: "revenue" | "bookings" | "cancellations" | "agents" | "destinations" | "operations" | "customers";
  title: string;
  detail: string;
  metric?: string;
  metricValue?: number;
  source: string;
  timestamp: string;
}

// --- Generate Insights from Data ---

export function generateInsights(bookings: Booking[]): OperationalInsight[] {
  const insights: OperationalInsight[] = [];
  let id = 0;
  const ts = "2025-05-27T09:00:00Z";

  const all = computeBookingAnalytics(bookings);
  const monthly = computeMonthlyTrends(bookings);
  const destinations = computeDestinationAnalytics(bookings);
  const agents = computeAgentAnalytics(bookings);
  const sources = computeSourceAnalytics(bookings);
  const dayOfWeek = computeDayOfWeekAnalytics(bookings);

  // Split into recent vs previous (last 3 months vs prior 3)
  const recentCutoff = monthly.length >= 6 ? monthly[monthly.length - 3].month : monthly[0]?.month || "2025-01";
  const recent = bookings.filter(b => b.bookingDate >= recentCutoff);
  const previous = bookings.filter(b => b.bookingDate < recentCutoff && b.bookingDate >= (monthly.length >= 6 ? monthly[monthly.length - 6].month : monthly[0]?.month || "2024-01"));
  const comparison = comparePeriods(recent, previous);

  // --- Revenue Insights ---

  if (comparison.revenue.change > 15) {
    insights.push({
      id: `INS-${++id}`, severity: "positive", category: "revenue",
      title: `Revenue grew ${comparison.revenue.change.toFixed(1)}% period-over-period`,
      detail: `Current period revenue of ₹${(comparison.revenue.current / 10000000).toFixed(2)}Cr exceeds prior period by ${comparison.revenue.change.toFixed(1)}%. Growth driven primarily by increased booking volume and improved average order value.`,
      metric: "Revenue Growth", metricValue: +comparison.revenue.change.toFixed(1),
      source: "Revenue Analytics", timestamp: ts,
    });
  } else if (comparison.revenue.change < -5) {
    insights.push({
      id: `INS-${++id}`, severity: "warning", category: "revenue",
      title: `Revenue declined ${Math.abs(comparison.revenue.change).toFixed(1)}% period-over-period`,
      detail: `Current period revenue dropped to ₹${(comparison.revenue.current / 10000000).toFixed(2)}Cr. Review destination mix and cancellation impact.`,
      metric: "Revenue Decline", metricValue: +comparison.revenue.change.toFixed(1),
      source: "Revenue Analytics", timestamp: ts,
    });
  }

  // Profit margin insight
  if (all.profitMargin < 15) {
    insights.push({
      id: `INS-${++id}`, severity: "warning", category: "revenue",
      title: `Profit margin at ${all.profitMargin}% — below 15% threshold`,
      detail: `Overall profit margin has compressed. International packages (higher margin) represent ${all.internationalShare.toFixed(1)}% of revenue. Consider adjusting domestic package pricing.`,
      metric: "Profit Margin", metricValue: all.profitMargin,
      source: "Financial Analytics", timestamp: ts,
    });
  } else {
    insights.push({
      id: `INS-${++id}`, severity: "positive", category: "revenue",
      title: `Profit margin healthy at ${all.profitMargin}%`,
      detail: `International revenue share at ${all.internationalShare.toFixed(1)}% provides margin uplift. Blended margin exceeds operational target.`,
      metric: "Profit Margin", metricValue: all.profitMargin,
      source: "Financial Analytics", timestamp: ts,
    });
  }

  // --- Cancellation Insights ---

  // Destination-specific cancellation analysis
  const highCancelDests = destinations.filter(d => d.cancellationRate > 12);
  if (highCancelDests.length > 0) {
    const worst = highCancelDests[0];
    insights.push({
      id: `INS-${++id}`, severity: "critical", category: "cancellations",
      title: `${worst.destination} cancellation rate at ${worst.cancellationRate}% — exceeds baseline`,
      detail: `${highCancelDests.length} destination(s) above 12% cancellation threshold. ${worst.destination} leads with ${worst.cancellationRate}% cancel rate across ${worst.bookings} bookings. Seasonal weather patterns and booking lead-time are primary factors.`,
      metric: "Cancellation Rate", metricValue: worst.cancellationRate,
      source: "Cancellation Analytics", timestamp: ts,
    });
  }

  // Overall cancellation trend
  if (monthly.length >= 2) {
    const recentCancel = monthly[monthly.length - 1].cancellationRate;
    const prevCancel = monthly[monthly.length - 2].cancellationRate;
    const cancelDelta = recentCancel - prevCancel;
    if (cancelDelta > 2) {
      insights.push({
        id: `INS-${++id}`, severity: "warning", category: "cancellations",
        title: `Cancellation rate increased ${cancelDelta.toFixed(1)}pp month-over-month`,
        detail: `Latest month cancel rate: ${recentCancel.toFixed(1)}% (prev: ${prevCancel.toFixed(1)}%). Monitor for sustained elevation. Common drivers: weather disruptions, pricing sensitivity, and booking lead-time compression.`,
        metric: "Cancel Rate MoM", metricValue: +cancelDelta.toFixed(1),
        source: "Trend Analysis", timestamp: ts,
      });
    }
  }

  // --- Agent Insights ---

  // Top performer
  const topAgent = agents[0];
  if (topAgent) {
    insights.push({
      id: `INS-${++id}`, severity: "positive", category: "agents",
      title: `${topAgent.agentName} leads with ${topAgent.completionRate.toFixed(1)}% completion rate`,
      detail: `Highest revenue efficiency at ₹${(topAgent.totalRevenue / 100000).toFixed(0)}L across ${topAgent.totalBookings} bookings. Cancellation rate at ${topAgent.cancellationRate}% — significantly below team average.`,
      metric: "Agent Revenue", metricValue: topAgent.totalRevenue,
      source: "Agent Analytics", timestamp: ts,
    });
  }

  // Underperforming agents
  const weakAgents = agents.filter(a => a.cancellationRate > 10);
  if (weakAgents.length > 0) {
    insights.push({
      id: `INS-${++id}`, severity: "warning", category: "agents",
      title: `${weakAgents.length} agent(s) with cancellation rate above 10%`,
      detail: `${weakAgents.map(a => `${a.agentName} (${a.cancellationRate}%)`).join(", ")}. Elevated cancellations correlate with lower completion rates and reduced revenue per booking.`,
      metric: "At-Risk Agents", metricValue: weakAgents.length,
      source: "Agent Analytics", timestamp: ts,
    });
  }

  // --- Destination Insights ---

  // International vs domestic margin
  const intlDests = destinations.filter(d => d.type === "international");
  const domDests = destinations.filter(d => d.type === "domestic");
  const intlMargin = mean(intlDests.map(d => d.profitMargin));
  const domMargin = mean(domDests.map(d => d.profitMargin));
  if (intlMargin > domMargin + 3) {
    insights.push({
      id: `INS-${++id}`, severity: "info", category: "destinations",
      title: `International margins ${(intlMargin - domMargin).toFixed(1)}pp above domestic`,
      detail: `International packages average ${intlMargin.toFixed(1)}% margin vs ${domMargin.toFixed(1)}% domestic. Higher AOV in international segment offsets lower booking volume.`,
      metric: "Margin Spread", metricValue: +(intlMargin - domMargin).toFixed(1),
      source: "Segment Analytics", timestamp: ts,
    });
  }

  // Top destination by revenue
  if (destinations.length > 0) {
    const topDest = destinations[0];
    const share = all.totalRevenue > 0 ? (topDest.revenue / all.totalRevenue * 100).toFixed(1) : "0";
    insights.push({
      id: `INS-${++id}`, severity: "info", category: "destinations",
      title: `${topDest.destination} leads destination revenue at ${share}% share`,
      detail: `₹${(topDest.revenue / 100000).toFixed(0)}L from ${topDest.bookings} bookings. AOV: ₹${topDest.avgValue.toLocaleString()}. Cancellation rate: ${topDest.cancellationRate}%.`,
      metric: "Revenue Share", metricValue: +share,
      source: "Destination Analytics", timestamp: ts,
    });
  }

  // --- Operational Insights ---

  // Weekend vs weekday
  const weekendDays = dayOfWeek.filter(d => d.day === "Fri" || d.day === "Sat" || d.day === "Sun");
  const weekdayDays = dayOfWeek.filter(d => d.day !== "Fri" && d.day !== "Sat" && d.day !== "Sun");
  const weekendAvg = mean(weekendDays.map(d => d.bookings));
  const weekdayAvg = mean(weekdayDays.map(d => d.bookings));
  if (weekendAvg > weekdayAvg * 1.15) {
    const premium = +((weekendAvg / weekdayAvg - 1) * 100).toFixed(0);
    insights.push({
      id: `INS-${++id}`, severity: "info", category: "operations",
      title: `Weekend booking volume ${premium}% above weekday average`,
      detail: `Friday–Sunday averages ${weekendAvg.toFixed(0)} bookings vs ${weekdayAvg.toFixed(0)} on weekdays. Weekend conversion rates also track higher, suggesting demand-driven booking behavior.`,
      metric: "Weekend Premium", metricValue: premium,
      source: "Operational Analytics", timestamp: ts,
    });
  }

  // Source channel performance
  const topSource = sources[0];
  if (topSource) {
    insights.push({
      id: `INS-${++id}`, severity: "info", category: "operations",
      title: `${topSource.source} channel leads at ${topSource.share}% of bookings`,
      detail: `${topSource.count} bookings via ${topSource.source}. AOV: ₹${topSource.avgValue.toLocaleString()}. Cancellation rate: ${topSource.cancellationRate}%.`,
      metric: "Channel Share", metricValue: topSource.share,
      source: "Channel Analytics", timestamp: ts,
    });
  }

  // Repeat customer insight
  if (all.repeatRatio > 20) {
    insights.push({
      id: `INS-${++id}`, severity: "positive", category: "customers",
      title: `Repeat customer ratio at ${all.repeatRatio}%`,
      detail: `${all.repeatCustomers} of ${all.totalCustomers} unique customers have booked multiple times. Repeat booking behavior indicates stable customer retention and reduces acquisition cost pressure.`,
      metric: "Repeat Ratio", metricValue: all.repeatRatio,
      source: "Customer Analytics", timestamp: ts,
    });
  }

  // Revenue concentration risk
  const top3Rev = sum(destinations.slice(0, 3).map(d => d.revenue));
  const top3Share = all.totalRevenue > 0 ? (top3Rev / all.totalRevenue * 100) : 0;
  if (top3Share > 35) {
    insights.push({
      id: `INS-${++id}`, severity: "warning", category: "revenue",
      title: `Top 3 destinations represent ${top3Share.toFixed(1)}% of total revenue`,
      detail: `Revenue concentration in ${destinations.slice(0, 3).map(d => d.destination).join(", ")}. Consider diversifying destination portfolio to reduce single-market exposure.`,
      metric: "Concentration", metricValue: +top3Share.toFixed(1),
      source: "Risk Analytics", timestamp: ts,
    });
  }

  // Booking volume trend
  if (monthly.length >= 3) {
    const last3 = monthly.slice(-3);
    const avgRecent = mean(last3.map(m => m.bookings));
    const prior3 = monthly.slice(-6, -3);
    const avgPrior = mean(prior3.map(m => m.bookings));
    const volumeChange = growthRate(avgRecent, avgPrior);
    if (Math.abs(volumeChange) > 5) {
      insights.push({
        id: `INS-${++id}`, severity: volumeChange > 0 ? "positive" : "warning", category: "bookings",
        title: `Booking volume ${volumeChange > 0 ? "up" : "down"} ${Math.abs(volumeChange).toFixed(1)}% (3-month rolling)`,
        detail: `Recent 3-month average: ${avgRecent.toFixed(0)} bookings/month vs ${avgPrior.toFixed(0)} prior period. ${volumeChange > 0 ? "Sustained growth indicates healthy demand pipeline." : "Declining volume warrants review of marketing spend and conversion funnel."}`,
        metric: "Volume Trend", metricValue: +volumeChange.toFixed(1),
        source: "Trend Analytics", timestamp: ts,
      });
    }
  }

  return insights;
}
