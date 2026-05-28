"""Bookings API endpoints."""

from fastapi import APIRouter, Query
from data.generator import DataStore

router = APIRouter()


@router.get("/summary")
async def booking_summary():
    df = DataStore.bookings
    total = len(df)
    return {
        "total_bookings": total,
        "confirmed_bookings": len(df[df["status"] == "confirmed"]),
        "completed_bookings": len(df[df["status"] == "completed"]),
        "cancelled_bookings": len(df[df["status"] == "cancelled"]),
        "pending_bookings": len(df[df["status"] == "pending"]),
        "cancellation_rate": round(len(df[df["status"] == "cancelled"]) / total * 100, 1),
        "avg_booking_value": int(df["amount"].mean()),
    }


@router.get("/trends")
async def booking_trends():
    monthly = DataStore.bookings.groupby("month").agg(
        bookings=("id", "count"),
        cancellations=("status", lambda x: (x == "cancelled").sum()),
        revenue=("amount", "sum"),
    ).reset_index()
    return [
        {"month": row["month"], "bookings": int(row["bookings"]), "cancellations": int(row["cancellations"]), "revenue": int(row["revenue"])}
        for _, row in monthly.iterrows()
    ]


@router.get("/by-status")
async def booking_by_status():
    counts = DataStore.bookings["status"].value_counts().to_dict()
    return [{"status": k, "count": int(v)} for k, v in counts.items()]


@router.get("/by-source")
async def booking_by_source():
    counts = DataStore.bookings["source"].value_counts().to_dict()
    return [{"source": k, "count": int(v)} for k, v in counts.items()]


@router.get("/recent")
async def recent_bookings(limit: int = Query(default=20, le=100)):
    df = DataStore.bookings.sort_values("date", ascending=False).head(limit)
    return df.to_dict(orient="records")
