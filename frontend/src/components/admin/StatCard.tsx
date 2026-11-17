import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  change?: number; // percentage, positive or negative
  icon: React.ElementType;
  colorScheme?: "agarwood" | "moss" | "amber" | "rose" | "sky";
  badgeNote?: string;
  onClick?: () => void;
}

const colorStyles = {
  agarwood: {
    bg: "bg-agarwood-50",
    iconBg: "bg-agarwood-100 text-agarwood-800",
    border: "border-agarwood-100 hover:border-agarwood-300",
  },
  moss: {
    bg: "bg-moss-50",
    iconBg: "bg-moss-100 text-moss-700",
    border: "border-moss-100 hover:border-moss-300",
  },
  amber: {
    bg: "bg-amber-50/60",
    iconBg: "bg-amber-100 text-amber-700",
    border: "border-amber-100 hover:border-amber-300",
  },
  rose: {
    bg: "bg-rose-50/60",
    iconBg: "bg-rose-100 text-rose-700",
    border: "border-rose-100 hover:border-rose-300",
  },
  sky: {
    bg: "bg-sky-50/60",
    iconBg: "bg-sky-100 text-sky-700",
    border: "border-sky-100 hover:border-sky-300",
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  change,
  icon: Icon,
  colorScheme = "agarwood",
  badgeNote,
  onClick,
}) => {
  const styles = colorStyles[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border bg-white p-4 sm:p-5 shadow-sm transition-all duration-200 ${styles.border} ${
        onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-charcoal-400">
          {title}
        </span>
        <div
          className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl ${styles.iconBg} shrink-0`}
        >
          <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-agarwood-900 truncate">
          {value}
        </div>
        {subValue && (
          <div className="mt-1 text-xs text-charcoal-400 font-medium truncate">
            {subValue}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-agarwood-50 text-xs">
        {change !== undefined ? (
          <div className="flex items-center gap-1 font-medium">
            {change > 0 ? (
              <span className="inline-flex items-center gap-0.5 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                <TrendingUp className="h-3.5 w-3.5" />+{change}%
              </span>
            ) : change < 0 ? (
              <span className="inline-flex items-center gap-0.5 text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-semibold">
                <TrendingDown className="h-3.5 w-3.5" />
                {change}%
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-charcoal-400 bg-gray-50 px-1.5 py-0.5 rounded">
                <Minus className="h-3.5 w-3.5" />
                0%
              </span>
            )}
            <span className="text-charcoal-300 ml-1">kỳ trước</span>
          </div>
        ) : (
          <div className="text-charcoal-300">Cập nhật liên tục</div>
        )}

        {badgeNote && (
          <span className="rounded-md bg-agarwood-100/70 px-2 py-0.5 text-[11px] font-semibold text-agarwood-800 shrink-0">
            {badgeNote}
          </span>
        )}
      </div>
    </div>
  );
};
