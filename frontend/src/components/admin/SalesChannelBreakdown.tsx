import React from "react";
import type { ChannelShare } from "@/services/adminDashboardApi";
import { formatVND } from "@/utils/format";
import { Globe, Building2, Store } from "lucide-react";

interface SalesChannelBreakdownProps {
  shares: ChannelShare[];
  loading?: boolean;
}

const channelIcons = {
  D2C: Globe,
  B2B: Building2,
  O2O: Store,
};

const channelColors = {
  D2C: {
    bar: "bg-agarwood-700",
    text: "text-agarwood-700",
    bgLight: "bg-agarwood-50",
  },
  B2B: {
    bar: "bg-moss-500",
    text: "text-moss-700",
    bgLight: "bg-moss-50",
  },
  O2O: {
    bar: "bg-agarwood-400",
    text: "text-agarwood-600",
    bgLight: "bg-amber-50",
  },
};

export const SalesChannelBreakdown: React.FC<SalesChannelBreakdownProps> = ({
  shares,
  loading,
}) => {
  if (loading || !shares || shares.length === 0) {
    return (
      <div className="rounded-2xl border border-agarwood-100 bg-white p-4 sm:p-6 shadow-sm">
        <div className="h-5 w-1/2 skeleton mb-4" />
        <div className="space-y-3">
          <div className="h-14 skeleton w-full rounded-xl" />
          <div className="h-14 skeleton w-full rounded-xl" />
          <div className="h-14 skeleton w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const totalRevenue = shares.reduce((sum, s) => sum + s.revenue, 0);

  return (
    <div className="rounded-2xl border border-agarwood-100 bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-md overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-agarwood-50">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-agarwood-900">
            Tỷ trọng Doanh thu theo Kênh
          </h3>
          <p className="text-[11px] sm:text-xs text-charcoal-400">
            Tổng cộng: {formatVND(totalRevenue)}
          </p>
        </div>
      </div>

      {/* Progress Bar Visualizer */}
      <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-agarwood-100/60 p-0.5">
        {shares.map((item) => {
          const colors = channelColors[item.channel] || channelColors.D2C;
          return (
            <div
              key={item.channel}
              className={`h-full ${colors.bar} first:rounded-l-full last:rounded-r-full transition-all duration-500`}
              style={{ width: `${Math.max(item.percentage, 5)}%` }}
              title={`${item.label}: ${item.percentage}%`}
            />
          );
        })}
      </div>

      {/* Channel Cards */}
      <div className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3">
        {shares.map((item) => {
          const Icon = channelIcons[item.channel] || Globe;
          const colors = channelColors[item.channel] || channelColors.D2C;

          return (
            <div
              key={item.channel}
              className={`flex items-center justify-between gap-2 rounded-xl p-2.5 sm:p-3 border border-agarwood-100/70 ${colors.bgLight} transition-all hover:border-agarwood-300`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs">
                  <Icon
                    className={`h-4 w-4 sm:h-4.5 sm:w-4.5 ${colors.text}`}
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-charcoal-600 truncate">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-charcoal-400">
                    {item.orderCount} đơn hàng
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-mono text-xs font-bold text-agarwood-900">
                  {formatVND(item.revenue)}
                </div>
                <div className="text-[11px] font-semibold text-charcoal-400">
                  {item.percentage}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
