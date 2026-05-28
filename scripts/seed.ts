// ============================================================
// AtlasOps AI — Supabase Data Seeding Script
// Generates 15,000 deterministic booking records with full
// operational realism: seasonal curves, agent skill correlation,
// repeat customers, destination-specific cancellation rates.
//
// Usage:
//   npx tsx scripts/seed.ts
//
// Requires:
//   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
// ============================================================

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

const BOOKING_COUNT = 15000;
const BATCH_SIZE = 500;

// ============================================================
// Seed Data — Destinations, Agents, Customers
// ============================================================

const destinations = [
  { name: "Goa", country: "India", region: "West India", type: "domestic", base_price: 15000, cancel_rate: 10.0, popularity: 9, seasonal_peak: ["Nov", "Dec", "Jan", "Feb"] },
  { name: "Dubai", country: "UAE", region: "International", type: "international", base_price: 95000, cancel_rate: 8.0, popularity: 9, seasonal_peak: ["Nov", "Dec", "Jan"] },
  { name: "Maldives", country: "Maldives", region: "International", type: "international", base_price: 180000, cancel_rate: 6.0, popularity: 7, seasonal_peak: ["Dec", "Jan", "Feb"] },
  { name: "Manali", country: "India", region: "North India", type: "domestic", base_price: 12000, cancel_rate: 14.0, popularity: 8, seasonal_peak: ["Apr", "May", "Jun", "Dec"] },
  { name: "Thailand", country: "Thailand", region: "International", type: "international", base_price: 65000, cancel_rate: 9.0, popularity: 8, seasonal_peak: ["Nov", "Dec", "Jan"] },
  { name: "Kerala", country: "India", region: "South India", type: "domestic", base_price: 20000, cancel_rate: 8.0, popularity: 7, seasonal_peak: ["Sep", "Oct", "Nov", "Dec"] },
  { name: "Singapore", country: "Singapore", region: "International", type: "international", base_price: 80000, cancel_rate: 7.0, popularity: 7, seasonal_peak: ["May", "Jun", "Nov", "Dec"] },
  { name: "Rajasthan", country: "India", region: "North India", type: "domestic", base_price: 18000, cancel_rate: 11.0, popularity: 7, seasonal_peak: ["Oct", "Nov", "Dec"] },
  { name: "Bali", country: "Indonesia", region: "International", type: "international", base_price: 100000, cancel_rate: 7.0, popularity: 8, seasonal_peak: ["Jun", "Jul", "Aug", "Dec"] },
  { name: "Kashmir", country: "India", region: "North India", type: "domestic", base_price: 15000, cancel_rate: 16.0, popularity: 8, seasonal_peak: ["Apr", "May", "Jun"] },
  { name: "Pondicherry", country: "India", region: "South India", type: "domestic", base_price: 10000, cancel_rate: 9.0, popularity: 5, seasonal_peak: ["Oct", "Nov", "Dec", "Jan"] },
  { name: "Andaman", country: "India", region: "South India", type: "domestic", base_price: 40000, cancel_rate: 10.0, popularity: 6, seasonal_peak: ["Nov", "Dec", "Jan", "Feb"] },
];

