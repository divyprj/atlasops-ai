// ============================================================
// AtlasOps AI — Forecasting Data (Generated from Booking Data)
// Statistical forecasts via linear regression + seasonal adj.
// ============================================================

import { ForecastDataPoint, ForecastSummary as ForecastSummaryType, Report } from "@/types";
import { bookings } from "./bookings";
import { computeMonthlyTrends, sum } from "@/lib/analytics";
import {
  forecastRevenue,
  forecastBookings,
  forecastCancellationRate,
  forecastDestinationDemand,
  generateForecastBrief,
} from "@/lib/forecast-engine";

// --- Compute Forecasts ---

const revForecast = forecastRevenue(bookings, 6);
const bkgForecast = forecastBookings(bookings, 6);
const cancelForecast = forecastCancellationRate(bookings, 6);
const monthly = computeMonthlyTrends(bookings);

// --- Revenue Forecast (actual + predicted) ---

export const revenueForecast: ForecastDataPoint[] = [
  // Historical actuals (last 5 months)
  ...monthly.slice(-5).map(m => ({
    date: m.month,
    actual: m.revenue,
    predicted: m.revenue,
    lowerBound: Math.round(m.revenue * 0.9),
    upperBound: Math.round(m.revenue * 1.1),
  })),
  // Forecast points
  ...revForecast.points.map(p => ({
    date: p.period,
    predicted: p.forecast,
    lowerBound: p.lower,
    upperBound: p.upper,
  })),
];

// --- Booking Forecast ---

export const bookingForecast: ForecastDataPoint[] = [
  ...monthly.slice(-5).map(m => ({
    date: m.month,
    actual: m.bookings,
    predicted: m.bookings,
    lowerBound: Math.round(m.bookings * 0.85),
    upperBound: Math.round(m.bookings * 1.15),
  })),
  ...bkgForecast.points.map(p => ({
    date: p.period,
    predicted: p.forecast,
    lowerBound: p.lower,
    upperBound: p.upper,
  })),
];

// --- Cancellation Rate Forecast ---

export const cancellationForecast: ForecastDataPoint[] = [
  ...monthly.slice(-5).map(m => ({
    date: m.month,
    actual: m.cancellationRate,
    predicted: m.cancellationRate,
    lowerBound: Math.max(0, m.cancellationRate - 3),
    upperBound: m.cancellationRate + 3,
  })),
  ...cancelForecast.points.map(p => ({
    date: p.period,
    predicted: p.forecast,
    lowerBound: p.lower,
    upperBound: p.upper,
  })),
];

// --- Destination Demand Forecast ---

export const demandForecastByDestination = forecastDestinationDemand(bookings, 10);

// --- Forecast Summaries ---

export const forecastSummaries: ForecastSummaryType[] = [
  {
    metric: "Monthly Revenue",
    nextMonthPrediction: revForecast.points[0]?.forecast || 0,
    confidence: revForecast.points[0]?.confidence || 0,
    trend: revForecast.trend === "growing" ? "up" : revForecast.trend === "declining" ? "down" : "flat",
    seasonalFactor: revForecast.seasonalityDetected
      ? "Seasonal patterns detected — forecast adjusted for cyclical demand"
      : "No significant seasonality — linear trend extrapolation applied",
  },
  {
    metric: "Booking Volume",
    nextMonthPrediction: bkgForecast.points[0]?.forecast || 0,
    confidence: bkgForecast.points[0]?.confidence || 0,
    trend: bkgForecast.trend === "growing" ? "up" : bkgForecast.trend === "declining" ? "down" : "flat",
    seasonalFactor: bkgForecast.seasonalityDetected
      ? "Seasonal booking patterns influence short-term projection"
      : "Volume trend follows linear growth trajectory",
  },
  {
    metric: "Cancellation Rate",
    nextMonthPrediction: cancelForecast.points[0]?.forecast || 0,
    confidence: cancelForecast.points[0]?.confidence || 0,
    trend: cancelForecast.trend === "growing" ? "up" : cancelForecast.trend === "declining" ? "down" : "flat",
    seasonalFactor: "Cancel rate projection based on recent trajectory and destination mix",
  },
];

// --- Executive Forecast Brief ---

export const forecastBrief = generateForecastBrief(bookings);

// --- Reports ---

// Derive report metrics from recent booking data
const lastMonthBookings = bookings.filter(b => {
  const d = new Date(b.bookingDate);
  return d.getMonth() === 3 && d.getFullYear() === 2025; // April 2025
});
const lastMonthRev = sum(lastMonthBookings.map(b => b.amount));
const lastMonthCancels = lastMonthBookings.filter(b => b.status === "cancelled").length;

export const reports: Report[] = [
  { id: "RPT-001", title: "Daily Operations Summary", type: "daily", status: "ready", generatedAt: "2025-05-27T08:00:00Z", period: "May 26, 2025", metrics: { revenue: 485000, bookings: 18, cancellations: 2, growth: 12.4 } },
  { id: "RPT-002", title: "Weekly Performance Report", type: "weekly", status: "ready", generatedAt: "2025-05-26T00:00:00Z", period: "May 19-25, 2025", metrics: { revenue: 3250000, bookings: 118, cancellations: 11, growth: 8.2 } },
  { id: "RPT-003", title: "Monthly Executive Summary", type: "monthly", status: "ready", generatedAt: "2025-05-01T00:00:00Z", period: "April 2025", metrics: { revenue: lastMonthRev, bookings: lastMonthBookings.length, cancellations: lastMonthCancels, growth: 15.6 } },
  { id: "RPT-004", title: "Q1 2025 Executive Report", type: "executive", status: "ready", generatedAt: "2025-04-01T00:00:00Z", period: "Q1 2025", metrics: { revenue: 38500000, bookings: 1380, cancellations: 124, growth: 22.1 } },
  { id: "RPT-005", title: "Daily Operations Summary", type: "daily", status: "ready", generatedAt: "2025-05-26T08:00:00Z", period: "May 25, 2025", metrics: { revenue: 412000, bookings: 15, cancellations: 1, growth: 5.8 } },
  { id: "RPT-006", title: "Weekly Performance Report", type: "weekly", status: "ready", generatedAt: "2025-05-19T00:00:00Z", period: "May 12-18, 2025", metrics: { revenue: 2980000, bookings: 105, cancellations: 9, growth: 6.4 } },
  { id: "RPT-007", title: "Today's Report", type: "daily", status: "generating", generatedAt: "2025-05-27T09:00:00Z", period: "May 27, 2025", metrics: { revenue: 245000, bookings: 8, cancellations: 1, growth: 0 } },
];

// Copilot suggested queries
export const suggestedQueries = [
  "What is driving the cancellation trend?",
  "Which destinations are underperforming baseline?",
  "Show agent performance rankings by revenue efficiency",
  "Revenue forecast for next quarter",
  "Identify highest-risk operational anomalies",
  "Which agents need performance intervention?",
  "Summarize operational health status",
  "Break down revenue concentration risk",
];
