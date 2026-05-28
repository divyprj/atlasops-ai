"use client";

// ============================================================
// AtlasOps AI — Workspace Actions
// Minimal shared upload/demo buttons for workspace initialization
// ============================================================

import React from "react";
import Link from "next/link";
import { useWorkspace } from "@/context/workspace-context";
import { Upload } from "lucide-react";

/**
 * Compact action bar for workspace initialization.
 * Used inline by each page's unique empty state — NOT a layout wrapper.
 */
export function WorkspaceActions() {
  const { loadDemoDataset, isLoading } = useWorkspace();

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/intake"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-foreground text-background text-[11px] font-medium hover:opacity-90 transition-opacity"
      >
        <Upload size={11} /> Upload Data
      </Link>
      <button
        onClick={loadDemoDataset}
        disabled={isLoading}
        className="px-3 py-1.5 rounded-md border border-border text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors disabled:opacity-50"
      >
        {isLoading ? "Initializing..." : "Load Demo Dataset"}
      </button>
    </div>
  );
}
