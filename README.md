<p align="center">
  <strong>AtlasOps AI</strong><br>
  <em>Operational Intelligence Infrastructure</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tests-88%20passing-5BAD6E?style=flat-square" alt="Tests">
  <img src="https://img.shields.io/badge/Lint-0%20errors-5BAD6E?style=flat-square" alt="Lint">
  <img src="https://img.shields.io/badge/Engines-6%20deterministic-4A90E2?style=flat-square" alt="Engines">
  <img src="https://img.shields.io/badge/Deployment-Vercel-black?style=flat-square" alt="Vercel">
</p>

---

## What is AtlasOps AI?

AtlasOps AI is an **enterprise operational intelligence platform** that transforms raw operational datasets into actionable analytics through deterministic computation.

Upload any CSV — e-commerce orders, SaaS metrics, travel bookings, logistics shipments — and the platform automatically detects the schema, maps columns, and computes KPIs, forecasts, anomalies, and insights in real time.

### Core Differentiator

> Most AI dashboard projects route everything through an LLM. AtlasOps treats the LLM as an **interpretation layer** — not the computation engine. KPIs don't hallucinate. Forecasts are statistically reproducible. The LLM explains findings — it doesn't generate them.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    DATA INGESTION LAYER                  │
│  CSV/XLSX Upload → PapaParse → Schema Intelligence      │
│  → Column Mapping → Type Inference → Confidence Score   │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│           DETERMINISTIC ANALYTICS LAYER (6 Engines)     │
│                                                         │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐ │
│  │  KPI Engine   │  │ Forecast Eng. │  │  Anomaly     │ │
│  │              │  │               │  │  Detection   │ │
│  │ Revenue      │  │ Linear Regr.  │  │ Z-Score      │ │
│  │ Margins      │  │ Seasonal Adj. │  │ Statistical  │ │
│  │ Growth Rate  │  │ Confidence    │  │ Pattern      │ │
│  │ Churn        │  │ Intervals     │  │ Scoring      │ │
│  └──────────────┘  └───────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐ │
│  │ Insight Eng.  │  │ Agent Analyt. │  │  Schema      │ │
│  │              │  │               │  │  Mapper      │ │
│  │ Pattern Det. │  │ Performance   │  │ Alias Dict.  │ │
│  │ Severity     │  │ Percentile    │  │ Type Infer.  │ │
│  │ Rating       │  │ Tiers         │  │ Confidence   │ │
│  └──────────────┘  └───────────────┘  └──────────────┘ │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│           INTERPRETATION LAYER (Optional LLM)           │
│                                                         │
│  Groq API (llama-3.3-70b-versatile)                     │
│  • Natural language query interpretation                │
│  • Executive summary generation                        │
│  • Contextual explanations                             │
│  • Graceful degradation when unavailable               │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              EXECUTIVE WORKSPACE (11 Modules)           │
│                                                         │
│  Command Center │ Revenue │ Transactions │ Forecasting  │
│  Insights │ Entities │ Data Quality │ Reports │ Copilot │
│  Intake Center │ Workspace Monitor                      │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Upload** → CSV/XLSX parsed by PapaParse/SheetJS
2. **Schema Detection** → Column aliases matched with confidence scores
3. **Normalization** → Raw data mapped to internal `Booking[]` type
4. **Persistence** → IndexedDB for session recovery (no server storage)
5. **Analytics** → 6 deterministic engines compute in parallel
6. **Rendering** → React components consume computed results
7. **Export** → CSV / JSON / TXT / PDF download via blob URLs

---

## Modules

| Module | Route | Purpose |
|---|---|---|
| **Command Center** | `/` | Executive KPI scorecard, pipeline readiness, operational state |
| **Revenue Intelligence** | `/revenue` | Revenue trends, segment analysis, regional distribution, growth |
| **Transaction Analytics** | `/bookings` | Volume analysis, status distribution, source attribution |
| **Entity Performance** | `/agents` | Composite scoring, ranking, deviation detection, sortable table |
| **Forecasting** | `/forecasting` | 6-month forward projections with confidence intervals |
| **Operational Insights** | `/insights` | Automated anomaly and trend detection feed, severity classification |
| **Data Quality** | `/health` | Field integrity matrix, null distribution, coverage analysis |
| **Reports** | `/reports` | Auto-generated operational intelligence briefs, PDF export |
| **Operations Copilot** | `/copilot` | Natural language queries against operational context |
| **Workspace Monitor** | `/admin` | Engine orchestration, runtime diagnostics, data quality scores |
| **Intake Center** | `/intake` | Schema-intelligent data onboarding with validation |

