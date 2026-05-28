"use client";

import React, { useMemo } from "react";
import { useWorkspace } from "@/context/workspace-context";
import { WorkspaceActions } from "@/components/workspace-actions";
import { KPICard } from "@/components/dashboard/kpi-card";
import { computeBookingAnalytics, computeMonthlyTrends, computeDestinationAnalytics, computeSourceAnalytics } from "@/lib/analytics";
import { formatCurrency, cn } from "@/lib/utils";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart,
} from "recharts";

const TT = { backgroundColor: "#141416", border: "1px solid #27272a", borderRadius: "6px", fontSize: "11px", padding: "8px 10px" };
const AX = { fontSize: 10, fill: "#52525b" };
const PIE_COLORS = ["#6366f1", "#3b82f6", "#ef4444", "#eab308"];

export default function BookingsPage() {
  const { isReady, dataset } = useWorkspace();

  const analytics = useMemo(() => {
    if (!dataset) return null;
    const summary = computeBookingAnalytics(dataset);
    const monthly = computeMonthlyTrends(dataset);
    const destinations = computeDestinationAnalytics(dataset);
    const sources = computeSourceAnalytics(dataset);
    const statusCounts = [
      { status: "confirmed", count: summary.confirmed },
      { status: "completed", count: summary.completed },
      { status: "cancelled", count: summary.cancelled },
      { status: "pending", count: summary.pending },
    ];
    return { summary, monthly, destinations, sources, statusCounts };
  }, [dataset]);

  if (!isReady || !dataset || !analytics) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight">Transaction Analytics</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">Schema-driven exploration of transactional data</p>
        </div>
        <WorkspaceActions />

        <div className="grid grid-cols-3 gap-3">
          {/* Expected Schema */}
          <div className="col-span-2 rounded-lg border border-border bg-card p-4">
            <p className="text-[12px] font-medium mb-3">Expected Schema</p>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-[10px] font-medium text-muted-foreground uppercase text-left px-3 py-1.5">Field</th>
                  <th className="text-[10px] font-medium text-muted-foreground uppercase text-left px-3 py-1.5">Type</th>
                  <th className="text-[10px] font-medium text-muted-foreground uppercase text-left px-3 py-1.5">Role</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { field: "booking_date", type: "date", role: "temporal key" },
                  { field: "amount", type: "numeric", role: "primary metric" },
                  { field: "status", type: "enum", role: "segmentation" },
                  { field: "destination", type: "string", role: "entity dimension" },
                  { field: "source", type: "string", role: "attribution channel" },
                  { field: "agent_id", type: "string", role: "performance entity" },
                  { field: "customer_id", type: "string", role: "unique identifier" },
                ].map((row) => (
                  <tr key={row.field} className="border-b border-border/50">
                    <td className="text-[11px] font-mono px-3 py-1.5">{row.field}</td>
                    <td className="text-[11px] font-mono text-muted-foreground px-3 py-1.5">{row.type}</td>
                    <td className="text-[11px] px-3 py-1.5">{row.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Aggregation Dimensions */}
          <div className="col-span-1 rounded-lg border border-border bg-card p-4">
            <p className="text-[12px] font-medium mb-3">Aggregation Dimensions</p>
            <div className="space-y-2">
              {[
                { dim: "temporal", output: "trend analysis" },
                { dim: "entity", output: "performance ranking" },
                { dim: "channel", output: "attribution modeling" },
                { dim: "status", output: "conversion funnel" },
                { dim: "geographic", output: "distribution analysis" },
              ].map((row) => (
                <div key={row.dim} className="flex items-center justify-between">
                  <span className="text-[11px]">{row.dim}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{row.output}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { summary, monthly, destinations, sources, statusCounts } = analytics;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[15px] font-semibold tracking-tight">Booking Analytics</h1>
        <p className="text-[12px] text-muted-foreground">Booking trends and destination performance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2.5">
        <KPICard title="Total Bookings" value={summary.totalBookings} format="number" change={12.6} />
        <KPICard title="Confirmed" value={summary.confirmed} format="number" change={8.4} />
        <KPICard title="Completed" value={summary.completed} format="number" change={15.2} />
        <KPICard title="Cancelled" value={summary.cancelled} format="number" change={-3.8} />
        <KPICard title="Cancel Rate" value={summary.cancellationRate} format="percentage" change={-2.1} />
      </div>

      {/* Booking Trends */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-[12px] font-medium mb-3">Booking Trends</p>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e22" vertical={false} />
            <XAxis dataKey="month" tick={AX} axisLine={false} tickLine={false} />
            <YAxis tick={AX} axisLine={false} tickLine={false} width={35} />
            <Tooltip contentStyle={TT} />
            <Bar dataKey="bookings" fill="#6366f1" radius={[2, 2, 0, 0]} barSize={16} name="Bookings" opacity={0.75} />
            <Line type="monotone" dataKey="cancellations" stroke="#ef4444" strokeWidth={1.5} dot={{ r: 2, fill: "#ef4444" }} name="Cancellations" opacity={0.8} />
            <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: "10px", color: "#71717a" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Status */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[12px] font-medium mb-3">Status Distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusCounts} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={48} outerRadius={72} strokeWidth={1.5} stroke="#141416">
                {statusCounts.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} opacity={0.75} />)}
              </Pie>
              <Tooltip contentStyle={TT} />
              <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: "10px", color: "#71717a" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Source */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[12px] font-medium mb-3">Booking Source</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sources}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e22" vertical={false} />
              <XAxis dataKey="source" tick={AX} axisLine={false} tickLine={false} />
              <YAxis tick={AX} axisLine={false} tickLine={false} width={35} />
              <Tooltip contentStyle={TT} />
              <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={20} opacity={0.75} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Destination Table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[12px] font-medium">Destination Performance</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-[11px] font-medium text-muted-foreground uppercase text-left px-4 py-2">Destination</th>
              <th className="text-[11px] font-medium text-muted-foreground uppercase text-right px-3 py-2">Bookings</th>
              <th className="text-[11px] font-medium text-muted-foreground uppercase text-right px-3 py-2">Revenue</th>
              <th className="text-[11px] font-medium text-muted-foreground uppercase text-left px-3 py-2">Type</th>
              <th className="text-[11px] font-medium text-muted-foreground uppercase text-right px-3 py-2">Cancel %</th>
            </tr>
          </thead>
          <tbody>
            {destinations.map((d) => (
              <tr key={d.destination} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                <td className="text-[12px] font-medium px-4 py-2.5">{d.destination}</td>
                <td className="text-[12px] font-mono text-right px-3 py-2.5">{d.bookings}</td>
                <td className="text-[12px] font-mono text-right px-3 py-2.5">{formatCurrency(d.revenue, true)}</td>
                <td className="text-[11px] text-muted-foreground px-3 py-2.5 capitalize">{d.type || "domestic"}</td>
                <td className={cn("text-[12px] font-mono text-right px-3 py-2.5",
                  d.cancellationRate > 10 ? "text-red-500" : ""
                )}>{d.cancellationRate.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