const agentData = [
  { name: "Rahul Sharma", email: "rahul.sharma@atlasops.com", region: "North India", skill_level: 9.5, response_time_min: 12, satisfaction: 4.8, join_date: "2022-03-15" },
  { name: "Priya Patel", email: "priya.patel@atlasops.com", region: "West India", skill_level: 8.8, response_time_min: 15, satisfaction: 4.6, join_date: "2022-06-01" },
  { name: "Arjun Mehta", email: "arjun.mehta@atlasops.com", region: "West India", skill_level: 8.2, response_time_min: 18, satisfaction: 4.4, join_date: "2022-09-10" },
  { name: "Sneha Reddy", email: "sneha.reddy@atlasops.com", region: "South India", skill_level: 9.1, response_time_min: 14, satisfaction: 4.7, join_date: "2022-04-20" },
  { name: "Vikram Singh", email: "vikram.singh@atlasops.com", region: "North India", skill_level: 8.5, response_time_min: 16, satisfaction: 4.5, join_date: "2023-01-08" },
  { name: "Kavya Nair", email: "kavya.nair@atlasops.com", region: "South India", skill_level: 7.8, response_time_min: 20, satisfaction: 4.2, join_date: "2023-03-15" },
  { name: "Aditya Joshi", email: "aditya.joshi@atlasops.com", region: "West India", skill_level: 9.0, response_time_min: 13, satisfaction: 4.6, join_date: "2022-11-01" },
  { name: "Meera Gupta", email: "meera.gupta@atlasops.com", region: "North India", skill_level: 7.3, response_time_min: 22, satisfaction: 4.0, join_date: "2023-06-20" },
  { name: "Rohan Das", email: "rohan.das@atlasops.com", region: "East India", skill_level: 6.5, response_time_min: 28, satisfaction: 3.8, join_date: "2023-08-10" },
  { name: "Ananya Iyer", email: "ananya.iyer@atlasops.com", region: "South India", skill_level: 8.7, response_time_min: 15, satisfaction: 4.5, join_date: "2022-07-15" },
  { name: "Karthik Bhat", email: "karthik.bhat@atlasops.com", region: "South India", skill_level: 8.0, response_time_min: 19, satisfaction: 4.3, join_date: "2023-02-01" },
  { name: "Neha Kapoor", email: "neha.kapoor@atlasops.com", region: "North India", skill_level: 7.6, response_time_min: 21, satisfaction: 4.1, join_date: "2023-05-10" },
  { name: "Siddharth Verma", email: "siddharth.verma@atlasops.com", region: "North India", skill_level: 6.0, response_time_min: 30, satisfaction: 3.6, join_date: "2023-10-01" },
  { name: "Divya Menon", email: "divya.menon@atlasops.com", region: "South India", skill_level: 8.3, response_time_min: 17, satisfaction: 4.4, join_date: "2022-12-01" },
  { name: "Rajesh Kumar", email: "rajesh.kumar@atlasops.com", region: "North India", skill_level: 7.0, response_time_min: 24, satisfaction: 3.9, join_date: "2023-07-15" },
];

const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Shaurya",
  "Ananya", "Diya", "Myra", "Sara", "Aadhya", "Kiara", "Pari", "Aanya", "Navya", "Riya",
  "Rohan", "Kabir", "Arnav", "Dhruv", "Yash", "Pranav", "Neil", "Harsh", "Dev", "Karan",
  "Zara", "Priya", "Neha", "Shreya", "Tanvi", "Pooja", "Isha", "Meera", "Nisha", "Kavya"];
const lastNames = ["Sharma", "Patel", "Singh", "Kumar", "Reddy", "Gupta", "Mehta", "Joshi", "Verma", "Nair",
  "Iyer", "Bhat", "Das", "Kapoor", "Menon", "Rao", "Chauhan", "Pandey", "Mishra", "Saxena"];
const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow",
  "Chandigarh", "Indore", "Bhopal", "Kochi", "Surat", "Nagpur", "Vizag", "Coimbatore", "Guwahati", "Patna"];

const packageNames: Record<string, string[]> = {
  "Goa": ["Goa Beach Bliss 4N/5D", "Goa Adventure Pack 3N/4D", "Goa Honeymoon Special 5N/6D"],
  "Dubai": ["Dubai Gold Pack 5N/6D", "Dubai Family Fun 6N/7D", "Dubai Luxury Escape 4N/5D"],
  "Maldives": ["Maldives Resort Premium 4N/5D", "Maldives Honeymoon 5N/6D", "Maldives Water Villa 3N/4D"],
  "Manali": ["Manali Snow Adventure 4N/5D", "Manali Family Pack 3N/4D", "Manali Honeymoon 5N/6D"],
  "Thailand": ["Thailand Explorer 5N/6D", "Bangkok-Pattaya Combo 6N/7D", "Phuket Beach 4N/5D"],
  "Kerala": ["Kerala Backwater Bliss 5N/6D", "Kerala Ayurveda Retreat 4N/5D", "Kerala Honeymoon 6N/7D"],
  "Singapore": ["Singapore City Explorer 4N/5D", "Singapore-Malaysia 6N/7D", "Singapore Family Fun 5N/6D"],
  "Rajasthan": ["Royal Rajasthan 6N/7D", "Rajasthan Heritage 5N/6D", "Jaipur-Udaipur Express 4N/5D"],
  "Bali": ["Bali Paradise 5N/6D", "Bali Honeymoon 4N/5D", "Bali Cultural Tour 6N/7D"],
  "Kashmir": ["Kashmir Paradise 5N/6D", "Kashmir Adventure 4N/5D", "Kashmir Houseboat Special 6N/7D"],
  "Pondicherry": ["Pondy Beach Retreat 3N/4D", "Pondy Heritage Walk 2N/3D"],
  "Andaman": ["Andaman Island Explorer 5N/6D", "Andaman Scuba Adventure 4N/5D"],
};

