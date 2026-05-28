"""Health API endpoints."""

from fastapi import APIRouter
from data.generator import DataStore

router = APIRouter()


@router.get("/status")
async def health_status():
    return DataStore.health_data


@router.get("/anomalies")
async def health_anomalies():
    return DataStore.anomalies


@router.get("/history")
async def health_history():
    return [
        {"date": "May 1", "score": 94.2},
        {"date": "May 5", "score": 93.8},
        {"date": "May 10", "score": 93.5},
        {"date": "May 15", "score": 93.1},
        {"date": "May 20", "score": 92.4},
        {"date": "May 25", "score": 91.8},
        {"date": "May 27", "score": 91.8},
    ]


@router.get("/tables")
async def table_health():
    return [
        {"table": "bookings", "records": 2500, "health": 94.2, "issues": 18},
        {"table": "agents", "records": 15, "health": 97.8, "issues": 3},
        {"table": "destinations", "records": 12, "health": 99.1, "issues": 1},
        {"table": "transactions", "records": 98400, "health": 95.6, "issues": 12},
        {"table": "customers", "records": 24200, "health": 93.4, "issues": 22},
        {"table": "analytics", "records": 1850, "health": 98.2, "issues": 2},
    ]
