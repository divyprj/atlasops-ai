// ============================================================
// AtlasOps AI — Anomalies API
// GET /api/anomalies
// ============================================================

import { NextResponse } from "next/server";
import { fetchBookings } from "@/lib/data-service";
import { detectOperationalAnomalies, computeOperationalRiskScore } from "@/lib/anomaly-engine";
import { databaseHealth } from "@/data/health";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const bookings = await fetchBookings();
    const anomalies = detectOperationalAnomalies(bookings);
    const riskScore = computeOperationalRiskScore(anomalies);

    return NextResponse.json({
      anomalies,
      riskScore,
      health: databaseHealth,
      meta: {
        source: bookings.length > 5000 ? "supabase" : "static",
        computedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[API /anomalies]", error);
    return NextResponse.json({ error: "Failed to detect anomalies" }, { status: 500 });
  }
}
