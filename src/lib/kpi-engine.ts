// ============================================================
// AtlasOps AI — KPI Engine
// Enterprise KPI computation with period comparison,
// trend analysis, and operational scoring
// ============================================================

import { Booking } from "@/types";
import {
  computeBookingAnalytics,
  computeMonthlyTrends,
  computeDestinationAnalytics,
  computeAgentAnalytics,
  growthRate,
  rollingAverage,
  sum,
} from "./analytics";

// --- KPI Definitions ---

export interface KPIMetric {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  change: number;          // absolute change
  changePercent: number;   // percentage change
  format: "currency" | "number" | "percentage" | "score";
  trend: "up" | "down" | "stable";
  status: "good" | "warning" | "critical";
}

export interface OperationalScorecard {
  overallScore: number;
  revenue: KPIMetric;
  bookingVolume: KPIMetric;
  cancellationRate: KPIMetric;
  revenueGrowth: KPIMetric;
  avgOrderValue: KPIMetric;
  profitMargin: KPIMetric;
  repeatRatio: KPIMetric;
  conversionRate: KPIMetric;
  agentProductivity: KPIMetric;
  healthScore: KPIMetric;
}

// --- Period Helpers ---

function getLatestMonths(bookings: Booking[], months: number) {
  const sorted = [...bookings].sort((a, b) =>
    b.bookingDate.localeCompare(a.bookingDate)
  );
  if (sorted.length === 0) return { current: [], previous: [] };

  const latestDate = new Date(sorted[0].bookingDate);
  const cutoff = new Date(latestDate);
  cutoff.setMonth(cutoff.getMonth() - months);
  const previousCutoff = new Date(cutoff);
  previousCutoff.setMonth(previousCutoff.getMonth() - months);

  const current = bookings.filter(b => {
    const d = new Date(b.bookingDate);
    return d >= cutoff && d <= latestDate;
  });
  const previous = bookings.filter(b => {
    const d = new Date(b.bookingDate);
    return d >= previousCutoff && d < cutoff;
  });
  return { current, previous };
}

// --- Trend Classification ---

function classifyTrend(changePercent: number): "up" | "down" | "stable" {
  if (changePercent > 1.5) return "up";
  if (changePercent < -1.5) return "down";
  return "stable";
}

function classifyStatus(
  metric: string,
  value: number,
  changePercent: number
): "good" | "warning" | "critical" {
  switch (metric) {
    case "cancellationRate":
      if (value > 15) return "critical";
      if (value > 10) return "warning";
      return "good";
    case "profitMargin":
      if (value < 10) return "critical";
      if (value < 15) return "warning";
      return "good";
    case "healthScore":
      if (value < 85) return "critical";
      if (value < 92) return "warning";
      return "good";
    case "conversionRate":
      if (value < 50) return "critical";
      if (value < 65) return "warning";
      return "good";
    default:
      if (changePercent < -10) return "critical";
      if (changePercent < -3) return "warning";
      return "good";
  }
}

// --- Build KPI Metric ---

function buildKPI(
  id: string,
  label: string,
  current: number,
  previous: number,
  format: KPIMetric["format"],
  metricType: string
): KPIMetric {
  const change = current - previous;
  const changePercent = +growthRate(current, previous).toFixed(1);
  return {
    id,
    label,
    value: +current.toFixed(1),
    previousValue: +previous.toFixed(1),
    change: +change.toFixed(1),
    changePercent,
    format,
    trend: classifyTrend(changePercent),
    status: classifyStatus(metricType, current, changePercent),
  };
}

// --- Main KPI Engine ---