const priceRanges: Record<string, [number, number]> = {
  "Goa": [8000, 35000], "Dubai": [45000, 180000], "Maldives": [80000, 350000], "Manali": [6000, 25000],
  "Thailand": [35000, 120000], "Kerala": [10000, 45000], "Singapore": [40000, 150000], "Rajasthan": [8000, 40000],
  "Bali": [50000, 200000], "Kashmir": [8000, 35000], "Pondicherry": [5000, 20000], "Andaman": [20000, 80000],
};

const seasonalDemand: Record<string, number[]> = {
  "Manali":     [0.6, 0.7, 0.9, 1.3, 1.5, 1.4, 0.5, 0.4, 0.6, 0.8, 0.7, 1.1],
  "Kashmir":    [0.4, 0.5, 0.8, 1.2, 1.4, 1.3, 0.4, 0.3, 0.5, 0.7, 0.5, 0.8],
  "Goa":        [1.4, 1.2, 0.9, 0.6, 0.5, 0.4, 0.3, 0.4, 0.6, 0.8, 1.3, 1.5],
  "Kerala":     [1.2, 1.1, 0.8, 0.6, 0.5, 0.4, 0.4, 0.5, 0.7, 0.9, 1.2, 1.3],
  "Andaman":    [1.3, 1.2, 1.0, 0.7, 0.5, 0.3, 0.3, 0.4, 0.6, 0.8, 1.1, 1.4],
  "Pondicherry":[1.1, 1.0, 0.8, 0.6, 0.5, 0.5, 0.4, 0.5, 0.7, 0.9, 1.2, 1.3],
  "Dubai":      [1.2, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.5, 0.8, 1.1, 1.3, 1.5],
  "Maldives":   [1.3, 1.1, 0.9, 0.7, 0.5, 0.4, 0.4, 0.5, 0.7, 1.0, 1.3, 1.5],
  "Thailand":   [1.1, 1.0, 0.9, 0.7, 0.6, 0.5, 0.5, 0.6, 0.8, 1.0, 1.2, 1.3],
  "Singapore":  [0.9, 0.8, 0.9, 0.8, 1.0, 1.1, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2],
  "Bali":       [1.2, 1.0, 0.8, 0.7, 0.6, 0.5, 0.6, 0.7, 0.8, 1.0, 1.2, 1.3],
  "Rajasthan":  [1.0, 0.9, 0.8, 0.5, 0.4, 0.3, 0.3, 0.4, 0.7, 1.1, 1.4, 1.3],
};

const destCancelRate: Record<string, number> = {
  "Goa": 0.10, "Dubai": 0.08, "Maldives": 0.06, "Manali": 0.14,
  "Thailand": 0.09, "Kerala": 0.08, "Singapore": 0.07, "Rajasthan": 0.11,
  "Bali": 0.07, "Kashmir": 0.16, "Pondicherry": 0.09, "Andaman": 0.10,
};

const sources: string[] = ["website", "referral", "agent", "social", "walk-in"];

// ============================================================
// Deterministic RNG (same as frontend)
// ============================================================

function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    return (s >>> 0) / 0xffffffff;
  };
}

function growthFactor(bookingDate: Date): number {
  const monthsFromBase = (bookingDate.getFullYear() - 2024) * 12 + bookingDate.getMonth();
  return 1.0 + monthsFromBase * 0.015;
}

// ============================================================
// Seeding Functions
// ============================================================

async function seedDestinations(): Promise<Map<string, string>> {
  console.log("  Seeding destinations...");
  const idMap = new Map<string, string>();

  for (const d of destinations) {
    const { data, error } = await supabase
      .from("destinations")
      .upsert(d, { onConflict: "name" })
      .select("id, name")
      .single();

    if (error) { console.error("  Destination error:", d.name, error.message); continue; }
    if (data) idMap.set(data.name, data.id);
  }

  console.log(`  ✓ ${idMap.size} destinations`);
  return idMap;
}

