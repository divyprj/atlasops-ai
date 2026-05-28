"use client";

import React from "react";
import { cn, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: number;
  change?: number;
  format?: "currency" | "number" | "percentage" | "score";
  subtitle?: string;
  className?: string;
}

export function KPICard({
  title,
  value,
  change,
  format = "number",
  subtitle,
  className,
}: KPICardProps) {
  const formattedValue = (() => {
    switch (format) {
      case "currency": return formatCurrency(value, true);
      case "percentage": return `${value.toFixed(1)}%`;
      case "score": return value.toFixed(1);
      default: return formatNumber(value, true);
    }
  })();

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className={cn("px-4 py-3 rounded-lg border border-border bg-card", className)}>
      <p className="text-[11px] font-medium text-muted-foreground mb-1">{title}</p>
      <p className="text-lg font-semibold tracking-tight text-foreground font-mono">{formattedValue}</p>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-1">
          {isPositive && <TrendingUp size={11} className="text-emerald-500" />}
          {isNegative && <TrendingDown size={11} className="text-red-500" />}
          {!isPositive && !isNegative && <Minus size={11} className="text-muted-foreground" />}
          <span className={cn("text-[11px] font-medium",
            isPositive && "text-emerald-500",
            isNegative && "text-red-500",
            !isPositive && !isNegative && "text-muted-foreground"
          )}>
            {formatPercent(change)}
          </span>
          {subtitle && <span className="text-[10px] text-muted-foreground ml-0.5">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
