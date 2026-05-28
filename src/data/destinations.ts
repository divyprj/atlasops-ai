// ============================================================
// AtlasOps AI — Mock Destination Data
// ============================================================

import { Destination } from "@/types";

export const destinations: Destination[] = [
  {
    id: "DST-001", name: "Goa", country: "India", region: "West India",
    type: "domestic", totalBookings: 1245, totalRevenue: 11200000,
    avgBookingValue: 9000, cancellationRate: 8.2, growthRate: 15.3,
    popularity: 9, seasonalPeak: ["Oct", "Nov", "Dec", "Jan"],
    monthlyBookings: [85, 72, 90, 105, 68, 55, 48, 52, 78, 115, 135, 142, 88, 75, 95, 110, 72],
  },
  {
    id: "DST-002", name: "Dubai", country: "UAE", region: "International",
    type: "international", totalBookings: 856, totalRevenue: 12800000,
    avgBookingValue: 14953, cancellationRate: 5.8, growthRate: 28.6,
    popularity: 10, seasonalPeak: ["Nov", "Dec", "Jan", "Feb"],
    monthlyBookings: [62, 58, 48, 42, 38, 35, 32, 30, 45, 72, 88, 95, 65, 60, 52, 45, 40],
  },
  {
    id: "DST-003", name: "Maldives", country: "Maldives", region: "International",
    type: "international", totalBookings: 534, totalRevenue: 9800000,
    avgBookingValue: 18352, cancellationRate: 4.2, growthRate: 22.1,
    popularity: 8, seasonalPeak: ["Dec", "Jan", "Feb", "Mar"],
    monthlyBookings: [42, 38, 35, 28, 22, 18, 15, 14, 25, 45, 55, 62, 44, 40, 38, 30, 24],
  },
  {
    id: "DST-004", name: "Manali", country: "India", region: "North India",
    type: "domestic", totalBookings: 978, totalRevenue: 7500000,
    avgBookingValue: 7669, cancellationRate: 10.5, growthRate: 8.4,
    popularity: 8, seasonalPeak: ["May", "Jun", "Dec", "Jan"],
    monthlyBookings: [75, 62, 55, 68, 95, 105, 88, 72, 58, 65, 82, 90, 78, 65, 58, 72, 98],
  },
  {
    id: "DST-005", name: "Thailand", country: "Thailand", region: "International",
    type: "international", totalBookings: 623, totalRevenue: 8900000,
    avgBookingValue: 14286, cancellationRate: 6.5, growthRate: 19.8,
    popularity: 8, seasonalPeak: ["Nov", "Dec", "Jan", "Feb"],
    monthlyBookings: [48, 42, 38, 32, 28, 25, 22, 24, 35, 52, 65, 72, 50, 44, 40, 34, 30],
  },
  {
    id: "DST-006", name: "Kerala", country: "India", region: "South India",
    type: "domestic", totalBookings: 892, totalRevenue: 7200000,
    avgBookingValue: 8072, cancellationRate: 7.8, growthRate: 12.5,
    popularity: 7, seasonalPeak: ["Sep", "Oct", "Nov", "Dec"],
    monthlyBookings: [52, 45, 48, 55, 42, 38, 35, 40, 62, 78, 85, 88, 55, 48, 52, 58, 45],
  },
  {
    id: "DST-007", name: "Singapore", country: "Singapore", region: "International",
    type: "international", totalBookings: 445, totalRevenue: 6800000,
    avgBookingValue: 15281, cancellationRate: 5.2, growthRate: 16.3,
    popularity: 7, seasonalPeak: ["May", "Jun", "Nov", "Dec"],
    monthlyBookings: [28, 25, 22, 28, 35, 38, 32, 28, 25, 32, 42, 48, 30, 28, 24, 30, 38],
  },
  {
    id: "DST-008", name: "Rajasthan", country: "India", region: "North India",
    type: "domestic", totalBookings: 834, totalRevenue: 6500000,
    avgBookingValue: 7794, cancellationRate: 9.1, growthRate: 10.2,
    popularity: 7, seasonalPeak: ["Oct", "Nov", "Dec", "Jan"],
    monthlyBookings: [55, 48, 52, 45, 38, 28, 22, 25, 42, 68, 78, 82, 58, 50, 55, 48, 40],
  },
  {
    id: "DST-009", name: "Bali", country: "Indonesia", region: "International",
    type: "international", totalBookings: 389, totalRevenue: 5900000,
    avgBookingValue: 15167, cancellationRate: 6.8, growthRate: 24.5,
    popularity: 8, seasonalPeak: ["Jun", "Jul", "Aug", "Dec"],
    monthlyBookings: [22, 18, 20, 25, 32, 38, 42, 35, 28, 25, 30, 38, 24, 20, 22, 28, 35],
  },
  {
    id: "DST-010", name: "Kashmir", country: "India", region: "North India",
    type: "domestic", totalBookings: 678, totalRevenue: 5400000,
    avgBookingValue: 7965, cancellationRate: 12.8, growthRate: 6.2,
    popularity: 7, seasonalPeak: ["Apr", "May", "Jun", "Jul"],
    monthlyBookings: [25, 22, 35, 55, 72, 68, 58, 42, 35, 30, 28, 25, 28, 24, 38, 58, 75],
  },
  {
    id: "DST-011", name: "Pondicherry", country: "India", region: "South India",
    type: "domestic", totalBookings: 456, totalRevenue: 3200000,
    avgBookingValue: 7018, cancellationRate: 8.5, growthRate: 14.8,
    popularity: 6, seasonalPeak: ["Oct", "Nov", "Dec", "Feb"],
    monthlyBookings: [25, 28, 22, 18, 15, 12, 10, 14, 22, 38, 45, 48, 28, 30, 24, 20, 16],
  },
  {
    id: "DST-012", name: "Andaman", country: "India", region: "South India",
    type: "domestic", totalBookings: 345, totalRevenue: 4100000,
    avgBookingValue: 11884, cancellationRate: 7.2, growthRate: 18.9,
    popularity: 7, seasonalPeak: ["Nov", "Dec", "Jan", "Feb"],
    monthlyBookings: [22, 20, 18, 15, 12, 10, 8, 10, 15, 28, 35, 40, 24, 22, 20, 16, 14],
  },
];

export const destinationSummary = {
  totalDestinations: destinations.length,
  domesticDestinations: destinations.filter(d => d.type === "domestic").length,
  internationalDestinations: destinations.filter(d => d.type === "international").length,
  topDestination: destinations.reduce((top, d) => d.totalRevenue > top.totalRevenue ? d : top, destinations[0]),
  fastestGrowing: destinations.reduce((top, d) => d.growthRate > top.growthRate ? d : top, destinations[0]),
  avgCancellationRate: +(destinations.reduce((s, d) => s + d.cancellationRate, 0) / destinations.length).toFixed(1),
};
