"use client";

// ============================================================
// AtlasOps AI — Operations Intelligence Copilot
// Workspace-connected operational intelligence terminal
// ============================================================

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useWorkspace } from "@/context/workspace-context";
import { WorkspaceActions } from "@/components/workspace-actions";
import { computeBookingAnalytics, computeAgentAnalytics, computeDestinationAnalytics, detectAnomalies, computeMonthlyTrends } from "@/lib/analytics";
import { generateInsights } from "@/lib/insight-engine";
import { formatCurrency, cn } from "@/lib/utils";
import { useRuntimeHealth } from "@/hooks/use-runtime-health";
import { Send, Terminal, Activity, AlertTriangle, Database, Clock, Zap } from "lucide-react";

// --- Types ---

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  meta?: {
    source: string;
    model: string;
    dataSource: string;
    records: number;
    computedAt: string;
  };
}

// --- Suggested Queries ---

const operationalQueries = [
  "Revenue breakdown by entity",
  "Performance ranking",
  "Cancellation risk analysis",
  "Forecast next quarter",
  "Anomaly summary",
  "Data quality overview",
  "Top entities by revenue",
  "Operational health status",
];

export default function CopilotPage() {
  const { isReady, dataset, metadata } = useWorkspace();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const runtime = useRuntimeHealth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<Array<{ role: string; content: string }>>([]);

  const hasBooted = useRef(false);

  // --- Workspace Context ---
  const context = useMemo(() => {
    if (!dataset || !metadata) return null;
    const analytics = computeBookingAnalytics(dataset);
    const agents = computeAgentAnalytics(dataset);
    const destinations = computeDestinationAnalytics(dataset);
    const insights = generateInsights(dataset);
    const monthly = computeMonthlyTrends(dataset);
    const revAnomalies = detectAnomalies(monthly.map(m => m.revenue), 2);

    return {
      revenue: formatCurrency(analytics.totalRevenue, true),
      records: metadata.rowCount.toLocaleString(),
      cancelRate: `${analytics.cancellationRate.toFixed(1)}%`,
      aov: formatCurrency(analytics.avgOrderValue, true),
      anomalyCount: revAnomalies.length,
      criticalCount: insights.filter(i => i.severity === "critical").length,
      insightCount: insights.length,
      agentCount: agents.length,
      destinationCount: destinations.length,
      schemaConfidence: metadata.schemaConfidence,
      fileName: metadata.fileName,
    };
  }, [dataset, metadata]);

  // --- Boot sequence ---
  useEffect(() => {
    if (hasBooted.current || !context || !metadata) return;
    hasBooted.current = true;

    const ts = new Date().toISOString();
    setMessages([
      {
        id: "boot-1",
        role: "system",
        content: "AtlasOps Intelligence Terminal v2.1.0",
        timestamp: ts,
      },
      {
        id: "boot-2",
        role: "system",
        content: `Workspace loaded: ${metadata.fileName}`,
        timestamp: ts,
      },
      {
        id: `boot-3-${Date.now()}`,
        role: "system",
        content: `${metadata.rowCount.toLocaleString()} records · ${metadata.columnCount} fields · ${metadata.schemaConfidence}% schema confidence · ${context.insightCount} insights (${context.criticalCount} critical) · ${context.anomalyCount} anomalies. Ready for queries.`,
        timestamp: ts,
      },
    ]);
  }, [context, metadata]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, loading]);

  // --- Send query ---
  const send = useCallback(async (text?: string) => {
    const q = text || input;
    if (!q.trim() || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: q,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          history: history.slice(-6),
        }),
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.response || data.error || "No response.",
        timestamp: new Date().toISOString(),
        meta: data.meta,
      };

      setMessages(prev => [...prev, assistantMsg]);
      setHistory(prev => [
        ...prev,
        { role: "user", content: q },
        { role: "assistant", content: data.response || "" },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "system",
          content: "Query failed. Check API connection.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, history]);

  if (!isReady || !dataset || !metadata) {
    return (
      <div className="h-[calc(100vh-7rem)] flex gap-3">
        {/* Offline Terminal */}
        <div className="flex-1 flex flex-col rounded-lg border border-border bg-card overflow-hidden min-w-0">
          {/* Terminal Header — mirrors active state */}
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-border bg-accent/20">
            <div className="flex items-center gap-2">
              <Terminal size={12} className="text-muted-foreground" />
              <span className="text-[11px] font-medium">Operations Intelligence</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                OFFLINE
              </span>
            </div>
            <span className="text-[9px] text-muted-foreground/40 font-mono">no dataset</span>
          </div>

          {/* Terminal Body */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {[
              { text: "AtlasOps Intelligence Terminal v2.1.0", dim: false },
              { text: "No operational workspace connected.", dim: true },
              { text: "Upload a dataset to initialize intelligence queries.", dim: true },
              { text: "", dim: true },
              { text: "Supported query types:", dim: false },
              { text: "  revenue_breakdown    — Revenue analysis by entity and segment", dim: true },
              { text: "  anomaly_scan         — Statistical outlier detection", dim: true },
              { text: "  performance_rank     — Entity efficiency scoring", dim: true },
              { text: "  forecast_projection  — Forward trend modeling", dim: true },
              { text: "  risk_assessment      — Operational risk analysis", dim: true },
              { text: "", dim: true },
              { text: "Initialize workspace to begin.", dim: false },
            ].map((line, i) => (
              <div key={i} className="flex items-start gap-2 py-0.5">
                <span className="text-[9px] text-muted-foreground/30 font-mono shrink-0 pt-0.5 w-14">
                  {line.text ? "—:—:—" : ""}
                </span>
                <span className={cn(
                  "text-[11px] font-mono",
                  line.dim ? "text-muted-foreground/50" : "text-muted-foreground"
                )}>
                  {line.text ? `> ${line.text}` : "\u00A0"}
                </span>
              </div>
            ))}

            {/* Inline workspace actions */}
            <div className="pt-3 pl-[4.5rem]">
              <WorkspaceActions />
            </div>
          </div>

          {/* Disabled Input — mirrors active state */}
          <div className="px-3 py-2 border-t border-border">
            <div className="flex gap-2 items-center opacity-40">
              <span className="text-[10px] text-muted-foreground font-mono shrink-0">▸</span>
              <input
                disabled
                placeholder="Connect workspace to enable queries..."
                className="flex-1 bg-transparent text-[12px] font-mono outline-none placeholder:text-muted-foreground/30 cursor-not-allowed"
              />
              <div className="px-2.5 py-1 rounded bg-foreground/20 text-background/40 text-[10px] font-medium">
                <Send size={11} />
              </div>
            </div>
          </div>
        </div>

        {/* Offline Sidebar — mirrors active state structure */}
        <div className="hidden xl:flex w-52 flex-col gap-2 shrink-0">
          {/* Workspace */}
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Database size={10} className="text-muted-foreground/40" />
              <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Workspace</span>
            </div>
            <div className="space-y-1.5">
              <StatusRow label="Dataset" value="No dataset" />
              <StatusRow label="Records" value="—" />
              <StatusRow label="Schema" value="—" />
              <StatusRow label="Entities" value="—" />
            </div>
          </div>

          {/* Metrics */}
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Activity size={10} className="text-muted-foreground/40" />
              <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Metrics</span>
            </div>
            <div className="space-y-1.5">
              <StatusRow label="Revenue" value="—" />
              <StatusRow label="AOV" value="—" />
              <StatusRow label="Cancel" value="—" />
            </div>
          </div>

          {/* Engines */}
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Zap size={10} className="text-muted-foreground/40" />
              <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Engines</span>
            </div>
            <div className="space-y-1">
              {[
                "KPI Engine",
                "Anomaly Engine",
                "Forecast Engine",
                "Insight Engine",
                "Groq LLM",
              ].map((name) => (
                <div key={name} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="text-[9px] text-muted-foreground/50 font-mono">{name}</span>
                </div>
              ))}
              <p className="text-[9px] text-muted-foreground/40 font-mono mt-1">0/5 active</p>
            </div>
          </div>

          {/* Session */}
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Clock size={10} className="text-muted-foreground/40" />
              <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Session</span>
            </div>
            <div className="space-y-1.5">
              <StatusRow label="Queries" value="0" />
              <StatusRow label="Context" value="0 msgs" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-3">
      {/* Main Terminal */}
      <div className="flex-1 flex flex-col rounded-lg border border-border bg-card overflow-hidden min-w-0">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-border bg-accent/20">
          <div className="flex items-center gap-2">
            <Terminal size={12} className="text-muted-foreground" />
            <span className="text-[11px] font-medium">Operations Intelligence</span>
            <span className={cn(
              "text-[9px] px-1.5 py-0.5 rounded border font-mono",
              runtime.mode === "live"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : runtime.mode === "degraded"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
            )}>
              {runtime.mode === "live" ? "LIVE · Groq Runtime" : runtime.mode === "degraded" ? "DEGRADED" : "DETERMINISTIC"}
            </span>
          </div>
          <span className="text-[9px] text-muted-foreground font-mono">{metadata.fileName}</span>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
          {messages.map((msg) => {
            if (msg.role === "system") {
              return (
                <div key={msg.id} className="flex items-start gap-2 py-0.5">
                  <span className="text-[9px] text-muted-foreground/50 font-mono shrink-0 pt-0.5 w-14">
                    {new Date(msg.timestamp).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{msg.content}</span>
                </div>
              );
            }

            if (msg.role === "user") {
              return (
                <div key={msg.id} className="flex items-start gap-2 py-0.5">
                  <span className="text-[9px] text-muted-foreground/50 font-mono shrink-0 pt-0.5 w-14">
                    {new Date(msg.timestamp).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-medium text-blue-400 mr-1.5">QUERY</span>
                    <span className="text-[12px]">{msg.content}</span>
                  </div>
                </div>
              );
            }

            // Assistant response
            return (
              <div key={msg.id} className="flex items-start gap-2 py-1">
                <span className="text-[9px] text-muted-foreground/50 font-mono shrink-0 pt-0.5 w-14">
                  {new Date(msg.timestamp).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="border border-border rounded px-3 py-2 bg-accent/10">
                    {msg.content.split("\n").map((line, i) => (
                      <p key={i} className={cn(
                        "text-[11px] leading-[1.6] font-mono",
                        !line ? "h-1.5" :
                        line.startsWith("•") || line.startsWith("-") ? "text-muted-foreground pl-1" :
                        line.match(/^[A-Z][A-Z\s]+:?$/) ? "font-medium text-foreground mt-1" :
                        line.includes(":") && line.indexOf(":") < 25 ? "text-foreground" :
                        "text-muted-foreground"
                      )}>
                        {line || "\u00A0"}
                      </p>
                    ))}
                    {/* Meta footer */}
                    {msg.meta && (
                      <div className="flex items-center gap-3 mt-2 pt-1.5 border-t border-border/50">
                        <span className="text-[8px] text-muted-foreground/60 font-mono">
                          {msg.meta.source === "groq" ? `llama-3.3-70b` : "analytics-engine"}
                        </span>
                        <span className="text-[8px] text-muted-foreground/40">|</span>
                        <span className="text-[8px] text-muted-foreground/60 font-mono">
                          {msg.meta.records?.toLocaleString()} records
                        </span>
                        <span className="text-[8px] text-muted-foreground/40">|</span>
                        <span className="text-[8px] text-muted-foreground/60 font-mono">
                          {msg.meta.dataSource}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-start gap-2 py-0.5">
              <span className="text-[9px] text-muted-foreground/50 font-mono shrink-0 pt-0.5 w-14">
                {new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-[10px] text-muted-foreground">Processing query...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Queries */}
        <div className="px-3 py-1.5 border-t border-border">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {operationalQueries.slice(0, 5).map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                disabled={loading}
                className="shrink-0 px-2 py-0.5 rounded text-[9px] text-muted-foreground hover:text-foreground border border-border/50 hover:border-border hover:bg-accent/20 transition-colors disabled:opacity-50 font-mono"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-3 py-2 border-t border-border">
          <div className="flex gap-2 items-center">
            <span className="text-[10px] text-emerald-400 font-mono shrink-0">▸</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Query operations data..."
              disabled={loading}
              className="flex-1 bg-transparent text-[12px] font-mono outline-none placeholder:text-muted-foreground/30 disabled:opacity-50"
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="px-2.5 py-1 rounded bg-foreground text-background text-[10px] font-medium hover:opacity-90 transition-opacity disabled:opacity-30"
            >
              <Send size={11} />
            </button>
          </div>
        </div>
      </div>

      {/* Context Sidebar */}
      <div className="hidden xl:flex w-52 flex-col gap-2 shrink-0">
        {/* Workspace */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Database size={10} className="text-blue-400" />
            <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Workspace</span>
          </div>
          {context ? (
            <div className="space-y-1.5">
              <StatusRow label="Dataset" value={context.fileName.length > 16 ? context.fileName.slice(0, 14) + "…" : context.fileName} />
              <StatusRow label="Records" value={context.records} />
              <StatusRow label="Schema" value={`${context.schemaConfidence}%`} />
              <StatusRow label="Entities" value={`${context.destinationCount}`} />
            </div>
          ) : null}
        </div>

        {/* Metrics */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Activity size={10} className="text-emerald-400" />
            <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Metrics</span>
          </div>
          {context ? (
            <div className="space-y-1.5">
              <StatusRow label="Revenue" value={context.revenue} />
              <StatusRow label="AOV" value={context.aov} />
              <StatusRow label="Cancel" value={context.cancelRate} />
            </div>
          ) : null}
        </div>

        {/* Anomalies */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-1.5 mb-2.5">
            <AlertTriangle size={10} className="text-amber-400" />
            <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Intelligence</span>
          </div>
          {context ? (
            <div className="space-y-1.5">
              <StatusRow label="Insights" value={String(context.insightCount)} />
              <StatusRow label="Critical" value={String(context.criticalCount)} highlight={context.criticalCount > 0} />
              <StatusRow label="Anomalies" value={String(context.anomalyCount)} />
            </div>
          ) : null}
        </div>

        {/* Engines */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Zap size={10} className="text-indigo-400" />
            <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Engines</span>
          </div>
          <div className="space-y-1">
            {[
              { name: "KPI Engine", status: "active", detail: "" },
              { name: "Anomaly Engine", status: "active", detail: "" },
              { name: "Forecast Engine", status: "active", detail: "" },
              { name: "Insight Engine", status: "active", detail: "" },
              { name: "Groq LLM", status: process.env.NEXT_PUBLIC_GROQ_CONFIGURED === "true" ? "active" : "local", detail: process.env.NEXT_PUBLIC_GROQ_CONFIGURED === "true" ? "" : "awaiting credentials" },
            ].map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className={cn(
                  "w-1 h-1 rounded-full",
                  s.status === "active" ? "bg-emerald-500" : "bg-amber-500"
                )} />
                <span className="text-[9px] text-muted-foreground font-mono">{s.name}</span>
                {s.detail && <span className="text-[8px] text-amber-400/70 font-mono">· {s.detail}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Session */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Clock size={10} className="text-muted-foreground" />
            <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Session</span>
          </div>
          <div className="space-y-1.5">
            <StatusRow label="Queries" value={String(messages.filter(m => m.role === "user").length)} />
            <StatusRow label="Context" value={`${history.length} msgs`} />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function StatusRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[9px] text-muted-foreground">{label}</span>
      <span className={cn(
        "text-[10px] font-mono",
        highlight ? "text-red-400" : "text-foreground"
      )}>
        {value}
      </span>
    </div>
  );
}