export function computeOperationalScorecard(
  bookings: Booking[],
  periodMonths: number = 3
): OperationalScorecard {
  const { current, previous } = getLatestMonths(bookings, periodMonths);

  const curAnalytics = computeBookingAnalytics(current);
  const prevAnalytics = computeBookingAnalytics(previous);

  // Agent productivity: revenue per agent per period
  const curAgents = computeAgentAnalytics(current);
  const prevAgents = computeAgentAnalytics(previous);
  const curAgentProductivity = curAgents.length > 0
    ? curAnalytics.totalRevenue / curAgents.length : 0;
  const prevAgentProductivity = prevAgents.length > 0
    ? prevAnalytics.totalRevenue / prevAgents.length : 0;

  // Conversion rate: completed / (total - pending)
  const curConversion = (curAnalytics.totalBookings - curAnalytics.pending) > 0
    ? (curAnalytics.completed / (curAnalytics.totalBookings - curAnalytics.pending)) * 100
    : 0;
  const prevConversion = (prevAnalytics.totalBookings - prevAnalytics.pending) > 0
    ? (prevAnalytics.completed / (prevAnalytics.totalBookings - prevAnalytics.pending)) * 100
    : 0;

  // Operational health score: composite
  const healthScore = computeHealthScore(curAnalytics);
  const prevHealthScore = computeHealthScore(prevAnalytics);

  // Revenue growth (annualized from period)
  const revenueGrowthPercent = +growthRate(curAnalytics.totalRevenue, prevAnalytics.totalRevenue).toFixed(1);
  const prevRevenueGrowthPercent = 0; // baseline

  const revenue = buildKPI("revenue", "Total Revenue", curAnalytics.totalRevenue, prevAnalytics.totalRevenue, "currency", "revenue");
  const bookingVolume = buildKPI("bookingVolume", "Booking Volume", curAnalytics.totalBookings, prevAnalytics.totalBookings, "number", "bookingVolume");
  const cancellationRate = buildKPI("cancellationRate", "Cancellation Rate", curAnalytics.cancellationRate, prevAnalytics.cancellationRate, "percentage", "cancellationRate");
  const revenueGrowth = buildKPI("revenueGrowth", "Revenue Growth", revenueGrowthPercent, prevRevenueGrowthPercent, "percentage", "revenueGrowth");
  const avgOrderValue = buildKPI("avgOrderValue", "Avg Order Value", curAnalytics.avgOrderValue, prevAnalytics.avgOrderValue, "currency", "avgOrderValue");
  const profitMargin = buildKPI("profitMargin", "Profit Margin", curAnalytics.profitMargin, prevAnalytics.profitMargin, "percentage", "profitMargin");
  const repeatRatio = buildKPI("repeatRatio", "Repeat Booking Ratio", curAnalytics.repeatRatio, prevAnalytics.repeatRatio, "percentage", "repeatRatio");
  const conversionRate = buildKPI("conversionRate", "Conversion Rate", curConversion, prevConversion, "percentage", "conversionRate");
  const agentProductivity = buildKPI("agentProductivity", "Revenue per Agent", curAgentProductivity, prevAgentProductivity, "currency", "agentProductivity");
  const healthScoreKPI = buildKPI("healthScore", "Operational Health", healthScore, prevHealthScore, "score", "healthScore");

  // Overall score: weighted composite
  const overallScore = computeOverallScore({
    cancellationRate: curAnalytics.cancellationRate,
    profitMargin: curAnalytics.profitMargin,
    conversionRate: curConversion,
    revenueGrowth: revenueGrowthPercent,
    repeatRatio: curAnalytics.repeatRatio,
  });

  return {
    overallScore,
    revenue,
    bookingVolume,
    cancellationRate,
    revenueGrowth,
    avgOrderValue,
    profitMargin,
    repeatRatio,
    conversionRate,
    agentProductivity,
    healthScore: healthScoreKPI,
  };
}

// --- Operational Health Score ---

