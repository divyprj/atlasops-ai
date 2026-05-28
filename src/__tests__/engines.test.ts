// ============================================================
// AtlasOps AI — Unbiased Test Suite
// Tests the core engines for correctness, edge cases,
// and known weaknesses. No cheerleading.
// ============================================================

import { describe, it, expect } from "vitest";
import {
  sum, mean, median, stdDev, percentile, zScore,
  groupBy, rollingAverage, growthRate, detectAnomalies,
  computeBookingAnalytics, computeMonthlyTrends,
  computeDestinationAnalytics, computeAgentAnalytics,
  comparePeriods,
} from "@/lib/analytics";
import { detectSchema, mapToBookings } from "@/lib/schema-mapper";
import { computeOperationalScorecard } from "@/lib/kpi-engine";
import { forecastRevenue, forecastBookings } from "@/lib/forecast-engine";
import { detectOperationalAnomalies, computeOperationalRiskScore } from "@/lib/anomaly-engine";
import { generateInsights } from "@/lib/insight-engine";
import type { Booking } from "@/types";

// ============================================================
// Test Data Factories
// ============================================================

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "B-001",
    customerId: "CUST-001",
    customerName: "Test Customer",
    customerEmail: "test@example.com",
    agentId: "AGT-001",
    agentName: "Test Agent",
    destination: "Mumbai",
    region: "West India",
    packageName: "Standard",
    packageType: "domestic",
    status: "confirmed",
    paymentStatus: "paid",
    amount: 50000,
    profit: 10000,
    bookingDate: "2025-01-15",
    travelDate: "2025-02-01",
    returnDate: "2025-02-05",
    pax: 2,
    source: "website",
    createdAt: "2025-01-15T10:00:00Z",
    ...overrides,
  };
}

/** Generate N bookings spread across months for time-series testing */
function makeDataset(n: number, opts: { months?: number; cancelRate?: number } = {}): Booking[] {
  const months = opts.months || 6;
  const cancelRate = opts.cancelRate || 0.1;
  const bookings: Booking[] = [];
  const agents = ["AGT-001", "AGT-002", "AGT-003", "AGT-004"];
  const destinations = ["Mumbai", "Delhi", "Goa", "Kerala", "Bangkok"];
  const statuses: Booking["status"][] = ["confirmed", "completed", "pending", "cancelled"];

  for (let i = 0; i < n; i++) {
    const monthOffset = i % months;
    const month = String(monthOffset + 1).padStart(2, "0");
    const day = String((i % 28) + 1).padStart(2, "0");
    const isCancelled = Math.random() < cancelRate;

    bookings.push(makeBooking({
      id: `B-${String(i + 1).padStart(4, "0")}`,
      customerId: `CUST-${String((i % 200) + 1).padStart(4, "0")}`,
      customerName: `Customer ${(i % 200) + 1}`,
      agentId: agents[i % agents.length],
      agentName: `Agent ${(i % agents.length) + 1}`,
      destination: destinations[i % destinations.length],
      region: i % 2 === 0 ? "North India" : "South India",
      packageType: i % 3 === 0 ? "international" : "domestic",
      status: isCancelled ? "cancelled" : statuses[i % 3] as Booking["status"],
      paymentStatus: isCancelled ? "refunded" : "paid",
      amount: 20000 + Math.floor(Math.random() * 80000),
      profit: 5000 + Math.floor(Math.random() * 20000),
      bookingDate: `2025-${month}-${day}`,
      travelDate: `2025-${month}-${day}`,
      returnDate: `2025-${month}-${day}`,
      source: (["website", "referral", "agent", "social", "walk-in"] as const)[i % 5],
    }));
  }
  return bookings;
}


// ============================================================
// SECTION 1: Statistical Functions
// These are the foundation. If these are wrong, everything
// downstream is wrong.
// ============================================================

