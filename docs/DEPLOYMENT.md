# AtlasOps AI — Deployment Guide

## Prerequisites

- Node.js 18+ ([nodejs.org](https://nodejs.org))
- npm 9+
- Git

## Quick Start

```bash
# Clone
git clone https://github.com/divyprj/atlasops-ai.git
cd atlasops-ai

# Install (Windows)
install.bat

# Or manual install
npm install

# Start development server
start.bat
# Or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Optional | Groq API key for LLM-powered Copilot |
| `NEXT_PUBLIC_GROQ_CONFIGURED` | Optional | Set to `"true"` when Groq key is active |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase anonymous key |

**Note:** The platform is fully functional without any API keys. All 6 deterministic analytics engines work offline. Only the Copilot's LLM interpretation requires Groq.

## Vercel Deployment

### Automatic (Recommended)

1. Push to GitHub
2. Import in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables in Vercel Settings → Environment Variables
4. Deploy

### Manual

```bash
npm i -g vercel
vercel
```

### Environment Variables on Vercel

Add these in **Settings → Environment Variables**:

- `GROQ_API_KEY` → Your Groq API key
- `NEXT_PUBLIC_GROQ_CONFIGURED` → `true`

## Build Verification

```bash
# TypeScript validation (must return 0 errors)
npx tsc --noEmit

# ESLint (must return 0 errors/warnings)
npx eslint src/ --max-warnings 0

# Production build
npm run build

# Run tests
npm run test
```

## Project Structure

```
atlasops-ai/
├── datasets/          # Demo operational datasets
├── testing/           # Stress-test datasets (malformed, nulls, etc.)
├── docs/              # Architecture & deployment docs
├── src/
│   ├── app/           # Next.js pages (App Router)
│   ├── components/    # React components
│   ├── context/       # WorkspaceProvider (IndexedDB state)
│   ├── data/          # Static demo data
│   ├── lib/           # Analytics engines
│   │   ├── analytics.ts       # Core computations
│   │   ├── kpi-engine.ts      # KPI scorecard
│   │   ├── forecast-engine.ts # Linear regression forecasting
│   │   ├── anomaly-engine.ts  # Z-score anomaly detection
│   │   ├── insight-engine.ts  # Pattern-driven insights
│   │   ├── schema-mapper.ts   # Schema intelligence
│   │   └── exports.ts         # CSV/JSON/TXT export
│   └── types/         # TypeScript types
├── install.bat        # Windows setup script
├── start.bat          # Windows dev server launcher
└── uninstall.bat      # Cleanup script
```

## Cleanup

```bash
# Windows
uninstall.bat

# Manual
rm -rf node_modules .next tsconfig.tsbuildinfo
```
