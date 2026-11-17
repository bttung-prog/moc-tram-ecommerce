import React, { useState } from "react";
import type { Order } from "@/types";
import { formatVND, formatTimeAgo } from "@/utils/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/constants/enums";
import {
  ShoppingCart,
  CheckCircle,
  ExternalLink,
  QrCode,
  Banknote,
  CreditCard,
  Building2,
  Store,
  Globe,
  Loader2,
} from "lucide-react";

interface RecentOrdersTableProps {
  orders: Order[];
  loading?: boolean;
  onConfirmOrder?: (orderId: string) => Promise<void>;
  onViewAll?: () => void;
}

export const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({
  orders,
  loading,
  onConfirmOrder,
  onViewAll,
}) => {
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleConfirm = async (orderId: string) => {
    if (!onConfirmOrder) return;
    try {
      setBusyId(orderId);
      await onConfirmOrder(orderId);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-agarwood-100 bg-white p-4 sm:p-6 shadow-sm">
        <div className="h-5 w-1/4 skeleton mb-4" />
        <div className="space-y-3">
          <div className="h-14 skeleton w-full rounded-xl" />
          <div className="h-14 skeleton w-full rounded-xl" />
          <div className="h-14 skeleton w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-agarwood-100 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 pb-3 sm:pb-4 border-b border-agarwood-50">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-agarwood-900 flex items-center gap-2">
            <ShoppingCart className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-agarwood-700" />
            Đơn hàng Mới nhất
          </h3>
          <p className="text-[11px] sm:text-xs text-charcoal-400 mt-0.5">
            Theo dõi và xử lý luồng đơn hàng realtime
          </p>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs font-semibold text-agarwood-700 hover:text-agarwood-900 transition-colors"
          >
            <span>Tất cả</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* 1. Mobile & Tablet Card View (< lg) */}
      <div className="divide-y divide-agarwood-50 lg:hidden">
        {orders.map((order) => {
          const isPending = order.status === "PENDING";
          const channel = order.salesChannel || "D2C";

          return (
            <div
              key={order.id}
              className="p-3.5 sm:p-4 hover:bg-agarwood-50/30 transition-colors space-y-2.5"
            >
              {/* Row 1: Code, Time, Status */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-agarwood-900 text-xs sm:text-sm">
                    #{order.orderCode}
                  </span>
                  <span className="text-[10px] text-charcoal-300">
                    {formatTimeAgo(order.createdAt)}
                  </span>
                </div>
                <span
                  className={`badge text-[10px] font-semibold ${
                    ORDER_STATUS_COLORS[order.status] ||
                    "bg-gray-100 text-gray-700"
                  }`}
                >
                  {ORDER_STATUS_LABELS[order.status] || order.status}
                </span>
              </div>

              {/* Row 2: Customer & Channel */}
              <div className="flex items-center justify-between text-xs text-charcoal-600 gap-2">
                <div className="min-w-0">
                  <span className="font-medium truncate block">
                    {order.customerName}
                  </span>
                  <span className="text-[11px] text-charcoal-400 font-mono">
                    {order.customerPhone}
                  </span>
                </div>

                <div className="shrink-0">
                  {channel === "B2B" ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-moss-100 text-moss-700 px-2 py-0.5 text-[10px] font-semibold">
                      <Building2 className="h-3 w-3" /> Khách sỉ
                    </span>
                  ) : channel === "O2O" ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-semibold">
                      <Store className="h-3 w-3" /> Showroom
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-agarwood-100 text-agarwood-800 px-2 py-0.5 text-[10px] font-semibold">
                      <Globe className="h-3 w-3" /> Website
                    </span>
                  )}
                </div>
              </div>

              {/* Row 3: Total, Payment Method & Quick Confirm */}
              <div className="flex items-center justify-between pt-2 border-t border-agarwood-50/80 gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-charcoal-500">
                    {order.paymentMethod === "VIETQR" ? (
                      <QrCode className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    ) : order.paymentMethod === "PAYPAL" ? (
                      <CreditCard className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                    ) : (
                      <Banknote className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    )}
                    <span>{order.paymentMethod}</span>
                    <span className="text-charcoal-300">·</span>
                    <span className="font-mono font-bold text-agarwood-900 text-xs">
                      {formatVND(order.total)}
                    </span>
                  </div>
                </div>

                <div>
                  {isPending ? (
                    <button
                      onClick={() => handleConfirm(order.id)}
                      disabled={busyId === order.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-agarwood-800 px-2.5 py-1 text-xs font-semibold text-cream hover:bg-agarwood-700 transition-colors shadow-xs disabled:opacity-50"
                    >
                      {busyId === order.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5" />
                      )}
                      <span>Duyệt đơn</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-charcoal-400 font-medium">
                      Đã tiếp nhận
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Desktop Full Table (>= lg) */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-agarwood-50/60 text-charcoal-400 font-semibold uppercase tracking-wider text-[11px] border-b border-agarwood-100">
            <tr>
              <th className="py-3.5 px-6">Mã đơn & Thời gian</th>
              <th className="py-3.5 px-4">Khách hàng</th>
              <th className="py-3.5 px-4">Kênh bán</th>
              <th className="py-3.5 px-4">Thanh toán</th>
              <th className="py-3.5 px-4 text-right">Tổng tiền</th>
              <th className="py-3.5 px-4 text-center">Trạng thái</th>
              <th className="py-3.5 px-6 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-agarwood-50">
            {orders.map((order) => {
              const isPending = order.status === "PENDING";
              const channel = order.salesChannel || "D2C";

              return (
                <tr
                  key={order.id}
                  className="hover:bg-agarwood-50/40 transition-colors"
                >
                  {/* Mã đơn */}
                  <td className="py-3.5 px-6">
                    <span className="font-mono font-bold text-agarwood-900 block">
                      #{order.orderCode}
                    </span>
                    <span className="text-[11px] text-charcoal-300">
                      {formatTimeAgo(order.createdAt)}
                    </span>
                  </td>

                  {/* Khách hàng */}
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-charcoal-600 block">
                      {order.customerName}
                    </span>
                    <span className="text-[11px] text-charcoal-400 font-mono">
                      {order.customerPhone}
                    </span>
                  </td>

                  {/* Kênh */}
                  <td className="py-3.5 px-4">
                    {channel === "B2B" ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-moss-100 text-moss-700 px-2 py-0.5 text-[11px] font-semibold">
                        <Building2 className="h-3 w-3" /> Khách sỉ
                      </span>
                    ) : channel === "O2O" ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 text-amber-800 px-2 py-0.5 text-[11px] font-semibold">
                        <Store className="h-3 w-3" /> Showroom
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-agarwood-100 text-agarwood-800 px-2 py-0.5 text-[11px] font-semibold">
                        <Globe className="h-3 w-3" /> Website
                      </span>
                    )}
                  </td>

                  {/* Thanh toán */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-charcoal-600">
                      {order.paymentMethod === "VIETQR" ? (
                        <QrCode className="h-3.5 w-3.5 text-emerald-600" />
                      ) : order.paymentMethod === "PAYPAL" ? (
                        <CreditCard className="h-3.5 w-3.5 text-sky-600" />
                      ) : (
                        <Banknote className="h-3.5 w-3.5 text-amber-600" />
                      )}
                      <span>{order.paymentMethod}</span>
                    </div>
                    <span
                      className={`text-[10px] font-medium block ${
                        order.payment?.status === "SUCCESS"
                          ? "text-emerald-600 font-semibold"
                          : "text-amber-600"
                      }`}
                    >
                      {order.payment?.status === "SUCCESS"
                        ? "Đã nhận tiền"
                        : "Chưa thanh toán"}
                    </span>
                  </td>

                  {/* Tổng tiền */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-mono font-bold text-agarwood-900 text-xs">
                      {formatVND(order.total)}
                    </span>
                    <span className="text-[10px] text-charcoal-400 block">
                      {order.items.length} món
                    </span>
                  </td>

                  {/* Trạng thái */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`badge text-[11px] font-semibold ${
                        ORDER_STATUS_COLORS[order.status] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>

                  {/* Thao tác */}
                  <td className="py-3.5 px-6 text-right">
                    {isPending ? (
                      <button
                        onClick={() => handleConfirm(order.id)}
                        disabled={busyId === order.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-agarwood-800 px-2.5 py-1 text-[11px] font-semibold text-cream hover:bg-agarwood-700 transition-colors shadow-xs disabled:opacity-50"
                      >
                        {busyId === order.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        <span>Duyệt đơn</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-charcoal-400">
                        Đã tiếp nhận
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