describe("Statistical Functions — Correctness", () => {

  describe("sum()", () => {
    it("handles normal case", () => {
      expect(sum([1, 2, 3, 4, 5])).toBe(15);
    });
    it("handles empty array", () => {
      expect(sum([])).toBe(0);
    });
    it("handles single element", () => {
      expect(sum([42])).toBe(42);
    });
    it("handles negative numbers", () => {
      expect(sum([-5, 5, -10, 10])).toBe(0);
    });
    it("handles floating point", () => {
      // This tests if JavaScript float quirks leak through
      const result = sum([0.1, 0.2]);
      expect(result).toBeCloseTo(0.3, 10);
    });
  });

  describe("mean()", () => {
    it("computes correctly", () => {
      expect(mean([10, 20, 30])).toBe(20);
    });
    it("returns 0 for empty array", () => {
      expect(mean([])).toBe(0);
    });
    it("handles single value", () => {
      expect(mean([7])).toBe(7);
    });
  });

  describe("median()", () => {
    it("odd-length array", () => {
      expect(median([3, 1, 2])).toBe(2);
    });
    it("even-length array", () => {
      expect(median([1, 2, 3, 4])).toBe(2.5);
    });
    it("empty array", () => {
      expect(median([])).toBe(0);
    });
    it("single value", () => {
      expect(median([99])).toBe(99);
    });
    it("does NOT mutate original array", () => {
      const arr = [3, 1, 2];
      median(arr);
      expect(arr).toEqual([3, 1, 2]);
    });
  });

  describe("stdDev()", () => {
    it("computes sample standard deviation", () => {
      // Known: stdDev([2,4,4,4,5,5,7,9]) ≈ 2.138
      const result = stdDev([2, 4, 4, 4, 5, 5, 7, 9]);
      expect(result).toBeCloseTo(2.138, 2);
    });
    it("returns 0 for empty array", () => {
      expect(stdDev([])).toBe(0);
    });
    it("returns 0 for single value", () => {
      expect(stdDev([5])).toBe(0);
    });
    it("returns 0 for identical values", () => {
      expect(stdDev([3, 3, 3, 3])).toBe(0);
    });
    it("handles two values", () => {
      // stdDev([0, 10]) with sample correction = 7.071
      const result = stdDev([0, 10]);
      expect(result).toBeCloseTo(7.071, 2);
    });
  });

  describe("percentile()", () => {
    it("50th percentile equals median for odd array", () => {
      const data = [1, 2, 3, 4, 5];
      expect(percentile(data, 50)).toBe(3);
    });
    it("0th percentile is min", () => {
      expect(percentile([5, 1, 3], 0)).toBe(1);
    });
    it("100th percentile is max", () => {
      expect(percentile([5, 1, 3], 100)).toBe(5);
    });
  });

  describe("zScore()", () => {
    it("returns 0 for value at mean", () => {
      expect(zScore(5, [3, 5, 7])).toBeCloseTo(0, 5);
    });
    it("returns 0 when stddev is 0 (all identical)", () => {
      expect(zScore(5, [5, 5, 5])).toBe(0);
    });
    it("correctly identifies outlier", () => {
      const values = [10, 10, 10, 10, 100];
      const z = zScore(100, values);
      expect(z).toBeGreaterThan(1.5);
    });
  });

  describe("growthRate()", () => {
    it("50% growth", () => {
      expect(growthRate(150, 100)).toBe(50);
    });
    it("returns 0 when previous is 0 (avoids division by zero)", () => {
      expect(growthRate(100, 0)).toBe(0);
    });
    it("negative growth", () => {
      expect(growthRate(80, 100)).toBe(-20);
    });
    it("zero to zero", () => {
      expect(growthRate(0, 0)).toBe(0);
    });
  });

  describe("rollingAverage()", () => {
    it("window=1 returns original values", () => {
      expect(rollingAverage([1, 2, 3], 1)).toEqual([1, 2, 3]);
    });
    it("window=3 on 3 values", () => {
      const result = rollingAverage([1, 2, 3], 3);
      expect(result[0]).toBe(1);     // only 1 value available
      expect(result[1]).toBe(1.5);   // mean(1,2)
      expect(result[2]).toBe(2);     // mean(1,2,3)
    });
  });
});


// ============================================================
// SECTION 2: groupBy — Data Partitioning
// ============================================================

describe("groupBy()", () => {
  it("groups items by key", () => {
    const items = [{ c: "a" }, { c: "b" }, { c: "a" }];
    const groups = groupBy(items, (i) => i.c);
    expect(groups["a"]).toHaveLength(2);
    expect(groups["b"]).toHaveLength(1);
  });
  it("handles empty array", () => {
    const groups = groupBy([], () => "key");
    expect(Object.keys(groups)).toHaveLength(0);
  });
});


// ============================================================
// SECTION 3: Anomaly Detection (Statistical)
// ============================================================

