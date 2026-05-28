// ============================================================
// AtlasOps AI — Runtime Health Hook
// Polls /api/runtime/health every 60s
// Caches state for UI indicators across all pages
// ============================================================

"use client";

import { useSyncExternalStore } from "react";

export interface RuntimeHealth {
  groq: boolean;
  model: string | null;
  latency: number | null;
  mode: "live" | "deterministic" | "degraded";
  message: string;
}

const DEFAULT_STATE: RuntimeHealth = {
  groq: false,
  model: null,
  latency: null,
  mode: "deterministic",
  message: "Checking runtime…",
};

const POLL_INTERVAL = 60_000; // 60 seconds

// ---- External store (module-level singleton) ----

let currentHealth: RuntimeHealth = DEFAULT_STATE;
let listeners: Array<() => void> = [];
let initialized = false;
let intervalId: ReturnType<typeof setInterval> | null = null;

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

async function fetchHealth() {
  try {
    const res = await fetch("/api/runtime/health", {
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      currentHealth = await res.json();
      emitChange();
    }
  } catch {
    currentHealth = {
      groq: false,
      model: null,
      latency: null,
      mode: "degraded",
      message: "Runtime check failed",
    };
    emitChange();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.push(listener);

  // Start polling on first subscriber
  if (!initialized) {
    initialized = true;
    fetchHealth();
    intervalId = setInterval(fetchHealth, POLL_INTERVAL);
  }

  return () => {
    listeners = listeners.filter((l) => l !== listener);
    // Stop polling when no subscribers
    if (listeners.length === 0 && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      initialized = false;
    }
  };
}

function getSnapshot(): RuntimeHealth {
  return currentHealth;
}

function getServerSnapshot(): RuntimeHealth {
  return DEFAULT_STATE;
}

// ---- Hook ----

export function useRuntimeHealth(): RuntimeHealth {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
