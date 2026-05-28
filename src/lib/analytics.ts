// ============================================================
// AtlasOps AI — Core Analytics Engine
// SQL-style aggregation, rolling averages, trend analysis
// ============================================================

import { Booking } from "@/types";

// --- Grouping & Aggregation ---

export function groupBy<T, K extends string>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const groups = {} as Record<K, T[]>;
  for (const item of items) {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

export function aggregate<T>(
  items: T[],
  fns: Record<string, (items: T[]) => number>
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [key, fn] of Object.entries(fns)) {
    result[key] = fn(items);
  }
  return result;
}

// --- Statistical Functions ---

export function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return sum(values) / values.length;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const squaredDiffs = values.map(v => (v - avg) ** 2);
  return Math.sqrt(sum(squaredDiffs) / (values.length - 1));
}

export function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

export function zScore(value: number, values: number[]): number {
  const avg = mean(values);
  const sd = stdDev(values);
  if (sd === 0) return 0;
  return (value - avg) / sd;
}

// --- Time Series ---

export function rollingAverage(values: number[], window: number): number[] {
  return values.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    return mean(slice);
  });
}

export function growthRate(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function monthOverMonth(
  monthlySeries: { month: string; value: number }[]
): { month: string; value: number; change: number; changePercent: number }[] {
  return monthlySeries.map((item, i) => {
    const prev = i > 0 ? monthlySeries[i - 1].value : item.value;
    return {
      ...item,
      change: item.value - prev,
      changePercent: growthRate(item.value, prev),
    };
  });
}

export function weekOverWeek(
  weeklySeries: { week: string; value: number }[]
): { week: string; value: number; change: number; changePercent: number }[] {
  return weeklySeries.map((item, i) => {
    const prev = i > 0 ? weeklySeries[i - 1].value : item.value;
    return {
      ...item,
      change: item.value - prev,
      changePercent: growthRate(item.value, prev),
    };
  });
}

// --- Anomaly Detection ---

export function detectAnomalies(
  values: number[],
  threshold: number = 2.0
): { index: number; value: number; zScore: number }[] {
  const avg = mean(values);
  const sd = stdDev(values);
  if (sd === 0) return [];
  return values
    .map((v, i) => ({ index: i, value: v, zScore: (v - avg) / sd }))
    .filter(item => Math.abs(item.zScore) > threshold);
}

// --- Booking-Specific Analytics ---

export function computeBookingAnalytics(bookings: Booking[]) {
  const totalBookings = bookings.length;
  const totalRevenue = sum(bookings.map(b => b.amount));
  const totalProfit = sum(bookings.map(b => b.profit));

  const byStatus = groupBy(bookings, b => b.status);
  const confirmed = (byStatus["confirmed"]?.length || 0);
  const completed = (byStatus["completed"]?.length || 0);
  const cancelled = (byStatus["cancelled"]?.length || 0);
  const pending = (byStatus["pending"]?.length || 0);

  const cancellationRate = totalBookings > 0 ? (cancelled / totalBookings) * 100 : 0;
  const avgOrderValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Revenue per booking (excluding cancelled)
  const activeBookings = totalBookings - cancelled;
  const revenuePerActiveBooking = activeBookings > 0 ? totalRevenue / activeBookings : 0;

  // Domestic vs International
  const byType = groupBy(bookings, b => b.packageType);
  const domesticRevenue = sum((byType["domestic"] || []).map(b => b.amount));
  const internationalRevenue = sum((byType["international"] || []).map(b => b.amount));
  const internationalShare = totalRevenue > 0 ? (internationalRevenue / totalRevenue) * 100 : 0;

  // Repeat customers
  const customerBookings = groupBy(bookings, b => b.customerId);
  const repeatCustomers = Object.values(customerBookings).filter(bs => bs.length > 1).length;
  const totalCustomers = Object.keys(customerBookings).length;
  const repeatRatio = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

  return {
    totalBookings,
    totalRevenue,
    totalProfit,
    confirmed,
    completed,
    cancelled,
    pending,
    cancellationRate: +cancellationRate.toFixed(1),
    avgOrderValue: Math.round(avgOrderValue),
    profitMargin: +profitMargin.toFixed(1),
    revenuePerActiveBooking: Math.round(revenuePerActiveBooking),
    domesticRevenue,
    internationalRevenue,
    internationalShare: +internationalShare.toFixed(1),
    repeatCustomers,
    totalCustomers,
    repeatRatio: +repeatRatio.toFixed(1),
  };
}

export function computeMonthlyTrends(bookings: Booking[]) {
  const byMonth = groupBy(bookings, b => b.bookingDate.substring(0, 7));

  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, bks]) => {
      const revenue = sum(bks.map(b => b.amount));
      const profit = sum(bks.map(b => b.profit));
      const domestic = sum(bks.filter(b => b.packageType === "domestic").map(b => b.amount));
      const international = sum(bks.filter(b => b.packageType === "international").map(b => b.amount));
      const cancellations = bks.filter(b => b.status === "cancelled").length;

      return {
        month,
        bookings: bks.length,
        revenue,
        profit,
        domestic,
        international,
        cancellations,
        cancellationRate: +(cancellations / bks.length * 100).toFixed(1),
        avgOrderValue: Math.round(revenue / bks.length),
      };
    });
}

