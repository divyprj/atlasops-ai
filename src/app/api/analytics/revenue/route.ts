// ============================================================
// AtlasOps AI — Revenue Analytics API
// GET /api/analytics/revenue
// ============================================================

import { NextResponse } from "next/server";
import { fetchBookings } from "@/lib/data-service";
import {
  computeBookingAnalytics,
  computeMonthlyTrends,
  computeDestinationAnalytics,
  computeRegionalAnalytics,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const bookings = await fetchBookings();
    const analytics = computeBookingAnalytics(bookings);
    const monthly = computeMonthlyTrends(bookings);
    const destinations = computeDestinationAnalytics(bookings);
    const regions = computeRegionalAnalytics(bookings);

    // Revenue summary
    const totalRevenue = analytics.totalRevenue;
    const totalProfit = bookings.reduce((s, b) => s + b.profit, 0);
    const profitMargin = totalRevenue > 0 ? +(totalProfit / totalRevenue * 100).toFixed(1) : 0;
    const domesticRevenue = bookings.filter(b => b.packageType === "domestic").reduce((s, b) => s + b.amount, 0);
    const internationalRevenue = bookings.filter(b => b.packageType === "international").reduce((s, b) => s + b.amount, 0);
    const internationalShare = totalRevenue > 0 ? +(internationalRevenue / totalRevenue * 100).toFixed(1) : 0;

    // Revenue growth (last 3 months vs prior 3 months)
    const sortedMonthly = monthly.sort((a, b) => a.month.localeCompare(b.month));
    const last3 = sortedMonthly.slice(-3);
    const prior3 = sortedMonthly.slice(-6, -3);
    const last3Rev = last3.reduce((s, m) => s + m.revenue, 0);
    const prior3Rev = prior3.reduce((s, m) => s + m.revenue, 0);
    const revenueGrowth = prior3Rev > 0 ? +((last3Rev - prior3Rev) / prior3Rev * 100).toFixed(1) : 0;

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalProfit,
        profitMargin,
        avgOrderValue: analytics.avgOrderValue,
        revenueGrowth,
        domesticRevenue,
        internationalRevenue,
        internationalShare,
      },
      monthly: monthly.sort((a, b) => a.month.localeCompare(b.month)),
      destinations: destinations.slice(0, 15),
      regions,
      meta: {
        source: bookings.length > 5000 ? "supabase" : "static",
        records: bookings.length,
        computedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[API /analytics/revenue]", error);
    return NextResponse.json({ error: "Failed to compute revenue analytics" }, { status: 500 });
  }
}
