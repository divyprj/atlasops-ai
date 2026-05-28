"""
AtlasOps AI — FastAPI Backend
AI-Powered Business Operations Intelligence Platform
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from data.generator import DataStore


@asynccontextmanager
async def lifespan(app: FastAPI):
    DataStore.initialize()
    yield


app = FastAPI(
    title="AtlasOps AI API",
    description="AI-Powered Business Operations Intelligence Platform API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from api import dashboard, revenue, bookings, agents, health, insights, forecasting, reports, copilot

app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(revenue.router, prefix="/api/revenue", tags=["Revenue"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(agents.router, prefix="/api/agents", tags=["Agents"])
app.include_router(health.router, prefix="/api/health", tags=["Health"])
app.include_router(insights.router, prefix="/api/insights", tags=["Insights"])
app.include_router(forecasting.router, prefix="/api/forecasting", tags=["Forecasting"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(copilot.router, prefix="/api/copilot", tags=["Copilot"])


@app.get("/api/health-check")
async def health_check():
    return {
        "status": "healthy",
        "service": "AtlasOps AI API",
        "version": "1.0.0",
        "data_loaded": DataStore.is_initialized,
    }
