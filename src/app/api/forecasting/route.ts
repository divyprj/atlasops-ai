// ============================================================
// AtlasOps AI — Forecasting API
// GET /api/forecasting
// ============================================================

import { NextResponse } from "next/server";
import { fetchBookings } from "@/lib/data-service";
import { computeMonthlyTrends } from "@/lib/analytics";
import {
  forecastRevenue,
  forecastBookings,
  forecastCancellationRate,
  forecastDestinationDemand,
  generateForecastBrief,
} from "@/lib/forecast-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const bookings = await fetchBookings();
    const monthly = computeMonthlyTrends(bookings);

    const revForecast = forecastRevenue(bookings, 6);
    const bkgForecast = forecastBookings(bookings, 6);
    const cancelForecast = forecastCancellationRate(bookings, 6);
    const destDemand = forecastDestinationDemand(bookings, 10);
    const brief = generateForecastBrief(bookings);

    // Build forecast data points (historical + projected)
    const sortedMonthly = monthly.sort((a, b) => a.month.localeCompare(b.month));
    const recentMonths = sortedMonthly.slice(-5);

    const revenueForecast = [
      ...recentMonths.map(m => ({
        date: m.month,
        actual: m.revenue,
        predicted: m.revenue,
        lowerBound: Math.round(m.revenue * 0.9),
        upperBound: Math.round(m.revenue * 1.1),
      })),
      ...revForecast.points.map(p => ({
        date: p.period,
        predicted: p.forecast,
        lowerBound: p.lower,
        upperBound: p.upper,
      })),
    ];

    const bookingForecast = [
      ...recentMonths.map(m => ({
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

    const cancellationForecast = [
      ...recentMonths.map(m => ({
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

    // Summaries
    const summaries = [
      {
        metric: "Monthly Revenue",
        nextMonthPrediction: revForecast.points[0]?.forecast || 0,
        confidence: revForecast.points[0]?.confidence || 0,
        trend: revForecast.trend === "growing" ? "up" : revForecast.trend === "declining" ? "down" : "flat",
        seasonalFactor: revForecast.seasonalityDetected
          ? "Seasonal patterns detected — forecast adjusted"
          : "Linear trend extrapolation applied",
      },
      {
        metric: "Booking Volume",
        nextMonthPrediction: bkgForecast.points[0]?.forecast || 0,
        confidence: bkgForecast.points[0]?.confidence || 0,
        trend: bkgForecast.trend === "growing" ? "up" : bkgForecast.trend === "declining" ? "down" : "flat",
        seasonalFactor: bkgForecast.seasonalityDetected
          ? "Seasonal booking patterns influence projection"
          : "Volume follows linear growth trajectory",
      },
      {
        metric: "Cancellation Rate",
        nextMonthPrediction: cancelForecast.points[0]?.forecast || 0,
        confidence: cancelForecast.points[0]?.confidence || 0,
        trend: cancelForecast.trend === "growing" ? "up" : cancelForecast.trend === "declining" ? "down" : "flat",
        seasonalFactor: "Cancel rate projected from recent trajectory and destination mix",
      },
    ];

    return NextResponse.json({
      revenueForecast,
      bookingForecast,
      cancellationForecast,
      destDemand,
      summaries,
      brief,
      meta: {
        source: bookings.length > 5000 ? "supabase" : "static",
        computedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[API /forecasting]", error);
    return NextResponse.json({ error: "Failed to compute forecasts" }, { status: 500 });
  }
}
