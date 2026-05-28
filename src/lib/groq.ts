// ============================================================
// AtlasOps AI — Groq Client
// AI interpretation layer (NOT generation)
// ============================================================

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export function isGroqConfigured(): boolean {
  return !!GROQ_API_KEY;
}

const SYSTEM_PROMPT = `You are an operations intelligence analyst for AtlasOps, a travel operations company. You analyze operational data and provide concise, analytical insights.

RULES:
- Use Bloomberg terminal / Datadog incident style communication
- Be concise, analytical, data-driven
- Use bullet points and structured formatting
- Include specific numbers from the provided context
- Never use emojis, exclamation marks, or conversational filler
- Never say "I think" or "I believe" — state facts from the data
- Never apologize or use pleasantries
- Format currency in Indian Rupees (₹) using Lakhs (L) and Crores (Cr)
- When referencing percentages, always include direction (up/down/flat)
- If asked something outside the operational data context, redirect to available analytics
- Keep responses under 200 words`;

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function queryGroq(
  messages: GroqMessage[],
  context: string,
): Promise<string> {
  if (!isGroqConfigured()) {
    return "Groq API not configured. Set GROQ_API_KEY environment variable.";
  }

  const fullMessages: GroqMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: `CURRENT OPERATIONAL CONTEXT:\n${context}` },
    ...messages,
  ];

  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: fullMessages,
        temperature: 0.3,
        max_tokens: 512,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Groq API Error]", response.status, errorText);
      return `Intelligence service unavailable (${response.status}). Operational data accessible via direct queries.`;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No response generated.";
  } catch (error) {
    console.error("[Groq Client Error]", error);
    return "Intelligence service connection failed. Try again or query operational data directly.";
  }
}
