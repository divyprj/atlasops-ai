"""
AtlasOps AI — Mock Data Generator
Generates realistic Indian travel operations data using NumPy/Pandas.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Any


DESTINATIONS = [
    {"id": "dest-01", "name": "Goa", "region": "West India", "type": "domestic", "avg_price": 25000, "peak_months": [11, 12, 1, 2]},
    {"id": "dest-02", "name": "Dubai", "region": "International", "type": "international", "avg_price": 85000, "peak_months": [10, 11, 12, 1]},
    {"id": "dest-03", "name": "Maldives", "region": "International", "type": "international", "avg_price": 180000, "peak_months": [11, 12, 1, 2, 3]},
    {"id": "dest-04", "name": "Manali", "region": "North India", "type": "domestic", "avg_price": 18000, "peak_months": [4, 5, 6, 12]},
    {"id": "dest-05", "name": "Thailand", "region": "International", "type": "international", "avg_price": 55000, "peak_months": [11, 12, 1, 2, 3]},
    {"id": "dest-06", "name": "Kerala", "region": "South India", "type": "domestic", "avg_price": 22000, "peak_months": [9, 10, 11, 12, 1]},
    {"id": "dest-07", "name": "Singapore", "region": "International", "type": "international", "avg_price": 72000, "peak_months": [3, 4, 5, 6]},
    {"id": "dest-08", "name": "Rajasthan", "region": "North India", "type": "domestic", "avg_price": 20000, "peak_months": [10, 11, 12, 1, 2]},
    {"id": "dest-09", "name": "Bali", "region": "International", "type": "international", "avg_price": 65000, "peak_months": [4, 5, 6, 7, 8]},
    {"id": "dest-10", "name": "Kashmir", "region": "North India", "type": "domestic", "avg_price": 28000, "peak_months": [3, 4, 5, 6, 7]},
    {"id": "dest-11", "name": "Pondicherry", "region": "South India", "type": "domestic", "avg_price": 15000, "peak_months": [10, 11, 12, 1, 2]},
    {"id": "dest-12", "name": "Andaman", "region": "East India", "type": "domestic", "avg_price": 35000, "peak_months": [10, 11, 12, 1, 2, 3]},
]

AGENTS = [
    {"id": "AGT-001", "name": "Rahul Sharma", "region": "North India", "tier": "elite"},
    {"id": "AGT-002", "name": "Priya Patel", "region": "West India", "tier": "elite"},
    {"id": "AGT-003", "name": "Sneha Reddy", "region": "South India", "tier": "elite"},
    {"id": "AGT-004", "name": "Arjun Nair", "region": "South India", "tier": "elite"},
    {"id": "AGT-005", "name": "Vikram Singh", "region": "North India", "tier": "strong"},
    {"id": "AGT-006", "name": "Ananya Das", "region": "East India", "tier": "strong"},
    {"id": "AGT-007", "name": "Karthik Iyer", "region": "South India", "tier": "strong"},
    {"id": "AGT-008", "name": "Meera Joshi", "region": "West India", "tier": "strong"},
    {"id": "AGT-009", "name": "Aditya Kumar", "region": "North India", "tier": "strong"},
    {"id": "AGT-010", "name": "Neha Gupta", "region": "North India", "tier": "average"},
    {"id": "AGT-011", "name": "Raj Malhotra", "region": "West India", "tier": "average"},
    {"id": "AGT-012", "name": "Deepa Krishnan", "region": "South India", "tier": "average"},
    {"id": "AGT-013", "name": "Amit Saxena", "region": "North India", "tier": "average"},
    {"id": "AGT-014", "name": "Rohan Das", "region": "East India", "tier": "needs_improvement"},
    {"id": "AGT-015", "name": "Siddharth Verma", "region": "North India", "tier": "needs_improvement"},
]

STATUSES = ["confirmed", "completed", "cancelled", "pending"]
SOURCES = ["website", "mobile_app", "partner", "direct", "referral"]


class DataStore:
    """Singleton data store for generated mock data."""
    
    is_initialized: bool = False
    bookings: pd.DataFrame = pd.DataFrame()
    agents_df: pd.DataFrame = pd.DataFrame()
    monthly_revenue: list[dict[str, Any]] = []
    revenue_by_region: list[dict[str, Any]] = []
    revenue_by_destination: list[dict[str, Any]] = []
    insights: list[dict[str, Any]] = []
    health_data: dict[str, Any] = {}
    anomalies: list[dict[str, Any]] = []
    
    @classmethod
    def initialize(cls, seed: int = 42) -> None:
        """Generate all mock data."""
        rng = np.random.default_rng(seed)
        
        cls.bookings = cls._generate_bookings(rng)
        cls.agents_df = cls._generate_agent_metrics(rng)
        cls.monthly_revenue = cls._compute_monthly_revenue()
        cls.revenue_by_region = cls._compute_revenue_by_region()
        cls.revenue_by_destination = cls._compute_revenue_by_destination()
        cls.insights = cls._generate_insights(rng)
        cls.health_data = cls._generate_health_data(rng)
        cls.anomalies = cls._generate_anomalies(rng)
        cls.is_initialized = True
    
    @classmethod
    def _generate_bookings(cls, rng: np.random.Generator) -> pd.DataFrame:
        """Generate 2500 realistic bookings."""
        n = 2500
        start_date = datetime(2024, 1, 1)
        
        rows = []
        for i in range(n):
            dest = rng.choice(DESTINATIONS)
            agent = rng.choice(AGENTS)
            
            days_offset = int(rng.integers(0, 540))
            booking_date = start_date + timedelta(days=days_offset)
            month = booking_date.month
            
            # Seasonal pricing
            is_peak = month in dest["peak_months"]
            price_mult = rng.uniform(1.1, 1.5) if is_peak else rng.uniform(0.7, 1.1)
            amount = int(dest["avg_price"] * price_mult * rng.uniform(0.8, 1.3))
            
            # Status with agent tier influence
            tier_cancel_rates = {"elite": 0.05, "strong": 0.08, "average": 0.10, "needs_improvement": 0.15}
            cancel_prob = tier_cancel_rates[agent["tier"]]
            status_weights = [0.3, 0.5, cancel_prob, 0.2 - cancel_prob]
            status = rng.choice(STATUSES, p=[w / sum(status_weights) for w in status_weights])
            
            source = rng.choice(SOURCES, p=[0.35, 0.25, 0.15, 0.15, 0.10])
            pax = int(rng.integers(1, 6))
            
            rows.append({
                "id": f"BKG-{i+1:04d}",
                "date": booking_date.strftime("%Y-%m-%d"),
                "month": booking_date.strftime("%Y-%m"),
                "destination": dest["name"],
                "destination_id": dest["id"],
                "region": dest["region"],
                "type": dest["type"],
                "agent_id": agent["id"],
                "agent_name": agent["name"],
                "amount": amount,
                "status": status,
                "source": source,
                "pax": pax,
                "profit_margin": round(rng.uniform(0.15, 0.28), 3),
            })
        
        return pd.DataFrame(rows)
    
    @classmethod
    def _generate_agent_metrics(cls, rng: np.random.Generator) -> pd.DataFrame:
        """Compute agent performance metrics from bookings."""
        agents_list = []
        for agent in AGENTS:
            agent_bookings = cls.bookings[cls.bookings["agent_id"] == agent["id"]]
            total_bookings = len(agent_bookings)
            total_revenue = int(agent_bookings["amount"].sum())
            cancelled = len(agent_bookings[agent_bookings["status"] == "cancelled"])
            cancel_ratio = round((cancelled / max(total_bookings, 1)) * 100, 1)
            
            tier_scores = {"elite": (85, 100), "strong": (70, 85), "average": (55, 70), "needs_improvement": (35, 55)}
            score_range = tier_scores[agent["tier"]]
            score = int(rng.integers(score_range[0], score_range[1]))
            
            conv_rates = {"elite": (75, 85), "strong": (68, 78), "average": (60, 70), "needs_improvement": (55, 65)}
            conv_range = conv_rates[agent["tier"]]
            conversion = round(rng.uniform(conv_range[0], conv_range[1]), 1)
            
            resp_times = {"elite": (8, 15), "strong": (12, 20), "average": (18, 25), "needs_improvement": (22, 35)}
            resp_range = resp_times[agent["tier"]]
            response_time = int(rng.integers(resp_range[0], resp_range[1]))
            
            satisfaction = round(rng.uniform(3.5 if agent["tier"] == "needs_improvement" else 4.0, 5.0), 1)
            
            agents_list.append({
                "id": agent["id"],
                "name": agent["name"],
                "region": agent["region"],
                "tier": agent["tier"],
                "total_bookings": total_bookings,
                "total_revenue": total_revenue,
                "cancellation_ratio": cancel_ratio,
                "conversion_rate": conversion,
                "avg_response_time": response_time,
                "performance_score": score,
                "customer_satisfaction": satisfaction,
            })
        
        return pd.DataFrame(agents_list)
    
    @classmethod
    def _compute_monthly_revenue(cls) -> list[dict[str, Any]]:
        """Aggregate revenue by month."""
        monthly = cls.bookings.groupby("month").agg(
            revenue=("amount", "sum"),
            bookings=("id", "count"),
            cancellations=("status", lambda x: (x == "cancelled").sum()),
        ).reset_index()
        
        result = []
        for _, row in monthly.iterrows():
            domestic = cls.bookings[(cls.bookings["month"] == row["month"]) & (cls.bookings["type"] == "domestic")]["amount"].sum()
            international = cls.bookings[(cls.bookings["month"] == row["month"]) & (cls.bookings["type"] == "international")]["amount"].sum()
            result.append({
                "date": row["month"],
                "revenue": int(row["revenue"]),
                "bookings": int(row["bookings"]),
                "cancellations": int(row["cancellations"]),
                "profit": int(row["revenue"] * 0.21),
                "domestic": int(domestic),
                "international": int(international),
            })
        return sorted(result, key=lambda x: x["date"])
    
    @classmethod
    def _compute_revenue_by_region(cls) -> list[dict[str, Any]]:
        grouped = cls.bookings.groupby("region")["amount"].sum().reset_index()
        total = grouped["amount"].sum()
        return [
            {"region": row["region"], "revenue": int(row["amount"]), "share": round(row["amount"] / total * 100, 1)}
            for _, row in grouped.iterrows()
        ]
    
    @classmethod
    def _compute_revenue_by_destination(cls) -> list[dict[str, Any]]:
        grouped = cls.bookings.groupby("destination")["amount"].sum().reset_index()
        total = grouped["amount"].sum()
        grouped = grouped.sort_values("amount", ascending=False)
        return [
            {"destination": row["destination"], "revenue": int(row["amount"]), "share": round(row["amount"] / total * 100, 1)}
            for _, row in grouped.iterrows()
        ]
    
    @classmethod
    def _generate_insights(cls, rng: np.random.Generator) -> list[dict[str, Any]]:
        """Generate AI-style operational insights."""
        return [
            {"id": "INS-001", "severity": "critical", "category": "revenue", "title": "Revenue Decline in North India", "description": "North India revenue has dropped 18.2% MoM. Kashmir and Manali showing steepest decline due to off-season transition.", "source": "ai", "recommendation": "Shift marketing budget to South India and international destinations for Q3.", "timestamp": "2025-05-27T10:00:00Z", "is_new": True},
            {"id": "INS-002", "severity": "warning", "category": "operations", "title": "Cancellation Rate Spike Detected", "description": "Cancellation rate increased from 6.8% to 8.4% in the last 7 days. Primary driver: weather-related cancellations in hill stations.", "source": "anomaly-detection", "recommendation": "Implement flexible rebooking policy for weather-affected destinations.", "timestamp": "2025-05-27T09:30:00Z", "is_new": True},
            {"id": "INS-003", "severity": "positive", "category": "growth", "title": "International Bookings Up 28.6%", "description": "International segment showing strong growth. Dubai and Thailand leading with combined 340 bookings this quarter.", "source": "ai", "timestamp": "2025-05-27T08:00:00Z", "is_new": True},
            {"id": "INS-004", "severity": "warning", "category": "performance", "title": "2 Agents Below Performance Threshold", "description": "Rohan Das (55/100) and Siddharth Verma (48/100) are significantly below the team average of 72.3.", "source": "rule-based", "recommendation": "Pair with elite-tier mentors. Schedule weekly performance reviews.", "timestamp": "2025-05-26T16:00:00Z", "is_new": False},
            {"id": "INS-005", "severity": "positive", "category": "revenue", "title": "Dubai Revenue Exceeds Target by 22%", "description": "Dubai has generated ₹1.28Cr this quarter, exceeding the ₹1.05Cr target.", "source": "ai", "timestamp": "2025-05-26T14:00:00Z", "is_new": False},
        ]
    
    @classmethod
    def _generate_health_data(cls, rng: np.random.Generator) -> dict[str, Any]:
        return {
            "overall_score": 91.8,
            "status": "warning",
            "total_records": len(cls.bookings),
            "duplicates_detected": 47,
            "missing_values": 32,
            "anomalies_detected": 8,
            "data_consistency_score": 96.2,
            "last_full_scan": "2025-05-27T06:00:00Z",
        }
    
    @classmethod
    def _generate_anomalies(cls, rng: np.random.Generator) -> list[dict[str, Any]]:
        return [
            {"id": "ANM-001", "type": "suspicious_transaction", "severity": "high", "table": "bookings", "description": "Transaction amount ₹4,85,000 exceeds 3σ threshold", "record_id": "BKG-0847", "detected_at": "2025-05-27T06:12:00Z", "resolved": False},
            {"id": "ANM-002", "type": "duplicate_record", "severity": "medium", "table": "bookings", "description": "Potential duplicate: matching customer, destination, and date", "record_id": "BKG-1204", "detected_at": "2025-05-26T18:30:00Z", "resolved": False},
            {"id": "ANM-003", "type": "missing_data", "severity": "low", "table": "agents", "description": "Missing customer satisfaction score for 3 records", "record_id": "AGT-014", "detected_at": "2025-05-25T12:00:00Z", "resolved": True},
        ]