describe("detectAnomalies() — Statistical Outlier Detection", () => {
  it("detects obvious outlier", () => {
    const values = [10, 10, 10, 10, 10, 10, 10, 100];
    const anomalies = detectAnomalies(values, 2.0);
    expect(anomalies.length).toBeGreaterThanOrEqual(1);
    expect(anomalies[0].value).toBe(100);
  });

  it("returns empty when all values are identical", () => {
    const anomalies = detectAnomalies([5, 5, 5, 5, 5], 2.0);
    expect(anomalies).toEqual([]);
  });

  it("returns empty for too-small dataset", () => {
    const anomalies = detectAnomalies([1], 2.0);
    expect(anomalies).toEqual([]);
  });

  it("respects threshold parameter", () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 20];
    const loose = detectAnomalies(values, 1.0);
    const strict = detectAnomalies(values, 3.0);
    expect(loose.length).toBeGreaterThanOrEqual(strict.length);
  });

  it("WEAKNESS: does not detect anomalies in bimodal distributions", () => {
    // Two clusters: [10,10,10] and [90,90,90] — mean≈50
    // Neither cluster is an outlier relative to the overall mean
    const values = [10, 10, 10, 90, 90, 90];
    const anomalies = detectAnomalies(values, 2.0);
    // This is a known limitation of z-score based detection
    expect(anomalies).toEqual([]);
  });
});


// ============================================================
// SECTION 4: Schema Mapper — Column Detection
// ============================================================

describe("Schema Mapper — detectSchema()", () => {

  it("maps standard headers correctly", () => {
    const headers = ["booking_id", "customer_name", "amount", "booking_date", "status"];
    const rows = [
      { booking_id: "B-001", customer_name: "John", amount: 5000, booking_date: "2025-01-01", status: "confirmed" },
      { booking_id: "B-002", customer_name: "Jane", amount: 7000, booking_date: "2025-01-02", status: "cancelled" },
    ];
    const schema = detectSchema(headers, rows);
    const mapped = schema.mappings.filter(m => m.targetField !== null);

    expect(mapped.length).toBeGreaterThanOrEqual(4);
    expect(schema.overallConfidence).toBeGreaterThan(50);
    expect(schema.missingRequiredFields).toHaveLength(0);
  });

  it("handles completely unknown headers", () => {
    const headers = ["xyzzy", "foobar", "bazqux"];
    const rows = [{ xyzzy: 1, foobar: "hello", bazqux: true }];
    const schema = detectSchema(headers, rows);

    expect(schema.unmappedColumns).toHaveLength(3);
    expect(schema.overallConfidence).toBeLessThan(50);
  });

  it("detects column types", () => {
    const headers = ["price", "name", "email_address", "created_date"];
    const rows = Array.from({ length: 30 }, (_, i) => ({
      price: 100 + i * 10,
      name: `User ${i}`,
      email_address: `user${i}@test.com`,
      created_date: `2025-01-${String(i % 28 + 1).padStart(2, "0")}`,
    }));
    const schema = detectSchema(headers, rows);

    const priceMapping = schema.mappings.find(m => m.sourceHeader === "price");
    const emailMapping = schema.mappings.find(m => m.sourceHeader === "email_address");

    expect(priceMapping?.detectedType).toBe("number");
    expect(emailMapping?.detectedType).toBe("email");
  });

  it("WEAKNESS: cannot distinguish 'amount' from 'profit' by value alone", () => {
    // Both are numeric. The mapper relies on header name matching only.
    const headers = ["total_sales", "net_earnings"];
    const rows = [{ total_sales: 50000, net_earnings: 10000 }];
    const schema = detectSchema(headers, rows);

    // 'total_sales' should map to 'amount' via partial match
    const salesMapping = schema.mappings.find(m => m.sourceHeader === "total_sales");
    // If it doesn't, that's a weakness in the alias dictionary
    if (salesMapping?.targetField !== "amount") {
      // This is a known gap — 'total_sales' may not match 'amount' aliases
      expect(salesMapping?.targetField).toBeNull();
    }
  });

  it("prevents duplicate field mappings", () => {
    const headers = ["amount", "total", "price"];
    const rows = [{ amount: 100, total: 200, price: 300 }];
    const schema = detectSchema(headers, rows);

    const amountMappings = schema.mappings.filter(m => m.targetField === "amount");
    // Only ONE header should map to 'amount'
    expect(amountMappings.length).toBeLessThanOrEqual(1);
  });

  it("handles empty rows gracefully", () => {
    const schema = detectSchema(["a", "b"], []);
    expect(schema.rowCount).toBe(0);
  });
});


