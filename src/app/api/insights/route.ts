// ============================================================
// AtlasOps AI — Insights API
// GET /api/insights
// ============================================================

import { NextResponse } from "next/server";
import { fetchBookings } from "@/lib/data-service";
import { generateInsights } from "@/lib/insight-engine";
import { detectOperationalAnomalies, computeOperationalRiskScore } from "@/lib/anomaly-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const bookings = await fetchBookings();
    const insights = generateInsights(bookings);
    const anomalies = detectOperationalAnomalies(bookings);
    const riskScore = computeOperationalRiskScore(anomalies);

    // Anomaly-derived alerts
    const alerts = anomalies.slice(0, 8).map((a, i) => ({
      id: `alert-${i}`,
      title: a.title,
      description: a.detail,
      severity: a.severity,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    }));

    // Summary
    const summary = {
      total: insights.length,
      critical: insights.filter(i => i.severity === "critical").length,
      warning: insights.filter(i => i.severity === "warning").length,
      positive: insights.filter(i => i.severity === "positive").length,
      info: insights.filter(i => i.severity === "info").length,
      anomalyCount: anomalies.length,
      riskScore,
    };

    return NextResponse.json({
      insights,
      alerts,
      summary,
      meta: {
        source: bookings.length > 5000 ? "supabase" : "static",
        computedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[API /insights]", error);
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}
