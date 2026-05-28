// ============================================================
// AtlasOps AI — Workspace State Management
// IndexedDB-backed workspace persistence for uploaded datasets
// ============================================================

import { get, set, del } from "idb-keyval";
import { Booking } from "@/types";

// --- Types ---

export interface DatasetMetadata {
  fileName: string;
  fileType: "csv" | "xlsx" | "pdf";
  rowCount: number;
  columnCount: number;
  uploadedAt: string;
  dateRange: { start: string; end: string } | null;
  detectedDomain: string;
  schemaConfidence: number; // 0-100
  unmappedColumns: string[];
}

export interface WorkspaceState {
  status: "empty" | "loading" | "ready" | "error";
  dataset: Booking[] | null;
  metadata: DatasetMetadata | null;
  error: string | null;
}

// --- IndexedDB Keys ---

const WORKSPACE_KEY = "atlasops-workspace-dataset";
const METADATA_KEY = "atlasops-workspace-metadata";

// --- Persistence ---

export async function saveWorkspace(
  bookings: Booking[],
  metadata: DatasetMetadata
): Promise<void> {
  await set(WORKSPACE_KEY, bookings);
  await set(METADATA_KEY, metadata);
}

export async function loadWorkspace(): Promise<{
  dataset: Booking[] | null;
  metadata: DatasetMetadata | null;
}> {
  try {
    const dataset = await get<Booking[]>(WORKSPACE_KEY);
    const metadata = await get<DatasetMetadata>(METADATA_KEY);
    return {
      dataset: dataset || null,
      metadata: metadata || null,
    };
  } catch {
    return { dataset: null, metadata: null };
  }
}

export async function clearWorkspace(): Promise<void> {
  await del(WORKSPACE_KEY);
  await del(METADATA_KEY);
}

// --- Initial State ---

export const EMPTY_WORKSPACE: WorkspaceState = {
  status: "empty",
  dataset: null,
  metadata: null,
  error: null,
};
