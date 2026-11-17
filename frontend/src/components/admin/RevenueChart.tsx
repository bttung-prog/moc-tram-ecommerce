import React, { useState } from "react";
import type { RevenueChartPoint } from "@/services/adminDashboardApi";
import { formatVND } from "@/utils/format";
import { TrendingUp } from "lucide-react";

interface RevenueChartProps {
  data: RevenueChartPoint[];
  loading?: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  loading,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [metric, setMetric] = useState<"revenue" | "orders">("revenue");

  if (loading || !data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-agarwood-100 bg-white p-4 sm:p-6 shadow-sm">
        <div className="h-6 w-1/3 skeleton mb-4" />
        <div className="h-60 sm:h-64 w-full skeleton" />
      </div>
    );
  }

  // Calculate scales
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1000000);
  const maxOrders = Math.max(...data.map((d) => d.orderCount), 5);
  const totalPeriodRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalPeriodOrders = data.reduce((sum, d) => sum + d.orderCount, 0);

  const activePoint =
    hoverIndex !== null ? data[hoverIndex] : data[data.length - 1];

  return (
    <div className="rounded-2xl border border-agarwood-100 bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-md overflow-hidden">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-agarwood-50">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif text-base sm:text-lg font-bold text-agarwood-900">
              Xu hướng Doanh thu & Tăng trưởng
            </h3>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] sm:text-xs font-semibold text-emerald-700">
              <TrendingUp className="h-3 w-3" /> +15.4%
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-charcoal-400 mt-0.5">
            Phân rã theo Website, Khách sỉ và Showroom
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center rounded-xl bg-agarwood-50 p-1 border border-agarwood-200/60 self-start sm:self-auto shrink-0">
          <button
            onClick={() => setMetric("revenue")}
            className={`rounded-lg px-2.5 sm:px-3 py-1 text-xs font-medium transition-all ${
              metric === "revenue"
                ? "bg-agarwood-800 text-cream shadow-sm"
                : "text-charcoal-500 hover:text-agarwood-800"
            }`}
          >
            Doanh thu (₫)
          </button>
          <button
            onClick={() => setMetric("orders")}
            className={`rounded-lg px-2.5 sm:px-3 py-1 text-xs font-medium transition-all ${
              metric === "orders"
                ? "bg-agarwood-800 text-cream shadow-sm"
                : "text-charcoal-500 hover:text-agarwood-800"
            }`}
          >
            Số đơn
          </button>
        </div>
      </div>

      {/* Quick Summary Pill & Legend */}
      <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
          <div>
            <span className="text-charcoal-400">Tổng kỳ: </span>
            <span className="font-bold font-mono text-agarwood-900 text-xs sm:text-sm">
              {metric === "revenue"
                ? formatVND(totalPeriodRevenue)
                : `${totalPeriodOrders} đơn`}
            </span>
          </div>
          {activePoint && (
            <div className="rounded-lg bg-agarwood-50 px-2 py-0.5 text-agarwood-800 font-medium text-[11px] sm:text-xs">
              <span>{activePoint.label}: </span>
              <span className="font-mono font-bold">
                {metric === "revenue"
                  ? formatVND(activePoint.revenue)
                  : `${activePoint.orderCount} đơn`}
              </span>
            </div>
          )}
        </div>

        {metric === "revenue" && (
          <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-agarwood-700" />
              <span className="text-charcoal-500">Website</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-moss-500" />
              <span className="text-charcoal-500">Khách sỉ</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-agarwood-400" />
              <span className="text-charcoal-500">Showroom</span>
            </span>
          </div>
        )}
      </div>

      {/* SVG Chart Area */}
      <div className="relative mt-4 sm:mt-6 h-56 sm:h-64 w-full">
        <div className="absolute inset-0 flex items-end justify-between gap-1.5 sm:gap-3 sm:gap-4 pt-6 pb-6">
          {data.map((point, index) => {
            const isHovered = hoverIndex === index;
            const isFirst = index === 0;
            const isLast = index === data.length - 1;

            // Clamped tooltip positioning to prevent viewport overflow
            const tooltipPosition = isFirst
              ? "left-0"
              : isLast
                ? "right-0"
                : "left-1/2 -translate-x-1/2";

            if (metric === "revenue") {
              const d2cHeight = (point.d2cRevenue / maxRevenue) * 100;
              const b2bHeight = (point.b2bRevenue / maxRevenue) * 100;
              const o2oHeight = (point.o2oRevenue / maxRevenue) * 100;
              const totalHeight = Math.max(
                d2cHeight + b2bHeight + o2oHeight,
                5,
              );

              return (
                <div
                  key={point.date}
                  className="group relative flex flex-1 flex-col items-center h-full justify-end"
                  onMouseEnter={() => setHoverIndex(index)}
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div
                      className={`absolute -top-14 z-20 whitespace-nowrap rounded-lg bg-charcoal-700 px-2.5 py-1.5 text-xs text-cream shadow-xl pointer-events-none transition-all ${tooltipPosition}`}
                    >
                      <div className="font-bold">{point.label}</div>
                      <div className="text-[10px] text-agarwood-200">
                        {formatVND(point.revenue)} ({point.orderCount} đơn)
                      </div>
                    </div>
                  )}

                  {/* Stacked Bar */}
                  <div
                    className={`relative w-full max-w-[36px] sm:max-w-[44px] rounded-t-lg sm:rounded-t-xl overflow-hidden flex flex-col-reverse transition-all duration-300 ${
                      isHovered
                        ? "ring-2 ring-agarwood-400 brightness-110 shadow-lg"
                        : "hover:opacity-90"
                    }`}
                    style={{ height: `${totalHeight}%` }}
                  >
                    {/* D2C Segment */}
                    <div
                      className="w-full bg-agarwood-700 transition-all"
                      style={{ height: `${(d2cHeight / totalHeight) * 100}%` }}
                    />
                    {/* B2B Segment */}
                    <div
                      className="w-full bg-moss-500 transition-all"
                      style={{ height: `${(b2bHeight / totalHeight) * 100}%` }}
                    />
                    {/* O2O Segment */}
                    <div
                      className="w-full bg-agarwood-400 transition-all"
                      style={{ height: `${(o2oHeight / totalHeight) * 100}%` }}
                    />
                  </div>

                  {/* Bottom Label */}
                  <div
                    className={`mt-2 text-[10px] sm:text-[11px] font-medium transition-colors truncate max-w-full text-center ${
                      isHovered
                        ? "text-agarwood-800 font-bold"
                        : "text-charcoal-400"
                    }`}
                  >
                    {point.label === "Hôm nay" ? (
                      <>
                        <span className="sm:hidden">Nay</span>
                        <span className="hidden sm:inline">Hôm nay</span>
                      </>
                    ) : (
                      point.label
                    )}
                  </div>
                </div>
              );
            } else {
              // Metric is Orders Count
              const heightPercent = Math.max(
                (point.orderCount / maxOrders) * 100,
                6,
              );

              return (
                <div
                  key={point.date}
                  className="group relative flex flex-1 flex-col items-center h-full justify-end"
                  onMouseEnter={() => setHoverIndex(index)}
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  {isHovered && (
                    <div
                      className={`absolute -top-12 z-20 whitespace-nowrap rounded-lg bg-charcoal-700 px-2.5 py-1 text-xs text-cream shadow-xl pointer-events-none ${tooltipPosition}`}
                    >
                      <div className="font-bold">
                        {point.label}: {point.orderCount} đơn
                      </div>
                    </div>
                  )}

                  <div
                    className={`w-full max-w-[36px] sm:max-w-[44px] rounded-t-lg sm:rounded-t-xl bg-gradient-to-t from-agarwood-800 to-agarwood-500 transition-all duration-300 ${
                      isHovered
                        ? "ring-2 ring-agarwood-400 brightness-110 shadow-lg"
                        : ""
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />

                  <div
                    className={`mt-2 text-[10px] sm:text-[11px] font-medium transition-colors truncate max-w-full text-center ${
                      isHovered
                        ? "text-agarwood-800 font-bold"
                        : "text-charcoal-400"
                    }`}
                  >
                    {point.label === "Hôm nay" ? (
                      <>
                        <span className="sm:hidden">Nay</span>
                        <span className="hidden sm:inline">Hôm nay</span>
                      </>
                    ) : (
                      point.label
                    )}
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};
