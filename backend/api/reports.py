"""Reports API endpoints."""

from fastapi import APIRouter
from data.generator import DataStore

router = APIRouter()


@router.get("/list")
async def list_reports():
    return [
        {"id": "RPT-001", "title": "Daily Operations Summary", "type": "daily", "status": "ready", "generated_at": "2025-05-27T08:00:00Z", "period": "May 26, 2025", "metrics": {"revenue": 485000, "bookings": 18}},
        {"id": "RPT-002", "title": "Weekly Performance Report", "type": "weekly", "status": "ready", "generated_at": "2025-05-26T00:00:00Z", "period": "May 19-25, 2025", "metrics": {"revenue": 3250000, "bookings": 118}},
        {"id": "RPT-003", "title": "Monthly Executive Summary", "type": "monthly", "status": "ready", "generated_at": "2025-05-01T00:00:00Z", "period": "April 2025", "metrics": {"revenue": 14200000, "bookings": 512}},
        {"id": "RPT-004", "title": "Q1 2025 Executive Report", "type": "executive", "status": "ready", "generated_at": "2025-04-01T00:00:00Z", "period": "Q1 2025", "metrics": {"revenue": 38500000, "bookings": 1380}},
    ]


@router.get("/generate/{report_type}")
async def generate_report(report_type: str):
    df = DataStore.bookings
    return {
        "type": report_type,
        "status": "ready",
        "metrics": {
            "total_revenue": int(df["amount"].sum()),
            "total_bookings": len(df),
            "cancellations": len(df[df["status"] == "cancelled"]),
            "avg_order_value": int(df["amount"].mean()),
        },
        "summary": f"Generated {report_type} report with {len(df)} booking records.",
    }
