"use client";

import React, { useMemo } from "react";
import { useWorkspace } from "@/context/workspace-context";
import { WorkspaceActions } from "@/components/workspace-actions";
import { forecastRevenue, forecastBookings, forecastCancellationRate, forecastDestinationDemand } from "@/lib/forecast-engine";
import { formatCurrency, cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

const TT = { backgroundColor: "#141416", border: "1px solid #27272a", borderRadius: "6px", fontSize: "11px", padding: "8px 10px" };
const AX = { fontSize: 10, fill: "#52525b" };

export default function ForecastingPage() {
  const { isReady, dataset } = useWorkspace();

  const forecasts = useMemo(() => {
    if (!dataset) return null;
    const revenue = forecastRevenue(dataset, 6);
    const bookings = forecastBookings(dataset, 6);
    const cancellation = forecastCancellationRate(dataset, 6);
    const demand = forecastDestinationDemand(dataset, 10);

    // Chart data: actual months + forecast months
    const revChart = revenue.points.map(p => ({
      date: p.period,
      predicted: p.forecast,
      upperBound: p.upper,
      lowerBound: p.lower,
      actual: null as number | null,
    }));

    const bookChart = bookings.points.map(p => ({
      date: p.period,
      predicted: p.forecast,
      actual: null as number | null,
    }));

    const cancelChart = cancellation.points.map(p => ({
      date: p.period,
      predicted: p.forecast,
      actual: null as number | null,
    }));

    const summaries = [
      {
        metric: "Revenue",
        nextMonthPrediction: revenue.points[0]?.forecast || 0,
        trend: revenue.trend === "growing" ? "up" as const : revenue.trend === "declining" ? "down" as const : "stable" as const,
        confidence: revenue.points[0]?.confidence || 0,
        seasonalFactor: revenue.seasonalityDetected ? "seasonal" : "stable",
      },
      {
        metric: "Bookings",
        nextMonthPrediction: Math.round(bookings.points[0]?.forecast || 0),
        trend: bookings.trend === "growing" ? "up" as const : bookings.trend === "declining" ? "down" as const : "stable" as const,
        confidence: bookings.points[0]?.confidence || 0,
        seasonalFactor: bookings.seasonalityDetected ? "seasonal" : "stable",
      },
      {
        metric: "Cancel Rate",
        nextMonthPrediction: Math.round((cancellation.points[0]?.forecast || 0) * 10) / 10,
        trend: cancellation.trend === "declining" ? "up" as const : cancellation.trend === "growing" ? "down" as const : "stable" as const,
        confidence: cancellation.points[0]?.confidence || 0,
        seasonalFactor: cancellation.seasonalityDetected ? "seasonal" : "stable",
      },
    ];

    return { revChart, bookChart, cancelChart, summaries, demand };
  }, [dataset]);

  if (!isReady || !dataset || !forecasts) {
    const modelParams = [
      { param: "Method", value: "Linear Regression + Seasonal" },
      { param: "Horizon", value: "6 months forward" },
      { param: "Confidence", value: "80% prediction interval" },
      { param: "Min. History", value: "3 periods required" },
      { param: "Decomposition", value: "Additive seasonal" },
      { param: "Trend Extraction", value: "Least squares fit" },
    ];

    const forecastTargets = [
      { name: "Revenue Projection", desc: "monthly forward estimate" },
      { name: "Volume Forecast", desc: "booking count prediction" },
      { name: "Cancellation Trend", desc: "rate trajectory" },
      { name: "Demand by Entity", desc: "destination-level forecast" },
    ];

    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight">Forecasting</h1>
          <p className="text-[12px] text-muted-foreground">Upload historical data to initialize forecast models</p>
        </div>

        <WorkspaceActions />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Model Specification */}
          <div className="rounded-lg border border-border bg-card">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-[12px] font-medium">Model Specification</p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-[10px] font-medium text-muted-foreground uppercase text-left px-4 py-2">Parameter</th>
                  <th className="text-[10px] font-medium text-muted-foreground uppercase text-left px-4 py-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {modelParams.map((m) => (
                  <tr key={m.param} className="border-b border-border/50">
                    <td className="text-[11px] text-muted-foreground px-4 py-2.5">{m.param}</td>
                    <td className="text-[11px] font-mono px-4 py-2.5">{m.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Forecast Targets */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-[12px] font-medium mb-3">Forecast Targets</p>
            <div className="space-y-0">
              {forecastTargets.map((t) => (
                <div key={t.name} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-[11px] font-medium">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full border border-border" />
                    <span className="text-[10px] text-muted-foreground">pending</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { revChart, bookChart, cancelChart, summaries, demand } = forecasts;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[15px] font-semibold tracking-tight">Forecasting</h1>
        <p className="text-[12px] text-muted-foreground">Statistical forecasting and demand prediction</p>
      </div>

      {/* Forecast Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
        {summaries.map((f, i) => (
          <div key={i} className="rounded-lg border border-border bg-card px-3.5 py-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] text-muted-foreground">{f.metric}</p>
              {f.trend === "up" ? <TrendingUp size={11} className="text-emerald-500" /> :
               f.trend === "down" ? <TrendingDown size={11} className="text-red-500" /> :
               <Minus size={11} className="text-muted-foreground" />}
            </div>
            <p className="text-[16px] font-semibold font-mono">
              {f.metric === "Revenue" ? formatCurrency(f.nextMonthPrediction, true) :
               f.metric === "Cancel Rate" ? `${f.nextMonthPrediction}%` :
               f.nextMonthPrediction}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{f.confidence}% confidence · {f.seasonalFactor}</p>
          </div>
        ))}
      </div>

      {/* Revenue Forecast */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-[12px] font-medium mb-3">Revenue Forecast</p>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={revChart}>
            <defs>
              <linearGradient id="confBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e22" vertical={false} />
            <XAxis dataKey="date" tick={AX} axisLine={false} tickLine={false} />
            <YAxis tick={AX} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} width={45} />
            <Tooltip contentStyle={TT} formatter={(value) => [formatCurrency(Number(value), true)]} />
            <Area type="monotone" dataKey="upperBound" stroke="none" fill="url(#confBand)" />
            <Area type="monotone" dataKey="lowerBound" stroke="none" fill="var(--color-background)" />
            <Line type="monotone" dataKey="predicted" stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Booking + Cancellation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[12px] font-medium mb-3">Booking Forecast</p>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={bookChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e22" vertical={false} />
              <XAxis dataKey="date" tick={AX} axisLine={false} tickLine={false} />
              <YAxis tick={AX} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={TT} />
              <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[12px] font-medium mb-3">Cancellation Forecast</p>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={cancelChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e22" vertical={false} />
              <XAxis dataKey="date" tick={AX} axisLine={false} tickLine={false} />
              <YAxis tick={AX} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={TT} />
              <Line type="monotone" dataKey="predicted" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 3" dot={false} opacity={0.7} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Demand Table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[12px] font-medium">Destination Demand Forecast</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-[11px] font-medium text-muted-foreground uppercase text-left px-4 py-2">Destination</th>
              <th className="text-[11px] font-medium text-muted-foreground uppercase text-right px-3 py-2">Current</th>
              <th className="text-[11px] font-medium text-muted-foreground uppercase text-right px-3 py-2">Predicted</th>
              <th className="text-[11px] font-medium text-muted-foreground uppercase text-right px-3 py-2">Change</th>
              <th className="text-[11px] font-medium text-muted-foreground uppercase text-right px-3 py-2">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {demand.map((d) => {
              const change = d.currentBookings > 0
                ? Math.round(((d.projectedBookings - d.currentBookings) / d.currentBookings) * 100)
                : 0;
              return (
                <tr key={d.destination} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="text-[12px] font-medium px-4 py-2.5">{d.destination}</td>
                  <td className="text-[12px] font-mono text-muted-foreground text-right px-3 py-2.5">{d.currentBookings}</td>
                  <td className="text-[12px] font-mono font-medium text-right px-3 py-2.5">{d.projectedBookings}</td>
                  <td className={cn("text-[12px] font-mono text-right px-3 py-2.5",
                    change > 0 ? "text-emerald-500" : "text-red-500"
                  )}>
                    {change > 0 ? "+" : ""}{change}%
                  </td>
                  <td className="text-[12px] font-mono text-muted-foreground text-right px-3 py-2.5">{d.confidence}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
