// ============================================================
// AtlasOps AI — Data Service Layer
// Fetches from Supabase with fallback to static generation
// ============================================================

import { isSupabaseConfigured, getSupabaseServer } from "./supabase";
import { mapDbBookingToBooking } from "@/types/database";
import { Booking } from "@/types";

// --- Fetch Bookings from Supabase ---

export async function fetchBookings(): Promise<Booking[]> {
  if (!isSupabaseConfigured()) {
    // Fallback: use static data
    const { bookings } = await import("@/data/bookings");
    return bookings;
  }

  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      customer:customers(name, email),
      agent:agents(name),
      destination:destinations(name, region)
    `)
    .order("booking_date", { ascending: false });

  if (error || !data) {
    console.error("[DataService] Bookings fetch failed:", error?.message);
    const { bookings } = await import("@/data/bookings");
    return bookings;
  }

  return data.map((row: Record<string, unknown>) => {
    const customer = row.customer as { name: string; email: string } | null;
    const agent = row.agent as { name: string } | null;
    const destination = row.destination as { name: string; region: string } | null;

    return mapDbBookingToBooking(
      row as unknown as import("@/types/database").DbBooking,
      agent?.name || "Unknown",
      customer?.name || "Unknown",
      customer?.email || "",
      destination?.name || "Unknown",
      destination?.region || "Unknown",
    );
  });
}

// --- Fetch Agent Metadata ---

export async function fetchAgents() {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .order("skill_level", { ascending: false });

  if (error) {
    console.error("[DataService] Agents fetch failed:", error.message);
    return null;
  }
  return data;
}

// --- Fetch Destinations ---

export async function fetchDestinations() {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .order("name");

  if (error) {
    console.error("[DataService] Destinations fetch failed:", error.message);
    return null;
  }
  return data;
}

// --- Fetch Stored Insights ---

export async function fetchStoredInsights() {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("insights")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[DataService] Insights fetch failed:", error.message);
    return null;
  }
  return data;
}

// --- Fetch Stored Anomalies ---

export async function fetchStoredAnomalies() {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("anomalies")
    .select("*")
    .order("detected_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("[DataService] Anomalies fetch failed:", error.message);
    return null;
  }
  return data;
}

// --- Booking Count (for health metrics) ---

export async function fetchBookingCount(): Promise<number | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseServer();
  const { count, error } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true });

  if (error) return null;
  return count;
}
