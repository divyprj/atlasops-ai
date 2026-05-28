// ============================================================
// AtlasOps AI — Forecast Engine
// Statistical forecasting: linear regression, seasonal
// adjustment, confidence intervals
// ============================================================

import { Booking } from "@/types";
import {
  computeMonthlyTrends,
  computeDestinationAnalytics,
  mean,
  stdDev,
  groupBy,
} from "./analytics";

// --- Forecast Types ---

export interface ForecastPoint {
  period: string;
  forecast: number;
  lower: number;    // 80% CI
  upper: number;    // 80% CI
  confidence: number; // 0-100
}

export interface ForecastSummary {
  metric: string;
  unit: string;
  horizon: string;
  points: ForecastPoint[];
  trend: "growing" | "declining" | "stable";
  trendStrength: number; // slope magnitude
  seasonalityDetected: boolean;
}

// --- Simple Linear Regression ---

function linearRegression(values: number[]): { slope: number; intercept: number; r2: number } {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: values[0] || 0, r2: 0 };

  const xs = values.map((_, i) => i);
  const xMean = mean(xs);
  const yMean = mean(values);

  let ssXY = 0, ssXX = 0, ssYY = 0;
  for (let i = 0; i < n; i++) {
    ssXY += (xs[i] - xMean) * (values[i] - yMean);
    ssXX += (xs[i] - xMean) ** 2;
    ssYY += (values[i] - yMean) ** 2;
  }

  const slope = ssXX > 0 ? ssXY / ssXX : 0;
  const intercept = yMean - slope * xMean;
  const r2 = ssXX > 0 && ssYY > 0 ? (ssXY ** 2) / (ssXX * ssYY) : 0;

  return { slope, intercept, r2 };
}

// --- Seasonal Index (multiplicative) ---

function computeSeasonalIndex(values: number[], period: number = 12): number[] {
  if (values.length < period) return values.map(() => 1.0);

  const avg = mean(values);
  if (avg === 0) return values.map(() => 1.0);

  // Compute average for each seasonal position
  const indices: number[] = [];
  for (let s = 0; s < period; s++) {
    const seasonalValues: number[] = [];
    for (let i = s; i < values.length; i += period) {
      seasonalValues.push(values[i]);
    }
    indices.push(seasonalValues.length > 0 ? mean(seasonalValues) / avg : 1.0);
  }

  return indices;
}

// --- Detect Seasonality ---

function hasSeasonality(values: number[], period: number = 12): boolean {
  const indices = computeSeasonalIndex(values, Math.min(period, values.length));
  const deviation = stdDev(indices);
  return deviation > 0.08; // >8% variation across seasons
}

// --- Revenue Forecast ---

export function forecastRevenue(bookings: Booking[], horizonMonths: number = 6): ForecastSummary {
  const monthly = computeMonthlyTrends(bookings);
  const revenues = monthly.map(m => m.revenue);

  const reg = linearRegression(revenues);
  const seasonal = computeSeasonalIndex(revenues, Math.min(12, revenues.length));
  const residuals = revenues.map((v, i) => v - (reg.intercept + reg.slope * i));
  const residualSD = stdDev(residuals);

  const points: ForecastPoint[] = [];
  for (let h = 1; h <= horizonMonths; h++) {
    const trendValue = reg.intercept + reg.slope * (revenues.length + h - 1);
    const seasonIdx = (revenues.length + h - 1) % seasonal.length;
    const forecast = Math.max(0, trendValue * seasonal[seasonIdx]);

    // Confidence decreases with horizon
    const horizonFactor = 1 + (h - 1) * 0.15;
    const ci = residualSD * 1.28 * horizonFactor; // 80% CI
    const confidence = Math.max(50, Math.min(95, 92 - h * 5));

    const lastMonth = monthly[monthly.length - 1]?.month || "2025-05";
    const [y, m] = lastMonth.split("-").map(Number);
    const forecastDate = new Date(y, m + h - 1, 1);
    const period = `${forecastDate.getFullYear()}-${String(forecastDate.getMonth() + 1).padStart(2, "0")}`;

    points.push({
      period,
      forecast: Math.round(forecast),
      lower: Math.round(Math.max(0, forecast - ci)),
      upper: Math.round(forecast + ci),
      confidence,
    });
  }

  return {
    metric: "Revenue",
    unit: "INR",
    horizon: `${horizonMonths}-month`,
    points,
    trend: reg.slope > 50000 ? "growing" : reg.slope < -50000 ? "declining" : "stable",
    trendStrength: Math.abs(reg.slope),
    seasonalityDetected: hasSeasonality(revenues),
  };
}

// --- Booking Volume Forecast ---

