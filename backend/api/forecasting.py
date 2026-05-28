"""Forecasting API endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/revenue")
async def revenue_forecast():
    return [
        {"date": "2025-01", "actual": 3780000, "predicted": 3650000, "lower_bound": 3200000, "upper_bound": 4100000},
        {"date": "2025-02", "actual": 3460000, "predicted": 3520000, "lower_bound": 3080000, "upper_bound": 3960000},
        {"date": "2025-03", "actual": 4050000, "predicted": 3900000, "lower_bound": 3420000, "upper_bound": 4380000},
        {"date": "2025-04", "actual": 4560000, "predicted": 4400000, "lower_bound": 3860000, "upper_bound": 4940000},
        {"date": "2025-05", "actual": 5280000, "predicted": 5100000, "lower_bound": 4470000, "upper_bound": 5730000},
        {"date": "2025-06", "actual": None, "predicted": 4800000, "lower_bound": 4100000, "upper_bound": 5500000},
        {"date": "2025-07", "actual": None, "predicted": 4200000, "lower_bound": 3500000, "upper_bound": 4900000},
    ]


@router.get("/bookings")
async def booking_forecast():
    return [
        {"date": "2025-01", "actual": 135, "predicted": 130, "lower_bound": 110, "upper_bound": 150},
        {"date": "2025-02", "actual": 122, "predicted": 125, "lower_bound": 105, "upper_bound": 145},
        {"date": "2025-03", "actual": 148, "predicted": 140, "lower_bound": 120, "upper_bound": 160},
        {"date": "2025-04", "actual": 165, "predicted": 158, "lower_bound": 135, "upper_bound": 180},
        {"date": "2025-05", "actual": 192, "predicted": 185, "lower_bound": 160, "upper_bound": 210},
        {"date": "2025-06", "actual": None, "predicted": 175, "lower_bound": 148, "upper_bound": 202},
    ]


@router.get("/demand")
async def demand_forecast():
    return [
        {"destination": "Dubai", "current": 85, "predicted": 110, "change": 29.4, "confidence": 87},
        {"destination": "Goa", "current": 72, "predicted": 45, "change": -37.5, "confidence": 91},
        {"destination": "Kashmir", "current": 75, "predicted": 88, "change": 17.3, "confidence": 85},
        {"destination": "Manali", "current": 98, "predicted": 65, "change": -33.7, "confidence": 89},
        {"destination": "Kerala", "current": 45, "predicted": 52, "change": 15.6, "confidence": 78},
    ]


@router.get("/summaries")
async def forecast_summaries():
    return [
        {"metric": "Monthly Revenue", "next_month": 4800000, "confidence": 85, "trend": "down"},
        {"metric": "Booking Volume", "next_month": 175, "confidence": 82, "trend": "down"},
        {"metric": "Cancellation Rate", "next_month": 8.6, "confidence": 78, "trend": "up"},
    ]