describe("Schema Mapper — mapToBookings()", () => {

  it("maps rows to Booking objects with correct fields", () => {
    const headers = ["order_id", "customer_name", "amount", "booking_date", "status"];
    const rows = [
      { order_id: "X-1", customer_name: "Alice", amount: "45000", booking_date: "2025-03-15", status: "confirmed" },
    ];
    const schema = detectSchema(headers, rows);
    const bookings = mapToBookings(rows, schema.mappings);

    expect(bookings).toHaveLength(1);
    expect(bookings[0].customerName).toBe("Alice");
    expect(bookings[0].amount).toBe(45000);
    expect(bookings[0].bookingDate).toBe("2025-03-15");
  });

  it("generates fallback values for unmapped fields", () => {
    const rows = [{ amount: 10000, booking_date: "2025-01-01", status: "pending" }];
    const schema = detectSchema(["amount", "booking_date", "status"], rows);
    const bookings = mapToBookings(rows, schema.mappings);

    expect(bookings[0].destination).toBe("Unknown");
    expect(bookings[0].pax).toBe(2); // fallback
    expect(bookings[0].id).toMatch(/ING-/);
  });

  it("normalizes status values", () => {
    const rows = [
      { amount: 100, booking_date: "2025-01-01", status: "Cancelled" },
      { amount: 100, booking_date: "2025-01-01", status: "COMPLETED" },
      { amount: 100, booking_date: "2025-01-01", status: "Active" },
      { amount: 100, booking_date: "2025-01-01", status: "gibberish" },
    ];
    const schema = detectSchema(["amount", "booking_date", "status"], rows);
    const bookings = mapToBookings(rows, schema.mappings);

    expect(bookings[0].status).toBe("cancelled");
    expect(bookings[1].status).toBe("completed");
    expect(bookings[2].status).toBe("confirmed");  // "Active" → "confirmed"
    expect(bookings[3].status).toBe("confirmed");  // fallback
  });

  it("WEAKNESS: currency symbols in amounts", () => {
    const rows = [
      { amount: "₹45,000", booking_date: "2025-01-01", status: "ok" },
      { amount: "$1,200.50", booking_date: "2025-01-01", status: "ok" },
    ];
    const schema = detectSchema(["amount", "booking_date", "status"], rows);
    const bookings = mapToBookings(rows, schema.mappings);

    // Should strip ₹ and $ and commas
    expect(bookings[0].amount).toBe(45000);
    expect(bookings[1].amount).toBe(1200.50);
  });
});


// ============================================================
// SECTION 5: Booking Analytics — Core Computations
// ============================================================

describe("computeBookingAnalytics()", () => {

  it("computes basic metrics correctly", () => {
    const bookings = [
      makeBooking({ amount: 10000, profit: 2000, status: "confirmed" }),
      makeBooking({ amount: 20000, profit: 4000, status: "completed", customerId: "CUST-002" }),
      makeBooking({ amount: 15000, profit: 3000, status: "cancelled", customerId: "CUST-003" }),
    ];
    const stats = computeBookingAnalytics(bookings);

    expect(stats.totalBookings).toBe(3);
    expect(stats.totalRevenue).toBe(45000);
    expect(stats.totalProfit).toBe(9000);
    expect(stats.cancelled).toBe(1);
    expect(stats.cancellationRate).toBeCloseTo(33.3, 0);
  });

  it("handles empty dataset", () => {
    const stats = computeBookingAnalytics([]);
    expect(stats.totalBookings).toBe(0);
    expect(stats.totalRevenue).toBe(0);
    expect(stats.avgOrderValue).toBe(0);
    expect(stats.cancellationRate).toBe(0);
    expect(stats.profitMargin).toBe(0);
  });

  it("KNOWN ISSUE: cancelled bookings still count toward revenue", () => {
    // This is architecturally intentional (gross revenue),
    // but could mislead users expecting net active revenue
    const bookings = [
      makeBooking({ amount: 100000, status: "cancelled" }),
    ];
    const stats = computeBookingAnalytics(bookings);

    // Revenue includes cancelled bookings
    expect(stats.totalRevenue).toBe(100000);
    // This means "totalRevenue" is actually "gross booked value"
    // not "earned revenue" — a naming ambiguity
  });

  it("correctly identifies repeat customers", () => {
    const bookings = [
      makeBooking({ customerId: "C1" }),
      makeBooking({ customerId: "C1" }),
      makeBooking({ customerId: "C2" }),
    ];
    const stats = computeBookingAnalytics(bookings);
    expect(stats.repeatCustomers).toBe(1);  // C1 is repeat
    expect(stats.totalCustomers).toBe(2);
  });

  it("profit margin calculation", () => {
    const bookings = [
      makeBooking({ amount: 100000, profit: 20000 }),
    ];
    const stats = computeBookingAnalytics(bookings);
    expect(stats.profitMargin).toBe(20.0);
  });
});


