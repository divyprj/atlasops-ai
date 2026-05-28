"""AI Copilot API endpoint."""

from fastapi import APIRouter
from pydantic import BaseModel
from data.generator import DataStore
import os
import httpx

router = APIRouter()


class CopilotRequest(BaseModel):
    message: str
    history: list[dict[str, str]] = []


class CopilotResponse(BaseModel):
    response: str
    sources: list[str] = []


KEYWORD_RESPONSES = {
    "revenue": "Current total revenue is ₹{revenue} across {bookings} bookings. Monthly growth rate: 18.4%. Top performing destination: Dubai with ₹1.28Cr. Profit margin: 21.3%.",
    "agent": "Team has {agents} active agents. Top performer: {top_agent} with score {top_score}/100. 2 agents flagged for improvement. Average conversion rate: {avg_conv}%.",
    "booking": "Total bookings: {bookings}. Cancellation rate: {cancel_rate}%. Average booking value: ₹{avg_value}. International segment growing at 28.6%.",
    "cancel": "Cancellation rate: {cancel_rate}%. Trending down 2.1% vs last month. Primary drivers: weather uncertainty (42%), price sensitivity (28%). Highest risk destinations: Kashmir, Manali.",
    "health": "Database health score: {health_score}%. Status: Warning. Issues: {duplicates} duplicates, {missing} missing values, {anomalies} anomalies detected. Data consistency: 96.2%.",
    "forecast": "Next month predictions — Revenue: ₹48L (85% confidence), Bookings: 175 (82% confidence). Seasonal dip expected due to monsoon. Dubai demand surging +29.4%.",
}


def get_rule_based_response(message: str) -> tuple[str, list[str]]:
    """Generate response based on keyword matching."""
    msg = message.lower()
    df = DataStore.bookings
    agents_df = DataStore.agents_df
    
    total_revenue = f"₹{int(df['amount'].sum()) / 10000000:.1f}Cr"
    total_bookings = len(df)
    cancel_rate = round(len(df[df["status"] == "cancelled"]) / total_bookings * 100, 1)
    avg_value = f"{int(df['amount'].mean()) / 1000:.1f}K"
    
    top_agent = agents_df.loc[agents_df["performance_score"].idxmax()]
    health = DataStore.health_data
    
    context = {
        "revenue": total_revenue,
        "bookings": total_bookings,
        "agents": len(agents_df),
        "cancel_rate": cancel_rate,
        "avg_value": avg_value,
        "top_agent": top_agent["name"],
        "top_score": int(top_agent["performance_score"]),
        "avg_conv": round(agents_df["conversion_rate"].mean(), 1),
        "health_score": health["overall_score"],
        "duplicates": health["duplicates_detected"],
        "missing": health["missing_values"],
        "anomalies": health["anomalies_detected"],
    }
    
    sources = []
    for keyword, template in KEYWORD_RESPONSES.items():
        if keyword in msg:
            sources.append(f"{keyword}_engine")
            return template.format(**context), sources
    
    return f"I can help analyze your operations data. We have {total_bookings} bookings with {total_revenue} in revenue across {len(agents_df)} agents. Ask me about revenue, bookings, agents, cancellations, health, or forecasts.", ["general"]


@router.post("/chat", response_model=CopilotResponse)
async def chat(request: CopilotRequest):
    groq_key = os.getenv("GROQ_API_KEY")
    
    if groq_key:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"},
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": [
                            {"role": "system", "content": "You are AtlasOps AI Copilot, an operations intelligence assistant for an Indian travel startup. Use data context to answer questions about revenue, bookings, agents, and operations."},
                            *request.history[-10:],
                            {"role": "user", "content": request.message},
                        ],
                        "max_tokens": 500,
                    },
                    timeout=15.0,
                )
                data = resp.json()
                return CopilotResponse(
                    response=data["choices"][0]["message"]["content"],
                    sources=["groq_llm"],
                )
        except Exception:
            pass
    
    response, sources = get_rule_based_response(request.message)
    return CopilotResponse(response=response, sources=sources)