async function seedAgents(): Promise<Map<number, string>> {
  console.log("  Seeding agents...");
  const idMap = new Map<number, string>();

  for (let i = 0; i < agentData.length; i++) {
    const { data, error } = await supabase
      .from("agents")
      .upsert(agentData[i], { onConflict: "email" })
      .select("id")
      .single();

    if (error) { console.error("  Agent error:", agentData[i].name, error.message); continue; }
    if (data) idMap.set(i, data.id);
  }

  console.log(`  ✓ ${idMap.size} agents`);
  return idMap;
}

async function seedCustomers(rng: () => number): Promise<Map<string, string>> {
  console.log("  Seeding customers...");
  const idMap = new Map<string, string>();
  const customers: Array<{name: string; email: string; phone: string; city: string; is_repeat: boolean}> = [];

  const CUSTOMER_COUNT = 3000;
  const usedEmails = new Set<string>();

  for (let i = 0; i < CUSTOMER_COUNT; i++) {
    const first = firstNames[Math.floor(rng() * firstNames.length)];
    const last = lastNames[Math.floor(rng() * lastNames.length)];
    const city = cities[Math.floor(rng() * cities.length)];
    let email = `${first.toLowerCase()}.${last.toLowerCase()}${i}@email.com`;
    // Ensure unique emails
    while (usedEmails.has(email)) { email = `${first.toLowerCase()}.${last.toLowerCase()}${i}${Math.floor(rng()*100)}@email.com`; }
    usedEmails.add(email);

    customers.push({
      name: `${first} ${last}`,
      email,
      phone: `+91${String(7000000000 + Math.floor(rng() * 3000000000))}`,
      city,
      is_repeat: i < CUSTOMER_COUNT * 0.3, // 30% repeat
    });
  }

  // Batch insert
  for (let i = 0; i < customers.length; i += BATCH_SIZE) {
    const batch = customers.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase.from("customers").insert(batch).select("id");
    if (error) { console.error("  Customer batch error:", error.message); continue; }
    if (data) {
      data.forEach((row, j) => {
        const localKey = `CUS-${String(i + j + 1).padStart(5, "0")}`;
        idMap.set(localKey, row.id);
      });
    }
  }

  console.log(`  ✓ ${idMap.size} customers`);
  return idMap;
}