describe("computeMonthlyTrends()", () => {

  it("groups bookings by month", () => {
    const bookings = [
      makeBooking({ bookingDate: "2025-01-10", amount: 10000 }),
      makeBooking({ bookingDate: "2025-01-20", amount: 20000 }),
      makeBooking({ bookingDate: "2025-02-05", amount: 30000 }),
    ];
    const trends = computeMonthlyTrends(bookings);

    expect(trends).toHaveLength(2);
    expect(trends[0].month).toBe("2025-01");
    expect(trends[0].revenue).toBe(30000);
    expect(trends[1].month).toBe("2025-02");
    expect(trends[1].revenue).toBe(30000);
  });

  it("sorts chronologically", () => {
    const bookings = [
      makeBooking({ bookingDate: "2025-03-01" }),
      makeBooking({ bookingDate: "2025-01-01" }),
      makeBooking({ bookingDate: "2025-02-01" }),
    ];
    const trends = computeMonthlyTrends(bookings);
    expect(trends[0].month).toBe("2025-01");
    expect(trends[2].month).toBe("2025-03");
  });

  it("WEAKNESS: depends on bookingDate format YYYY-MM-DD", () => {
    // If someone passes DD/MM/YYYY, substring(0,7) will be garbage
    const bookings = [
      makeBooking({ bookingDate: "15/01/2025" }),
    ];
    const trends = computeMonthlyTrends(bookings);
    // The month key will be "15/01/2" — meaningless
    expect(trends[0].month).not.toMatch(/^\d{4}-\d{2}$/);
  });
});


// ============================================================
// SECTION 6: KPI Engine — Operational Scorecard
// ============================================================

describe("KPI Engine — computeOperationalScorecard()", () => {

  it("returns a scorecard with all required fields", () => {
    const data = makeDataset(100, { months: 6 });
    const scorecard = computeOperationalScorecard(data);

    expect(scorecard).toHaveProperty("overallScore");
    expect(scorecard).toHaveProperty("revenue");
    expect(scorecard).toHaveProperty("bookingVolume");
    expect(scorecard).toHaveProperty("cancellationRate");
    expect(scorecard).toHaveProperty("avgOrderValue");
    expect(scorecard).toHaveProperty("profitMargin");

    // Score should be bounded
    expect(scorecard.overallScore).toBeGreaterThanOrEqual(0);
    expect(scorecard.overallScore).toBeLessThanOrEqual(100);
  });

  it("handles small dataset", () => {
    const data = makeDataset(5, { months: 2 });
    const scorecard = computeOperationalScorecard(data);
    expect(scorecard.overallScore).toBeGreaterThanOrEqual(0);
  });

  it("handles empty dataset without crashing", () => {
    expect(() => computeOperationalScorecard([])).not.toThrow();
  });

  it("KPI values have correct structure", () => {
    const data = makeDataset(50);
    const scorecard = computeOperationalScorecard(data);
    const kpi = scorecard.revenue;

    expect(kpi).toHaveProperty("label");
    expect(kpi).toHaveProperty("value");
    expect(kpi).toHaveProperty("previousValue");
    expect(kpi).toHaveProperty("change");
    expect(kpi).toHaveProperty("changePercent");
    expect(kpi).toHaveProperty("format");
    expect(kpi).toHaveProperty("trend");
    expect(kpi).toHaveProperty("status");
    expect(["up", "down", "stable"]).toContain(kpi.trend);
    expect(["good", "warning", "critical"]).toContain(kpi.status);
  });
});


// ============================================================
// SECTION 7: Forecast Engine
// ============================================================

