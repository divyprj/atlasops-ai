// ============================================================
// AtlasOps AI — Database Row Types
// Maps PostgreSQL schema to TypeScript interfaces
// ============================================================

// --- Reference Tables ---

export interface DbDestination {
  id: string;
  name: string;
  country: string;
  region: string;
  type: "domestic" | "international";
  base_price: number;
  cancel_rate: number;
  popularity: number;
  seasonal_peak: string[];
  created_at: string;
}

export interface DbAgent {
  id: string;
  name: string;
  email: string;
  region: string;
  skill_level: number;
  response_time_min: number;
  satisfaction: number;
  join_date: string;
  active: boolean;
  created_at: string;
}

export interface DbCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  is_repeat: boolean;
  created_at: string;
}

// --- Fact Table ---

export interface DbBooking {
  id: string;
  customer_id: string;
  agent_id: string;
  destination_id: string;
  package_name: string;
  package_type: "domestic" | "international";
  status: "confirmed" | "cancelled" | "pending" | "completed";
  payment_status: "paid" | "partial" | "refunded" | "pending";
  amount: number;
  profit: number;
  booking_date: string;
  travel_date: string;
  return_date: string;
  pax: number;
  source: "website" | "referral" | "agent" | "social" | "walk-in";
  created_at: string;
}

// --- Analytics Tables ---

export interface DbOperationalMetric {
  id: string;
  date: string;
  total_bookings: number;
  total_revenue: number;
  total_profit: number;
  cancellation_count: number;
  cancel_rate: number;
  avg_order_value: number;
  domestic_revenue: number;
  intl_revenue: number;
  repeat_bookings: number;
  created_at: string;
}

export interface DbInsight {
  id: string;
  severity: "critical" | "warning" | "info" | "positive";
  category: "revenue" | "operations" | "performance" | "risk" | "growth" | "anomaly";
  title: string;
  detail: string;
  metric: string | null;
  metric_value: number | null;
  recommendation: string | null;
  source: string;
  is_new: boolean;
  created_at: string;
}

export interface DbAnomaly {
  id: string;
  type: string;
  severity: "critical" | "warning" | "info";
  title: string;
  detail: string;
  observed_value: number | null;
  expected_value: number | null;
  deviation: number | null;
  affected_entity: string | null;
  resolved: boolean;
  detected_at: string;
}

// --- Joined Query Types ---

export interface DbBookingWithRelations extends DbBooking {
  customer?: DbCustomer;
  agent?: DbAgent;
  destination?: DbDestination;
}

// --- Mapper: DB rows → existing Booking type ---

import { Booking } from "@/types";

export function mapDbBookingToBooking(
  row: DbBooking,
  agentName: string,
  customerName: string,
  customerEmail: string,
  destination: string,
  region: string
): Booking {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName,
    customerEmail,
    agentId: row.agent_id,
    agentName,
    destination,
    region,
    packageName: row.package_name,
    packageType: row.package_type,
    status: row.status,
    paymentStatus: row.payment_status,
    amount: row.amount,
    profit: row.profit,
    bookingDate: row.booking_date,
    travelDate: row.travel_date,
    returnDate: row.return_date,
    pax: row.pax,
    source: row.source,
    createdAt: row.created_at,
  };
}
