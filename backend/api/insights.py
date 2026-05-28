"""Insights API endpoints."""

from fastapi import APIRouter
from data.generator import DataStore

router = APIRouter()


@router.get("/feed")
async def insights_feed():
    return DataStore.insights


@router.get("/summary")
async def insights_summary():
    insights = DataStore.insights
    return {
        "total": len(insights),
        "critical": sum(1 for i in insights if i["severity"] == "critical"),
        "warning": sum(1 for i in insights if i["severity"] == "warning"),
        "positive": sum(1 for i in insights if i["severity"] == "positive"),
        "info": sum(1 for i in insights if i["severity"] == "info"),
        "new_insights": sum(1 for i in insights if i.get("is_new")),
    }
