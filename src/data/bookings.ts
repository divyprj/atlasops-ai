// ============================================================
// AtlasOps AI — Mock Booking Data Generator
// ============================================================

import { Booking } from "@/types";

const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Shaurya",
  "Ananya", "Diya", "Myra", "Sara", "Aadhya", "Kiara", "Pari", "Aanya", "Navya", "Riya",
  "Rohan", "Kabir", "Arnav", "Dhruv", "Yash", "Pranav", "Neil", "Harsh", "Dev", "Karan",
  "Zara", "Priya", "Neha", "Shreya", "Tanvi", "Pooja", "Isha", "Meera", "Nisha", "Kavya"];
const lastNames = ["Sharma", "Patel", "Singh", "Kumar", "Reddy", "Gupta", "Mehta", "Joshi", "Verma", "Nair",
  "Iyer", "Bhat", "Das", "Kapoor", "Menon", "Rao", "Chauhan", "Pandey", "Mishra", "Saxena"];

const destinationNames = ["Goa", "Dubai", "Maldives", "Manali", "Thailand", "Kerala", "Singapore", "Rajasthan", "Bali", "Kashmir", "Pondicherry", "Andaman"];
const destinationRegions: Record<string, string> = {
  "Goa": "West India", "Dubai": "International", "Maldives": "International", "Manali": "North India",
  "Thailand": "International", "Kerala": "South India", "Singapore": "International", "Rajasthan": "North India",
  "Bali": "International", "Kashmir": "North India", "Pondicherry": "South India", "Andaman": "South India"
};
const destinationTypes: Record<string, "domestic" | "international"> = {
  "Goa": "domestic", "Dubai": "international", "Maldives": "international", "Manali": "domestic",
  "Thailand": "international", "Kerala": "domestic", "Singapore": "international", "Rajasthan": "domestic",
  "Bali": "international", "Kashmir": "domestic", "Pondicherry": "domestic", "Andaman": "domestic"
};

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

const agentIds = ["AGT-001", "AGT-002", "AGT-003", "AGT-004", "AGT-005", "AGT-006", "AGT-007",
  "AGT-008", "AGT-009", "AGT-010", "AGT-011", "AGT-012", "AGT-013", "AGT-014", "AGT-015"];
const agentNames = ["Rahul Sharma", "Priya Patel", "Arjun Mehta", "Sneha Reddy", "Vikram Singh",
  "Kavya Nair", "Aditya Joshi", "Meera Gupta", "Rohan Das", "Ananya Iyer",
  "Karthik Bhat", "Neha Kapoor", "Siddharth Verma", "Divya Menon", "Rajesh Kumar"];
const sources: ("website" | "referral" | "agent" | "social" | "walk-in")[] = ["website", "referral", "agent", "social", "walk-in"];

function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    return (s >>> 0) / 0xffffffff;
  };
}

// --- Seasonal Demand Curves ---
// Each destination has a monthly demand multiplier (1-12)
const seasonalDemand: Record<string, number[]> = {
  // Hill stations peak in summer (Apr-Jun), dip in monsoon (Jul-Sep)
  "Manali":     [0.6, 0.7, 0.9, 1.3, 1.5, 1.4, 0.5, 0.4, 0.6, 0.8, 0.7, 1.1],
  "Kashmir":    [0.4, 0.5, 0.8, 1.2, 1.4, 1.3, 0.4, 0.3, 0.5, 0.7, 0.5, 0.8],
  // Beach destinations peak in winter (Nov-Feb)
  "Goa":        [1.4, 1.2, 0.9, 0.6, 0.5, 0.4, 0.3, 0.4, 0.6, 0.8, 1.3, 1.5],
  "Kerala":     [1.2, 1.1, 0.8, 0.6, 0.5, 0.4, 0.4, 0.5, 0.7, 0.9, 1.2, 1.3],
  "Andaman":    [1.3, 1.2, 1.0, 0.7, 0.5, 0.3, 0.3, 0.4, 0.6, 0.8, 1.1, 1.4],
  "Pondicherry":[1.1, 1.0, 0.8, 0.6, 0.5, 0.5, 0.4, 0.5, 0.7, 0.9, 1.2, 1.3],
  // International — peak around festivals and school holidays
  "Dubai":      [1.2, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.5, 0.8, 1.1, 1.3, 1.5],
  "Maldives":   [1.3, 1.1, 0.9, 0.7, 0.5, 0.4, 0.4, 0.5, 0.7, 1.0, 1.3, 1.5],
  "Thailand":   [1.1, 1.0, 0.9, 0.7, 0.6, 0.5, 0.5, 0.6, 0.8, 1.0, 1.2, 1.3],
  "Singapore":  [0.9, 0.8, 0.9, 0.8, 1.0, 1.1, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2],
  "Bali":       [1.2, 1.0, 0.8, 0.7, 0.6, 0.5, 0.6, 0.7, 0.8, 1.0, 1.2, 1.3],
  // Heritage — steady with festive peaks
  "Rajasthan":  [1.0, 0.9, 0.8, 0.5, 0.4, 0.3, 0.3, 0.4, 0.7, 1.1, 1.4, 1.3],
};

