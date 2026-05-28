// ============================================================
// AtlasOps AI — Anomaly Detection Engine
// Statistical anomaly detection with z-scores, rolling
// baselines, and threshold analysis
// ============================================================

import { Booking } from "@/types";
import {
  groupBy,
  sum,
  mean,
  stdDev,
  zScore,
  computeMonthlyTrends,
  computeDestinationAnalytics,
  computeAgentAnalytics,
} from "./analytics";

// --- Anomaly Types ---

export interface Anomaly {
  id: string;
  type: "refund_spike" | "cancel_anomaly" | "booking_volatility" | "regional_drop" | "revenue_anomaly" | "agent_deviation" | "suspicious_transaction";
  severity: "critical" | "warning" | "info";
  title: string;
  detail: string;
  metric: string;
  observedValue: number;
  expectedValue: number;
  deviation: number; // z-score or % deviation
  affectedEntity: string;
  timestamp: string;
}

// --- Core Detection ---

export function detectOperationalAnomalies(bookings: Booking[]): Anomaly[] {
  const anomalies: Anomaly[] = [];
  let id = 0;
  const ts = "2025-05-27T09:00:00Z";

  // --- 1. Monthly Cancellation Anomalies ---
  const monthly = computeMonthlyTrends(bookings);
  if (monthly.length >= 4) {
    const cancelRates = monthly.map(m => m.cancellationRate);
    const cancelMean = mean(cancelRates);
    const cancelSD = stdDev(cancelRates);

    monthly.forEach((m, i) => {
      if (cancelSD > 0) {
        const z = (m.cancellationRate - cancelMean) / cancelSD;
        if (z > 1.8) {
          anomalies.push({
            id: `ANM-${++id}`, type: "cancel_anomaly",
            severity: z > 2.5 ? "critical" : "warning",
            title: `Cancellation spike in ${m.month}`,
            detail: `Cancel rate ${m.cancellationRate.toFixed(1)}% vs ${cancelMean.toFixed(1)}% baseline (${z.toFixed(1)}σ). ${m.cancellations} cancellations from ${m.bookings} bookings.`,
            metric: "Cancellation Rate", observedValue: m.cancellationRate,
            expectedValue: +cancelMean.toFixed(1), deviation: +z.toFixed(2),
            affectedEntity: m.month, timestamp: ts,
          });
        }
      }
    });
  }

  // --- 2. Revenue Anomalies (MoM drops) ---
  if (monthly.length >= 3) {
    const revenues = monthly.map(m => m.revenue);
    const revMean = mean(revenues);
    const revSD = stdDev(revenues);

    monthly.forEach((m, i) => {
      if (i > 0 && revSD > 0) {
        const z = (m.revenue - revMean) / revSD;
        if (z < -1.8) {
          anomalies.push({
            id: `ANM-${++id}`, type: "revenue_anomaly",
            severity: z < -2.5 ? "critical" : "warning",
            title: `Revenue below baseline in ${m.month}`,
            detail: `₹${(m.revenue / 100000).toFixed(0)}L vs ₹${(revMean / 100000).toFixed(0)}L expected (${Math.abs(z).toFixed(1)}σ below). Booking count: ${m.bookings}.`,
            metric: "Monthly Revenue", observedValue: m.revenue,
            expectedValue: +revMean.toFixed(0), deviation: +z.toFixed(2),
            affectedEntity: m.month, timestamp: ts,
          });
        }
      }
    });
  }

  // --- 3. Booking Volume Volatility ---
  if (monthly.length >= 4) {
    const volumes = monthly.map(m => m.bookings);
    const volMean = mean(volumes);
    const volSD = stdDev(volumes);
    const cv = volSD / volMean; // coefficient of variation

    if (cv > 0.25) {
      anomalies.push({
        id: `ANM-${++id}`, type: "booking_volatility",
        severity: cv > 0.35 ? "warning" : "info",
        title: `Booking volume volatility elevated (CV: ${(cv * 100).toFixed(1)}%)`,
        detail: `Monthly booking count ranges from ${Math.min(...volumes)} to ${Math.max(...volumes)} (mean: ${volMean.toFixed(0)}). High variance may indicate inconsistent demand or seasonal dependency.`,
        metric: "Volume CV", observedValue: +(cv * 100).toFixed(1),
        expectedValue: 20, deviation: +((cv - 0.2) / 0.1).toFixed(2),
        affectedEntity: "Booking Pipeline", timestamp: ts,
      });
    }
  }

  // --- 4. Destination-Level Anomalies ---
  const destinations = computeDestinationAnalytics(bookings);
  if (destinations.length >= 3) {
    const cancelRates = destinations.map(d => d.cancellationRate);
    const cancelAvg = mean(cancelRates);
    const cancelStd = stdDev(cancelRates);

    destinations.forEach(dest => {
      if (cancelStd > 0) {
        const z = (dest.cancellationRate - cancelAvg) / cancelStd;
        if (z > 1.5) {
          anomalies.push({
            id: `ANM-${++id}`, type: "cancel_anomaly",
            severity: z > 2.0 ? "critical" : "warning",
            title: `${dest.destination}: cancel rate ${dest.cancellationRate}% exceeds norm`,
            detail: `${dest.cancellationRate}% vs ${cancelAvg.toFixed(1)}% destination average (${z.toFixed(1)}σ). ${dest.bookings} total bookings, ₹${(dest.revenue / 100000).toFixed(0)}L revenue.`,
            metric: "Destination Cancel Rate", observedValue: dest.cancellationRate,
            expectedValue: +cancelAvg.toFixed(1), deviation: +z.toFixed(2),
            affectedEntity: dest.destination, timestamp: ts,
          });
        }
      }
    });
  }

  // --- 5. Refund Pattern Analysis ---
  const refunded = bookings.filter(b => b.paymentStatus === "refunded");
  const refundRate = bookings.length > 0 ? (refunded.length / bookings.length) * 100 : 0;
  const refundByMonth = groupBy(refunded, b => b.bookingDate.substring(0, 7));
  const totalByMonth = groupBy(bookings, b => b.bookingDate.substring(0, 7));

  const monthlyRefundRates = Object.entries(totalByMonth).map(([month, all]) => {
    const refs = refundByMonth[month]?.length || 0;
    return { month, rate: all.length > 0 ? (refs / all.length) * 100 : 0 };
  }).sort((a, b) => a.month.localeCompare(b.month));

  if (monthlyRefundRates.length >= 3) {
    const rates = monthlyRefundRates.map(m => m.rate);
    const refMean = mean(rates);
    const refSD = stdDev(rates);

    monthlyRefundRates.forEach(m => {
      if (refSD > 0) {
        const z = (m.rate - refMean) / refSD;
        if (z > 1.8) {
          anomalies.push({
            id: `ANM-${++id}`, type: "refund_spike",
            severity: z > 2.5 ? "critical" : "warning",
            title: `Refund spike in ${m.month}: ${m.rate.toFixed(1)}%`,
            detail: `Refund rate ${m.rate.toFixed(1)}% vs ${refMean.toFixed(1)}% baseline (${z.toFixed(1)}σ). Review for policy abuse or operational issues.`,
            metric: "Refund Rate", observedValue: +m.rate.toFixed(1),
            expectedValue: +refMean.toFixed(1), deviation: +z.toFixed(2),
            affectedEntity: m.month, timestamp: ts,
          });
        }
      }
    });
  }

  // --- 6. Agent Performance Deviations ---
  const agents = computeAgentAnalytics(bookings);
  if (agents.length >= 3) {
    const agentCancelRates = agents.map(a => a.cancellationRate);
    const agentCancelMean = mean(agentCancelRates);
    const agentCancelSD = stdDev(agentCancelRates);

    agents.forEach(agent => {
      if (agentCancelSD > 0) {
        const z = (agent.cancellationRate - agentCancelMean) / agentCancelSD;
        if (z > 1.5) {
          anomalies.push({
            id: `ANM-${++id}`, type: "agent_deviation",
            severity: z > 2.0 ? "warning" : "info",
            title: `${agent.agentName}: cancel rate ${agent.cancellationRate}% above peer average`,
            detail: `${agent.cancellationRate}% vs ${agentCancelMean.toFixed(1)}% team average (${z.toFixed(1)}σ). ${agent.totalBookings} bookings, ₹${(agent.totalRevenue / 100000).toFixed(0)}L revenue.`,
            metric: "Agent Cancel Rate", observedValue: agent.cancellationRate,
            expectedValue: +agentCancelMean.toFixed(1), deviation: +z.toFixed(2),
            affectedEntity: agent.agentName, timestamp: ts,
          });
        }
      }
    });
  }

  // --- 7. Suspicious High-Value Cancelled Transactions ---
  const cancelledBookings = bookings.filter(b => b.status === "cancelled");
  const cancelledAmounts = cancelledBookings.map(b => b.amount);
  if (cancelledAmounts.length >= 5) {
    const amtMean = mean(cancelledAmounts);
    const amtSD = stdDev(cancelledAmounts);

    const suspicious = cancelledBookings.filter(b => {
      if (amtSD === 0) return false;
      return (b.amount - amtMean) / amtSD > 2.5;
    });

    if (suspicious.length > 0) {
      anomalies.push({
        id: `ANM-${++id}`, type: "suspicious_transaction",
        severity: "warning",
        title: `${suspicious.length} high-value cancellation(s) flagged`,
        detail: `${suspicious.length} cancelled bookings exceed 2.5σ of cancelled booking value distribution. Avg flagged value: ₹${(mean(suspicious.map(s => s.amount)) / 1000).toFixed(0)}K vs ₹${(amtMean / 1000).toFixed(0)}K baseline. Review for potential fraud or policy abuse.`,
        metric: "Suspicious Cancels", observedValue: suspicious.length,
        expectedValue: 0, deviation: 2.5,
        affectedEntity: "Transaction Monitor", timestamp: ts,
      });
    }
  }

  // Sort by severity
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  return anomalies.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

// --- Risk Score ---

export function computeOperationalRiskScore(anomalies: Anomaly[]): number {
  // 100 = no risk, 0 = critical
  let score = 100;
  for (const a of anomalies) {
    if (a.severity === "critical") score -= 8;
    else if (a.severity === "warning") score -= 4;
    else score -= 1;
  }
  return Math.max(0, Math.min(100, score));
}
