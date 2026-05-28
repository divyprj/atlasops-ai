// ============================================================
// AtlasOps AI — Dashboard API
// GET /api/dashboard
// Returns executive KPI scorecard
// ============================================================

import { NextResponse } from "next/server";
import { fetchBookings } from "@/lib/data-service";
import { computeOperationalScorecard } from "@/lib/kpi-engine";
import { databaseHealth } from "@/data/health";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const bookings = await fetchBookings();
    const scorecard = computeOperationalScorecard(bookings, 6);

    return NextResponse.json({
      scorecard,
      healthScore: databaseHealth.overallScore,
      meta: {
        source: bookings.length > 5000 ? "supabase" : "static",
        records: bookings.length,
        computedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[API /dashboard]", error);
    return NextResponse.json({ error: "Failed to compute dashboard" }, { status: 500 });
  }
}