// Destination-specific cancellation rates (base %)
const destCancelRate: Record<string, number> = {
  "Goa": 0.10, "Dubai": 0.08, "Maldives": 0.06, "Manali": 0.14,
  "Thailand": 0.09, "Kerala": 0.08, "Singapore": 0.07, "Rajasthan": 0.11,
  "Bali": 0.07, "Kashmir": 0.16, "Pondicherry": 0.09, "Andaman": 0.10,
};

// Agent skill levels (affects conversion and cancellation)
const agentSkill: Record<string, number> = {
  "AGT-001": 0.95, "AGT-002": 0.88, "AGT-003": 0.82, "AGT-004": 0.91, "AGT-005": 0.85,
  "AGT-006": 0.78, "AGT-007": 0.90, "AGT-008": 0.73, "AGT-009": 0.65, "AGT-010": 0.87,
  "AGT-011": 0.80, "AGT-012": 0.76, "AGT-013": 0.60, "AGT-014": 0.83, "AGT-015": 0.70,
};

// Overall business growth factor (YoY ~18%)
function growthFactor(bookingDate: Date): number {
  // Base: Jan 2024 = 1.0, growing ~1.5% per month
  const monthsFromBase = (bookingDate.getFullYear() - 2024) * 12 + bookingDate.getMonth();
  return 1.0 + monthsFromBase * 0.015;
}

