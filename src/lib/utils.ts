import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatter (Indian Rupees)
export function formatCurrency(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Number formatter
export function formatNumber(num: number, compact = false): string {
  if (compact) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat("en-IN").format(num);
}

// Percentage formatter
export function formatPercent(value: number): string {
  if (value > 999) return ">+999%";
  if (value < -999) return "<-999%";
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

// Date formatter
export function formatDate(dateStr: string, style: "short" | "medium" | "long" = "medium"): string {
  const date = new Date(dateStr);
  if (style === "short") return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  if (style === "long") return date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// Relative time
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr, "short");
}

// Performance tier color
export function getTierColor(tier: string): string {
  switch (tier) {
    case "elite": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    case "strong": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    case "average": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "needs_improvement": return "text-red-400 bg-red-500/10 border-red-500/20";
    default: return "text-muted-foreground bg-muted";
  }
}

// Severity color
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "critical": return "text-red-400 bg-red-500/10 border-red-500/20";
    case "warning": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "info": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    case "positive": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    case "high": return "text-red-400 bg-red-500/10 border-red-500/20";
    case "medium": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "low": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    default: return "text-muted-foreground bg-muted";
  }
}

// Health status color
export function getHealthColor(status: string): string {
  switch (status) {
    case "healthy": return "text-emerald-400";
    case "warning": return "text-amber-400";
    case "critical": return "text-red-400";
    case "degraded": return "text-orange-400";
    default: return "text-muted-foreground";
  }
}

// Trend indicator
export function getTrendIcon(change: number): { symbol: string; color: string } {
  if (change > 0) return { symbol: "↑", color: "text-emerald-400" };
  if (change < 0) return { symbol: "↓", color: "text-red-400" };
  return { symbol: "→", color: "text-muted-foreground" };
}
