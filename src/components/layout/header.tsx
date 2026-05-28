"use client";

// ============================================================
// AtlasOps AI — Workspace Context Header
// Displays real operational metadata instead of fake SaaS chrome
// ============================================================

import React from "react";
import { ChevronRight, Database, AlertTriangle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useWorkspace } from "@/context/workspace-context";
import { timeAgo, cn } from "@/lib/utils";

const routeLabels: Record<string, string> = {
  "/": "Command Center",
  "/revenue": "Revenue Intelligence",
  "/bookings": "Transaction Analytics",
  "/insights": "Operational Insights",
  "/agents": "Entity Performance",
  "/health": "Data Quality",
  "/forecasting": "Forecasting",
  "/reports": "Reports",
  "/copilot": "Operations Copilot",
  "/admin": "Workspace Monitor",
  "/intake": "Intake Center",
};

export function Header() {
  const pathname = usePathname();
  const { metadata, isReady } = useWorkspace();
  const pageTitle = routeLabels[pathname] || "AtlasOps";

  return (
    <header className="sticky top-0 z-30 h-[52px] border-b border-border bg-background flex items-center justify-between px-4 pl-12 lg:pl-6 lg:px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px]">
        <span className="text-muted-foreground">AtlasOps</span>
        <ChevronRight size={12} className="text-muted-foreground/40" />
        <span className="text-foreground font-medium">{pageTitle}</span>
      </div>

      {/* Workspace Context */}
      <div className="flex items-center gap-3">
        {isReady && metadata ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-mono text-foreground">{metadata.fileName}</span>
            </div>
            <span className="text-[10px] text-muted-foreground/30">|</span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {metadata.rowCount.toLocaleString()} records
            </span>
            <span className="text-[10px] text-muted-foreground/30">|</span>
            <span className={cn(
              "text-[10px] font-mono",
              metadata.schemaConfidence >= 80 ? "text-muted-foreground" : "text-amber-500"
            )}>
              {metadata.schemaConfidence}% confidence
            </span>
            {metadata.unmappedColumns.length > 0 && (
              <>
                <span className="text-[10px] text-muted-foreground/30">|</span>
                <span className="text-[10px] text-amber-500 flex items-center gap-1">
                  <AlertTriangle size={9} />
                  {metadata.unmappedColumns.length} unmapped
                </span>
              </>
            )}
            <span className="text-[10px] text-muted-foreground/30">|</span>
            <span className="text-[10px] font-mono text-muted-foreground hidden md:inline">6 engines active</span>
            <span className="text-[10px] text-muted-foreground/30 hidden md:inline">|</span>
            <span className="text-[9px] text-muted-foreground/50 hidden md:inline">
              {timeAgo(metadata.uploadedAt)}
            </span>
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <Database size={11} className="text-muted-foreground/40" />
            <span className="text-[11px] text-muted-foreground">No workspace active</span>
          </div>
        )}
      </div>
    </header>
  );
}
