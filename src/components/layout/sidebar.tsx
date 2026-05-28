"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/context/workspace-context";
import {
  LayoutDashboard,
  TrendingUp,
  CalendarCheck,
  Brain,
  Users,
  ShieldCheck,
  LineChart,
  FileText,
  Bot,
  Settings,
  Activity,
  Menu,
  X,
  Upload,
  Database,
} from "lucide-react";

const navSections = [
  {
    label: "Overview",
    items: [
      { label: "Command Center", href: "/", icon: LayoutDashboard },
      { label: "Revenue", href: "/revenue", icon: TrendingUp },
      { label: "Transactions", href: "/bookings", icon: CalendarCheck },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Insights", href: "/insights", icon: Brain },
      { label: "Entities", href: "/agents", icon: Users },
      { label: "Forecasting", href: "/forecasting", icon: LineChart },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Intake Center", href: "/intake", icon: Upload },
      { label: "Data Quality", href: "/health", icon: ShieldCheck },
      { label: "Reports", href: "/reports", icon: FileText },
      { label: "Copilot", href: "/copilot", icon: Bot },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Workspace Monitor", href: "/admin", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isReady, metadata, reset } = useWorkspace();

  const nav = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-[52px] border-b border-border">
        <div className="flex items-center gap-2.5">
          <Activity size={16} className="text-foreground" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-[13px] font-semibold text-foreground tracking-tight">AtlasOps</span>
            <span className="text-[10px] font-medium text-muted-foreground">AI</span>
          </div>
        </div>
        <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>
          <X size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              {section.label}
            </p>
            <div className="space-y-px">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] transition-colors",
                      isActive
                        ? "bg-accent text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <Icon size={15} strokeWidth={isActive ? 2 : 1.5} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Workspace Status Footer */}
      <div className="border-t border-border px-4 py-3">
        {isReady && metadata ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Database size={11} className="text-emerald-400 shrink-0" />
              <span className="text-[10px] font-mono text-muted-foreground truncate">{metadata.fileName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
              <span>{metadata.rowCount.toLocaleString()} records</span>
              <span className="text-muted-foreground/30">·</span>
              <span>{metadata.schemaConfidence}% conf</span>
              <span className="text-muted-foreground/30">·</span>
              <span>6 engines</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-muted-foreground/50">Groq · llama-3.3-70b</span>
              <button
                onClick={reset}
                className="text-[9px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
              <span className="text-[10px] text-muted-foreground">No dataset loaded</span>
            </div>
            <span className="text-[9px] text-muted-foreground/40 block pl-3.5">0 engines · LLM idle</span>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-3.5 left-4 z-50 lg:hidden text-muted-foreground hover:text-foreground"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-[220px] border-r border-border bg-sidebar flex-col">
        {nav}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/80 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 z-50 h-screen w-[220px] border-r border-border bg-sidebar flex flex-col lg:hidden">
            {nav}
          </aside>
        </>
      )}
    </>
  );
}