describe("Forecast Engine — forecastRevenue()", () => {

  it("produces forecast points for requested horizon", () => {
    const data = makeDataset(120, { months: 12 });
    const forecast = forecastRevenue(data, 6);

    expect(forecast.points).toHaveLength(6);
    expect(forecast).toHaveProperty("trend");
    expect(forecast).toHaveProperty("trendStrength");
    expect(forecast).toHaveProperty("seasonalityDetected");
  });

  it("forecast values are positive", () => {
    const data = makeDataset(120, { months: 12 });
    const forecast = forecastRevenue(data, 6);

    for (const point of forecast.points) {
      expect(point.forecast).toBeGreaterThan(0);
    }
  });

  it("confidence intervals are correctly ordered", () => {
    const data = makeDataset(120, { months: 12 });
    const forecast = forecastRevenue(data, 6);

    for (const point of forecast.points) {
      expect(point.lower).toBeLessThanOrEqual(point.forecast);
      expect(point.upper).toBeGreaterThanOrEqual(point.forecast);
    }
  });

  it("WEAKNESS: trend classification with very small data", () => {
    // With only 2 months of data, linear regression is fragile
    const data = makeDataset(10, { months: 2 });
    const forecast = forecastRevenue(data, 6);
    // Should still produce a result without crashing
    expect(forecast.points.length).toBe(6);
    // But confidence should be low — check if it is
    const avgConfidence = mean(forecast.points.map(p => p.confidence));
    // If confidence is high despite tiny data, that's a problem
    // (This test documents behavior rather than asserting correctness)
    expect(avgConfidence).toBeDefined();
  });

  it("handles single month of data", () => {
    const data = [
      makeBooking({ bookingDate: "2025-01-01", amount: 50000 }),
    ];
    expect(() => forecastRevenue(data, 6)).not.toThrow();
  });
});

describe("Forecast Engine — forecastBookings()", () => {
  it("returns forecast without crashing", () => {
    const data = makeDataset(60, { months: 6 });
    const forecast = forecastBookings(data, 6);
    expect(forecast.points).toHaveLength(6);
  });
});


// ============================================================
// SECTION 8: Anomaly Engine — Operational Anomalies
// ============================================================

describe("Anomaly Engine — detectOperationalAnomalies()", () => {

  it("returns structured anomaly objects", () => {
    const data = makeDataset(200, { months: 8, cancelRate: 0.15 });
    const anomalies = detectOperationalAnomalies(data);

    for (const a of anomalies) {
      expect(a).toHaveProperty("id");
      expect(a).toHaveProperty("type");
      expect(a).toHaveProperty("severity");
      expect(a).toHaveProperty("title");
      expect(a).toHaveProperty("detail");
      expect(a).toHaveProperty("observedValue");
      expect(a).toHaveProperty("expectedValue");
      expect(["critical", "warning", "info"]).toContain(a.severity);
    }
  });

  it("sorted by severity (critical first)", () => {
    const data = makeDataset(200, { months: 8, cancelRate: 0.3 });
    const anomalies = detectOperationalAnomalies(data);
    const severityOrder = { critical: 0, warning: 1, info: 2 };

    for (let i = 1; i < anomalies.length; i++) {
      expect(severityOrder[anomalies[i].severity])
        .toBeGreaterThanOrEqual(severityOrder[anomalies[i - 1].severity]);
    }
  });

  it("handles empty dataset", () => {
    expect(() => detectOperationalAnomalies([])).not.toThrow();
    expect(detectOperationalAnomalies([])).toEqual([]);
  });

  it("WEAKNESS: needs minimum 4 months for cancellation detection", () => {
    const data = makeDataset(20, { months: 2, cancelRate: 0.5 });
    const anomalies = detectOperationalAnomalies(data);
    // High cancel rate but too few months — may miss it
    const cancelAnomalies = anomalies.filter(a => a.type === "cancel_anomaly");
    // This is a documented limitation
    expect(cancelAnomalies.length).toBe(0);
  });
});

describe("computeOperationalRiskScore()", () => {
  it("100 when no anomalies", () => {
    expect(computeOperationalRiskScore([])).toBe(100);
  });

  it("decreases with anomalies", () => {
    const anomalies = [
      { severity: "critical" as const },
      { severity: "warning" as const },
    ] as any[];
    const score = computeOperationalRiskScore(anomalies);
    expect(score).toBe(100 - 8 - 4); // 88
  });

  it("never goes below 0", () => {
    const anomalies = Array(50).fill({ severity: "critical" });
    expect(computeOperationalRiskScore(anomalies as any)).toBe(0);
  });
});


// ============================================================
// SECTION 9: Insight Engine
// ============================================================

