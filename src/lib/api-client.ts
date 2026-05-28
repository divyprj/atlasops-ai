// ============================================================
// AtlasOps AI — API Client
// Typed fetch layer with retry, error handling, metadata
// ============================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  meta?: {
    source: string;
    records?: number;
    computedAt: string;
  };
}

interface FetchOptions {
  retries?: number;
  timeout?: number;
}

async function apiFetch<T>(
  endpoint: string,
  options?: FetchOptions & RequestInit,
): Promise<ApiResponse<T>> {
  const { retries = 2, timeout = 15000, ...fetchOpts } = options || {};

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${API_BASE}${endpoint}`, {
        signal: controller.signal,
        ...fetchOpts,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        if (attempt < retries) continue;
        return { data: null, error: `API ${response.status}: ${errorText}` };
      }

      // Handle CSV/text responses
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("text/csv") || contentType.includes("text/plain")) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const disposition = response.headers.get("content-disposition") || "";
        const filename = disposition.match(/filename="(.+)"/)?.[1] || "export.csv";
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        return { data: null, error: null };
      }

      const json = await response.json();

      // Extract meta if present
      const meta = json.meta;
      delete json.meta;

      return { data: json as T, error: null, meta };
    } catch (err) {
      if (attempt < retries) continue;
      const message = err instanceof Error ? err.message : "Network error";
      return { data: null, error: message };
    }
  }

  return { data: null, error: "Max retries exceeded" };
}

// ============================================================
// Typed API Endpoints
// ============================================================

export const api = {
  dashboard: () => apiFetch<DashboardResponse>("/dashboard"),
  revenue: () => apiFetch<RevenueResponse>("/analytics/revenue"),
  bookings: () => apiFetch<BookingsResponse>("/analytics/bookings"),
  agents: () => apiFetch<AgentsResponse>("/agents"),
  insights: () => apiFetch<InsightsResponse>("/insights"),
  anomalies: () => apiFetch<AnomaliesResponse>("/anomalies"),
  forecasting: () => apiFetch<ForecastingResponse>("/forecasting"),

  copilot: (query: string, history?: Array<{ role: string; content: string }>) =>
    apiFetch<CopilotResponse>("/copilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, history }),
    }),

  export: (type: "bookings" | "revenue" | "agents" | "executive") =>
    apiFetch<null>(`/exports/${type}`),
};

// ============================================================
// Response Types
// ============================================================

export interface DashboardResponse {
  scorecard: import("@/lib/kpi-engine").OperationalScorecard;
  healthScore: number;
}

export interface RevenueResponse {
  summary: {
    totalRevenue: number;
    totalProfit: number;
    profitMargin: number;
    avgOrderValue: number;
    revenueGrowth: number;
    domesticRevenue: number;
    internationalRevenue: number;
    internationalShare: number;
  };
  monthly: Array<{
    month: string;
    revenue: number;
    bookings: number;
    cancellations: number;
    cancellationRate: number;
    profit: number;
    domesticRevenue: number;
    internationalRevenue: number;
  }>;
  destinations: Array<{
    destination: string;
    revenue: number;
    bookings: number;
    cancellationRate: number;
    avgOrderValue: number;
    profitMargin: number;
  }>;
  regions: Array<{
    region: string;
    revenue: number;
    bookings: number;
    share: number;
  }>;
}

export interface BookingsResponse {
  analytics: {
    totalBookings: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    pending: number;
    totalRevenue: number;
    avgOrderValue: number;
    cancellationRate: number;
    repeatRatio: number;
    totalCustomers: number;
    repeatCustomers: number;
  };
  monthly: Array<{
    month: string;
    bookings: number;
    revenue: number;
    cancellations: number;
    cancellationRate: number;
  }>;
  destinations: Array<{
    destination: string;
    bookings: number;
    revenue: number;
    cancellationRate: number;
    avgOrderValue: number;
  }>;
  sources: Array<{
    source: string;
    count: number;
    share: number;
    avgValue: number;
  }>;
  dayOfWeek: Array<{
    day: string;
    count: number;
    avgValue: number;
  }>;
}

export interface AgentsResponse {
  agents: Array<{
    agentName: string;
    totalBookings: number;
    totalRevenue: number;
    conversionRate: number;
    cancellationRate: number;
    performanceScore: number;
    responseTime: number;
    satisfaction: number;
  }>;
  summary: {
    activeAgents: number;
    eliteCount: number;
    needsImprovementCount: number;
    avgConversionRate: number;
    avgResponseTime: number;
  };
}

export interface InsightsResponse {
  insights: Array<{
    id: string;
    severity: string;
    category: string;
    title: string;
    description: string;
    recommendation?: string;
    source: string;
    timestamp: string;
    isNew: boolean;
  }>;
  alerts: Array<{
    id: string;
    title: string;
    description: string;
    severity: string;
    timestamp: string;
  }>;
  summary: {
    total: number;
    critical: number;
    warning: number;
    positive: number;
    info: number;
    anomalyCount: number;
    riskScore: number;
  };
}

export interface AnomaliesResponse {
  anomalies: Array<{
    type: string;
    severity: string;
    title: string;
    detail: string;
    observedValue?: number;
    expectedValue?: number;
    deviation?: number;
  }>;
  riskScore: number;
  health: {
    overallScore: number;
    status: string;
    totalRecords: number;
    duplicatesDetected: number;
    missingValues: number;
    anomaliesDetected: number;
    dataConsistencyScore: number;
  };
}

export interface ForecastingResponse {
  revenueForecast: Array<{ date: string; actual?: number; predicted: number; lowerBound: number; upperBound: number }>;
  bookingForecast: Array<{ date: string; actual?: number; predicted: number; lowerBound: number; upperBound: number }>;
  cancellationForecast: Array<{ date: string; actual?: number; predicted: number; lowerBound: number; upperBound: number }>;
  destDemand: Array<{ destination: string; currentBookings: number; projectedBookings: number; change: number; confidence: number }>;
  summaries: Array<{ metric: string; nextMonthPrediction: number; confidence: number; trend: string; seasonalFactor: string }>;
  brief: string;
}

export interface CopilotResponse {
  response: string;
  meta: {
    source: string;
    model: string;
    dataSource: string;
    records: number;
    computedAt: string;
  };
}
