# AtlasOps AI

Operational intelligence platform with deterministic analytics, anomaly detection, forecasting, and AI-assisted executive interpretation.

## Architecture

AtlasOps AI separates **deterministic computation** from **LLM interpretation**.

All KPIs, anomaly detection, forecasting, and scoring run as reproducible statistical engines. LLMs are scoped strictly to executive commentary, operational summaries, and natural language interaction.

```
Dataset Ingestion
→ Schema Detection        (column mapping, type inference, confidence scoring)
→ KPI Computation         (revenue, margin, AOV, growth, churn)
→ Anomaly Detection       (z-score statistical outlier analysis)
→ Forecast Engine         (linear regression + seasonal decomposition)
→ Intelligence Synthesis  (pattern detection, severity classification)
→ Executive Reporting     (Groq-powered interpretation layer)
```

### Why This Matters

Most AI dashboard projects route everything through an LLM. AtlasOps treats the LLM as an interpretation layer — not the computation engine. KPIs don't hallucinate. Forecasts are statistically reproducible. The LLM explains findings, it doesn't generate them.

## Modules

| Module | Purpose |
|---|---|
| **Command Center** | Executive KPI scorecard with pipeline readiness |
| **Revenue Intelligence** | Revenue trends, segment analysis, regional distribution |
| **Transaction Analytics** | Volume analysis, status distribution, source attribution |
| **Entity Performance** | Composite scoring, ranking, deviation detection |
| **Forecasting** | 6-month forward projections with confidence intervals |
| **Operational Insights** | Automated anomaly and trend detection feed |
| **Data Quality** | Field integrity matrix, null distribution, coverage analysis |
| **Reports** | Auto-generated operational intelligence briefs (PDF export) |
| **Operations Copilot** | Natural language queries against operational context |
| **Workspace Monitor** | Engine orchestration, runtime diagnostics |
| **Intake Center** | Schema-intelligent data onboarding with validation |

## Ingestion Pipeline

The Intake Center provides real-time diagnostics during upload:

- **Schema Detection** — auto-maps columns to operational fields with confidence scoring
- **Null Distribution** — per-field fill rate analysis
- **Field Classification** — metric, temporal, dimension, entity categorization
- **Type Inference** — number, date, enum, string detection with sample validation
- **Data Preview** — first 5 rows with truncation handling

Supported formats: CSV, XLSX (structured analytics), PDF (executive reports via Copilot/Reports only).

## Tech Stack

- **Framework** — Next.js 16 (App Router, Turbopack)
- **Language** — TypeScript (strict mode)
- **Styling** — Tailwind CSS 4
- **Charts** — Recharts
- **Persistence** — IndexedDB (idb-keyval) — client-side, no server storage required
- **AI** — Groq API (llama-3.3-70b-versatile) — interpretation layer only
- **File Parsing** — PapaParse (CSV), SheetJS (XLSX)
- **Deployment** — Vercel-ready

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```bash
cp .env.example .env.local
```

| Variable | Required | Purpose |
|---|---|---|
| `GROQ_API_KEY` | Optional | Enables executive commentary and Copilot queries |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Persistent workspace storage |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase client auth |

> The platform operates fully without external APIs. Deterministic analytics (KPIs, forecasting, anomaly detection) run entirely client-side. Groq adds executive interpretation when configured.

## Design Decisions

**Client-side analytics** — All computation runs in-browser via IndexedDB. No server-side data storage. Privacy-friendly, fast, no infrastructure overhead.

**PDF restriction** — PDF support is limited to Copilot and Reports. Operational engines (Revenue, Transactions, Forecasting, etc.) require structured datasets (CSV/XLSX).

**Graceful LLM failure** — If Groq is unavailable, the UI degrades gracefully: statistical analytics remain fully operational, executive commentary shows a fallback message.

**Runtime visibility** — The header, sidebar, and workspace monitor expose engine state, schema confidence, and model availability. No fake "AI Active" indicators.

## Build

```bash
npm run build     # Production build
npm run lint      # ESLint
npx tsc --noEmit  # TypeScript validation
```

## License

MIT
