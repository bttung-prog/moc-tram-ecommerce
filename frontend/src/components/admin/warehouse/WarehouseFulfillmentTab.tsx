import React, { useState } from "react";
import type { Order } from "@/types";
import { formatVND } from "@/utils/format";
import {
  Search,
  Box,
  Truck,
  Printer,
  CheckCircle2,
  ShieldAlert,
  Flame,
  Droplets,
} from "lucide-react";

interface WarehouseFulfillmentTabProps {
  orders: Order[];
  onOpenPacking: (order: Order) => void;
  onOpenShippingLabel: (order: Order) => void;
  onDispatchOrder: (orderId: string) => Promise<void>;
}

export const WarehouseFulfillmentTab: React.FC<
  WarehouseFulfillmentTabProps
> = ({ orders, onOpenPacking, onOpenShippingLabel, onDispatchOrder }) => {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (filterStatus === "NEED_PACK") {
      if (!["CONFIRMED", "PAID"].includes(order.status)) return false;
    } else if (filterStatus === "PACKING") {
      if (order.status !== "PACKING") return false;
    } else if (filterStatus === "SHIPPING") {
      if (order.status !== "SHIPPING") return false;
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const codeMatch = order.orderCode.toLowerCase().includes(q);
      const nameMatch = (order.shippingFullName || order.customerName)
        .toLowerCase()
        .includes(q);
      const phoneMatch = (order.shippingPhone || order.customerPhone).includes(
        q,
      );
      const trackMatch = order.shipment?.trackingCode
        ?.toLowerCase()
        .includes(q);
      if (!codeMatch && !nameMatch && !phoneMatch && !trackMatch) return false;
    }

    return true;
  });

  const handleDispatch = async (order: Order) => {
    if (
      !confirm(
        `Xác nhận đã bàn giao kiện hàng của đơn ${order.orderCode} (Vận đơn: ${order.shipment?.trackingCode || "N/A"}) cho bưu tá?`,
      )
    ) {
      return;
    }

    try {
      setDispatchingId(order.id);
      await onDispatchOrder(order.id);
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-agarwood-100 shadow-sm">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
              filterStatus === "ALL"
                ? "bg-agarwood-700 text-cream font-semibold shadow-sm"
                : "bg-charcoal-50 text-charcoal-600 hover:bg-charcoal-100"
            }`}
          >
            Tất cả ({orders.length})
          </button>
          <button
            onClick={() => setFilterStatus("NEED_PACK")}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
              filterStatus === "NEED_PACK"
                ? "bg-amber-600 text-cream font-semibold shadow-sm"
                : "bg-charcoal-50 text-charcoal-600 hover:bg-charcoal-100"
            }`}
          >
            Cần đóng gói (
            {
              orders.filter((o) => ["CONFIRMED", "PAID"].includes(o.status))
                .length
            }
            )
          </button>
          <button
            onClick={() => setFilterStatus("PACKING")}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
              filterStatus === "PACKING"
                ? "bg-blue-600 text-cream font-semibold shadow-sm"
                : "bg-charcoal-50 text-charcoal-600 hover:bg-charcoal-100"
            }`}
          >
            Đang đóng gói ({orders.filter((o) => o.status === "PACKING").length}
            )
          </button>
          <button
            onClick={() => setFilterStatus("SHIPPING")}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
              filterStatus === "SHIPPING"
                ? "bg-emerald-700 text-cream font-semibold shadow-sm"
                : "bg-charcoal-50 text-charcoal-600 hover:bg-charcoal-100"
            }`}
          >
            Đã bàn giao bưu tá (
            {orders.filter((o) => o.status === "SHIPPING").length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-charcoal-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã đơn, khách, SĐT..."
            className="w-full rounded-xl border border-agarwood-200 pl-9 pr-3.5 py-1.5 text-xs text-charcoal-800 focus:border-agarwood-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-charcoal-200 bg-white p-12 text-center text-charcoal-400">
            <Box className="h-10 w-10 text-charcoal-300 mx-auto mb-3" />
            <p className="text-sm font-semibold">
              Không tìm thấy đơn hàng xuất kho nào phù hợp
            </p>
            <p className="text-xs mt-1">
              Hãy thử đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isNeedPack = ["CONFIRMED", "PAID"].includes(order.status);
            const isPacking = order.status === "PACKING";
            const isShipping = order.status === "SHIPPING";
            const isCOD = order.paymentMethod === "COD";

            return (
              <div
                key={order.id}
                className="rounded-2xl bg-white border border-agarwood-100 shadow-sm overflow-hidden hover:border-agarwood-300 transition-colors"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-charcoal-100 bg-ivory/60 px-5 py-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-agarwood-900 text-sm">
                      {order.orderCode}
                    </span>
                    <span className="text-charcoal-400">|</span>
                    <span className="text-charcoal-500">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                        isNeedPack
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : isPacking
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                      }`}
                    >
                      {isNeedPack
                        ? "Chờ nhặt & gói"
                        : isPacking
                          ? "Đang đóng gói"
                          : "Đã giao bưu tá"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-charcoal-500">
                      Thanh toán:{" "}
                      <strong
                        className={
                          isCOD ? "text-amber-700" : "text-emerald-700"
                        }
                      >
                        {isCOD
                          ? `COD (${formatVND(order.total)})`
                          : "Đã chuyển khoản"}
                      </strong>
                    </span>
                    {order.shipment && (
                      <span className="rounded bg-charcoal-100 px-2 py-0.5 font-mono text-[11px] text-charcoal-700">
                        {order.shipment.carrier} - {order.shipment.trackingCode}
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Body */}
                <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left: Customer Info (3 cols) */}
                  <div className="lg:col-span-4 border-r-0 lg:border-r border-charcoal-100 pr-0 lg:pr-4 space-y-1.5 text-xs text-charcoal-700">
                    <p className="font-bold text-charcoal-900 text-sm">
                      {order.shippingFullName || order.customerName}
                    </p>
                    <p className="font-mono font-medium text-charcoal-600">
                      {order.shippingPhone || order.customerPhone}
                    </p>
                    <p className="text-charcoal-500 leading-relaxed">
                      {[
                        order.shippingDetail,
                        order.shippingWard,
                        order.shippingProvince,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {order.note && (
                      <div className="mt-2 rounded-lg bg-agarwood-50 p-2 text-[11px] text-agarwood-900 border border-agarwood-100">
                        <strong>Ghi chú đơn:</strong> {order.note}
                      </div>
                    )}
                  </div>

                  {/* Middle: Items to pick (5 cols) */}
                  <div className="lg:col-span-5 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400">
                      Mặt hàng cần xuất ({order.items.length})
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-xl bg-charcoal-50/70 p-2.5 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="h-10 w-10 rounded-lg object-cover border border-charcoal-200 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/images/products/placeholder.jpg";
                              }}
                            />
                            <div>
                              <p className="font-semibold text-charcoal-900 line-clamp-1">
                                {item.productName}
                              </p>
                              <p className="text-[11px] text-charcoal-500">
                                Quy cách: {item.specLabel}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-sm text-agarwood-900 shrink-0">
                            x{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Safety Warnings for Mộc Trầm */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-amber-800 border border-amber-200">
                        <ShieldAlert className="h-3 w-3" /> Chống sốc 3 lớp
                      </span>
                      <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-blue-800 border border-blue-200">
                        <Droplets className="h-3 w-3" /> Gói hút ẩm
                      </span>
                      <span className="inline-flex items-center gap-1 rounded bg-orange-50 px-2 py-0.5 text-orange-800 border border-orange-200">
                        <Flame className="h-3 w-3" /> Chống cháy nổ
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions (3 cols) */}
                  <div className="lg:col-span-3 flex flex-col justify-center items-stretch gap-2.5 pl-0 lg:pl-3 border-t lg:border-t-0 border-charcoal-100 pt-3 lg:pt-0">
                    {isNeedPack && (
                      <button
                        onClick={() => onOpenPacking(order)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-agarwood-700 hover:bg-agarwood-800 px-4 py-2.5 text-xs font-semibold text-cream shadow-sm transition-colors"
                      >
                        <Box className="h-4 w-4" />
                        <span>Đóng gói & Tạo Vận Đơn</span>
                      </button>
                    )}

                    {isPacking && (
                      <>
                        <button
                          onClick={() => onOpenShippingLabel(order)}
                          className="flex items-center justify-center gap-2 rounded-xl border border-agarwood-300 bg-white hover:bg-agarwood-50 px-4 py-2 text-xs font-semibold text-agarwood-800 transition-colors shadow-sm"
                        >
                          <Printer className="h-4 w-4 text-agarwood-700" />
                          <span>In Tem Vận Đơn (100x150)</span>
                        </button>
                        <button
                          onClick={() => handleDispatch(order)}
                          disabled={dispatchingId === order.id}
                          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-4 py-2 text-xs font-semibold text-cream shadow-sm transition-colors disabled:opacity-50"
                        >
                          <Truck className="h-4 w-4" />
                          <span>
                            {dispatchingId === order.id
                              ? "Đang xuất kho..."
                              : "Bàn Giao Cho Shipper"}
                          </span>
                        </button>
                      </>
                    )}

                    {isShipping && (
                      <>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 rounded-xl p-2.5 border border-emerald-200 font-medium">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>Đã giao cho bưu tá vận chuyển</span>
                        </div>
                        <button
                          onClick={() => onOpenShippingLabel(order)}
                          className="flex items-center justify-center gap-2 rounded-xl border border-charcoal-200 bg-white hover:bg-charcoal-50 px-4 py-2 text-xs font-semibold text-charcoal-700 transition-colors"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>In lại phiếu xuất</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
