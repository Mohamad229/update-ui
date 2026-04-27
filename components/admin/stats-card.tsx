import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

type AccentColor = "blue" | "green" | "orange" | "purple" | "cyan";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent: AccentColor;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

const accentStyles: Record<
  AccentColor,
  {
    iconBg: string;
    iconColor: string;
    trendPositive: string;
    trendNegative: string;
  }
> = {
  blue: {
    iconBg: "bg-[hsl(199_89%_48%/0.12)] dark:bg-[hsl(199_89%_58%/0.15)]",
    iconColor: "text-[hsl(199_89%_48%)] dark:text-[hsl(199_89%_58%)]",
    trendPositive: "text-[hsl(152_69%_41%)]",
    trendNegative: "text-[hsl(0_84%_60%)]",
  },
  green: {
    iconBg: "bg-[hsl(152_69%_41%/0.12)] dark:bg-[hsl(152_69%_51%/0.15)]",
    iconColor: "text-[hsl(152_69%_41%)] dark:text-[hsl(152_69%_51%)]",
    trendPositive: "text-[hsl(152_69%_41%)]",
    trendNegative: "text-[hsl(0_84%_60%)]",
  },
  orange: {
    iconBg: "bg-[hsl(27_96%_61%/0.12)] dark:bg-[hsl(27_96%_71%/0.15)]",
    iconColor: "text-[hsl(27_96%_51%)] dark:text-[hsl(27_96%_61%)]",
    trendPositive: "text-[hsl(152_69%_41%)]",
    trendNegative: "text-[hsl(0_84%_60%)]",
  },
  purple: {
    iconBg: "bg-[hsl(270_60%_55%/0.12)] dark:bg-[hsl(270_60%_65%/0.15)]",
    iconColor: "text-[hsl(270_60%_50%)] dark:text-[hsl(270_60%_65%)]",
    trendPositive: "text-[hsl(152_69%_41%)]",
    trendNegative: "text-[hsl(0_84%_60%)]",
  },
  cyan: {
    iconBg: "bg-[hsl(187_72%_45%/0.12)] dark:bg-[hsl(187_72%_55%/0.15)]",
    iconColor: "text-[hsl(187_72%_45%)] dark:text-[hsl(187_72%_55%)]",
    trendPositive: "text-[hsl(152_69%_41%)]",
    trendNegative: "text-[hsl(0_84%_60%)]",
  },
};

export function StatsCard({
  label,
  value,
  icon: Icon,
  accent,
  trend,
  className,
}: StatsCardProps) {
  const styles = accentStyles[accent];
  const isPositive = trend && trend.value >= 0;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5",
        "shadow-[0_2px_8px_-2px_rgb(0_0_0/0.06),0_4px_12px_-2px_rgb(0_0_0/0.03)]",
        "transition-all duration-300 ease-out",
        "hover:shadow-[0_8px_24px_-4px_rgb(0_0_0/0.08),0_4px_12px_-2px_rgb(0_0_0/0.04)]",
        "hover:-translate-y-0.5",
        className,
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300",
          "group-hover:opacity-100",
          accent === "blue" &&
            "bg-gradient-to-br from-[hsl(199_89%_48%/0.02)] to-transparent",
          accent === "green" &&
            "bg-gradient-to-br from-[hsl(152_69%_41%/0.02)] to-transparent",
          accent === "orange" &&
            "bg-gradient-to-br from-[hsl(27_96%_61%/0.02)] to-transparent",
          accent === "purple" &&
            "bg-gradient-to-br from-[hsl(270_60%_55%/0.02)] to-transparent",
          accent === "cyan" &&
            "bg-gradient-to-br from-[hsl(187_72%_45%/0.02)] to-transparent",
        )}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-card-foreground">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>

          {trend && (
            <div className="flex items-center gap-1.5">
              {isPositive ? (
                <TrendingUp
                  className={cn("size-3.5", styles.trendPositive)}
                  strokeWidth={2.5}
                />
              ) : (
                <TrendingDown
                  className={cn("size-3.5", styles.trendNegative)}
                  strokeWidth={2.5}
                />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  isPositive ? styles.trendPositive : styles.trendNegative,
                )}
              >
                {isPositive ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">
                {trend.label}
              </span>
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-lg",
            "transition-transform duration-300 group-hover:scale-105",
            styles.iconBg,
          )}
        >
          <Icon className={cn("size-5", styles.iconColor)} strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}