---

## Analytics Engines

### 1. KPI Engine (`kpi-engine.ts`)
Computes operational scorecard with 7 metrics: revenue, booking volume, cancellation rate, average order value, profit margin, customer retention, growth rate. Each KPI includes current value, previous period, change percentage, trend direction, and status classification.

### 2. Forecast Engine (`forecast-engine.ts`)
Linear regression with seasonal decomposition. Produces 6-month forward projections with upper/lower confidence intervals. Classifies trend strength and detects seasonality patterns. Handles revenue and booking volume forecasts independently.

### 3. Anomaly Engine (`anomaly-engine.ts`)
Z-score based statistical outlier detection across multiple dimensions: revenue spikes, cancellation anomalies, booking volume deviations, and profit margin shifts. Outputs severity-classified alerts (critical / warning / info) sorted by impact.

### 4. Insight Engine (`insight-engine.ts`)
Pattern-driven operational insight generation. Analyzes profit margins, customer concentration, entity performance distribution, cancellation trends, and growth trajectories. Produces actionable intelligence with severity levels and categories.

### 5. Agent Analytics Engine (`analytics.ts`)
Percentile-based performance scoring for entities. Computes composite scores from revenue, volume, and cancellation metrics. Adaptive tier classification (Top Performer / Above Average / Average / Below Average) that scales with dataset size.

### 6. Schema Mapper (`schema-mapper.ts`)
Weighted alias dictionary for automatic column detection across domains. Maps arbitrary CSV headers to the internal `Booking` type with confidence scoring. Supports e-commerce, SaaS, travel, and logistics terminologies out of the box.

---

## Ingestion Pipeline

The Intake Center provides real-time diagnostics during upload:

| Feature | Description |
|---|---|
| **Schema Detection** | Auto-maps columns to operational fields with confidence scoring |
| **Null Distribution** | Per-field fill rate analysis |
| **Field Classification** | Metric, temporal, dimension, entity categorization |
| **Type Inference** | Number, date, enum, string detection with sample validation |
| **Data Preview** | First 5 rows with truncation handling |
| **Unmapped Columns** | Highlights columns that couldn't be automatically mapped |
| **Validation Summary** | Overall schema confidence percentage |

**Supported formats:** CSV, XLSX (structured analytics)

**Schema adaptability examples:**

| Input Header | Maps To | Domain |
|---|---|---|
| `order_id`, `booking_id`, `shipment_id` | `id` | All |
| `customer_name`, `sender_name` | `customerName` | All |
| `mrr`, `amount`, `total`, `contract_value` | `amount` | SaaS, E-commerce |
| `order_date`, `booking_date`, `ship_date` | `bookingDate` | All |
| `status`, `order_status`, `tracking_status` | `status` | All |
| `destination`, `receiver_city` | `destination` | Travel, Logistics |

---

## Runtime Intelligence System

The platform exposes infrastructure-grade runtime visibility:

| Location | Live State | Deterministic State | Degraded State |
|---|---|---|---|
| **Header Strip** | `● Groq · 412ms` | `● Deterministic` | `● Runtime degraded` |
| **Sidebar Footer** | `● Groq · llama-3.3-70b` | `● LLM standby` | `● Groq · degraded` |
| **Copilot Terminal** | `LIVE · Groq Runtime` | `DETERMINISTIC` | `DEGRADED` |

**Health Endpoint:** `GET /api/runtime/health`

