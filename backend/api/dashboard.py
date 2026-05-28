"""Dashboard API endpoints."""

from fastapi import APIRouter
from data.generator import DataStore

router = APIRouter()


@router.get("/kpis")
async def get_kpis():
    df = DataStore.bookings
    total_revenue = int(df["amount"].sum())
    total_bookings = len(df)
    cancelled = len(df[df["status"] == "cancelled"])
    cancel_rate = round((cancelled / total_bookings) * 100, 1)
    avg_order = int(df["amount"].mean())
    
    return {
        "total_revenue": total_revenue,
        "total_bookings": total_bookings,
        "cancellation_rate": cancel_rate,
        "avg_order_value": avg_order,
        "active_agents": len(DataStore.agents_df),
        "monthly_growth": 18.4,
        "health_score": DataStore.health_data["overall_score"],
        "retention_rate": 24.6,
    }


@router.get("/charts")
async def get_charts():
    return {
        "monthly_revenue": DataStore.monthly_revenue,
        "revenue_by_region": DataStore.revenue_by_region,
        "revenue_by_destination": DataStore.revenue_by_destination,
    }


@router.get("/alerts")
async def get_alerts():
    return [i for i in DataStore.insights if i["severity"] in ("critical", "warning")]


@router.get("/activity")
async def get_activity():
    return [
        {"id": "act-1", "type": "booking", "title": "New booking confirmed", "description": "Dubai package for 4 pax — ₹3.4L", "actor": "Rahul Sharma", "timestamp": "2025-05-27T12:30:00Z"},
        {"id": "act-2", "type": "cancellation", "title": "Booking cancelled", "description": "BKG-2341 — Manali trip cancelled by customer", "actor": "System", "timestamp": "2025-05-27T11:45:00Z"},
        {"id": "act-3", "type": "agent", "title": "Agent milestone", "description": "Sneha Reddy reached 200 lifetime bookings", "actor": None, "timestamp": "2025-05-27T10:00:00Z"},
        {"id": "act-4", "type": "alert", "title": "Health alert triggered", "description": "Database health score dropped below 92%", "actor": "System", "timestamp": "2025-05-27T06:15:00Z"},
    ]