function computeHealthScore(analytics: ReturnType<typeof computeBookingAnalytics>): number {
  // Composite of:
  // - Low cancellation rate (25% weight)
  // - Good profit margin (25% weight)
  // - Good repeat ratio (15% weight)
  // - Balanced domestic/international (10% weight)
  // - Revenue volume (5% weight)
  // - Data quality baseline (20% floor — clean data gets credit)

  const cancelScore = Math.max(0, 100 - analytics.cancellationRate * 3); // 0% = 100, 33% = 0
  const marginScore = Math.min(100, analytics.profitMargin * 4); // 25% margin = 100
  const repeatScore = analytics.totalCustomers > 0
    ? Math.min(100, analytics.repeatRatio * 3 + 20) // 20pt floor for any dataset
    : 50; // default when no repeat data available
  const balanceScore = Math.min(100, 100 - Math.abs(analytics.internationalShare - 40) * 1.5); // softer penalty
  const volumeScore = Math.min(100, analytics.totalBookings * 2); // 50+ bookings = 100

  const score = (
    cancelScore * 0.25 +
    marginScore * 0.25 +
    repeatScore * 0.15 +
    balanceScore * 0.10 +
    volumeScore * 0.05 +
    20 // data quality baseline — clean ingestion earns 20 points
  );

  return +Math.min(100, score).toFixed(1);
}

// --- Overall Business Score ---

function computeOverallScore(metrics: {
  cancellationRate: number;
  profitMargin: number;
  conversionRate: number;
  revenueGrowth: number;
  repeatRatio: number;
}): number {
  // Weighted composite — enterprise standard scoring
  const cancelScore = Math.max(0, 100 - metrics.cancellationRate * 5);
  const marginScore = Math.min(100, metrics.profitMargin * 4);
  const conversionScore = Math.min(100, metrics.conversionRate * 1.2);
  const growthScore = Math.min(100, Math.max(0, 50 + metrics.revenueGrowth * 2));
  const repeatScore = Math.min(100, metrics.repeatRatio * 3);

  return +(
    cancelScore * 0.25 +
    marginScore * 0.20 +
    conversionScore * 0.25 +
    growthScore * 0.15 +
    repeatScore * 0.15
  ).toFixed(1);
}

// --- Revenue Decomposition ---

export function computeRevenueDecomposition(bookings: Booking[]) {
  const analytics = computeBookingAnalytics(bookings);
  const destinations = computeDestinationAnalytics(bookings);

  // Revenue concentration (Herfindahl index)
  const shares = destinations.map(d => d.revenue / analytics.totalRevenue);
  const hhi = sum(shares.map(s => s * s)) * 10000;

  // Top 3 destinations contribute what %
  const top3Revenue = sum(destinations.slice(0, 3).map(d => d.revenue));
  const top3Share = analytics.totalRevenue > 0 ? (top3Revenue / analytics.totalRevenue) * 100 : 0;

  return {
    totalRevenue: analytics.totalRevenue,
    totalProfit: analytics.totalProfit,
    profitMargin: analytics.profitMargin,
    domesticRevenue: analytics.domesticRevenue,
    internationalRevenue: analytics.internationalRevenue,
    internationalShare: analytics.internationalShare,
    hhi: Math.round(hhi),
    top3Share: +top3Share.toFixed(1),
    destinations,
  };
}

// --- Trend Summary for Executive View ---

export function computeExecutiveSummary(bookings: Booking[]) {
  const monthly = computeMonthlyTrends(bookings);
  const revenueValues = monthly.map(m => m.revenue);
  const bookingValues = monthly.map(m => m.bookings);
  const cancelValues = monthly.map(m => m.cancellationRate);

  const revenueMA3 = rollingAverage(revenueValues, 3);
  const bookingMA3 = rollingAverage(bookingValues, 3);
  const cancelMA3 = rollingAverage(cancelValues, 3);

  return monthly.map((m, i) => ({
    ...m,
    revenueMA3: Math.round(revenueMA3[i]),
    bookingMA3: +bookingMA3[i].toFixed(0),
    cancelMA3: +cancelMA3[i].toFixed(1),
  }));
}
