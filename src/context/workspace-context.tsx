"use client";

// ============================================================
// AtlasOps AI — Workspace Context
// React Context providing workspace state to all pages
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { Booking } from "@/types";
import {
  WorkspaceState,
  DatasetMetadata,
  EMPTY_WORKSPACE,
  saveWorkspace,
  loadWorkspace,
  clearWorkspace,
} from "@/lib/workspace";

// --- Context Shape ---

interface WorkspaceContextValue {
  state: WorkspaceState;
  dataset: Booking[] | null;
  metadata: DatasetMetadata | null;
  isReady: boolean;
  isEmpty: boolean;
  isLoading: boolean;
  setDataset: (bookings: Booking[], metadata: DatasetMetadata) => Promise<void>;
  reset: () => Promise<void>;
  loadDemoDataset: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

// --- Provider ---

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WorkspaceState>(EMPTY_WORKSPACE);
  const hasInitialized = useRef(false);

  // Restore from IndexedDB on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    async function restore() {
      setState(prev => ({ ...prev, status: "loading" }));
      try {
        const { dataset, metadata } = await loadWorkspace();
        if (dataset && dataset.length > 0 && metadata) {
          setState({ status: "ready", dataset, metadata, error: null });
        } else {
          setState(EMPTY_WORKSPACE);
        }
      } catch {
        setState(EMPTY_WORKSPACE);
      }
    }
    restore();
  }, []);

  // Set dataset (after upload + schema mapping)
  const setDataset = useCallback(async (bookings: Booking[], metadata: DatasetMetadata) => {
    setState({ status: "loading", dataset: null, metadata: null, error: null });
    try {
      await saveWorkspace(bookings, metadata);
      setState({ status: "ready", dataset: bookings, metadata, error: null });
    } catch (err) {
      setState({
        status: "error",
        dataset: null,
        metadata: null,
        error: err instanceof Error ? err.message : "Failed to save workspace",
      });
    }
  }, []);

  // Clear workspace
  const reset = useCallback(async () => {
    await clearWorkspace();
    setState(EMPTY_WORKSPACE);
  }, []);

  // Load demo dataset (static travel data)
  const loadDemoDataset = useCallback(async () => {
    setState(prev => ({ ...prev, status: "loading" }));
    try {
      const { bookings } = await import("@/data/bookings");
      const metadata: DatasetMetadata = {
        fileName: "demo-travel-operations.csv",
        fileType: "csv",
        rowCount: bookings.length,
        columnCount: 18,
        uploadedAt: new Date().toISOString(),
        dateRange: {
          start: bookings.reduce((min, b) => b.bookingDate < min ? b.bookingDate : min, bookings[0]?.bookingDate || ""),
          end: bookings.reduce((max, b) => b.bookingDate > max ? b.bookingDate : max, bookings[0]?.bookingDate || ""),
        },
        detectedDomain: "Travel Operations",
        schemaConfidence: 100,
        unmappedColumns: [],
      };
      await saveWorkspace(bookings, metadata);
      setState({ status: "ready", dataset: bookings, metadata, error: null });
    } catch (err) {
      setState({
        status: "error",
        dataset: null,
        metadata: null,
        error: err instanceof Error ? err.message : "Failed to load demo dataset",
      });
    }
  }, []);

  const value: WorkspaceContextValue = {
    state,
    dataset: state.dataset,
    metadata: state.metadata,
    isReady: state.status === "ready" && state.dataset !== null,
    isEmpty: state.status === "empty",
    isLoading: state.status === "loading",
    setDataset,
    reset,
    loadDemoDataset,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

// --- Hook ---

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