export function computeWeeklyTrends(bookings: Booking[]) {
  const getWeek = (dateStr: string) => {
    const d = new Date(dateStr);
    const start = new Date(d.getFullYear(), 0, 1);
    const diff = d.getTime() - start.getTime();
    const weekNum = Math.ceil(diff / (7 * 86400000));
    return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
  };

  const byWeek = groupBy(bookings, b => getWeek(b.bookingDate));

  return Object.entries(byWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, bks]) => ({
      week,
      bookings: bks.length,
      revenue: sum(bks.map(b => b.amount)),
      cancellations: bks.filter(b => b.status === "cancelled").length,
    }));
}

export function computeDestinationAnalytics(bookings: Booking[]) {
  const byDest = groupBy(bookings, b => b.destination);

  return Object.entries(byDest)
    .map(([destination, bks]) => {
      const revenue = sum(bks.map(b => b.amount));
      const profit = sum(bks.map(b => b.profit));
      const cancelled = bks.filter(b => b.status === "cancelled").length;
      const avgValue = Math.round(revenue / bks.length);

      return {
        destination,
        bookings: bks.length,
        revenue,
        profit,
        avgValue,
        cancellationRate: +(cancelled / bks.length * 100).toFixed(1),
        profitMargin: +(profit / revenue * 100).toFixed(1),
        type: bks[0]?.packageType || "domestic",
        region: bks[0]?.region || "Unknown",
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

export function computeAgentAnalytics(bookings: Booking[]) {
  const byAgent = groupBy(bookings, b => b.agentId);

  return Object.entries(byAgent)
    .map(([agentId, bks]) => {
      const revenue = sum(bks.map(b => b.amount));
      const profit = sum(bks.map(b => b.profit));
      const cancelled = bks.filter(b => b.status === "cancelled").length;
      const completed = bks.filter(b => b.status === "completed").length;
      const totalCount = bks.length;

      return {
        agentId,
        agentName: bks[0]?.agentName || agentId,
        totalBookings: totalCount,
        totalRevenue: revenue,
        totalProfit: profit,
        cancellations: cancelled,
        cancellationRate: +(cancelled / totalCount * 100).toFixed(1),
        completionRate: +(completed / totalCount * 100).toFixed(1),
        avgBookingValue: Math.round(revenue / totalCount),
        profitMargin: +(profit / revenue * 100).toFixed(1),
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export function computeRegionalAnalytics(bookings: Booking[]) {
  const byRegion = groupBy(bookings, b => b.region);

  return Object.entries(byRegion)
    .map(([region, bks]) => ({
      region,
      bookings: bks.length,
      revenue: sum(bks.map(b => b.amount)),
      profit: sum(bks.map(b => b.profit)),
      avgValue: Math.round(sum(bks.map(b => b.amount)) / bks.length),
      cancellationRate: +(bks.filter(b => b.status === "cancelled").length / bks.length * 100).toFixed(1),
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

// --- Period Comparison ---

export function comparePeriods(
  currentBookings: Booking[],
  previousBookings: Booking[]
) {
  const current = computeBookingAnalytics(currentBookings);
  const previous = computeBookingAnalytics(previousBookings);

  return {
    revenue: { current: current.totalRevenue, previous: previous.totalRevenue, change: growthRate(current.totalRevenue, previous.totalRevenue) },
    bookings: { current: current.totalBookings, previous: previous.totalBookings, change: growthRate(current.totalBookings, previous.totalBookings) },
    cancellationRate: { current: current.cancellationRate, previous: previous.cancellationRate, change: +(current.cancellationRate - previous.cancellationRate).toFixed(1) },
    avgOrderValue: { current: current.avgOrderValue, previous: previous.avgOrderValue, change: growthRate(current.avgOrderValue, previous.avgOrderValue) },
    profitMargin: { current: current.profitMargin, previous: previous.profitMargin, change: +(current.profitMargin - previous.profitMargin).toFixed(1) },
    repeatRatio: { current: current.repeatRatio, previous: previous.repeatRatio, change: +(current.repeatRatio - previous.repeatRatio).toFixed(1) },
  };
}

// --- Source Analytics ---

export function computeSourceAnalytics(bookings: Booking[]) {
  const bySource = groupBy(bookings, b => b.source);

  return Object.entries(bySource)
    .map(([source, bks]) => ({
      source,
      count: bks.length,
      revenue: sum(bks.map(b => b.amount)),
      share: +(bks.length / bookings.length * 100).toFixed(1),
      avgValue: Math.round(sum(bks.map(b => b.amount)) / bks.length),
      cancellationRate: +(bks.filter(b => b.status === "cancelled").length / bks.length * 100).toFixed(1),
    }))
    .sort((a, b) => b.count - a.count);
}

// --- Day of Week Analysis ---

export function computeDayOfWeekAnalytics(bookings: Booking[]) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const byDay = groupBy(bookings, b => {
    const d = new Date(b.bookingDate);
    return dayNames[d.getDay()] as string;
  });

  return dayNames.map(day => ({
    day,
    bookings: byDay[day]?.length || 0,
    revenue: sum((byDay[day] || []).map(b => b.amount)),
    cancellationRate: byDay[day]
      ? +(byDay[day].filter(b => b.status === "cancelled").length / byDay[day].length * 100).toFixed(1)
      : 0,
  }));
}
