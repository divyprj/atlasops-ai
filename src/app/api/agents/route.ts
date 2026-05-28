// ============================================================
// AtlasOps AI — Agent Analytics API
// GET /api/agents
// ============================================================

import { NextResponse } from "next/server";
import { fetchBookings } from "@/lib/data-service";
import { computeAgentAnalytics, mean } from "@/lib/analytics";

export const dynamic = "force-dynamic";


// Satisfaction correlated inversely with cancellation rate
function estimateResponseTime(cancellationRate: number): number {
  // Low cancel → fast response (10-15min), high cancel → slow (25-30min)
  return Math.round(10 + cancellationRate * 1.5);
}

function estimateSatisfaction(cancellationRate: number, completionRate: number): number {
  // Composite: low cancel + high completion = high satisfaction
  const score = 5.0 - (cancellationRate * 0.08) + (completionRate * 0.005);
  return +Math.min(5, Math.max(1, score)).toFixed(1);
}

function computePerformanceScore(
  completionRate: number,
  cancellationRate: number,
  avgBookingValue: number,
  allAgentAvgValue: number
): number {
  const completionScore = Math.min(100, completionRate * 1.3);
  const cancelScore = Math.max(0, 100 - cancellationRate * 6);
  const valueScore = Math.min(100, (avgBookingValue / allAgentAvgValue) * 70);
  const score = completionScore * 0.35 + cancelScore * 0.25 + valueScore * 0.25 + 15;
  return Math.round(Math.min(100, Math.max(0, score)));
}

export async function GET() {
  try {
    const bookings = await fetchBookings();
    const rawAgents = computeAgentAnalytics(bookings);

    // Compute avg booking value across all agents for normalization
    const allAvgValue = rawAgents.length > 0
      ? mean(rawAgents.map(a => a.avgBookingValue))
      : 1;

    // Enrich with performance metrics
    const agents = rawAgents.map(a => {
      const performanceScore = computePerformanceScore(
        a.completionRate, a.cancellationRate, a.avgBookingValue, allAvgValue
      );
      const responseTime = estimateResponseTime(a.cancellationRate);
      const satisfaction = estimateSatisfaction(a.cancellationRate, a.completionRate);
      const conversionRate = +(100 - a.cancellationRate).toFixed(1);

      return {
        ...a,
        performanceScore,
        responseTime,
        satisfaction,
        conversionRate,
        tier: "pending" as "elite" | "strong" | "average" | "needs_improvement" | "pending", // assigned below
      };
    }).sort((a, b) => b.performanceScore - a.performanceScore);

    // Adaptive percentile-based tiers
    const total = agents.length;
    agents.forEach((agent, index) => {
      const percentile = total > 1 ? index / (total - 1) : 0;
      (agent as { tier: string }).tier =
        percentile <= 0.10 ? "elite" :
        percentile <= 0.35 ? "strong" :
        percentile <= 0.65 ? "average" :
        "needs_improvement";
    });

    // Summary
    const activeAgents = agents.length;
    const eliteCount = agents.filter(a => a.tier === "elite").length;
    const needsImprovementCount = agents.filter(a => a.tier === "needs_improvement").length;
    const avgConversion = agents.length > 0
      ? +(agents.reduce((s, a) => s + a.conversionRate, 0) / agents.length).toFixed(1)
      : 0;
    const avgResponse = agents.length > 0
      ? Math.round(agents.reduce((s, a) => s + a.responseTime, 0) / agents.length)
      : 0;
    const avgSatisfaction = agents.length > 0
      ? +(agents.reduce((s, a) => s + a.satisfaction, 0) / agents.length).toFixed(1)
      : 0;

    return NextResponse.json({
      agents,
      summary: {
        activeAgents,
        eliteCount,
        needsImprovementCount,
        avgConversionRate: avgConversion,
        avgResponseTime: avgResponse,
        avgSatisfaction,
      },
      meta: {
        source: bookings.length > 5000 ? "supabase" : "static",
        computedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[API /agents]", error);
    return NextResponse.json({ error: "Failed to compute agent analytics" }, { status: 500 });
  }
}
