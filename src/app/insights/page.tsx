"use client";

import React, { useState, useMemo } from "react";
import { useWorkspace } from "@/context/workspace-context";
import { WorkspaceActions } from "@/components/workspace-actions";
import { generateInsights } from "@/lib/insight-engine";
import { formatCurrency, cn, timeAgo } from "@/lib/utils";

type SeverityFilter = "all" | "critical" | "warning" | "positive" | "info";

const severityDot: Record<string, string> = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  positive: "bg-emerald-500",
  info: "bg-blue-500",
};

export default function InsightsPage() {
  const { isReady, dataset } = useWorkspace();
  const [filter, setFilter] = useState<SeverityFilter>("all");

  const insights = useMemo(() => {
    if (!dataset) return [];
    return generateInsights(dataset).map((ins, i) => ({
      id: ins.id || `ins-${i}`,
      title: ins.title,
      description: ins.detail,
      severity: ins.severity,
      category: ins.category,
      metric: ins.metric,
      metricValue: ins.metricValue,
      source: ins.source,
      timestamp: ins.timestamp || new Date(2024, 0, 1, 12 - i).toISOString(),
      isNew: i < 3,
    }));
  }, [dataset]);

  if (!isReady || !dataset) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight">Operational Insights</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">Automated detection of patterns, anomalies, and risks</p>
        </div>
        <WorkspaceActions />

        {/* Severity Ladder */}
        <div className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-2.5">
          {[
            { label: "CRITICAL", color: "bg-red-500" },
            { label: "WARNING", color: "bg-amber-500" },
            { label: "POSITIVE", color: "bg-emerald-500" },
            { label: "INFO", color: "bg-blue-500" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className={cn("w-1.5 h-1.5 rounded-full", s.color)} />
              <span className="text-[10px] font-medium text-muted-foreground">{s.label}</span>
              <span className="text-[10px] text-muted-foreground">—</span>
            </div>
          ))}
        </div>

        {/* 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Intelligence Feed */}
          <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4">
            <p className="text-[12px] font-medium mb-3">Intelligence Feed</p>
            <div className="space-y-1">
              {[
                { name: "Revenue Concentration", desc: "High dependency on single entity detected", cat: "risk" },
                { name: "Cancellation Spike", desc: "Abnormal cancellation rate in period", cat: "anomaly" },
                { name: "Growth Acceleration", desc: "Sustained positive revenue trend", cat: "trend" },
                { name: "Seasonal Pattern", desc: "Cyclical demand variation identified", cat: "pattern" },
              ].map((row) => (
                <div key={row.name} className="flex items-start gap-3 py-2 px-2 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground opacity-40 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium">{row.name}</p>
                    <p className="text-[11px] text-muted-foreground">{row.desc}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground capitalize shrink-0">{row.cat}</span>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-muted-foreground mt-3 pt-2 border-t border-border">Sample patterns — upload data for live detection</p>
          </div>

          {/* Detection Engine */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-[12px] font-medium mb-3">Detection Engine</p>
            <div className="space-y-2">
              {[
                { category: "Revenue Patterns", method: "z-score analysis" },
                { category: "Volume Anomalies", method: "trend deviation" },
                { category: "Risk Concentration", method: "dependency detection" },
                { category: "Performance Drift", method: "entity degradation" },
              ].map((row) => (
                <div key={row.category} className="flex items-center justify-between">
                  <span className="text-[11px]">{row.category}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{row.method}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filtered = filter === "all" ? insights : insights.filter((i) => i.severity === filter);

  const summary = {
    total: insights.length,
    critical: insights.filter(i => i.severity === "critical").length,
    warning: insights.filter(i => i.severity === "warning").length,
    positive: insights.filter(i => i.severity === "positive").length,
    info: insights.filter(i => i.severity === "info").length,
    newInsights: insights.filter(i => i.isNew).length,
  };

  const categoryCounts = insights.reduce<Record<string, number>>((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + 1;
    return acc;
  }, {});

  const filters: { label: string; value: SeverityFilter; count: number }[] = [
    { label: "All", value: "all", count: summary.total },
    { label: "Critical", value: "critical", count: summary.critical },
    { label: "Warning", value: "warning", count: summary.warning },
    { label: "Positive", value: "positive", count: summary.positive },
    { label: "Info", value: "info", count: summary.info },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[15px] font-semibold tracking-tight">AI Insights</h1>
        <p className="text-[12px] text-muted-foreground">Operational intelligence and recommendations</p>
      </div>

      {/* Summary + Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>{summary.total} insights</span>
          <span>·</span>
          <span className="text-red-500">{summary.critical} critical</span>
          <span>·</span>
          <span className="text-amber-500">{summary.warning} warning</span>
          <span>·</span>
          <span className="text-emerald-500">{summary.positive} positive</span>
          <span>·</span>
          <span>{summary.newInsights} new</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-2.5 py-1 rounded text-[11px] font-medium transition-colors",
              filter === f.value
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label} <span className="text-muted-foreground ml-0.5">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Insight Feed */}
        <div className="lg:col-span-3 space-y-1">
          {filtered.map((insight) => (
            <div
              key={insight.id}
              className="rounded-lg border border-border bg-card p-3.5 hover:bg-accent/20 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", severityDot[insight.severity])} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[12px] font-medium">{insight.title}</p>
                    {insight.isNew && <span className="text-[9px] text-muted-foreground bg-accent px-1.5 py-0.5 rounded">New</span>}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{insight.description}</p>

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-muted-foreground capitalize">{insight.category}</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] text-muted-foreground">{insight.source}</span>
                    {insight.metricValue !== undefined && (
                      <>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] font-mono text-foreground">
                          {typeof insight.metricValue === "number" && insight.metricValue > 10000
                            ? formatCurrency(insight.metricValue, true)
                            : `${insight.metricValue}`}
                        </span>
                      </>
                    )}
                    <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(insight.timestamp)}</span>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-card p-3.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase mb-3">By Category</p>
            <div className="space-y-2">
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-[11px] capitalize">{cat}</span>
                  <span className="text-[11px] font-mono text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-3.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase mb-3">By Severity</p>
            <div className="space-y-2">
              {(["critical", "warning", "positive", "info"] as const).map((sev) => {
                const count = insights.filter((i) => i.severity === sev).length;
                return (
                  <div key={sev} className="flex items-center gap-2">
                    <span className={cn("w-1.5 h-1.5 rounded-full", severityDot[sev])} />
                    <span className="text-[11px] capitalize flex-1">{sev}</span>
                    <span className="text-[11px] font-mono text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