export function forecastBookings(bookings: Booking[], horizonMonths: number = 6): ForecastSummary {
  const monthly = computeMonthlyTrends(bookings);
  const volumes = monthly.map(m => m.bookings);

  const reg = linearRegression(volumes);
  const seasonal = computeSeasonalIndex(volumes, Math.min(12, volumes.length));
  const residuals = volumes.map((v, i) => v - (reg.intercept + reg.slope * i));
  const residualSD = stdDev(residuals);

  const points: ForecastPoint[] = [];
  for (let h = 1; h <= horizonMonths; h++) {
    const trendValue = reg.intercept + reg.slope * (volumes.length + h - 1);
    const seasonIdx = (volumes.length + h - 1) % seasonal.length;
    const forecast = Math.max(0, trendValue * seasonal[seasonIdx]);
    const horizonFactor = 1 + (h - 1) * 0.15;
    const ci = residualSD * 1.28 * horizonFactor;
    const confidence = Math.max(50, Math.min(95, 90 - h * 5));

    const lastMonth = monthly[monthly.length - 1]?.month || "2025-05";
    const [y, m] = lastMonth.split("-").map(Number);
    const forecastDate = new Date(y, m + h - 1, 1);
    const period = `${forecastDate.getFullYear()}-${String(forecastDate.getMonth() + 1).padStart(2, "0")}`;

    points.push({
      period,
      forecast: Math.round(forecast),
      lower: Math.round(Math.max(0, forecast - ci)),
      upper: Math.round(forecast + ci),
      confidence,
    });
  }

  return {
    metric: "Bookings",
    unit: "count",
    horizon: `${horizonMonths}-month`,
    points,
    trend: reg.slope > 2 ? "growing" : reg.slope < -2 ? "declining" : "stable",
    trendStrength: Math.abs(reg.slope),
    seasonalityDetected: hasSeasonality(volumes),
  };
}

// --- Cancellation Rate Forecast ---

export function forecastCancellationRate(bookings: Booking[], horizonMonths: number = 6): ForecastSummary {
  const monthly = computeMonthlyTrends(bookings);
  const rates = monthly.map(m => m.cancellationRate);

  const reg = linearRegression(rates);
  const residuals = rates.map((v, i) => v - (reg.intercept + reg.slope * i));
  const residualSD = stdDev(residuals);

  const points: ForecastPoint[] = [];
  for (let h = 1; h <= horizonMonths; h++) {
    const forecast = Math.max(0, Math.min(50, reg.intercept + reg.slope * (rates.length + h - 1)));
    const horizonFactor = 1 + (h - 1) * 0.2;
    const ci = residualSD * 1.28 * horizonFactor;
    const confidence = Math.max(45, Math.min(90, 85 - h * 6));

    const lastMonth = monthly[monthly.length - 1]?.month || "2025-05";
    const [y, m] = lastMonth.split("-").map(Number);
    const forecastDate = new Date(y, m + h - 1, 1);
    const period = `${forecastDate.getFullYear()}-${String(forecastDate.getMonth() + 1).padStart(2, "0")}`;

    points.push({
      period,
      forecast: +forecast.toFixed(1),
      lower: +Math.max(0, forecast - ci).toFixed(1),
      upper: +Math.min(50, forecast + ci).toFixed(1),
      confidence,
    });
  }

  return {
    metric: "Cancellation Rate",
    unit: "%",
    horizon: `${horizonMonths}-month`,
    points,
    trend: reg.slope > 0.3 ? "growing" : reg.slope < -0.3 ? "declining" : "stable",
    trendStrength: Math.abs(reg.slope),
    seasonalityDetected: false,
  };
}

// --- Destination Demand Forecast ---

export function forecastDestinationDemand(bookings: Booking[], topN: number = 5): {
  destination: string;
  currentBookings: number;
  projectedBookings: number;
  change: number;
  confidence: number;
}[] {
  const destinations = computeDestinationAnalytics(bookings);
  const byDest = groupBy(bookings, b => b.destination);

  return destinations.slice(0, topN).map(dest => {
    const destBookings = byDest[dest.destination] || [];
    const byMonth = groupBy(destBookings, b => b.bookingDate.substring(0, 7));
    const monthlyCounts = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, bks]) => bks.length);

    const reg = linearRegression(monthlyCounts);
    const projected = Math.max(1, Math.round(reg.intercept + reg.slope * monthlyCounts.length));
    const current = monthlyCounts[monthlyCounts.length - 1] || 0;
    const change = current > 0 ? +((projected - current) / current * 100).toFixed(1) : 0;

    return {
      destination: dest.destination,
      currentBookings: current,
      projectedBookings: projected,
      change,
      confidence: Math.max(55, Math.round(reg.r2 * 100)),
    };
  });
}

// --- Executive Forecast Brief ---

export function generateForecastBrief(bookings: Booking[]): string {
  const revForecast = forecastRevenue(bookings, 3);
  const bkgForecast = forecastBookings(bookings, 3);
  const cancelForecast = forecastCancellationRate(bookings, 3);

  const nextRev = revForecast.points[0];
  const nextBkg = bkgForecast.points[0];
  const nextCancel = cancelForecast.points[0];

  const lines = [
    `Forecast Summary — ${nextRev.period}`,
    "",
    `Revenue: ₹${(nextRev.forecast / 100000).toFixed(0)}L (${nextRev.confidence}% confidence)`,
    `  Range: ₹${(nextRev.lower / 100000).toFixed(0)}L – ₹${(nextRev.upper / 100000).toFixed(0)}L`,
    "",
    `Bookings: ${nextBkg.forecast} (${nextBkg.confidence}% confidence)`,
    `  Range: ${nextBkg.lower} – ${nextBkg.upper}`,
    "",
    `Cancel Rate: ${nextCancel.forecast}% (${nextCancel.confidence}% confidence)`,
    `  Range: ${nextCancel.lower}% – ${nextCancel.upper}%`,
    "",
    `Trend: Revenue ${revForecast.trend}, Bookings ${bkgForecast.trend}`,
    revForecast.seasonalityDetected ? "Seasonal patterns detected in revenue data." : "",
  ];

  return lines.filter(Boolean).join("\n");
}
