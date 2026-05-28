// ============================================================
// AtlasOps AI — Revenue Data (Derived from Bookings)
// All revenue data is computed from actual booking records
// ============================================================

import { RevenueDataPoint } from "@/types";
import { bookings } from "./bookings";
import {
  computeBookingAnalytics,
  computeMonthlyTrends,
  computeDestinationAnalytics,
  computeRegionalAnalytics,
  groupBy,
  sum,
} from "@/lib/analytics";

// --- Monthly Revenue (derived from bookings) ---

const monthlyTrends = computeMonthlyTrends(bookings);

export const monthlyRevenue: RevenueDataPoint[] = monthlyTrends.map(m => {
  const monthBookings = bookings.filter(b => b.bookingDate.startsWith(m.month));
  const domesticRev = sum(monthBookings.filter(b => b.packageType === "domestic").map(b => b.amount));
  const intlRev = sum(monthBookings.filter(b => b.packageType === "international").map(b => b.amount));

  return {
    date: m.month,
    revenue: m.revenue,
    bookings: m.bookings,
    cancellations: m.cancellations,
    profit: m.profit,
    domestic: domesticRev,
    international: intlRev,
  };
});

// --- Weekly Revenue (last 24 weeks from bookings) ---

function computeWeeklyRevenue(): RevenueDataPoint[] {
  const recentBookings = bookings.filter(b => b.bookingDate >= "2024-12-01");
  const getWeekKey = (dateStr: string) => {
    const d = new Date(dateStr);
    const start = new Date(2024, 11, 2); // Dec 2 = Mon
    const diff = Math.floor((d.getTime() - start.getTime()) / (7 * 86400000));
    return `W${String(Math.max(1, diff + 1)).padStart(2, "0")}`;
  };

  const byWeek = groupBy(recentBookings, b => getWeekKey(b.bookingDate));

  return Object.entries(byWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 24)
    .map(([week, bks]) => {
      const revenue = sum(bks.map(b => b.amount));
      const domestic = sum(bks.filter(b => b.packageType === "domestic").map(b => b.amount));
      const intl = sum(bks.filter(b => b.packageType === "international").map(b => b.amount));
      return {
        date: week,
        revenue,
        bookings: bks.length,
        cancellations: bks.filter(b => b.status === "cancelled").length,
        profit: sum(bks.map(b => b.profit)),
        domestic,
        international: intl,
      };
    });
}

export const weeklyRevenue = computeWeeklyRevenue();

// --- Daily Revenue (last 90 days from bookings) ---

function computeDailyRevenue(): RevenueDataPoint[] {
  const cutoff = new Date(2025, 2, 1); // Mar 1
  const recentBookings = bookings.filter(b => {
    const d = new Date(b.bookingDate);
    return d >= new Date(cutoff.getTime() - 90 * 86400000) && d <= cutoff;
  });

  const byDay = groupBy(recentBookings, b => b.bookingDate);

  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, bks]) => {
      const revenue = sum(bks.map(b => b.amount));
      return {
        date,
        revenue,
        bookings: bks.length,
        cancellations: bks.filter(b => b.status === "cancelled").length,
        profit: sum(bks.map(b => b.profit)),
        domestic: sum(bks.filter(b => b.packageType === "domestic").map(b => b.amount)),
        international: sum(bks.filter(b => b.packageType === "international").map(b => b.amount)),
      };
    });
}

export const dailyRevenue = computeDailyRevenue();

// --- Revenue Summary (computed from all bookings) ---

const allAnalytics = computeBookingAnalytics(bookings);

// Period comparison: last 6 months vs previous 6 months
const recentBookings = bookings.filter(b => b.bookingDate >= "2024-12-01");
const previousBookings = bookings.filter(b => b.bookingDate >= "2024-06-01" && b.bookingDate < "2024-12-01");
const recentAnalytics = computeBookingAnalytics(recentBookings);
const previousAnalytics = computeBookingAnalytics(previousBookings);
const revenueGrowth = previousAnalytics.totalRevenue > 0
  ? +((recentAnalytics.totalRevenue - previousAnalytics.totalRevenue) / previousAnalytics.totalRevenue * 100).toFixed(1)
  : 0;

export const revenueSummary = {
  totalRevenue: allAnalytics.totalRevenue,
  totalProfit: allAnalytics.totalProfit,
  avgOrderValue: allAnalytics.avgOrderValue,
  revenueGrowth,
  profitMargin: allAnalytics.profitMargin,
  domesticRevenue: allAnalytics.domesticRevenue,
  internationalRevenue: allAnalytics.internationalRevenue,
  internationalShare: allAnalytics.internationalShare,
  totalBookings: allAnalytics.totalBookings,
  cancellationRate: allAnalytics.cancellationRate,
  repeatRatio: allAnalytics.repeatRatio,
};

// --- Regional Revenue (computed from bookings) ---

export const revenueByRegion = computeRegionalAnalytics(bookings).map(r => {
  // Compute growth by comparing H2 2024 vs H1 2024 for this region
  const regionRecent = bookings.filter(b => b.region === r.region && b.bookingDate >= "2024-07-01");
  const regionPrev = bookings.filter(b => b.region === r.region && b.bookingDate < "2024-07-01");
  const recentRev = sum(regionRecent.map(b => b.amount));
  const prevRev = sum(regionPrev.map(b => b.amount));
  const growth = prevRev > 0 ? +((recentRev - prevRev) / prevRev * 100).toFixed(1) : 0;

  return {
    region: r.region,
    revenue: r.revenue,
    bookings: r.bookings,
    growth,
  };
});

// --- Destination Revenue (computed from bookings) ---

const destAnalytics = computeDestinationAnalytics(bookings);
export const revenueByDestination = destAnalytics.map(d => ({
  destination: d.destination,
  revenue: d.revenue,
  share: +(d.revenue / allAnalytics.totalRevenue * 100).toFixed(1),
  profitMargin: d.profitMargin,
  bookings: d.bookings,
  avgValue: d.avgValue,
  cancellationRate: d.cancellationRate,
}));