function generateBookings(count: number): Booking[] {
  const rng = seededRandom(42);
  const bookings: Booking[] = [];

  // Pre-generate a pool of repeat customer IDs (30% of pool)
  const customerPool: string[] = [];
  const repeatPool: string[] = [];
  for (let i = 0; i < 800; i++) {
    const id = `CUS-${String(i + 1).padStart(5, "0")}`;
    customerPool.push(id);
    if (i < 240) repeatPool.push(id); // first 240 are repeat customers
  }

  for (let i = 0; i < count; i++) {
    // --- Date with seasonal weighting ---
    // Span 18 months: Jan 2024 to Jun 2025
    const rawDay = Math.floor(rng() * 540);
    const bookingDate = new Date(2024, 0, 1 + rawDay);
    const month0 = bookingDate.getMonth(); // 0-based

    // --- Destination selection weighted by seasonal demand ---
    const weights = destinationNames.map(d => {
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
    const destination = destinationNames[destIdx];

    // --- Weekend booking boost (Fri-Sun bookings ~35% higher) ---
    const dayOfWeek = bookingDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
    if (!isWeekend && rng() < 0.12) continue; // skip some weekday bookings for realism

    const packages = packageNames[destination];
    const [minPrice, maxPrice] = priceRanges[destination];
    const pax = Math.floor(rng() * 4) + 1;
    const baseAmount = Math.round(minPrice + rng() * (maxPrice - minPrice));
    const amount = baseAmount * pax;

    // --- Agent assignment (weighted by skill for better destinations) ---
    const agentIdx = Math.floor(rng() * agentIds.length);
    const agentId = agentIds[agentIdx];
    const skill = agentSkill[agentId] || 0.75;

    // --- Customer selection (repeat customers more likely) ---
    let customerId: string;
    if (rng() < 0.35) {
      // Pick from repeat pool
      customerId = repeatPool[Math.floor(rng() * repeatPool.length)];
    } else {
      customerId = customerPool[Math.floor(rng() * customerPool.length)];
    }

    const firstName = firstNames[Math.floor(rng() * firstNames.length)];
    const lastName = lastNames[Math.floor(rng() * lastNames.length)];

    const travelDate = new Date(bookingDate.getTime() + (7 + Math.floor(rng() * 60)) * 86400000);
    const returnDate = new Date(travelDate.getTime() + (3 + Math.floor(rng() * 5)) * 86400000);

    // --- Status: influenced by agent skill + destination cancel rate ---
    const baseCancelRate = destCancelRate[destination] || 0.10;
    const adjustedCancelRate = baseCancelRate * (1.5 - skill); // good agents reduce cancellations
    const statusRng = rng();
    let status: Booking["status"];
    let paymentStatus: Booking["paymentStatus"];

    // Older bookings more likely completed
    const ageMonths = (new Date(2025, 5, 1).getTime() - bookingDate.getTime()) / (30 * 86400000);
    const completionBias = Math.min(0.7, 0.3 + ageMonths * 0.03);

    if (statusRng < completionBias) {
      status = "completed"; paymentStatus = "paid";
    } else if (statusRng < completionBias + 0.20) {
      status = "confirmed"; paymentStatus = rng() > 0.3 ? "paid" : "partial";
    } else if (statusRng < completionBias + 0.20 + adjustedCancelRate) {
      status = "cancelled"; paymentStatus = rng() > 0.6 ? "refunded" : "paid";
    } else {
      status = "pending"; paymentStatus = rng() > 0.5 ? "partial" : "pending";
    }

    // --- Profit: international packages have higher margins ---
    const isInternational = destinationTypes[destination] === "international";
    const marginBase = isInternational ? 0.18 : 0.13;
    const marginVariance = rng() * 0.10;
    const profit = Math.round(amount * (marginBase + marginVariance));

    // --- Source: website grows over time, walk-in decreases ---
    const sourceWeights = [
      0.30 + ageMonths * -0.005, // website (grows)
      0.20,                       // referral (stable)
      0.25,                       // agent (stable)
      0.15 + ageMonths * 0.003,   // social (grows slowly)
      0.10 + ageMonths * -0.003,  // walk-in (decreases)
    ];
    const totalSW = sourceWeights.reduce((a, b) => a + b, 0);
    let sr = rng() * totalSW;
    let sourceIdx = 0;
    for (let j = 0; j < sourceWeights.length; j++) {
      sr -= sourceWeights[j];
      if (sr <= 0) { sourceIdx = j; break; }
    }

    bookings.push({
      id: `BKG-${String(i + 1).padStart(5, "0")}`,
      customerId,
      customerName: `${firstName} ${lastName}`,
      customerEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      agentId,
      agentName: agentNames[agentIdx],
      destination,
      region: destinationRegions[destination],
      packageName: packages[Math.floor(rng() * packages.length)],
      packageType: destinationTypes[destination],
      status,
      paymentStatus,
      amount,
      profit,
      bookingDate: bookingDate.toISOString().split("T")[0],
      travelDate: travelDate.toISOString().split("T")[0],
      returnDate: returnDate.toISOString().split("T")[0],
      pax,
      source: sources[sourceIdx],
      createdAt: bookingDate.toISOString(),
    });
  }

  return bookings.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
}

export const bookings = generateBookings(2500);

// Pre-computed analytics
export const bookingSummary = {
  totalBookings: bookings.length,
  confirmedBookings: bookings.filter(b => b.status === "confirmed").length,
  completedBookings: bookings.filter(b => b.status === "completed").length,
  cancelledBookings: bookings.filter(b => b.status === "cancelled").length,
  pendingBookings: bookings.filter(b => b.status === "pending").length,
  totalRevenue: bookings.reduce((s, b) => s + b.amount, 0),
  avgBookingValue: Math.round(bookings.reduce((s, b) => s + b.amount, 0) / bookings.length),
  cancellationRate: +(bookings.filter(b => b.status === "cancelled").length / bookings.length * 100).toFixed(1),
  domesticBookings: bookings.filter(b => b.packageType === "domestic").length,
  internationalBookings: bookings.filter(b => b.packageType === "international").length,
};

export const bookingsByMonth = (() => {
  const monthMap: Record<string, { bookings: number; revenue: number; cancellations: number }> = {};
  bookings.forEach(b => {
    const month = b.bookingDate.substring(0, 7);
    if (!monthMap[month]) monthMap[month] = { bookings: 0, revenue: 0, cancellations: 0 };
    monthMap[month].bookings++;
    monthMap[month].revenue += b.amount;
    if (b.status === "cancelled") monthMap[month].cancellations++;
  });
  return Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data }));
})();

export const bookingsBySource = (() => {
  const sourceMap: Record<string, number> = {};
  bookings.forEach(b => { sourceMap[b.source] = (sourceMap[b.source] || 0) + 1; });
  return Object.entries(sourceMap).map(([source, count]) => ({ source, count, percentage: +((count / bookings.length) * 100).toFixed(1) }));
})();

export const bookingsByStatus = (() => {
  const statusMap: Record<string, number> = {};
  bookings.forEach(b => { statusMap[b.status] = (statusMap[b.status] || 0) + 1; });
  return Object.entries(statusMap).map(([status, count]) => ({ status, count }));
})();

export const bookingsByDestination = (() => {
  const destMap: Record<string, { bookings: number; revenue: number; type: string; cancelled: number }> = {};
  bookings.forEach(b => {
    if (!destMap[b.destination]) destMap[b.destination] = { bookings: 0, revenue: 0, type: destinationTypes[b.destination], cancelled: 0 };
    destMap[b.destination].bookings++;
    destMap[b.destination].revenue += b.amount;
    if (b.status === "cancelled") destMap[b.destination].cancelled++;
  });
  return Object.entries(destMap)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .map(([destination, data]) => ({
      destination,
      bookings: data.bookings,
      revenue: data.revenue,
      type: data.type,
      cancellationRate: +((data.cancelled / data.bookings) * 100).toFixed(1),
    }));
})();

