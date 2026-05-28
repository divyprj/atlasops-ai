# AtlasOps AI — Architecture

## System Overview

AtlasOps AI is an **Operational Intelligence Infrastructure** that transforms raw operational datasets into actionable analytics through deterministic computation.

**Core Differentiator:** Analytics are computed deterministically. AI is used only for interpretation — never for computation.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Data Ingestion Layer                  │
│  CSV Upload → Parser → Schema Intelligence → Normalizer │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Deterministic Analytics Layer               │
│                                                         │
│  ┌──────────┐ ┌──────────────┐ ┌───────────────────┐   │
│  │KPI Engine│ │Forecast Eng. │ │ Anomaly Detection │   │
│  │          │ │              │ │                   │   │
│  │Revenue   │ │Linear Regr.  │ │Z-Score Analysis   │   │
│  │Margins   │ │Seasonal Adj. │ │Statistical Bounds │   │
│  │Churn     │ │Confidence    │ │Pattern Detection  │   │
│  │Growth    │ │Intervals     │ │Severity Scoring   │   │
│  └──────────┘ └──────────────┘ └───────────────────┘   │
│                                                         │
│  ┌──────────────────┐ ┌─────────────────────────────┐   │
│  │  Insight Engine   │ │    Agent Analytics Engine    │   │
│  │                  │ │                             │   │
│  │Pattern Detection │ │Performance Scoring          │   │
│  │Sentiment Class.  │ │Percentile-Based Tiers       │   │
│  │Severity Rating   │ │Conversion Tracking          │   │
│  └──────────────────┘ └─────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Interpretation Layer (Optional)             │
│                                                         │
│  Groq LLM (llama-3.3-70b)                              │
│  - Natural language query interpretation                │
│  - Executive summary generation                        │
│  - Contextual explanations                             │
│  - Graceful degradation when unavailable               │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Executive Workspace                     │
│                                                         │
│  Command Center │ Revenue │ Transactions │ Forecasting  │
│  Insights │ Entities │ Data Quality │ Reports │ Copilot │
└─────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Deterministic Over Probabilistic
All KPIs, forecasts, and anomaly scores are computed using standard statistical methods (mean, std deviation, linear regression, z-scores). LLM is never used for computation.

### 2. Schema Intelligence
The schema mapper uses a weighted alias dictionary to automatically detect and map columns from any domain (travel, e-commerce, SaaS, logistics) to the internal `Booking` type.

### 3. Adaptive Scoring
Agent performance tiers are percentile-based (not hardcoded thresholds), ensuring meaningful tier distribution regardless of dataset size.

### 4. Health Score with Data Quality Floor
The operational health score includes a 20-point baseline for data quality — clean ingestion is rewarded, preventing punitive scores for well-structured small datasets.

### 5. Graceful LLM Degradation
When Groq API is unavailable, the Copilot falls back to statistical analytics. The UI explicitly shows "awaiting credentials" rather than hiding the degradation.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| State | React Context + IndexedDB |
| Charts | Recharts |
| Styling | CSS Variables + Tailwind |
| LLM | Groq (llama-3.3-70b) |
| Database | Supabase (optional) |
| Hosting | Vercel |

## Data Flow

1. **Upload** → CSV parsed by PapaParse
2. **Schema Detection** → Column aliases matched with confidence scores
3. **Normalization** → Raw data mapped to `Booking[]` type
4. **Persistence** → IndexedDB for session recovery
5. **Analytics** → 6 deterministic engines compute in parallel
6. **Rendering** → React components consume computed results
7. **Export** → CSV/JSON/TXT download via blob URLs