```json
{
  "groq": true,
  "model": "llama-3.3-70b-versatile",
  "latency": 412,
  "mode": "live",
  "message": "Intelligence runtime active"
}
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Framework** | Next.js (App Router) | 16.2.6 |
| **Language** | TypeScript (strict) | 5.x |
| **Runtime** | React | 19.2.4 |
| **Styling** | Tailwind CSS | 4.x |
| **Charts** | Recharts | 3.8.1 |
| **State** | React Context + IndexedDB (idb-keyval) | 6.2.4 |
| **File Parsing** | PapaParse (CSV), SheetJS (XLSX) | 5.5.3, 0.18.5 |
| **PDF Generation** | jsPDF | 4.2.1 |
| **AI / LLM** | Groq API (llama-3.3-70b-versatile) | — |
| **Database** | Supabase (optional) | 2.106.2 |
| **Animations** | Framer Motion | 12.40.0 |
| **Icons** | Lucide React | 1.16.0 |
| **Testing** | Vitest | 4.1.7 |
| **Linting** | ESLint + eslint-config-next | 9.x |
| **Deployment** | Vercel | — |

---

## Getting Started

### Prerequisites

- **Node.js** 18.0 or higher ([nodejs.org](https://nodejs.org))
- **npm** 9.0 or higher
- **Git** (for cloning)

### Installation

```bash
# Clone the repository
git clone https://github.com/divyprj/atlasops-ai.git
cd atlasops-ai

# Windows (recommended)
install.bat      # Checks Node.js, installs deps, validates TypeScript

# Manual
npm install
```

### Configuration

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Optional | Groq API key for LLM-powered Copilot and executive summaries |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase project URL for persistent workspace storage |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase anonymous key for client authentication |

> **Note:** The platform is fully functional without any API keys. All 6 deterministic analytics engines work offline. Only the Copilot's LLM interpretation requires Groq.

### Running

```bash
# Windows
start.bat        # Launches dev server with runtime diagnostics

# Manual
npm run dev      # Start development server on http://localhost:3000
```

### Usage

1. Open [http://localhost:3000](http://localhost:3000)
2. Navigate to **Intake Center** (`/intake`)
3. Upload any CSV file (try one from `/datasets`)
4. Schema Intelligence auto-detects and maps columns
5. Click **Initialize Analytics** to process
6. Explore all 11 modules with live data

---

## Demo Datasets

Pre-built operational datasets in `/datasets`:

| Dataset | Domain | Rows | Columns | Key Features |
|---|---|---|---|---|
| `ecommerce_orders.csv` | E-Commerce | 120 | 18 | Multi-category, returns, payment methods, shipping regions |
| `saas_metrics.csv` | SaaS | 60 | 17 | MRR/ARR, churn, plan tiers, seat counts, usage metrics |
| `travel_operations.csv` | Travel | 100 | 17 | Bookings, destinations, agents, pax, operational margins |
| `logistics_operations.csv` | Logistics | 110 | 18 | Shipments, delays, carriers, warehouses, priority levels |

### Stress-Test Datasets (`/testing`)

| File | Purpose |
|---|---|
| `malformed_csv.csv` | Broken CSV structure — extra commas, unmatched quotes, empty rows |
| `null_heavy.csv` | 50%+ null values — tests data quality engine |
| `duplicate_rows.csv` | Exact duplicates — tests entity counting |
| `schema_mismatch.csv` | Unrecognizable columns — tests schema mapper graceful degradation |
| `malformed_dates.csv` | Inconsistent date formats — tests date parser resilience |
| `extreme_outliers.csv` | Extreme / negative amounts — tests anomaly detection boundaries |

---

## Design System

| Token | Value | Usage |
|---|---|---|
| Deep Graphite | `#1A1D21` | Background, canvas |
| Midnight Blue | `#121E3A` | Sidebar, elevated surfaces |
| Operational Blue | `#4A90E2` | Primary, interactive elements |
| Soft Silver | `#B8BDC7` | Muted text, secondary content |
| Off White | `#F5F7FA` | Foreground text |
| Critical | `#C74B4B` | Error states, critical alerts |
| Warning | `#D4A843` | Warning states, amber alerts |
| Positive | `#5BAD6E` | Success states, healthy metrics |

