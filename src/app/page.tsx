"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useWorkspace } from "@/context/workspace-context";
import { KPICard } from "@/components/dashboard/kpi-card";
import { WorkspaceActions } from "@/components/workspace-actions";
import { formatCurrency, cn, timeAgo } from "@/lib/utils";
import { computeOperationalScorecard } from "@/lib/kpi-engine";
import { computeMonthlyTrends, computeDestinationAnalytics, computeRegionalAnalytics } from "@/lib/analytics";
import { exportToCSV, generateExecutiveSummaryText } from "@/lib/exports";
import {
  AlertTriangle, Info, Bookmark, XCircle, UserCheck, Bell, Download,
  ArrowRight, BarChart3, TrendingUp, Shield, Brain,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#6366f1", "#3b82f6", "#eab308", "#8b5cf6", "#06b6d4"];
const TOOLTIP_STYLE = { backgroundColor: "#141416", border: "1px solid #27272a", borderRadius: "6px", fontSize: "11px", padding: "8px 10px" };
const AXIS_STYLE = { fontSize: 10, fill: "#52525b" };

// --- Onboarding Empty State ---

function InitializeWorkspace() {
  const pipelineSteps = [
    { step: 1, name: "Data Ingestion", status: "awaiting upload", detail: "CSV · XLSX structured dataset parsing and normalization" },
    { step: 2, name: "Schema Detection", status: "pending", detail: "Column mapping, type inference, confidence scoring" },
    { step: 3, name: "KPI Computation", status: "pending", detail: "Revenue, margin, churn, AOV scorecard generation" },
    { step: 4, name: "Anomaly Detection", status: "pending", detail: "Z-score outlier analysis across all metric dimensions" },
    { step: 5, name: "Forecast Engine", status: "pending", detail: "Linear regression with seasonal adjustment modeling" },
    { step: 6, name: "Intelligence Feed", status: "pending", detail: "Pattern detection, severity classification, insight synthesis" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[15px] font-semibold tracking-tight">Command Center</h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Operational intelligence pipeline — awaiting data initialization
        </p>
      </div>

      <WorkspaceActions />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Pipeline Readiness — spans 2 cols */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4">
          <p className="text-[12px] font-medium mb-4">Pipeline Readiness</p>
          <div className="relative">
            {pipelineSteps.map((s, i) => (
              <div key={s.step} className="relative flex items-start gap-3 pb-4 last:pb-0">
                {/* Vertical connector */}
                {i < pipelineSteps.length - 1 && (
                  <div className="absolute left-[5px] top-[14px] bottom-0 w-px border-l border-dashed border-border" />
                )}
                {/* Dot */}
                <div className="relative z-10 mt-[5px] w-[11px] h-[11px] rounded-full border-2 border-border bg-card shrink-0" />
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium">Step {s.step}: {s.name}</span>
                    <span className={cn(
                      "text-[9px] font-mono px-1.5 py-0.5 rounded",
                      s.status === "awaiting upload"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-accent/40 text-muted-foreground"
                    )}>
                      ○ {s.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workspace Summary — 1 col */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[12px] font-medium mb-3">Workspace Summary</p>
          <div className="space-y-2.5">
            {[
              { label: "Status", value: "No workspace" },
              { label: "Records", value: "—" },
              { label: "Engines", value: "0/6 initialized" },
              { label: "Modules", value: "8 available" },
              { label: "Formats", value: "CSV · XLSX" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{row.label}</span>
                <span className="text-[10px] font-mono text-foreground/70">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Available Modules</p>
            <div className="space-y-1">
              {[
                "Command Center",
                "Revenue Intelligence",
                "Transaction Analytics",
                "Entity Performance",
                "Data Quality",
                "Forecasting",
                "Reports",
                "Operations Copilot",
              ].map((m) => (
                <div key={m} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-border" />
                  <span className="text-[10px] text-muted-foreground">{m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Active Dashboard ---

function Dashboard({ bookings }: { bookings: import("@/types").Booking[] }) {
  const scorecard = useMemo(() => computeOperationalScorecard(bookings, 6), [bookings]);
  const monthlyTrends = useMemo(() => computeMonthlyTrends(bookings), [bookings]);
  const destAnalytics = useMemo(() => computeDestinationAnalytics(bookings), [bookings]);
  const regionAnalytics = useMemo(() => computeRegionalAnalytics(bookings), [bookings]);

  const topDest = destAnalytics.slice(0, 8).map(d => ({ ...d, rev: d.revenue / 100000 }));
  const bookingsByMonth = monthlyTrends.map(m => ({
    month: m.month,
    bookings: m.bookings,
    cancellations: m.cancellations,
  }));
  const revenueByRegion = regionAnalytics.map(r => ({
    region: r.region,
    revenue: r.revenue,
  }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight">Command Center</h1>
          <p className="text-[12px] text-muted-foreground">Operational overview · Score: {scorecard.overallScore}/100</p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => exportToCSV(
              destAnalytics.map(d => ({ destination: d.destination, revenue: d.revenue, bookings: d.bookings, cancelRate: d.cancellationRate, margin: d.profitMargin })),
              "atlasops-destinations",
              [{ key: "destination", header: "Destination" }, { key: "revenue", header: "Revenue" }, { key: "bookings", header: "Bookings" }, { key: "cancelRate", header: "Cancel %" }, { key: "margin", header: "Margin %" }]
            )}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] text-muted-foreground hover:text-foreground border border-border hover:bg-accent/30 transition-colors"
          >
            <Download size={10} /> CSV
          </button>
          <button
            onClick={() => {
              const text = generateExecutiveSummaryText({
                totalRevenue: scorecard.revenue.value,
                totalBookings: scorecard.bookingVolume.value,
                cancellationRate: scorecard.cancellationRate.value,
                profitMargin: scorecard.profitMargin.value,
                avgOrderValue: scorecard.avgOrderValue.value,
                repeatRatio: scorecard.repeatRatio.value,
                revenueGrowth: +scorecard.revenue.changePercent.toFixed(1),
                activeAgents: new Set(bookings.map(b => b.agentId)).size,
                topDestination: destAnalytics[0]?.destination || "-",
                riskScore: 0,
              });
              const blob = new Blob([text], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = "executive-summary.txt";
              a.click(); URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] text-muted-foreground hover:text-foreground border border-border hover:bg-accent/30 transition-colors"
          >
            <Download size={10} /> Report
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2.5">
        <KPICard title="Revenue" value={scorecard.revenue.value} format="currency" change={+scorecard.revenue.changePercent.toFixed(1)} subtitle="vs prev" />
        <KPICard title="Bookings" value={scorecard.bookingVolume.value} format="number" change={+scorecard.bookingVolume.changePercent.toFixed(1)} subtitle="vs prev" />
        <KPICard title="Cancel Rate" value={scorecard.cancellationRate.value} format="percentage" change={scorecard.cancellationRate.change} />
        <KPICard title="Profit Margin" value={scorecard.profitMargin.value} format="percentage" change={scorecard.profitMargin.change} />
        <KPICard title="Avg Order" value={scorecard.avgOrderValue.value} format="currency" change={+scorecard.avgOrderValue.changePercent.toFixed(1)} />
        <KPICard title="Repeat Rate" value={scorecard.repeatRatio.value} format="percentage" change={scorecard.repeatRatio.change} />
        <KPICard title="Health Score" value={scorecard.healthScore.value} format="score" change={scorecard.healthScore.change} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[12px] font-medium mb-3">Revenue Trend</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyTrends}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e22" vertical={false} />
              <XAxis dataKey="month" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} width={50} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [formatCurrency(Number(value), true), "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={1.5} fill="url(#revFill)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[12px] font-medium mb-3">Booking Volume</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={bookingsByMonth} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e22" vertical={false} />
              <XAxis dataKey="month" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={35} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="bookings" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={14} name="Bookings" opacity={0.8} />
              <Bar dataKey="cancellations" fill="#ef4444" radius={[2, 2, 0, 0]} barSize={14} name="Cancellations" opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[12px] font-medium mb-3">Top Destinations</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topDest} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e22" horizontal={false} />
              <XAxis type="number" tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}L`} />
              <YAxis dataKey="destination" type="category" tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} width={70} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`₹${Number(value).toFixed(0)}L`]} />
              <Bar dataKey="rev" fill="#6366f1" radius={[0, 3, 3, 0]} barSize={14} opacity={0.75} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[12px] font-medium mb-3">Revenue by Region</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={revenueByRegion} dataKey="revenue" nameKey="region" cx="50%" cy="50%" innerRadius={58} outerRadius={85} strokeWidth={1.5} stroke="#141416">
                {revenueByRegion.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.75} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [formatCurrency(Number(value), true)]} />
              <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: "10px", color: "#71717a" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function CommandCenter() {
  const { isReady, isEmpty, isLoading, dataset } = useWorkspace();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="text-center space-y-2">
          <div className="w-5 h-5 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin mx-auto" />
          <p className="text-[11px] text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (isEmpty || !dataset) {
    return <InitializeWorkspace />;
  }

  return <Dashboard bookings={dataset} />;
}
