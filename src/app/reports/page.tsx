"use client";

// ============================================================
// AtlasOps AI — Dynamic Report Center
// Reports generated from uploaded workspace datasets
// ============================================================

import React, { useMemo, useState } from "react";
import { useWorkspace } from "@/context/workspace-context";
import { WorkspaceActions } from "@/components/workspace-actions";
import { computeBookingAnalytics, computeMonthlyTrends, computeDestinationAnalytics, computeAgentAnalytics, detectAnomalies } from "@/lib/analytics";
import { computeOperationalScorecard } from "@/lib/kpi-engine";
import { generateInsights } from "@/lib/insight-engine";
import { formatCurrency, cn, timeAgo } from "@/lib/utils";
import { exportToCSV, generateExecutiveSummaryText } from "@/lib/exports";
import { Download, CheckCircle, FileText, BarChart3, AlertTriangle, TrendingUp } from "lucide-react";

interface GeneratedReport {
  id: string;
  title: string;
  type: "operational" | "revenue" | "quality" | "executive" | "anomaly";
  description: string;
  generatedAt: string;
  metrics: Record<string, string | number>;
  exportData: Record<string, unknown>[];
}

export default function ReportsPage() {
  const { isReady, dataset, metadata } = useWorkspace();
  const [exporting, setExporting] = useState<string | null>(null);

  const reports = useMemo(() => {
    if (!dataset || !metadata) return [];

    const analytics = computeBookingAnalytics(dataset);
    const monthly = computeMonthlyTrends(dataset);
    const destinations = computeDestinationAnalytics(dataset);
    const agents = computeAgentAnalytics(dataset);
    const scorecard = computeOperationalScorecard(dataset);
    const insights = generateInsights(dataset);
    const revAnomalies = detectAnomalies(monthly.map(m => m.revenue), 2);

    const now = new Date().toISOString();
    const fileName = metadata.fileName.replace(/\.[^/.]+$/, "");

    const generated: GeneratedReport[] = [
      {
        id: "exec-summary",
        title: `Executive Summary — ${fileName}`,
        type: "executive",
        description: `Comprehensive intelligence summary from ${metadata.rowCount.toLocaleString()} records across ${monthly.length} periods.`,
        generatedAt: now,
        metrics: {
          revenue: formatCurrency(analytics.totalRevenue, true),
          records: analytics.totalBookings,
          margin: `${Math.round(analytics.totalProfit / analytics.totalRevenue * 100)}%`,
          growth: `${scorecard.revenueGrowth.value > 0 ? "+" : ""}${scorecard.revenueGrowth.value}%`,
        },
        exportData: [{
          totalRevenue: analytics.totalRevenue,
          totalBookings: analytics.totalBookings,
          profitMargin: Math.round(analytics.totalProfit / analytics.totalRevenue * 100),
          avgValue: analytics.avgOrderValue,
          cancellationRate: analytics.cancellationRate,
          confirmedRate: Math.round((analytics.confirmed / analytics.totalBookings) * 100),
        }],
      },
      {
        id: "rev-analysis",
        title: `Revenue Variance Analysis — ${fileName}`,
        type: "revenue",
        description: `Period-over-period revenue analysis with ${revAnomalies.length > 0 ? `${revAnomalies.length} variance anomalies detected` : "stable variance patterns"}.`,
        generatedAt: now,
        metrics: {
          total: formatCurrency(analytics.totalRevenue, true),
          periods: monthly.length,
          anomalies: revAnomalies.length,
          trend: scorecard.revenueGrowth.value > 0 ? "Growing" : "Declining",
        },
        exportData: monthly.map(m => ({
          period: m.month,
          revenue: m.revenue,
          bookings: m.bookings,
          cancellations: m.cancellations,
          avgValue: m.bookings > 0 ? Math.round(m.revenue / m.bookings) : 0,
        })),
      },
      {
        id: "ops-summary",
        title: `Operational Summary — ${fileName}`,
        type: "operational",
        description: `Operational metrics across ${destinations.length} entities and ${agents.length} agents.`,
        generatedAt: now,
        metrics: {
          entities: destinations.length,
          agents: agents.length,
          cancelRate: `${analytics.cancellationRate.toFixed(1)}%`,
          aov: formatCurrency(analytics.avgOrderValue, true),
        },
        exportData: destinations.map(d => ({
          destination: d.destination,
          bookings: d.bookings,
          revenue: d.revenue,
          cancellationRate: d.cancellationRate.toFixed(1),
          type: d.type || "—",
        })),
      },
      {
        id: "anomaly-report",
        title: `Anomaly Detection Report — ${fileName}`,
        type: "anomaly",
        description: `${insights.filter(i => i.severity === "critical").length} critical, ${insights.filter(i => i.severity === "warning").length} warnings across ${insights.length} total insights detected.`,
        generatedAt: now,
        metrics: {
          total: insights.length,
          critical: insights.filter(i => i.severity === "critical").length,
          warnings: insights.filter(i => i.severity === "warning").length,
          positive: insights.filter(i => i.severity === "positive").length,
        },
        exportData: insights.map(ins => ({
          severity: ins.severity,
          category: ins.category,
          title: ins.title,
          detail: ins.detail,
          metric: ins.metric || "—",
          metricValue: ins.metricValue || "—",
        })),
      },
      {
        id: "agent-perf",
        title: `Entity Performance Report — ${fileName}`,
        type: "quality",
        description: `Performance analysis for ${agents.length} operational entities with ranking and efficiency metrics.`,
        generatedAt: now,
        metrics: {
          entities: agents.length,
          topPerformer: agents.sort((a, b) => b.totalRevenue - a.totalRevenue)[0]?.agentName || "—",
          avgCompletion: `${Math.round(agents.reduce((s, a) => s + a.completionRate, 0) / (agents.length || 1))}%`,
          avgCancel: `${(agents.reduce((s, a) => s + a.cancellationRate, 0) / (agents.length || 1)).toFixed(1)}%`,
        },
        exportData: agents.map(a => ({
          entity: a.agentName,
          totalBookings: a.totalBookings,
          totalRevenue: a.totalRevenue,
          completionRate: a.completionRate.toFixed(1),
          cancellationRate: a.cancellationRate.toFixed(1),
          avgValue: a.avgBookingValue,
        })),
      },
    ];

    return generated;
  }, [dataset, metadata]);

  if (!isReady || !dataset || !metadata) {
    const reportTemplates = [
      { icon: <FileText size={13} className="text-muted-foreground/50" />, title: "Executive Intelligence Summary", sections: "KPIs · Growth · Risk", format: "CSV", },
      { icon: <TrendingUp size={13} className="text-muted-foreground/50" />, title: "Revenue Variance Analysis", sections: "Trend · Anomalies", format: "CSV", },
      { icon: <BarChart3 size={13} className="text-muted-foreground/50" />, title: "Operational Summary", sections: "Entities · Channels", format: "CSV", },
      { icon: <AlertTriangle size={13} className="text-muted-foreground/50" />, title: "Anomaly Detection Report", sections: "Severity · Patterns", format: "CSV", },
      { icon: <CheckCircle size={13} className="text-muted-foreground/50" />, title: "Entity Performance Report", sections: "Ranking · Efficiency", format: "CSV", },
    ];

    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight">Reports</h1>
          <p className="text-[12px] text-muted-foreground">Upload operational data to generate intelligence reports</p>
        </div>

        <WorkspaceActions />

        {/* Report Template Queue */}
        <div className="grid grid-cols-1 gap-2">
          {reportTemplates.map((r) => (
            <div key={r.title} className="rounded-lg border border-border bg-card px-4 py-3 flex items-center gap-4 hover:bg-accent/20">
              <div className="shrink-0">{r.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium">{r.title}</p>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground hidden sm:block">{r.sections}</p>
              <p className="text-[10px] font-mono text-muted-foreground hidden md:block">{r.format}</p>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full border border-border" />
                <span className="text-[10px] text-muted-foreground">Pending</span>
              </div>
            </div>
          ))}
        </div>

        {/* Report Lifecycle */}
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide mb-2">Report Lifecycle</p>
          <div className="flex items-center gap-2">
            {["Upload", "Analysis", "Generation", "Export"].map((step, i, arr) => (
              <React.Fragment key={step}>
                <span className="text-[10px] text-muted-foreground">{step}</span>
                {i < arr.length - 1 && <span className="text-[10px] text-muted-foreground/40">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const typeIcons: Record<string, React.ReactNode> = {
    executive: <FileText size={12} className="text-indigo-400" />,
    revenue: <TrendingUp size={12} className="text-emerald-400" />,
    operational: <BarChart3 size={12} className="text-blue-400" />,
    anomaly: <AlertTriangle size={12} className="text-amber-400" />,
    quality: <CheckCircle size={12} className="text-cyan-400" />,
  };

  function handleExport(report: GeneratedReport) {
    setExporting(report.id);
    const cols = report.exportData.length > 0
      ? Object.keys(report.exportData[0]).map(k => ({ key: k, header: k }))
      : [];
    exportToCSV(report.exportData, `atlasops-${report.id}`, cols);
    setTimeout(() => setExporting(null), 1000);
  }

  const typeCounts = {
    executive: reports.filter(r => r.type === "executive").length,
    revenue: reports.filter(r => r.type === "revenue").length,
    operational: reports.filter(r => r.type === "operational").length,
    anomaly: reports.filter(r => r.type === "anomaly").length,
    quality: reports.filter(r => r.type === "quality").length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[15px] font-semibold tracking-tight">Reports</h1>
        <p className="text-[12px] text-muted-foreground">
          Generated from <span className="font-mono text-foreground">{metadata.fileName}</span> · {metadata.rowCount.toLocaleString()} records
        </p>
      </div>

      {/* Report Type Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5">
        {[
          { type: "Executive", desc: "Intelligence summary", count: typeCounts.executive },
          { type: "Revenue", desc: "Variance analysis", count: typeCounts.revenue },
          { type: "Operational", desc: "Entity performance", count: typeCounts.operational },
          { type: "Anomaly", desc: "Detection summary", count: typeCounts.anomaly },
          { type: "Quality", desc: "Efficiency metrics", count: typeCounts.quality },
        ].map((rt) => (
          <div key={rt.type} className="rounded-lg border border-border bg-card p-3.5">
            <p className="text-[12px] font-medium mb-0.5">{rt.type}</p>
            <p className="text-[10px] text-muted-foreground mb-2">{rt.desc}</p>
            <span className="text-[10px] text-muted-foreground">{rt.count} report{rt.count !== 1 ? "s" : ""}</span>
          </div>
        ))}
      </div>

      {/* Reports Table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[12px] font-medium">Generated Reports</p>
        </div>
        <div className="divide-y divide-border/50">
          {reports.map((r) => (
            <div key={r.id} className="px-4 py-3 hover:bg-accent/20 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5">{typeIcons[r.type]}</div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium">{r.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{r.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {Object.entries(r.metrics).map(([k, v]) => (
                        <span key={k} className="text-[10px] text-muted-foreground">
                          <span className="text-muted-foreground/60 capitalize">{k}:</span>{" "}
                          <span className="font-mono text-foreground">{v}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <div className="flex items-center gap-1">
                    <CheckCircle size={10} className="text-emerald-500" />
                    <span className="text-[10px] text-emerald-500">Ready</span>
                  </div>
                  <button
                    onClick={() => handleExport(r)}
                    disabled={exporting === r.id}
                    className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    <Download size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Executive Summary Preview */}
      {reports[0] && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[12px] font-medium">Executive Intelligence Summary</p>
              <p className="text-[10px] text-muted-foreground">{metadata.fileName} · {timeAgo(reports[0].generatedAt)}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-3">
            {Object.entries(reports[0].metrics).map(([k, v]) => (
              <div key={k} className="p-2.5 rounded bg-accent/20 text-center">
                <p className="text-[10px] text-muted-foreground capitalize">{k}</p>
                <p className="text-[14px] font-semibold font-mono">{v}</p>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Analysis of <span className="font-mono text-foreground">{metadata.fileName}</span> processed {metadata.rowCount.toLocaleString()} records
            across {metadata.columnCount} fields with {metadata.schemaConfidence}% schema confidence.
            {reports.find(r => r.type === "anomaly")
              ? ` ${reports.find(r => r.type === "anomaly")!.metrics.critical} critical anomalies detected requiring review.`
              : " No critical anomalies detected."}
            {" "}All operational engines initialized and reporting.
          </p>
        </div>
      )}
    </div>
  );
}