**Typography:** Inter (UI) + IBM Plex Mono (runtime values, schemas, console)

---

## API Routes

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/dashboard` | POST | Dashboard KPI computation |
| `/api/analytics/revenue` | POST | Revenue analytics |
| `/api/analytics/bookings` | POST | Booking analytics |
| `/api/agents` | POST | Entity performance analytics |
| `/api/forecasting` | POST | Forecast generation |
| `/api/anomalies` | POST | Anomaly detection |
| `/api/insights` | POST | Insight generation |
| `/api/copilot` | POST | LLM-powered natural language queries |
| `/api/exports/[type]` | POST | Data export (CSV / JSON / TXT) |
| `/api/runtime/health` | GET | Runtime intelligence health check |

---

## Build & Test

```bash
# Production build (14 static + 8 dynamic routes)
npm run build

# Test suite (88 tests, ~700ms)
npm run test

# ESLint (0 errors, 0 warnings)
npm run lint

# TypeScript validation (0 errors)
npx tsc --noEmit
```

### Test Coverage

| Section | Tests | Coverage |
|---|---|---|
| Statistical Utilities | 16 | sum, mean, median, stdDev, percentile, zScore, growthRate, rollingAverage |
| Data Grouping | 2 | groupBy with empty/populated arrays |
| Anomaly Detection | 5 | Outlier detection, thresholds, bimodal distributions, empty sets |
| Schema Mapper | 10 | Header mapping, unknown columns, type detection, duplicates, empty rows |
| Booking Analytics | 7 | Revenue, margins, repeat customers, empty datasets, cancellation rates |
| Monthly Trends | 3 | Grouping, sorting, date format weaknesses |
| KPI Engine | 4 | Scorecard structure, small/empty datasets, KPI field validation |
| Forecast Engine | 6 | Horizon length, positive values, confidence intervals, minimal data |
| Anomaly Engine | 5 | Structured output, severity sorting, empty data, risk scores |
| Insight Engine | 3 | Insight generation, severity levels, guaranteed insights |
| Integration | 2 | End-to-end pipeline, 10K record stress test (<2s) |
| Edge Cases | 6 | All cancelled, identical amounts, single booking, zero/negative values |
| Destination & Agent | 2 | Grouping, per-entity metrics |
| Period Comparison | 2 | Change computation, empty previous period |

---

## Design Decisions

### Client-Side Analytics
All computation runs in-browser via IndexedDB. No server-side data storage. Privacy-friendly, fast, no infrastructure overhead. Data never leaves the user's browser.

### Deterministic Over Probabilistic
All KPIs, forecasts, and anomaly scores use standard statistical methods (mean, std deviation, linear regression, z-scores). LLM is never used for computation — only interpretation.

### Graceful LLM Degradation
When Groq API is unavailable, statistical analytics remain fully operational. The UI explicitly shows "Deterministic Mode" rather than hiding the degradation. This is architecturally intentional.

### Schema Intelligence
The schema mapper uses a weighted alias dictionary to automatically detect and map columns from any domain to the internal type. No manual configuration required. Supports 50+ column name aliases.

### Adaptive Scoring
Entity performance tiers are percentile-based (not hardcoded thresholds), ensuring meaningful tier distribution regardless of dataset size.

### Runtime Visibility
The header, sidebar, and workspace monitor expose actual engine state, schema confidence, and model availability. No fake "AI Active" indicators — only real infrastructure telemetry.

---

## Project Structure

```
atlasops-ai/
│
├── datasets/                  # Demo operational datasets
│   ├── ecommerce_orders.csv   # 120 rows, e-commerce domain
│   ├── saas_metrics.csv       # 60 rows, SaaS domain
│   ├── travel_operations.csv  # 100 rows, travel domain
│   ├── logistics_operations.csv # 110 rows, logistics domain
│   └── README.md
│
├── testing/                   # Stress-test datasets
│   ├── malformed_csv.csv
│   ├── null_heavy.csv
│   ├── duplicate_rows.csv
│   ├── schema_mismatch.csv
│   ├── malformed_dates.csv
│   ├── extreme_outliers.csv
│   └── README.md
│
├── docs/                      # Architecture & deployment docs
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
│
├── src/
│   ├── __tests__/             # Vitest test suite
│   │   └── engines.test.ts    # 88 tests across all engines
│   │
│   ├── app/                   # Next.js App Router pages
│   │   ├── page.tsx           # Command Center (/)
│   │   ├── layout.tsx         # Root layout + providers
│   │   ├── globals.css        # Design system tokens
│   │   ├── revenue/           # Revenue Intelligence
│   │   ├── bookings/          # Transaction Analytics
│   │   ├── agents/            # Entity Performance
│   │   ├── forecasting/       # Forecasting
│   │   ├── insights/          # Operational Insights
│   │   ├── health/            # Data Quality
│   │   ├── reports/           # Reports
│   │   ├── copilot/           # Operations Copilot
│   │   ├── admin/             # Workspace Monitor
│   │   ├── intake/            # Intake Center
│   │   └── api/               # API routes (10 endpoints)
│   │       ├── dashboard/
│   │       ├── analytics/
│   │       ├── agents/
│   │       ├── forecasting/
│   │       ├── anomalies/
│   │       ├── insights/
│   │       ├── copilot/
│   │       ├── exports/
│   │       └── runtime/health/
│   │
│   ├── components/            # React components
│   │   ├── layout/
│   │   │   ├── sidebar.tsx    # Navigation + workspace status
│   │   │   └── header.tsx     # Breadcrumb + runtime indicators
│   │   ├── dashboard/
│   │   │   └── kpi-card.tsx   # KPI metric display
│   │   ├── ui/
│   │   │   └── tooltip.tsx    # Tooltip component
│   │   ├── workspace-actions.tsx  # Export actions
│   │   └── workspace-context.tsx  # (legacy)
│   │
│   ├── context/
│   │   └── workspace-context.tsx  # WorkspaceProvider (IndexedDB)
│   │
│   ├── hooks/
│   │   └── use-runtime-health.ts  # Runtime health polling
│   │
│   ├── lib/                   # Core analytics engines
│   │   ├── analytics.ts       # Core computations + utilities
│   │   ├── kpi-engine.ts      # Operational KPI scorecard
│   │   ├── forecast-engine.ts # Linear regression forecasting
│   │   ├── anomaly-engine.ts  # Z-score anomaly detection
│   │   ├── insight-engine.ts  # Pattern-driven insights
│   │   ├── schema-mapper.ts   # Schema intelligence
│   │   ├── groq.ts            # Groq API client
│   │   ├── exports.ts         # CSV/JSON/TXT export
│   │   ├── file-parser.ts     # CSV/XLSX parsing
│   │   ├── data-service.ts    # Data access layer
│   │   ├── supabase.ts        # Supabase client
│   │   ├── workspace.ts       # Workspace utilities
│   │   ├── utils.ts           # General utilities
│   │   └── api-client.ts      # API client
│   │
│   ├── data/                  # Static/demo data generators
│   │   ├── agents.ts
│   │   ├── bookings.ts
│   │   ├── destinations.ts
│   │   ├── forecasting.ts
│   │   ├── health.ts
│   │   ├── insights.ts
│   │   └── revenue.ts
│   │
│   └── types/                 # TypeScript types
│       ├── index.ts           # Core types (Booking, etc.)
│       └── database.ts        # Database types
│
├── install.bat                # Windows setup script
├── start.bat                  # Windows dev server launcher
├── uninstall.bat              # Windows cleanup script
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
└── postcss.config.mjs
```

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in [Vercel Dashboard](https://vercel.com/new)
3. Add `GROQ_API_KEY` in Settings → Environment Variables
4. Deploy

### Manual

```bash
npm run build
npm run start
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

---

## Cleanup

```bash
# Windows
uninstall.bat

# Manual
rm -rf node_modules .next tsconfig.tsbuildinfo
```

---

## License

MIT

---

<p align="center">
  <strong>AtlasOps AI</strong> — Operational Intelligence Infrastructure<br>
  <em>Deterministic analytics. Schema intelligence. Enterprise-grade.</em>
</p>