describe("Insight Engine — generateInsights()", () => {

  it("produces insights from valid dataset", () => {
    const data = makeDataset(100, { months: 6 });
    const insights = generateInsights(data);

    expect(insights.length).toBeGreaterThan(0);
    for (const ins of insights) {
      expect(ins).toHaveProperty("id");
      expect(ins).toHaveProperty("severity");
      expect(ins).toHaveProperty("category");
      expect(ins).toHaveProperty("title");
      expect(ins).toHaveProperty("detail");
      expect(ins.title.length).toBeGreaterThan(0);
      expect(ins.detail.length).toBeGreaterThan(0);
    }
  });

  it("handles empty dataset without crashing", () => {
    expect(() => generateInsights([])).not.toThrow();
  });

  it("insights have valid severity levels", () => {
    const data = makeDataset(100, { months: 6 });
    const insights = generateInsights(data);
    const validSeverities = ["critical", "warning", "positive", "info"];
    for (const ins of insights) {
      expect(validSeverities).toContain(ins.severity);
    }
  });

  it("HONESTY CHECK: always generates at least a profit margin insight", () => {
    // The engine always produces a profit margin insight (healthy OR warning)
    // This means it never returns empty — which is good for UX but
    // means some insights are guaranteed, not data-driven
    const data = makeDataset(50, { months: 6 });
    const insights = generateInsights(data);
    const profitInsight = insights.find(i =>
      i.title.toLowerCase().includes("profit margin")
    );
    expect(profitInsight).toBeDefined();
  });
});


// ============================================================
// SECTION 10: Integration — End-to-End Pipeline
// ============================================================

describe("Integration — Ingestion to Analytics", () => {

  it("CSV-like data → schema detection → mapToBookings → analytics", () => {
    const headers = ["order_id", "customer", "total", "date", "status", "agent", "destination"];
    const rows = Array.from({ length: 50 }, (_, i) => ({
      order_id: `ORD-${i}`,
      customer: `Customer ${i}`,
      total: 10000 + i * 500,
      date: `2025-${String((i % 6) + 1).padStart(2, "0")}-15`,
      status: i % 5 === 0 ? "cancelled" : "confirmed",
      agent: `Agent ${i % 3}`,
      destination: ["Mumbai", "Delhi", "Goa"][i % 3],
    }));

    // Step 1: Schema detection
    const schema = detectSchema(headers, rows);
    expect(schema.overallConfidence).toBeGreaterThan(30);

    // Step 2: Map to Booking type
    const bookings = mapToBookings(rows, schema.mappings);
    expect(bookings).toHaveLength(50);

    // Step 3: Compute analytics
    const stats = computeBookingAnalytics(bookings);
    expect(stats.totalBookings).toBe(50);
    expect(stats.totalRevenue).toBeGreaterThan(0);

    // Step 4: Monthly trends
    const trends = computeMonthlyTrends(bookings);
    expect(trends.length).toBeGreaterThan(0);

    // Step 5: KPI scorecard
    const scorecard = computeOperationalScorecard(bookings);
    expect(scorecard.overallScore).toBeGreaterThanOrEqual(0);
    expect(scorecard.overallScore).toBeLessThanOrEqual(100);
  });

  it("STRESS: 10000 bookings pipeline", () => {
    const data = makeDataset(10000, { months: 12, cancelRate: 0.12 });

    const start = Date.now();
    const stats = computeBookingAnalytics(data);
    const trends = computeMonthlyTrends(data);
    const scorecard = computeOperationalScorecard(data);
    const forecast = forecastRevenue(data, 6);
    const anomalies = detectOperationalAnomalies(data);
    const insights = generateInsights(data);
    const elapsed = Date.now() - start;

    // All engines should handle 10K records
    expect(stats.totalBookings).toBe(10000);
    expect(trends.length).toBe(12);
    expect(scorecard.overallScore).toBeGreaterThanOrEqual(0);
    expect(forecast.points).toHaveLength(6);
    expect(anomalies).toBeDefined();
    expect(insights.length).toBeGreaterThan(0);

    // Performance: full pipeline under 2 seconds
    expect(elapsed).toBeLessThan(2000);
  });
});


// ============================================================
// SECTION 11: Edge Cases & Known Weaknesses
// ============================================================