async function seedBookings(
  rng: () => number,
  destIds: Map<string, string>,
  agentIds: Map<number, string>,
  customerIds: Map<string, string>,
): Promise<void> {
  console.log(`  Seeding ${BOOKING_COUNT} bookings...`);

  const destNames = Array.from(destIds.keys());
  const agentCount = agentIds.size;
  const customerKeys = Array.from(customerIds.keys());
  const repeatKeys = customerKeys.filter((_, i) => i < customerKeys.length * 0.3);

  const agentSkills: number[] = agentData.map(a => a.skill_level / 10); // normalize to 0-1

  const bookings: Array<Record<string, unknown>> = [];
  let skipped = 0;

  for (let i = 0; i < BOOKING_COUNT + 5000; i++) {
    if (bookings.length >= BOOKING_COUNT) break;

    // Date: span 18 months (Jan 2024 – Jun 2025)
    const rawDay = Math.floor(rng() * 540);
    const bookingDate = new Date(2024, 0, 1 + rawDay);
    const month0 = bookingDate.getMonth();

    // Destination selection weighted by seasonal demand
    const weights = destNames.map(d => {
      const seasonal = seasonalDemand[d]?.[month0] || 1.0;
      return seasonal * growthFactor(bookingDate);
    });
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let r = rng() * totalWeight;
    let destIdx = 0;
    for (let j = 0; j < weights.length; j++) {
      r -= weights[j];
      if (r <= 0) { destIdx = j; break; }
    }
    const destination = destNames[destIdx];

    // Weekend boost
    const dayOfWeek = bookingDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
    if (!isWeekend && rng() < 0.12) { skipped++; continue; }

    const pkgs = packageNames[destination] || ["Standard Package"];
    const [minP, maxP] = priceRanges[destination] || [10000, 50000];
    const pax = Math.floor(rng() * 4) + 1;
    const baseAmount = Math.round(minP + rng() * (maxP - minP));
    const amount = baseAmount * pax;

    const agentIdx = Math.floor(rng() * agentCount);
    const skill = agentSkills[agentIdx] || 0.75;

    // Customer
    let custKey: string;
    if (rng() < 0.35) {
      custKey = repeatKeys[Math.floor(rng() * repeatKeys.length)];
    } else {
      custKey = customerKeys[Math.floor(rng() * customerKeys.length)];
    }

    const travelDate = new Date(bookingDate.getTime() + (7 + Math.floor(rng() * 60)) * 86400000);
    const returnDate = new Date(travelDate.getTime() + (3 + Math.floor(rng() * 5)) * 86400000);

    // Status
    const baseCancelRate = destCancelRate[destination] || 0.10;
    const adjustedCancelRate = baseCancelRate * (1.5 - skill);
    const statusRng = rng();
    const ageMonths = (new Date(2025, 5, 1).getTime() - bookingDate.getTime()) / (30 * 86400000);
    const completionBias = Math.min(0.7, 0.3 + ageMonths * 0.03);

    let status: string;
    let paymentStatus: string;
    if (statusRng < completionBias) {
      status = "completed"; paymentStatus = "paid";
    } else if (statusRng < completionBias + 0.20) {
      status = "confirmed"; paymentStatus = rng() > 0.3 ? "paid" : "partial";
    } else if (statusRng < completionBias + 0.20 + adjustedCancelRate) {
      status = "cancelled"; paymentStatus = rng() > 0.6 ? "refunded" : "paid";
    } else {
      status = "pending"; paymentStatus = rng() > 0.5 ? "partial" : "pending";
    }

    // Profit
    const isIntl = destinations.find(d => d.name === destination)?.type === "international";
    const marginBase = isIntl ? 0.18 : 0.13;
    const profit = Math.round(amount * (marginBase + rng() * 0.10));

    // Source
    const sourceWeights = [
      0.30 + ageMonths * -0.005,
      0.20,
      0.25,
      0.15 + ageMonths * 0.003,
      0.10 + ageMonths * -0.003,
    ];
    const totalSW = sourceWeights.reduce((a, b) => a + b, 0);
    let sr = rng() * totalSW;
    let srcIdx = 0;
    for (let j = 0; j < sourceWeights.length; j++) {
      sr -= sourceWeights[j];
      if (sr <= 0) { srcIdx = j; break; }
    }

    bookings.push({
      customer_id: customerIds.get(custKey),
      agent_id: agentIds.get(agentIdx),
      destination_id: destIds.get(destination),
      package_name: pkgs[Math.floor(rng() * pkgs.length)],
      package_type: destinations.find(d => d.name === destination)?.type || "domestic",
      status,
      payment_status: paymentStatus,
      amount,
      profit,
      booking_date: bookingDate.toISOString().split("T")[0],
      travel_date: travelDate.toISOString().split("T")[0],
      return_date: returnDate.toISOString().split("T")[0],
      pax,
      source: sources[srcIdx],
      created_at: bookingDate.toISOString(),
    });
  }

  // Batch insert bookings
  let inserted = 0;
  for (let i = 0; i < bookings.length; i += BATCH_SIZE) {
    const batch = bookings.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("bookings").insert(batch);
    if (error) {
      console.error(`  Booking batch ${i / BATCH_SIZE + 1} error:`, error.message);
      continue;
    }
    inserted += batch.length;
    process.stdout.write(`\r  Inserted: ${inserted}/${bookings.length}`);
  }
  console.log(`\n  ✓ ${inserted} bookings (${skipped} weekday skips for realism)`);
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("  AtlasOps AI — Supabase Seeder");
  console.log("═══════════════════════════════════════");
  console.log(`  Target: ${BOOKING_COUNT} bookings`);
  console.log(`  URL: ${SUPABASE_URL}`);
  console.log("");

  const rng = seededRandom(42);

  // Seed reference tables
  const destIds = await seedDestinations();
  const agentIds = await seedAgents();
  const customerIds = await seedCustomers(rng);

  // Seed bookings
  await seedBookings(rng, destIds, agentIds, customerIds);

  // Verify counts
  console.log("\n  Verification:");
  for (const table of ["destinations", "agents", "customers", "bookings"]) {
    const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
    console.log(`  ${table}: ${count} rows`);
  }

  console.log("\n  ✓ Seeding complete.");
}

main().catch(console.error);
