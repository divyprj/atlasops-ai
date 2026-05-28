// ============================================================
// AtlasOps AI — Exports API
// GET /api/exports/[type]
// Supported types: bookings, revenue, agents, executive
// ============================================================

import { NextResponse } from "next/server";
import { fetchBookings } from "@/lib/data-service";
import { computeBookingAnalytics, computeDestinationAnalytics, computeAgentAnalytics } from "@/lib/analytics";
import { computeOperationalScorecard } from "@/lib/kpi-engine";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const bookings = await fetchBookings();

    switch (type) {
      case "bookings": {
        const csv = [
          "ID,Customer,Destination,Package,Type,Status,Amount,Profit,BookingDate,Agent,Source",
          ...bookings.slice(0, 5000).map(b =>
            `"${b.id}","${b.customerName}","${b.destination}","${b.packageName}","${b.packageType}","${b.status}",${b.amount},${b.profit},"${b.bookingDate}","${b.agentName}","${b.source}"`
          ),
        ].join("\n");
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="atlasops-bookings-${new Date().toISOString().split("T")[0]}.csv"`,
          },
        });
      }

      case "revenue": {
        const destinations = computeDestinationAnalytics(bookings);
        const csv = [
          "Destination,Revenue,Bookings,CancellationRate,AvgOrderValue",
          ...destinations.map(d => `"${d.destination}",${d.revenue},${d.bookings},${d.cancellationRate},${d.avgValue}`),
        ].join("\n");
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="atlasops-revenue-${new Date().toISOString().split("T")[0]}.csv"`,
          },
        });
      }

      case "agents": {
        const agents = computeAgentAnalytics(bookings);
        const csv = [
          "Agent,TotalBookings,Revenue,CompletionRate,CancellationRate,ProfitMargin",
          ...agents.map(a => `"${a.agentName}",${a.totalBookings},${a.totalRevenue},${a.completionRate},${a.cancellationRate},${a.profitMargin}`),
        ].join("\n");
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="atlasops-agents-${new Date().toISOString().split("T")[0]}.csv"`,
          },
        });
      }

      case "executive": {
        const scorecard = computeOperationalScorecard(bookings, 6);
        const analytics = computeBookingAnalytics(bookings);
        const text = [
          "ATLASOPS AI — EXECUTIVE SUMMARY",
          `Generated: ${new Date().toISOString().split("T")[0]}`,
          "",
          "═══════════════════════════════════════",
          "KEY PERFORMANCE INDICATORS",
          "═══════════════════════════════════════",
          "",
          `Total Revenue:        ₹${(scorecard.revenue.value / 10000000).toFixed(2)} Cr`,
          `Revenue Growth:       ${scorecard.revenue.changePercent > 0 ? "+" : ""}${scorecard.revenue.changePercent.toFixed(1)}%`,
          `Profit Margin:        ${scorecard.profitMargin.value}%`,
          `Average Order Value:  ₹${scorecard.avgOrderValue.value.toLocaleString()}`,
          `Total Bookings:       ${scorecard.bookingVolume.value.toLocaleString()}`,
          `Cancellation Rate:    ${scorecard.cancellationRate.value}%`,
          `Repeat Ratio:         ${scorecard.repeatRatio.value}%`,
          `Operational Score:    ${scorecard.overallScore}/100`,
          "",
          "═══════════════════════════════════════",
          "OPERATIONAL STATUS",
          "═══════════════════════════════════════",
          "",
          scorecard.overallScore >= 80 ? "System: NORMAL" :
          scorecard.overallScore >= 60 ? "System: ELEVATED RISK" : "System: CRITICAL",
          "",
          `Records Analyzed: ${analytics.totalBookings}`,
          `Unique Customers: ${analytics.totalCustomers}`,
          `Repeat Customers: ${analytics.repeatCustomers}`,
          "",
          "— AtlasOps AI Operations Intelligence",
        ].join("\n");

        return new NextResponse(text, {
          headers: {
            "Content-Type": "text/plain",
            "Content-Disposition": `attachment; filename="atlasops-executive-summary-${new Date().toISOString().split("T")[0]}.txt"`,
          },
        });
      }

      default:
        return NextResponse.json({ error: `Unknown export type: ${type}` }, { status: 400 });
    }
  } catch (error) {
    console.error("[API /exports]", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
