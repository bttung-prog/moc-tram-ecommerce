import React, { useState } from "react";
import type { InventorySummary } from "@/services/inventoryApi";
import type { Order, ReturnRequest } from "@/types";
import { formatVND } from "@/utils/format";
import {
  Package,
  AlertTriangle,
  ArrowUpRight,
  ScanLine,
  Truck,
  RotateCcw,
  CheckCircle,
  ExternalLink,
  PlusCircle,
  Box,
} from "lucide-react";

interface WarehouseOverviewTabProps {
  inventory: InventorySummary[];
  fulfillmentOrders: Order[];
  returns: ReturnRequest[];
  onOpenInbound: (skuId?: string) => void;
  onOpenPacking: (order: Order) => void;
  onOpenShippingLabel: (order: Order) => void;
  onSwitchTab: (tab: string) => void;
}

export const WarehouseOverviewTab: React.FC<WarehouseOverviewTabProps> = ({
  inventory,
  fulfillmentOrders,
  returns,
  onOpenInbound,
  onOpenPacking,
  onOpenShippingLabel,
  onSwitchTab,
}) => {
  const [quickScanInput, setQuickScanInput] = useState("");
  const [scanResult, setScanResult] = useState<{
    type: "order" | "sku" | "not_found";
    order?: Order;
    sku?: InventorySummary;
  } | null>(null);

  // Compute metrics
  const pendingOrders = fulfillmentOrders.filter((o) =>
    ["CONFIRMED", "PAID"].includes(o.status),
  );
  const packingOrders = fulfillmentOrders.filter((o) => o.status === "PACKING");
  const lowStockItems = inventory.filter((i) => i.lowStock);
  const pendingReturns = returns.filter((r) =>
    ["SUBMITTED", "VERIFIED", "APPROVED"].includes(r.status),
  );

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = quickScanInput.trim().toUpperCase();
    if (!query) return;

    // Check order code
    const foundOrder = fulfillmentOrders.find(
      (o) =>
        o.orderCode.toUpperCase() === query ||
        o.shipment?.trackingCode?.toUpperCase() === query,
    );
    if (foundOrder) {
      setScanResult({ type: "order", order: foundOrder });
      return;
    }

    // Check SKU ID or Barcode
    const foundSku = inventory.find(
      (i) =>
        i.skuId.toUpperCase() === query ||
        i.productName.toUpperCase().includes(query),
    );
    if (foundSku) {
      setScanResult({ type: "sku", sku: foundSku });
      return;
    }

    setScanResult({ type: "not_found" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Barcode / Quick Scanner Banner */}
      <div className="rounded-2xl bg-charcoal-700 text-cream p-5 shadow-sm border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-agarwood-600/50 text-cream border border-agarwood-400/30">
              <ScanLine className="h-6 w-6 text-agarwood-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif text-cream">
                Quét Mã Vận Đơn & Tra Cứu Kho Nhanh
              </h2>
              <p className="text-xs text-charcoal-200">
                Sử dụng máy quét Barcode/QR hoặc nhập mã đơn (VD: MT25...), mã
                SKU để thao tác tức thì.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleScanSubmit}
            className="flex items-center gap-2 max-w-md w-full"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={quickScanInput}
                onChange={(e) => setQuickScanInput(e.target.value)}
                placeholder="Nhập hoặc quét mã đơn / SKU..."
                className="w-full rounded-xl bg-charcoal-800 border border-white/20 px-3.5 py-2 text-xs text-white placeholder-charcoal-400 focus:outline-none focus:border-agarwood-400 font-mono"
              />
              {quickScanInput && (
                <button
                  type="button"
                  onClick={() => {
                    setQuickScanInput("");
                    setScanResult(null);
                  }}
                  className="absolute right-2.5 top-2 text-[10px] text-charcoal-300 hover:text-white"
                >
                  Xóa
                </button>
              )}
            </div>
            <button
              type="submit"
              className="rounded-xl bg-agarwood-500 hover:bg-agarwood-600 px-4 py-2 text-xs font-semibold text-white transition-colors shrink-0 shadow"
            >
              Tìm nhanh
            </button>
          </form>
        </div>

        {/* Scan Result Feedback Box */}
        {scanResult && (
          <div className="mt-4 pt-4 border-t border-white/10">
            {scanResult.type === "order" && scanResult.order && (
              <div className="rounded-xl bg-white/10 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-amber-300 text-sm">
                    {scanResult.order.orderCode}
                  </span>
                  <span>
                    Khách hàng: <strong>{scanResult.order.customerName}</strong>
                  </span>
                  <span className="rounded-full bg-agarwood-500/30 px-2 py-0.5 text-[11px] border border-agarwood-400/40">
                    Trạng thái: {scanResult.order.status}
                  </span>
                  <span className="text-charcoal-200">
                    {scanResult.order.items.length} món —{" "}
                    {formatVND(scanResult.order.total)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenPacking(scanResult.order!)}
                    className="rounded-lg bg-agarwood-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-agarwood-600"
                  >
                    Đóng gói đơn này
                  </button>
                  <button
                    onClick={() => onOpenShippingLabel(scanResult.order!)}
                    className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30"
                  >
                    In Tem Vận Đơn
                  </button>
                </div>
              </div>
            )}

            {scanResult.type === "sku" && scanResult.sku && (
              <div className="rounded-xl bg-white/10 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-amber-300">
                    {scanResult.sku.skuId}
                  </span>
                  <span>
                    {scanResult.sku.productName} ({scanResult.sku.specLabel})
                  </span>
                  <span>
                    Tồn thực tế: <strong>{scanResult.sku.onHand}</strong>
                  </span>
                  <span>
                    Khả dụng: <strong>{scanResult.sku.available}</strong>
                  </span>
                </div>
                <button
                  onClick={() => onOpenInbound(scanResult.sku!.skuId)}
                  className="rounded-lg bg-agarwood-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-agarwood-600"
                >
                  Lập phiếu nhập thêm
                </button>
              </div>
            )}

            {scanResult.type === "not_found" && (
              <div className="text-xs text-red-300 italic">
                Không tìm thấy đơn hàng hoặc sản phẩm nào khớp với mã: "
                {quickScanInput}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Đơn cần đóng gói */}
        <div
          onClick={() => onSwitchTab("fulfillment")}
          className="cursor-pointer rounded-2xl bg-white p-5 border border-agarwood-100 shadow-sm hover:shadow-md hover:border-agarwood-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500">
              Đơn cần chuẩn bị
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Box className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-charcoal-900">
              {pendingOrders.length}
            </span>
            <span className="text-xs text-amber-700 font-medium">
              chờ đóng gói
            </span>
          </div>
          <p className="mt-2 text-[11px] text-charcoal-400 flex items-center justify-between">
            <span>Đang đóng gói: {packingOrders.length}</span>
            <span className="text-agarwood-600 font-semibold flex items-center">
              Xử lý <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </p>
        </div>

        {/* Cảnh báo hết hàng */}
        <div
          onClick={() => onSwitchTab("inventory")}
          className="cursor-pointer rounded-2xl bg-white p-5 border border-agarwood-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500">
              Cảnh báo tồn kho
            </span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-red-600">
              {lowStockItems.length}
            </span>
            <span className="text-xs text-red-600 font-medium">
              mặt hàng sắp hết
            </span>
          </div>
          <p className="mt-2 text-[11px] text-charcoal-400 flex items-center justify-between">
            <span>Ngưỡng an toàn: ≤ 10 cái</span>
            <span className="text-agarwood-600 font-semibold flex items-center">
              Xem tồn <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </p>
        </div>

        {/* Tổng mặt hàng SKU */}
        <div
          onClick={() => onSwitchTab("inventory")}
          className="cursor-pointer rounded-2xl bg-white p-5 border border-agarwood-100 shadow-sm hover:shadow-md hover:border-agarwood-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500">
              Tổng mã SKU lưu kho
            </span>
            <div className="p-2 rounded-xl bg-agarwood-50 text-agarwood-700">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-agarwood-900">
              {inventory.length}
            </span>
            <span className="text-xs text-charcoal-500">quy cách đang bán</span>
          </div>
          <p className="mt-2 text-[11px] text-charcoal-400 flex items-center justify-between">
            <span>
              Tổng tồn: {inventory.reduce((sum, i) => sum + i.onHand, 0)} đơn vị
            </span>
            <span className="text-agarwood-600 font-semibold flex items-center">
              Chi tiết <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </p>
        </div>

        {/* Kiện hàng hoàn chờ nhận */}
        <div
          onClick={() => onSwitchTab("returns")}
          className="cursor-pointer rounded-2xl bg-white p-5 border border-agarwood-100 shadow-sm hover:shadow-md hover:border-agarwood-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500">
              Hàng hoàn / Đổi trả
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <RotateCcw className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-purple-900">
              {pendingReturns.length}
            </span>
            <span className="text-xs text-purple-700 font-medium">
              kiện cần kiểm tra
            </span>
          </div>
          <p className="mt-2 text-[11px] text-charcoal-400 flex items-center justify-between">
            <span>Kiểm định hàng hoàn trả</span>
            <span className="text-agarwood-600 font-semibold flex items-center">
              Tiếp nhận <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </p>
        </div>
      </div>

      {/* 3. Two Columns: Low Stock Alert & Urgent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Cảnh báo hàng chạm ngưỡng an toàn */}
        <div className="rounded-2xl bg-white p-5 border border-agarwood-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-agarwood-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <h3 className="font-serif text-sm font-bold text-charcoal-900">
                  Cảnh Báo Hết Hàng Cần Nhập Thêm ({lowStockItems.length})
                </h3>
              </div>
              <button
                onClick={() => onOpenInbound()}
                className="flex items-center gap-1 text-xs font-semibold text-agarwood-700 hover:text-agarwood-800"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Nhập hàng mới</span>
              </button>
            </div>

            <div className="divide-y divide-charcoal-100 mt-2 max-h-72 overflow-y-auto">
              {lowStockItems.length === 0 ? (
                <div className="p-6 text-center text-xs text-charcoal-400">
                  <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  Mọi mặt hàng đều đạt mức an toàn trên ngưỡng tồn kho.
                </div>
              ) : (
                lowStockItems.map((item) => (
                  <div
                    key={item.skuId}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="h-10 w-10 rounded-lg object-cover border border-charcoal-100 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/images/products/placeholder.jpg";
                        }}
                      />
                      <div>
                        <p className="font-semibold text-charcoal-800 line-clamp-1">
                          {item.productName}
                        </p>
                        <p className="text-[11px] text-charcoal-400">
                          {item.specLabel} — Mã:{" "}
                          <span className="font-mono">{item.skuId}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block rounded-md bg-red-100 px-2 py-0.5 font-mono text-xs font-bold text-red-800">
                        Còn {item.onHand} cái
                      </span>
                      <button
                        onClick={() => onOpenInbound(item.skuId)}
                        className="block mt-1 text-[11px] font-semibold text-agarwood-700 hover:underline"
                      >
                        + Nhập kho
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-agarwood-100 mt-3 text-right">
            <button
              onClick={() => onSwitchTab("inventory")}
              className="text-xs font-semibold text-agarwood-700 hover:text-agarwood-900 inline-flex items-center gap-1"
            >
              Xem toàn bộ bảng tồn kho <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Right: Đơn hàng cần xuất khẩn cấp trong ngày */}
        <div className="rounded-2xl bg-white p-5 border border-agarwood-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-agarwood-100">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-agarwood-700" />
                <h3 className="font-serif text-sm font-bold text-charcoal-900">
                  Đơn Hàng Cần Đóng Gói Hôm Nay ({pendingOrders.length})
                </h3>
              </div>
              <button
                onClick={() => onSwitchTab("fulfillment")}
                className="text-xs font-semibold text-agarwood-700 hover:text-agarwood-800"
              >
                Xem tất cả
              </button>
            </div>

            <div className="divide-y divide-charcoal-100 mt-2 max-h-72 overflow-y-auto">
              {pendingOrders.length === 0 ? (
                <div className="p-6 text-center text-xs text-charcoal-400">
                  <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  Hiện không có đơn nào đang chờ đóng gói. Tuyệt vời!
                </div>
              ) : (
                pendingOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-agarwood-900">
                          {order.orderCode}
                        </span>
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                          {order.status === "PAID" ? "Đã TT" : "Chờ đóng gói"}
                        </span>
                      </div>
                      <p className="text-charcoal-600 mt-0.5">
                        {order.shippingFullName || order.customerName} —{" "}
                        {order.items.length} mặt hàng
                      </p>
                      <p className="text-[11px] text-charcoal-400">
                        Đích đến: {order.shippingProvince}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onOpenPacking(order)}
                        className="rounded-lg bg-agarwood-700 hover:bg-agarwood-800 px-3 py-1.5 text-xs font-semibold text-cream transition-colors shadow-sm"
                      >
                        Đóng gói
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-agarwood-100 mt-3 text-right">
            <button
              onClick={() => onSwitchTab("fulfillment")}
              className="text-xs font-semibold text-agarwood-700 hover:text-agarwood-900 inline-flex items-center gap-1"
            >
              Mở khu vực xuất hàng & in vận đơn{" "}
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
