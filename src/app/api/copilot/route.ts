// ============================================================
// AtlasOps AI — Copilot API
// POST /api/copilot
// Operational data → analytics → Groq → response
// ============================================================

import { NextResponse } from "next/server";
import { fetchBookings } from "@/lib/data-service";
import { queryGroq, isGroqConfigured, GroqMessage } from "@/lib/groq";
import { computeBookingAnalytics, computeDestinationAnalytics, computeAgentAnalytics, computeSourceAnalytics } from "@/lib/analytics";
import { detectOperationalAnomalies, computeOperationalRiskScore } from "@/lib/anomaly-engine";
import { generateForecastBrief } from "@/lib/forecast-engine";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

// --- Build operational context for Groq ---

function buildOperationalContext(bookings: import("@/types").Booking[]): string {
  const analytics = computeBookingAnalytics(bookings);
  const destinations = computeDestinationAnalytics(bookings);
  const agents = computeAgentAnalytics(bookings);
  const sources = computeSourceAnalytics(bookings);
  const anomalies = detectOperationalAnomalies(bookings);
  const riskScore = computeOperationalRiskScore(anomalies);

  const topDests = destinations.slice(0, 5);
  const topAgents = agents.slice(0, 5);
  const weakAgents = agents.filter(a => a.cancellationRate > 12);
  const highCancelDests = destinations.filter(d => d.cancellationRate > 10);
  const criticalAnomalies = anomalies.filter(a => a.severity === "critical");

  let forecastBrief = "";
  try { forecastBrief = generateForecastBrief(bookings); } catch { /* skip */ }

  return [
    `OPERATIONAL METRICS:`,
    `Total Revenue: ${formatCurrency(analytics.totalRevenue, true)}`,
    `Total Bookings: ${analytics.totalBookings}`,
    `Cancellation Rate: ${analytics.cancellationRate}%`,
    `Average Order Value: ${formatCurrency(analytics.avgOrderValue)}`,
    `Repeat Customer Ratio: ${analytics.repeatRatio}%`,
    `Operational Risk Score: ${riskScore}/100`,
    `Active Anomalies: ${anomalies.length} (${criticalAnomalies.length} critical)`,
    ``,
    `TOP DESTINATIONS (by revenue):`,
    ...topDests.map(d => `  ${d.destination}: ${formatCurrency(d.revenue, true)} | ${d.bookings} bookings | ${d.cancellationRate}% cancel`),
    ``,
    `HIGH CANCEL DESTINATIONS:`,
    ...highCancelDests.map(d => `  ${d.destination}: ${d.cancellationRate}% (${d.bookings} bookings)`),
    ``,
    `TOP AGENTS:`,
    ...topAgents.map(a => `  ${a.agentName}: ${formatCurrency(a.totalRevenue, true)} | ${a.totalBookings} bookings | ${a.cancellationRate}% cancel`),
    weakAgents.length > 0 ? `\nHIGH-CANCEL AGENTS:` : "",
    ...weakAgents.map(a => `  ${a.agentName}: ${a.cancellationRate}% cancel | ${a.totalBookings} bookings`),
    ``,
    `CHANNELS:`,
    ...sources.map(s => `  ${s.source}: ${s.count} (${s.share}%) | AOV ${formatCurrency(s.avgValue)}`),
    ``,
    criticalAnomalies.length > 0 ? `CRITICAL ANOMALIES:` : "",
    ...criticalAnomalies.slice(0, 3).map(a => `  ${a.title}`),
    ``,
    forecastBrief ? `FORECAST:\n${forecastBrief}` : "",
  ].filter(Boolean).join("\n");
}

// --- Fallback: data-driven response without Groq ---

function generateFallbackResponse(query: string, bookings: import("@/types").Booking[]): string {
  const l = query.toLowerCase();
  const analytics = computeBookingAnalytics(bookings);
  const destinations = computeDestinationAnalytics(bookings);
  const agents = computeAgentAnalytics(bookings);

  if (l.includes("revenue") || l.includes("profit")) {
    const totalProfit = bookings.reduce((s, b) => s + b.profit, 0);
    const margin = analytics.totalRevenue > 0 ? (totalProfit / analytics.totalRevenue * 100).toFixed(1) : "0";
    return `Revenue: ${formatCurrency(analytics.totalRevenue, true)} | Profit: ${formatCurrency(totalProfit, true)} | Margin: ${margin}%\nAOV: ${formatCurrency(analytics.avgOrderValue)}\nTop: ${destinations.slice(0, 3).map(d => `${d.destination} (${formatCurrency(d.revenue, true)})`).join(", ")}`;
  }
  if (l.includes("agent") || l.includes("perform")) {
    return `${agents.length} agents active\nTop: ${agents.slice(0, 3).map(a => `${a.agentName} (${formatCurrency(a.totalRevenue, true)})`).join(", ")}\nHigh cancel: ${agents.filter(a => a.cancellationRate > 12).map(a => `${a.agentName} (${a.cancellationRate}%)`).join(", ") || "None"}`;
  }
  if (l.includes("cancel")) {
    const highCancel = destinations.filter(d => d.cancellationRate > 10);
    return `Overall: ${analytics.cancellationRate}%\nHigh-risk: ${highCancel.map(d => `${d.destination} (${d.cancellationRate}%)`).join(", ")}`;
  }
  if (l.includes("forecast") || l.includes("predict")) {
    try { return generateForecastBrief(bookings); } catch { return "Forecast computation unavailable."; }
  }
  if (l.includes("anomal") || l.includes("risk") || l.includes("health")) {
    const anomalies = detectOperationalAnomalies(bookings);
    const risk = computeOperationalRiskScore(anomalies);
    return `Risk Score: ${risk}/100 | ${anomalies.length} anomalies\n${anomalies.slice(0, 3).map(a => `[${a.severity.toUpperCase()}] ${a.title}`).join("\n")}`;
  }
  return `Available queries: revenue, agents, cancellations, forecasting, anomalies, risk\nBookings: ${analytics.totalBookings} | Revenue: ${formatCurrency(analytics.totalRevenue, true)} | Cancel: ${analytics.cancellationRate}%`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, history } = body as { query: string; history?: GroqMessage[] };

    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    const bookings = await fetchBookings();
    const context = buildOperationalContext(bookings);

    let response: string;
    let source: "groq" | "analytics-engine";

    if (isGroqConfigured()) {
      const messages: GroqMessage[] = [
        ...(history || []).slice(-6),
        { role: "user", content: query },
      ];
      response = await queryGroq(messages, context);
      source = "groq";
    } else {
      response = generateFallbackResponse(query, bookings);
      source = "analytics-engine";
    }

    return NextResponse.json({
      response,
      meta: {
        source,
        model: isGroqConfigured() ? "llama-3.3-70b-versatile" : "local-analytics",
        dataSource: bookings.length > 5000 ? "supabase" : "static",
        records: bookings.length,
        computedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[API /copilot]", error);
    return NextResponse.json({ error: "Copilot query failed" }, { status: 500 });
  }
}
