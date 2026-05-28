// ============================================================
// AtlasOps AI — Booking Analytics API
// GET /api/analytics/bookings
// ============================================================

import { NextResponse } from "next/server";
import { fetchBookings } from "@/lib/data-service";
import {
  computeBookingAnalytics,
  computeMonthlyTrends,
  computeDestinationAnalytics,
  computeSourceAnalytics,
  computeDayOfWeekAnalytics,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const bookings = await fetchBookings();

    return NextResponse.json({
      analytics: computeBookingAnalytics(bookings),
      monthly: computeMonthlyTrends(bookings).sort((a, b) => a.month.localeCompare(b.month)),
      destinations: computeDestinationAnalytics(bookings),
      sources: computeSourceAnalytics(bookings),
      dayOfWeek: computeDayOfWeekAnalytics(bookings),
      meta: {
        source: bookings.length > 5000 ? "supabase" : "static",
        records: bookings.length,
        computedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[API /analytics/bookings]", error);
    return NextResponse.json({ error: "Failed to compute booking analytics" }, { status: 500 });
  }
}