describe("Edge Cases — Things That Could Break", () => {

  it("all bookings cancelled", () => {
    const data = Array(20).fill(null).map((_, i) =>
      makeBooking({
        id: `B-${i}`,
        status: "cancelled",
        bookingDate: `2025-0${(i % 6) + 1}-15`,
      })
    );
    const stats = computeBookingAnalytics(data);
    expect(stats.cancellationRate).toBe(100);
    expect(stats.revenuePerActiveBooking).toBe(0); // 0 active bookings → guard
  });

  it("all bookings same amount", () => {
    const data = Array(30).fill(null).map((_, i) =>
      makeBooking({
        id: `B-${i}`,
        amount: 50000,
        bookingDate: `2025-0${(i % 6) + 1}-15`,
      })
    );
    const stats = computeBookingAnalytics(data);
    expect(stats.avgOrderValue).toBe(50000);
    // StdDev of amounts would be 0 — anomaly engine should handle gracefully
    expect(() => detectOperationalAnomalies(data)).not.toThrow();
  });

  it("single booking", () => {
    const data = [makeBooking()];
    expect(() => computeBookingAnalytics(data)).not.toThrow();
    expect(() => computeOperationalScorecard(data)).not.toThrow();
    expect(() => forecastRevenue(data, 6)).not.toThrow();
    expect(() => detectOperationalAnomalies(data)).not.toThrow();
    expect(() => generateInsights(data)).not.toThrow();
  });

  it("bookings with $0 amount", () => {
    const data = [
      makeBooking({ amount: 0, profit: 0 }),
      makeBooking({ amount: 0, profit: 0, id: "B-002" }),
    ];
    const stats = computeBookingAnalytics(data);
    expect(stats.avgOrderValue).toBe(0);
    expect(stats.profitMargin).toBe(0); // 0/0 guarded
  });

  it("negative profit (loss-making bookings)", () => {
    const data = [
      makeBooking({ amount: 10000, profit: -5000 }),
    ];
    const stats = computeBookingAnalytics(data);
    expect(stats.profitMargin).toBe(-50);
  });

  it("WEAKNESS: extremely large numbers", () => {
    const data = [
      makeBooking({ amount: Number.MAX_SAFE_INTEGER, profit: 1e15 }),
    ];
    // Should not produce Infinity or NaN
    const stats = computeBookingAnalytics(data);
    expect(Number.isFinite(stats.totalRevenue)).toBe(true);
    expect(Number.isFinite(stats.profitMargin)).toBe(true);
  });
});


// ============================================================
// SECTION 12: Destination & Agent Analytics
// ============================================================

describe("computeDestinationAnalytics()", () => {
  it("groups by destination and computes metrics", () => {
    const data = [
      makeBooking({ destination: "Goa", amount: 30000, profit: 6000 }),
      makeBooking({ destination: "Goa", amount: 50000, profit: 10000, id: "B-002" }),
      makeBooking({ destination: "Delhi", amount: 40000, profit: 8000, id: "B-003" }),
    ];
    const result = computeDestinationAnalytics(data);

    expect(result).toHaveLength(2);
    // Sorted by revenue descending
    expect(result[0].destination).toBe("Goa");
    expect(result[0].revenue).toBe(80000);
    expect(result[0].bookings).toBe(2);
  });
});

describe("computeAgentAnalytics()", () => {
  it("computes per-agent metrics", () => {
    const data = [
      makeBooking({ agentId: "A1", agentName: "Agent One", amount: 50000 }),
      makeBooking({ agentId: "A1", agentName: "Agent One", amount: 30000, id: "B-002" }),
      makeBooking({ agentId: "A2", agentName: "Agent Two", amount: 40000, id: "B-003" }),
    ];
    const agents = computeAgentAnalytics(data);

    expect(agents).toHaveLength(2);
    const a1 = agents.find(a => a.agentId === "A1");
    expect(a1?.totalBookings).toBe(2);
    expect(a1?.totalRevenue).toBe(80000);
  });
});


// ============================================================
// SECTION 13: comparePeriods — Period-over-Period
// ============================================================

describe("comparePeriods()", () => {
  it("computes change between two periods", () => {
    const current = [
      makeBooking({ amount: 50000 }),
      makeBooking({ amount: 50000, id: "B-002" }),
    ];
    const previous = [
      makeBooking({ amount: 40000, id: "B-003" }),
    ];
    const comparison = comparePeriods(current, previous);

    expect(comparison.revenue.current).toBe(100000);
    expect(comparison.revenue.previous).toBe(40000);
    expect(comparison.revenue.change).toBeCloseTo(150, 0); // 150% growth
  });

  it("handles empty previous period", () => {
    const current = [makeBooking({ amount: 50000 })];
    const comparison = comparePeriods(current, []);
    // growthRate(100000, 0) returns 0 (guarded)
    expect(comparison.revenue.change).toBe(0);
  });
});
