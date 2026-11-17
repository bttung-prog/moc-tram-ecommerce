import React from "react";
import { useNavigate } from "react-router-dom";
import type {
  DashboardStats,
  InventoryAlert,
} from "@/services/adminDashboardApi";
import {
  Clock,
  AlertTriangle,
  Sparkles,
  Warehouse,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

interface ActionAlertsProps {
  stats: DashboardStats | null;
  inventoryAlerts?: InventoryAlert[];
  loading?: boolean;
}

export const ActionAlerts: React.FC<ActionAlertsProps> = ({
  stats,
  loading,
}) => {
  const navigate = useNavigate();

  if (loading || !stats) {
    return (
      <div className="rounded-2xl border border-agarwood-100 bg-white p-4 sm:p-6 shadow-sm">
        <div className="h-5 w-1/3 skeleton mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="h-20 skeleton rounded-xl" />
          <div className="h-20 skeleton rounded-xl" />
          <div className="h-20 skeleton rounded-xl" />
          <div className="h-20 skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  const items = [
    {
      title: "Đơn hàng chờ duyệt",
      count: stats.pendingOrdersCount,
      desc: "Cần xác nhận xuất kho",
      icon: Clock,
      path: "/admin/don-hang",
      color: "amber",
      urgent: stats.pendingOrdersCount > 0,
    },
    {
      title: "Đổi trả & Khiếu nại",
      count: stats.pendingReturnsCount,
      desc: "Yêu cầu đổi hàng/hoàn tiền",
      icon: AlertTriangle,
      path: "/admin/doi-tra",
      color: "rose",
      urgent: stats.pendingReturnsCount > 0,
    },
    {
      title: "Yêu cầu báo giá sỉ",
      count: stats.newQuotesCount,
      desc: "Khách sỉ, đại lý, đối tác",
      icon: Sparkles,
      path: "/admin/tu-van",
      color: "sky",
      urgent: stats.newQuotesCount > 0,
    },
    {
      title: "Cảnh báo tồn kho",
      count: stats.lowStockCount,
      desc: "SKU tồn kho < 15 sp",
      icon: Warehouse,
      path: "/admin/kho",
      color: "agarwood",
      urgent: stats.lowStockCount > 0,
    },
  ];

  const colorStyles = {
    amber: {
      border: "border-amber-200 hover:border-amber-400 bg-amber-50/40",
      badge: "bg-amber-100 text-amber-800",
      icon: "text-amber-600",
    },
    rose: {
      border: "border-rose-200 hover:border-rose-400 bg-rose-50/40",
      badge: "bg-rose-100 text-rose-800",
      icon: "text-rose-600",
    },
    sky: {
      border: "border-sky-200 hover:border-sky-400 bg-sky-50/40",
      badge: "bg-sky-100 text-sky-800",
      icon: "text-sky-600",
    },
    agarwood: {
      border: "border-agarwood-200 hover:border-agarwood-400 bg-agarwood-50/40",
      badge: "bg-agarwood-100 text-agarwood-800",
      icon: "text-agarwood-700",
    },
  };

  return (
    <div className="rounded-2xl border border-agarwood-100 bg-white p-4 sm:p-6 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-agarwood-50">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-agarwood-700 shrink-0" />
          <h3 className="font-serif text-base sm:text-lg font-bold text-agarwood-900">
            Tác vụ Cần xử lý Gấp (Action Required)
          </h3>
        </div>
        <span className="text-[11px] sm:text-xs text-charcoal-400 font-medium">
          Ưu tiên xử lý trong ngày
        </span>
      </div>

      <div className="mt-3.5 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        {items.map((item) => {
          const Icon = item.icon;
          const styles = colorStyles[item.color as keyof typeof colorStyles];

          return (
            <div
              key={item.title}
              onClick={() => navigate(item.path)}
              className={`group flex cursor-pointer flex-col justify-between rounded-xl border p-3.5 sm:p-4 transition-all hover:shadow-md hover:-translate-y-0.5 ${styles.border}`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-1.5 rounded-lg bg-white shadow-xs ${styles.icon}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${styles.badge} ${
                    item.urgent ? "animate-pulse" : ""
                  }`}
                >
                  {item.count} việc
                </span>
              </div>

              <div className="mt-2.5 sm:mt-3">
                <div className="text-xs sm:text-sm font-bold text-charcoal-600 group-hover:text-agarwood-900 transition-colors">
                  {item.title}
                </div>
                <div className="text-[11px] sm:text-xs text-charcoal-400 mt-0.5">
                  {item.desc}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-black/5 text-[11px] sm:text-xs font-semibold text-agarwood-800 group-hover:text-agarwood-600">
                <span>Xem chi tiết</span>
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
