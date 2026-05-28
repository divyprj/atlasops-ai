"use client";

import React, { useMemo } from "react";
import { useWorkspace } from "@/context/workspace-context";
import { WorkspaceActions } from "@/components/workspace-actions";
import { KPICard } from "@/components/dashboard/kpi-card";
import { computeMonthlyTrends, computeDestinationAnalytics, computeRegionalAnalytics, computeBookingAnalytics } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";
import {
  ComposedChart, Area, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const TT = { backgroundColor: "#141416", border: "1px solid #27272a", borderRadius: "6px", fontSize: "11px", padding: "8px 10px" };
const AX = { fontSize: 10, fill: "#52525b" };

export default function RevenuePage() {
  const { isReady, dataset } = useWorkspace();

  const analytics = useMemo(() => {
    if (!dataset) return null;
    const summary = computeBookingAnalytics(dataset);
    const monthly = computeMonthlyTrends(dataset);
    const destinations = computeDestinationAnalytics(dataset);
    const regions = computeRegionalAnalytics(dataset);
    return { summary, monthly, destinations, regions };
  }, [dataset]);

  if (!isReady || !dataset || !analytics) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight">Revenue Intelligence</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">Multi-dimensional revenue modeling and segment analysis</p>
        </div>
        <WorkspaceActions />

        <div className="grid grid-cols-2 gap-3">
          {/* Analysis Dimensions */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-[12px] font-medium mb-3">Analysis Dimensions</p>
            <div className="space-y-0">
              {[
                { dim: "Temporal Trend", output: "area chart, period-over-period" },
                { dim: "Segment Split", output: "domestic vs international" },
                { dim: "Regional Dist.", output: "horizontal bar ranking" },
                { dim: "Entity Attribution", output: "destination-level breakdown" },
                { dim: "Profit Overlay", output: "revenue vs profit comparison" },
              ].map((row) => (
                <div key={row.dim} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-accent/20">
                  <span className="text-[11px]">{row.dim}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{row.output}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Computed Metrics */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-[12px] font-medium mb-3">Computed Metrics</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Total Revenue", unit: "currency" },
                { label: "Total Profit", unit: "currency" },
                { label: "Profit Margin", unit: "percentage" },
                { label: "Avg Order Value", unit: "currency" },
                { label: "Growth Rate", unit: "percentage" },
                { label: "Entity Count", unit: "count" },
              ].map((m) => (
                <div key={m.label} className="p-2.5 rounded bg-accent/10">
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                  <p className="text-[14px] font-mono mt-0.5">—</p>
                  <p className="text-[9px] text-muted-foreground">{m.unit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { summary, monthly, destinations, regions } = analytics;
  const totalProfit = summary.totalProfit;
  const profitMargin = summary.profitMargin;
  const aov = summary.avgOrderValue;


  const monthlyRevenue = monthly.map(m => ({
    date: m.month,
    revenue: m.revenue,
    profit: m.profit,
    domestic: m.domestic,
    international: m.international,
  }));

  const totalRevenue = summary.totalRevenue;
  const destWithShare = destinations.map(d => ({
    ...d,
    share: Math.round((d.revenue / totalRevenue) * 1000) / 10,
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[15px] font-semibold tracking-tight">Revenue Intelligence</h1>
        <p className="text-[12px] text-muted-foreground">Revenue performance and segment analysis</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2.5">
        <KPICard title="Total Revenue" value={totalRevenue} format="currency" change={18.4} />
        <KPICard title="Total Profit" value={totalProfit} format="currency" change={22.1} />
        <KPICard title="Profit Margin" value={profitMargin} format="percentage" change={1.8} />
        <KPICard title="Avg Order Value" value={aov} format="currency" change={5.2} />
        <KPICard title="Intl Share" value={summary.internationalShare} format="percentage" change={3.2} />
      </div>

      {/* Revenue + Profit Trend */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-[12px] font-medium mb-3">Revenue & Profit Trend</p>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={monthlyRevenue}>
            <defs>
              <linearGradient id="revAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e22" vertical={false} />
            <XAxis dataKey="date" tick={AX} axisLine={false} tickLine={false} />
            <YAxis tick={AX} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} width={50} />
            <Tooltip contentStyle={TT} formatter={(value) => [formatCurrency(Number(value), true)]} />
            <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={1.5} fill="url(#revAreaFill)" name="Revenue" />
            <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Profit" />
            <Legend iconType="line" wrapperStyle={{ fontSize: "10px", color: "#71717a" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Domestic vs International */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[12px] font-medium mb-3">Domestic vs International</p>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="domFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="intFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e22" vertical={false} />
              <XAxis dataKey="date" tick={AX} axisLine={false} tickLine={false} />
              <YAxis tick={AX} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} width={50} />
              <Tooltip contentStyle={TT} formatter={(value) => [formatCurrency(Number(value), true)]} />
              <Area type="monotone" dataKey="domestic" stroke="#6366f1" strokeWidth={1.5} fill="url(#domFill)" name="Domestic" />
              <Area type="monotone" dataKey="international" stroke="#3b82f6" strokeWidth={1.5} fill="url(#intFill)" name="International" />
              <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: "10px", color: "#71717a" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Regional Breakdown */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[12px] font-medium mb-3">Revenue by Region</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={regions} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e22" horizontal={false} />
              <XAxis type="number" tick={AX} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
              <YAxis dataKey="region" type="category" tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={TT} formatter={(value) => [formatCurrency(Number(value), true)]} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[0, 3, 3, 0]} barSize={16} opacity={0.75} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Destination Table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[12px] font-medium">Revenue by Destination</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-[11px] font-medium text-muted-foreground uppercase text-left px-4 py-2">Destination</th>
                <th className="text-[11px] font-medium text-muted-foreground uppercase text-right px-3 py-2">Revenue</th>
                <th className="text-[11px] font-medium text-muted-foreground uppercase text-right px-3 py-2">Share</th>
                <th className="text-[11px] font-medium text-muted-foreground uppercase px-3 py-2 text-left w-48">Distribution</th>
              </tr>
            </thead>
            <tbody>
              {destWithShare.map((d) => (
                <tr key={d.destination} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="text-[12px] font-medium px-4 py-2.5">{d.destination}</td>
                  <td className="text-[12px] font-mono text-right px-3 py-2.5">{formatCurrency(d.revenue, true)}</td>
                  <td className="text-[12px] font-mono text-muted-foreground text-right px-3 py-2.5">{d.share}%</td>
                  <td className="px-3 py-2.5">
                    <div className="w-full bg-accent/30 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-indigo-500/60" style={{ width: `${Math.min(d.share * 4, 100)}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
