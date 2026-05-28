// ============================================================
// AtlasOps AI — Runtime Health Endpoint
// GET /api/runtime/health
// Returns intelligence runtime state for UI indicators
// ============================================================

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export async function GET() {
  const start = Date.now();

  // No API key configured → deterministic mode
  if (!GROQ_API_KEY) {
    return NextResponse.json({
      groq: false,
      model: null,
      latency: null,
      mode: "deterministic",
      message: "Deterministic analytics operational",
    });
  }

  // Ping Groq with minimal request to verify connectivity
  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    const latency = Date.now() - start;

    if (response.ok) {
      return NextResponse.json({
        groq: true,
        model: GROQ_MODEL,
        latency,
        mode: "live",
        message: "Intelligence runtime active",
      });
    }

    // API returned error (bad key, rate limit, etc.)
    return NextResponse.json({
      groq: false,
      model: GROQ_MODEL,
      latency,
      mode: "degraded",
      message: "Intelligence runtime degraded",
    });
  } catch {
    const latency = Date.now() - start;
    return NextResponse.json({
      groq: false,
      model: GROQ_MODEL,
      latency,
      mode: "degraded",
      message: "Intelligence runtime unreachable",
    });
  }
}
