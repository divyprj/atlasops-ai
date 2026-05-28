// ============================================================
// AtlasOps AI — Agent Analytics API
// GET /api/agents
// ============================================================

import { NextResponse } from "next/server";
import { fetchBookings } from "@/lib/data-service";
import { computeAgentAnalytics, mean } from "@/lib/analytics";

export const dynamic = "force-dynamic";

// Response time correlated with performance (lower = better)
const agentResponseTimes: Record<string, number> = {};
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
        tier: performanceScore >= 85 ? "elite" as const :
              performanceScore >= 70 ? "strong" as const :
              performanceScore >= 55 ? "average" as const :
              "needs_improvement" as const,
      };
    }).sort((a, b) => b.performanceScore - a.performanceScore);

    // Summary
    const activeAgents = agents.length;
    const eliteCount = agents.filter(a => a.performanceScore >= 85).length;
    const needsImprovementCount = agents.filter(a => a.performanceScore < 55).length;
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
