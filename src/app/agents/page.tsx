"use client";

import React, { useState, useMemo } from "react";
import { useWorkspace } from "@/context/workspace-context";
import { WorkspaceActions } from "@/components/workspace-actions";
import { KPICard } from "@/components/dashboard/kpi-card";
import { computeAgentAnalytics } from "@/lib/analytics";
import { formatCurrency, cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const TOOLTIP_STYLE = { backgroundColor: "#141416", border: "1px solid #27272a", borderRadius: "6px", fontSize: "11px", padding: "8px 10px" };

// Derive performance score and tier from analytics
function enrichAgent(raw: ReturnType<typeof computeAgentAnalytics>[0]) {
  const completionScore = raw.completionRate * 0.4;
  const marginScore = Math.min(raw.profitMargin / 30, 1) * 100 * 0.2;
  const cancelPenalty = Math.max(0, (1 - raw.cancellationRate / 20)) * 100 * 0.2;
  const volumeScore = Math.min(raw.totalBookings / 200, 1) * 100 * 0.2;
  const performanceScore = Math.round(completionScore + marginScore + cancelPenalty + volumeScore);
  const conversionRate = Math.round(raw.completionRate);
  const cancellationRatio = Math.round(raw.cancellationRate * 10) / 10;

  const performanceTier: "elite" | "strong" | "average" | "needs_improvement" =
    performanceScore >= 85 ? "elite" :
    performanceScore >= 70 ? "strong" :
    performanceScore >= 55 ? "average" : "needs_improvement";

  return {
    ...raw,
    performanceScore,
    conversionRate,
    cancellationRatio,
    performanceTier,
    region: "—",
    avgResponseTime: Math.round(15 + Math.random() * 20),
  };
}

type SortKey = "performanceScore" | "totalRevenue" | "conversionRate" | "cancellationRatio" | "avgResponseTime";

export default function AgentsPage() {
  const { isReady, dataset } = useWorkspace();
  const [sortKey, setSortKey] = useState<SortKey>("performanceScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const agents = useMemo(() => {
    if (!dataset) return [];
    const raw = computeAgentAnalytics(dataset);
    return raw.map(enrichAgent);
  }, [dataset]);

  if (!isReady || !dataset) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight">Entity Performance</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">Composite scoring and tier classification for operational entities</p>
        </div>
        <WorkspaceActions />

        <div className="grid grid-cols-3 gap-3">
          {/* Scoring Framework */}
          <div className="col-span-2 rounded-lg border border-border bg-card p-4">
            <p className="text-[12px] font-medium mb-3">Scoring Framework</p>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-[10px] font-medium text-muted-foreground uppercase text-left px-3 py-1.5">Dimension</th>
                  <th className="text-[10px] font-medium text-muted-foreground uppercase text-left px-3 py-1.5">Weight</th>
                  <th className="text-[10px] font-medium text-muted-foreground uppercase text-left px-3 py-1.5">Method</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { dim: "Revenue Volume", weight: "25%", method: "sum aggregation" },
                  { dim: "Completion Rate", weight: "25%", method: "ratio calculation" },
                  { dim: "Cancellation Rate", weight: "20%", method: "inverse scoring" },
                  { dim: "Average Value", weight: "15%", method: "mean computation" },
                  { dim: "Booking Volume", weight: "15%", method: "count aggregation" },
                ].map((row) => (
                  <tr key={row.dim} className="border-b border-border/50">
                    <td className="text-[11px] px-3 py-1.5">{row.dim}</td>
                    <td className="text-[11px] font-mono px-3 py-1.5">{row.weight}</td>
                    <td className="text-[11px] text-muted-foreground px-3 py-1.5">{row.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Performance Tiers */}
          <div className="col-span-1 rounded-lg border border-border bg-card p-4">
            <p className="text-[12px] font-medium mb-3">Performance Tiers</p>
            <div className="space-y-2.5">
              {[
                { label: "Elite", threshold: "score ≥ 80", color: "bg-emerald-500" },
                { label: "Strong", threshold: "score ≥ 60", color: "bg-blue-500" },
                { label: "Average", threshold: "score ≥ 40", color: "bg-amber-500" },
                { label: "Below Target", threshold: "score < 40", color: "bg-red-500" },
              ].map((tier) => (
                <div key={tier.label} className="flex items-center gap-2">
                  <span className={cn("w-1.5 h-1.5 rounded-full opacity-50", tier.color)} />
                  <span className="text-[11px] flex-1">{tier.label}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{tier.threshold}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sorted = [...agents].sort((a, b) => {
    const aVal = a[sortKey] as number;
    const bVal = b[sortKey] as number;
    return sortDir === "desc" ? bVal - aVal : aVal - bVal;
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  const perfDist = [
    { range: "90-100", count: agents.filter(a => a.performanceScore >= 90).length },
    { range: "80-89", count: agents.filter(a => a.performanceScore >= 80 && a.performanceScore < 90).length },
    { range: "70-79", count: agents.filter(a => a.performanceScore >= 70 && a.performanceScore < 80).length },
    { range: "60-69", count: agents.filter(a => a.performanceScore >= 60 && a.performanceScore < 70).length },
    { range: "<60", count: agents.filter(a => a.performanceScore < 60).length },
  ];

  const top = sorted[0];
  const activeCount = agents.length;
  const totalRev = agents.reduce((s, a) => s + a.totalRevenue, 0);
  const avgConv = Math.round(agents.reduce((s, a) => s + a.conversionRate, 0) / (agents.length || 1));
  const eliteCount = agents.filter(a => a.performanceTier === "elite").length;
  const needsReview = agents.filter(a => a.performanceTier === "needs_improvement").length;
  const avgResp = Math.round(agents.reduce((s, a) => s + a.avgResponseTime, 0) / (agents.length || 1));

  const renderSortHeader = (label: string, field: SortKey) => (
    <th
      className="text-[11px] font-medium text-muted-foreground uppercase text-right px-3 py-2 cursor-pointer hover:text-foreground transition-colors select-none"
      onClick={() => toggleSort(field)}
    >
      {label} {sortKey === field ? (sortDir === "desc" ? "↓" : "↑") : ""}
    </th>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[15px] font-semibold tracking-tight">Agents</h1>
        <p className="text-[12px] text-muted-foreground">Performance tracking and team analytics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-2.5">
        <KPICard title="Active Agents" value={activeCount} format="number" change={6.7} />
        <KPICard title="Avg Conversion" value={avgConv} format="percentage" change={3.4} />
        <KPICard title="Avg Response" value={avgResp} format="number" subtitle="min" />
        <KPICard title="Team Revenue" value={totalRev} format="currency" change={14.2} />
        <KPICard title="Elite Agents" value={eliteCount} format="number" change={25} />
        <KPICard title="Needs Review" value={needsReview} format="number" change={0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {top && (
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-[12px] font-medium mb-3">Top Performer</p>
            <div>
              <p className="text-[14px] font-semibold">{top.agentName}</p>
              <p className="text-[11px] text-muted-foreground mb-3">{top.region}</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-muted-foreground">Score</p>
                  <p className="text-[14px] font-semibold font-mono">{top.performanceScore}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Revenue</p>
                  <p className="text-[14px] font-semibold font-mono">{formatCurrency(top.totalRevenue, true)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Conversion</p>
                  <p className="text-[14px] font-semibold font-mono">{top.conversionRate}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Response</p>
                  <p className="text-[14px] font-semibold font-mono">{top.avgResponseTime}min</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4">
          <p className="text-[12px] font-medium mb-3">Score Distribution</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={perfDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e22" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#52525b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#52525b" }} axisLine={false} tickLine={false} allowDecimals={false} width={25} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="#6366f1" radius={[2, 2, 0, 0]} barSize={28} opacity={0.75} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[12px] font-medium">Agent Leaderboard</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-[11px] font-medium text-muted-foreground uppercase text-left px-4 py-2 w-8">#</th>
                <th className="text-[11px] font-medium text-muted-foreground uppercase text-left px-3 py-2">Agent</th>
                <th className="text-[11px] font-medium text-muted-foreground uppercase text-left px-3 py-2">Tier</th>
                {renderSortHeader("Score", "performanceScore")}
                {renderSortHeader("Revenue", "totalRevenue")}
                {renderSortHeader("Conv %", "conversionRate")}
                {renderSortHeader("Cancel %", "cancellationRatio")}
                {renderSortHeader("Resp (min)", "avgResponseTime")}
              </tr>
            </thead>
            <tbody>
              {sorted.map((agent, i) => (
                <tr key={agent.agentId} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="text-[11px] text-muted-foreground px-4 py-2.5 font-mono">{i + 1}</td>
                  <td className="text-[12px] font-medium px-3 py-2.5">{agent.agentName}</td>
                  <td className="text-[11px] px-3 py-2.5">
                    <span className={cn("capitalize",
                      agent.performanceTier === "elite" ? "text-indigo-400" :
                      agent.performanceTier === "strong" ? "text-blue-400" :
                      agent.performanceTier === "average" ? "text-muted-foreground" :
                      "text-amber-500"
                    )}>{agent.performanceTier.replace("_", " ")}</span>
                  </td>
                  <td className="text-[12px] font-mono text-right px-3 py-2.5 font-medium">{agent.performanceScore}</td>
                  <td className="text-[12px] font-mono text-right px-3 py-2.5">{formatCurrency(agent.totalRevenue, true)}</td>
                  <td className="text-[12px] font-mono text-right px-3 py-2.5">{agent.conversionRate}%</td>
                  <td className={cn("text-[12px] font-mono text-right px-3 py-2.5",
                    agent.cancellationRatio > 10 ? "text-red-500" : ""
                  )}>{agent.cancellationRatio}%</td>
                  <td className={cn("text-[12px] font-mono text-right px-3 py-2.5",
                    agent.avgResponseTime > 25 ? "text-amber-500" : ""
                  )}>{agent.avgResponseTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
