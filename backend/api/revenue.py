"""Revenue API endpoints."""

from fastapi import APIRouter
from data.generator import DataStore

router = APIRouter()


@router.get("/summary")
async def revenue_summary():
    df = DataStore.bookings
    total = int(df["amount"].sum())
    profit = int(total * 0.213)
    return {
        "total_revenue": total,
        "total_profit": profit,
        "profit_margin": 21.3,
        "avg_order_value": int(df["amount"].mean()),
        "revenue_growth": 18.4,
    }


@router.get("/trends")
async def revenue_trends():
    return DataStore.monthly_revenue


@router.get("/by-region")
async def revenue_by_region():
    return DataStore.revenue_by_region


@router.get("/by-destination")
async def revenue_by_destination():
    return DataStore.revenue_by_destination
