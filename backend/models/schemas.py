"""Pydantic response models for AtlasOps AI API."""

from pydantic import BaseModel
from typing import Optional


class KPIResponse(BaseModel):
    total_revenue: int
    total_bookings: int
    cancellation_rate: float
    avg_order_value: int
    active_agents: int
    monthly_growth: float
    health_score: float
    retention_rate: float


class RevenueDataPoint(BaseModel):
    date: str
    revenue: int
    bookings: int
    cancellations: int
    profit: int
    domestic: int
    international: int


class AgentResponse(BaseModel):
    id: str
    name: str
    region: str
    tier: str
    total_bookings: int
    total_revenue: int
    cancellation_ratio: float
    conversion_rate: float
    avg_response_time: int
    performance_score: int
    customer_satisfaction: float


class HealthStatusResponse(BaseModel):
    overall_score: float
    status: str
    total_records: int
    duplicates_detected: int
    missing_values: int
    anomalies_detected: int
    data_consistency_score: float
    last_full_scan: str


class AnomalyResponse(BaseModel):
    id: str
    type: str
    severity: str
    table: str
    description: str
    record_id: str
    detected_at: str
    resolved: bool


class ForecastDataPoint(BaseModel):
    date: str
    actual: Optional[int] = None
    predicted: int
    lower_bound: int
    upper_bound: int


class CopilotRequest(BaseModel):
    message: str
    history: list[dict[str, str]] = []


class CopilotResponse(BaseModel):
    response: str
    sources: list[str] = []
