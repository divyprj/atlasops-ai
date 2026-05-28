"""Agents API endpoints."""

from fastapi import APIRouter, HTTPException
from data.generator import DataStore

router = APIRouter()


@router.get("/leaderboard")
async def agent_leaderboard():
    df = DataStore.agents_df.sort_values("performance_score", ascending=False)
    return df.to_dict(orient="records")


@router.get("/summary")
async def agent_summary():
    df = DataStore.agents_df
    top = df.loc[df["performance_score"].idxmax()]
    return {
        "active_agents": len(df),
        "avg_conversion_rate": round(df["conversion_rate"].mean(), 1),
        "total_agent_revenue": int(df["total_revenue"].sum()),
        "elite_count": len(df[df["tier"] == "elite"]),
        "needs_improvement_count": len(df[df["tier"] == "needs_improvement"]),
        "avg_response_time": int(df["avg_response_time"].mean()),
        "top_performer": {
            "name": top["name"],
            "region": top["region"],
            "performance_score": int(top["performance_score"]),
            "total_revenue": int(top["total_revenue"]),
            "conversion_rate": float(top["conversion_rate"]),
        },
    }


@router.get("/{agent_id}")
async def agent_detail(agent_id: str):
    df = DataStore.agents_df
    agent = df[df["id"] == agent_id]
    if agent.empty:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent.iloc[0].to_dict()
