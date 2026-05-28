"use client";

// ============================================================
// AtlasOps AI — Workspace Intelligence Monitor
// Real workspace metrics derived from uploaded datasets
// ============================================================

import React, { useMemo } from "react";
import { useWorkspace } from "@/context/workspace-context";
import { WorkspaceActions } from "@/components/workspace-actions";
import { computeBookingAnalytics, computeMonthlyTrends, computeAgentAnalytics, computeDestinationAnalytics, computeSourceAnalytics } from "@/lib/analytics";
import { generateInsights } from "@/lib/insight-engine";
import { detectAnomalies as detectStatAnomalies } from "@/lib/analytics";
import { cn, timeAgo } from "@/lib/utils";

export default function AdminPage() {
  const { isReady, dataset, metadata } = useWorkspace();

  const diagnostics = useMemo(() => {
    if (!dataset || !metadata) return null;

    const analytics = computeBookingAnalytics(dataset);
    const monthly = computeMonthlyTrends(dataset);
    const agents = computeAgentAnalytics(dataset);
    const destinations = computeDestinationAnalytics(dataset);
    const sources = computeSourceAnalytics(dataset);
    const insights = generateInsights(dataset);

    // Data quality metrics
    const nullFields = dataset.reduce((count, row) => {
      let nulls = 0;
      if (!row.amount || row.amount === 0) nulls++;
      if (!row.bookingDate) nulls++;
      if (!row.status) nulls++;
      if (!row.destination || row.destination === "Unknown") nulls++;
      return count + nulls;
    }, 0);
    const totalFields = dataset.length * 4;
    const completeness = Math.round(((totalFields - nullFields) / totalFields) * 100);

    // Unique value counts
    const uniqueDestinations = new Set(dataset.map(d => d.destination)).size;
    const uniqueAgents = new Set(dataset.map(d => d.agentId)).size;
    const uniqueCustomers = new Set(dataset.map(d => d.customerId)).size;
    const uniqueSources = new Set(dataset.map(d => d.source)).size;
    const uniqueStatuses = new Set(dataset.map(d => d.status)).size;

    // Temporal span
    const dates = dataset.map(d => d.bookingDate).filter(Boolean).sort();
    const dateRange = dates.length > 1
      ? `${dates[0]} → ${dates[dates.length - 1]}`
      : "—";
    const monthSpan = monthly.length;

    // Anomaly detection on revenue series
    const revSeries = monthly.map(m => m.revenue);
    const anomalies = detectStatAnomalies(revSeries, 2);

    return {
      analytics,
      monthlyCount: monthSpan,
      agentCount: agents.length,
      destinationCount: destinations.length,
      sourceCount: sources.length,
      insightCount: insights.length,
      criticalInsights: insights.filter(i => i.severity === "critical").length,
      anomalyCount: anomalies.length,
      completeness,
      uniqueDestinations,
      uniqueAgents,
      uniqueCustomers,
      uniqueSources,
      uniqueStatuses,
      dateRange,
      nullFields,
    };
  }, [dataset, metadata]);

  if (!isReady || !dataset || !metadata || !diagnostics) {
    const engineList = [
      { name: "Ingestion Pipeline", req: "requires dataset upload" },
      { name: "Schema Analyzer", req: "requires ingestion" },
      { name: "KPI Engine", req: "requires schema mapping" },
      { name: "Anomaly Engine", req: "requires KPI baseline" },
      { name: "Forecast Engine", req: "requires 3+ periods" },
      { name: "Insight Engine", req: "requires anomaly scan" },
      { name: "Report Generator", req: "requires all engines" },
      { name: "Copilot Context", req: "requires insight feed" },
    ];

    const statusPairs = [
      { label: "Workspace", value: "not initialized" },
      { label: "Dataset", value: "—" },
      { label: "Records", value: "—" },
      { label: "Schema", value: "—" },
      { label: "Engines Active", value: "0 / 8" },
      { label: "Last Ingestion", value: "—" },
    ];

    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight">Workspace Intelligence Monitor</h1>
          <p className="text-[12px] text-muted-foreground">Upload a dataset to initialize workspace engines</p>
        </div>

        <WorkspaceActions />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Engine Orchestration */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-[12px] font-medium mb-3">Engine Orchestration</p>
            <div className="border-l-2 border-border ml-1 space-y-0">
              {engineList.map((e) => (
                <div key={e.name} className="flex items-center gap-3 py-2 pl-4 relative">
                  <span className="absolute left-[-5px] w-1.5 h-1.5 rounded-full border border-border bg-card" />
                  <span className="text-[11px] font-medium flex-1">{e.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground hidden sm:block">{e.req}</span>
                  <span className="text-[10px] text-muted-foreground">idle</span>
                </div>
              ))}
            </div>
          </div>

          {/* Workspace Status */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-[12px] font-medium mb-3">Workspace Status</p>
            <div className="space-y-0">
              {statusPairs.map((s) => (
                <div key={s.label} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-accent/20">
                  <span className="text-[11px] text-muted-foreground">{s.label}</span>
                  <span className="text-[11px] font-mono">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const engines = [
    { name: "KPI Engine", status: "active", detail: `${7} scorecards` },
    { name: "Analytics Engine", status: "active", detail: `${diagnostics.monthlyCount} periods` },
    { name: "Anomaly Engine", status: diagnostics.anomalyCount > 0 ? "warning" : "active", detail: `${diagnostics.anomalyCount} flagged` },
    { name: "Forecast Engine", status: "active", detail: `6-month horizon` },
    { name: "Insight Engine", status: diagnostics.criticalInsights > 0 ? "warning" : "active", detail: `${diagnostics.insightCount} insights` },
    { name: "Agent Analytics", status: "active", detail: `${diagnostics.agentCount} entities` },
    { name: "Destination Analytics", status: "active", detail: `${diagnostics.destinationCount} entities` },
    { name: "Source Attribution", status: "active", detail: `${diagnostics.sourceCount} channels` },
  ];

  const workspaceMetrics = [
    { label: "Ingestion Status", value: "Complete", ok: true },
    { label: "Schema Confidence", value: `${metadata.schemaConfidence}%`, ok: metadata.schemaConfidence >= 70 },
    { label: "Records Processed", value: metadata.rowCount.toLocaleString(), ok: true },
    { label: "Data Completeness", value: `${diagnostics.completeness}%`, ok: diagnostics.completeness >= 90 },
  ];

  const entityBreakdown = [
    { entity: "Records", count: dataset.length, type: "rows" },
    { entity: "Columns", count: metadata.columnCount, type: "fields" },
    { entity: "Entities (Dest.)", count: diagnostics.uniqueDestinations, type: "unique" },
    { entity: "Entities (Agent)", count: diagnostics.uniqueAgents, type: "unique" },
    { entity: "Customers", count: diagnostics.uniqueCustomers, type: "unique" },
    { entity: "Sources", count: diagnostics.uniqueSources, type: "channels" },
    { entity: "Statuses", count: diagnostics.uniqueStatuses, type: "enum" },
    { entity: "Time Periods", count: diagnostics.monthlyCount, type: "months" },
  ];

  const pipelineConfig = [
    { label: "File", value: metadata.fileName },
    { label: "Type", value: metadata.fileType.toUpperCase() },
    { label: "Domain", value: metadata.detectedDomain },
    { label: "Date Range", value: diagnostics.dateRange },
    { label: "Uploaded", value: timeAgo(metadata.uploadedAt) },
    { label: "Unmapped Columns", value: metadata.unmappedColumns.length > 0 ? metadata.unmappedColumns.join(", ") : "None" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[15px] font-semibold tracking-tight">Workspace Intelligence Monitor</h1>
        <p className="text-[12px] text-muted-foreground">Ingestion diagnostics · Engine status · Data quality</p>
      </div>

      {/* Status Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {workspaceMetrics.map((m) => (
          <div key={m.label} className="rounded-lg border border-border bg-card p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={cn("w-1.5 h-1.5 rounded-full", m.ok ? "bg-emerald-500" : "bg-amber-500")} />
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </div>
            <p className="text-[14px] font-semibold font-mono">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Engine Grid */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-[12px] font-medium mb-3">Operational Engines</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {engines.map((e) => (
            <div key={e.name} className="flex items-center gap-2 p-2 rounded border border-border/50">
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                e.status === "active" ? "bg-emerald-500" : "bg-amber-500"
              )} />
              <div className="min-w-0">
                <p className="text-[11px] font-medium truncate">{e.name}</p>
                <p className="text-[9px] text-muted-foreground">{e.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Ingestion Config */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[12px] font-medium mb-3">Ingestion Pipeline</p>
          <div className="space-y-1">
            {pipelineConfig.map((s) => (
              <div key={s.label} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-accent/20 transition-colors">
                <span className="text-[11px] text-muted-foreground">{s.label}</span>
                <span className="text-[11px] font-mono text-right max-w-[200px] truncate">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Entity Breakdown */}
        <div className="rounded-lg border border-border bg-card">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[12px] font-medium">Dataset Composition</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-[10px] font-medium text-muted-foreground uppercase text-left px-3 py-1.5">Entity</th>
                <th className="text-[10px] font-medium text-muted-foreground uppercase text-right px-3 py-1.5">Count</th>
                <th className="text-[10px] font-medium text-muted-foreground uppercase text-left px-3 py-1.5">Type</th>
              </tr>
            </thead>
            <tbody>
              {entityBreakdown.map((e) => (
                <tr key={e.entity} className="border-b border-border/50">
                  <td className="text-[11px] font-medium px-3 py-2">{e.entity}</td>
                  <td className="text-[11px] font-mono text-right px-3 py-2">{e.count.toLocaleString()}</td>
                  <td className="text-[10px] text-muted-foreground px-3 py-2">{e.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
