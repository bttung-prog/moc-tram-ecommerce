import React, { useState, useEffect, useCallback } from "react";
import {
  inventoryApi,
  type InventorySummary,
  type InboundReceiptData,
} from "@/services/inventoryApi";
import type {
  InventoryBatch,
  InventoryMovement,
  Order,
  ReturnRequest,
} from "@/types";
import { WarehouseOverviewTab } from "@/components/admin/warehouse/WarehouseOverviewTab";
import { WarehouseFulfillmentTab } from "@/components/admin/warehouse/WarehouseFulfillmentTab";
import { WarehouseInventoryTab } from "@/components/admin/warehouse/WarehouseInventoryTab";
import { WarehouseMovementsTab } from "@/components/admin/warehouse/WarehouseMovementsTab";
import { WarehouseReturnsTab } from "@/components/admin/warehouse/WarehouseReturnsTab";
import { WarehouseInboundModal } from "@/components/admin/warehouse/WarehouseInboundModal";
import { WarehouseAdjustmentModal } from "@/components/admin/warehouse/WarehouseAdjustmentModal";
import { WarehousePackingModal } from "@/components/admin/warehouse/WarehousePackingModal";
import { ShippingLabelModal } from "@/components/admin/warehouse/ShippingLabelModal";
import {
  LayoutDashboard,
  Box,
  Boxes,
  History,
  RotateCcw,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";

export const WarehousePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "fulfillment" | "inventory" | "movements" | "returns"
  >("overview");

  // Data states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inventory, setInventory] = useState<InventorySummary[]>([]);
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [fulfillmentOrders, setFulfillmentOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);

  // Modals state
  const [isInboundOpen, setIsInboundOpen] = useState(false);
  const [inboundPreselectSku, setInboundPreselectSku] = useState<
    string | undefined
  >();

  const [adjustmentItem, setAdjustmentItem] = useState<InventorySummary | null>(
    null,
  );

  const [packingOrder, setPackingOrder] = useState<Order | null>(null);

  const [shippingLabelOrder, setShippingLabelOrder] = useState<Order | null>(
    null,
  );

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllData = useCallback(async () => {
    try {
      const [invRes, batchRes, movRes, ordRes, retRes] = await Promise.all([
        inventoryApi.getInventorySummary(),
        inventoryApi.getBatches(),
        inventoryApi.getMovements(),
        inventoryApi.getFulfillmentOrders(),
        inventoryApi.getReturnRequests(),
      ]);

      if (invRes.success && invRes.data) setInventory(invRes.data);
      if (batchRes.success && batchRes.data) setBatches(batchRes.data);
      if (movRes.success && movRes.data) setMovements(movRes.data);
      if (ordRes.success && ordRes.data) setFulfillmentOrders(ordRes.data);
      if (retRes.success && retRes.data) setReturns(retRes.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    showToast("Đã làm mới dữ liệu kho thành công");
  };

  // Inbound submit
  const handleInboundSubmit = async (data: InboundReceiptData) => {
    const res = await inventoryApi.stockIn(data);
    if (res.success) {
      showToast(res.message);
      await loadAllData();
    } else {
      throw new Error(res.message);
    }
  };

  // Adjustment submit
  const handleAdjustmentSubmit = async (data: {
    skuId: string;
    actualStock: number;
    reason: string;
  }) => {
    const res = await inventoryApi.adjustStock(data);
    if (res.success) {
      showToast(res.message);
      await loadAllData();
    } else {
      throw new Error(res.message);
    }
  };

  // Pack order submit
  const handleConfirmPack = async (
    orderId: string,
    data: { carrier: string; trackingCode: string; note?: string },
  ) => {
    const res = await inventoryApi.packOrder(orderId, data);
    if (res.success) {
      showToast(res.message);
      await loadAllData();
    } else {
      throw new Error(res.message);
    }
  };

  // Dispatch / Handover to carrier
  const handleDispatchOrder = async (orderId: string) => {
    const res = await inventoryApi.dispatchOrder(orderId);
    if (res.success) {
      showToast(res.message);
      await loadAllData();
    } else {
      alert(res.message);
    }
  };

  // Return inspection
  const handleInspectReturn = async (
    returnId: string,
    action: "RESTOCK" | "DAMAGED",
    note: string,
  ) => {
    const res = await inventoryApi.inspectReturnItem(returnId, action, note);
    if (res.success) {
      showToast(res.message);
      await loadAllData();
    } else {
      alert(res.message);
    }
  };

  const pendingPackCount = fulfillmentOrders.filter((o) =>
    ["CONFIRMED", "PAID"].includes(o.status),
  ).length;
  const lowStockCount = inventory.filter((i) => i.lowStock).length;
  const pendingReturnCount = returns.filter((r) =>
    ["SUBMITTED", "VERIFIED", "APPROVED"].includes(r.status),
  ).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-charcoal-900 px-4 py-3 text-xs font-medium text-white shadow-xl animate-fade-in border border-white/10">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-agarwood-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-agarwood-100 px-2.5 py-0.5 text-xs font-semibold text-agarwood-800">
              Phân Hệ Vận Hành Kho
            </span>
            <span className="text-xs text-charcoal-400">• Vai trò Thủ kho</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-agarwood-900 mt-1">
            Quản Lý Kho Hàng & Đóng Gói Đơn Hàng
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Theo dõi tồn kho thực tế, xử lý nhặt hàng & in vận đơn, nhập hàng
            theo lô và kiểm soát hàng hoàn.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-xl border border-charcoal-200 bg-white px-3.5 py-2 text-xs font-semibold text-charcoal-700 hover:bg-charcoal-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-agarwood-600" : ""}`}
            />
            <span>Làm mới</span>
          </button>

          <button
            onClick={() => {
              setInboundPreselectSku(undefined);
              setIsInboundOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-agarwood-700 hover:bg-agarwood-800 px-4 py-2 text-xs font-semibold text-cream transition-colors shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Lập Phiếu Nhập Kho</span>
          </button>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex overflow-x-auto scrollbar-none border-b border-agarwood-100 gap-1 sm:gap-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === "overview"
              ? "border-agarwood-600 text-agarwood-900 bg-agarwood-50/50"
              : "border-transparent text-charcoal-500 hover:text-charcoal-800 hover:border-charcoal-300"
          }`}
        >
          <LayoutDashboard className="h-4 w-4 text-agarwood-700" />
          <span>Tổng Quan & Quét Nhanh</span>
        </button>

        <button
          onClick={() => setActiveTab("fulfillment")}
          className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === "fulfillment"
              ? "border-agarwood-600 text-agarwood-900 bg-agarwood-50/50"
              : "border-transparent text-charcoal-500 hover:text-charcoal-800 hover:border-charcoal-300"
          }`}
        >
          <Box className="h-4 w-4 text-agarwood-700" />
          <span>Đóng Gói & Xuất Hàng</span>
          {pendingPackCount > 0 && (
            <span className="rounded-full bg-amber-500 text-white px-2 py-0.2 text-[10px] font-bold">
              {pendingPackCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === "inventory"
              ? "border-agarwood-600 text-agarwood-900 bg-agarwood-50/50"
              : "border-transparent text-charcoal-500 hover:text-charcoal-800 hover:border-charcoal-300"
          }`}
        >
          <Boxes className="h-4 w-4 text-agarwood-700" />
          <span>Tồn Kho & Lô Hàng</span>
          {lowStockCount > 0 && (
            <span className="rounded-full bg-red-500 text-white px-2 py-0.2 text-[10px] font-bold">
              {lowStockCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("movements")}
          className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === "movements"
              ? "border-agarwood-600 text-agarwood-900 bg-agarwood-50/50"
              : "border-transparent text-charcoal-500 hover:text-charcoal-800 hover:border-charcoal-300"
          }`}
        >
          <History className="h-4 w-4 text-agarwood-700" />
          <span>Nhật Ký Biến Động</span>
        </button>

        <button
          onClick={() => setActiveTab("returns")}
          className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === "returns"
              ? "border-agarwood-600 text-agarwood-900 bg-agarwood-50/50"
              : "border-transparent text-charcoal-500 hover:text-charcoal-800 hover:border-charcoal-300"
          }`}
        >
          <RotateCcw className="h-4 w-4 text-agarwood-700" />
          <span>Hàng Hoàn & Đổi Trả</span>
          {pendingReturnCount > 0 && (
            <span className="rounded-full bg-purple-600 text-white px-2 py-0.2 text-[10px] font-bold">
              {pendingReturnCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Tab Views */}
      {loading ? (
        <div className="py-20 text-center text-charcoal-400">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-agarwood-600 mb-2" />
          <p className="text-sm font-medium">Đang tải dữ liệu kho...</p>
        </div>
      ) : (
        <>
          {activeTab === "overview" && (
            <WarehouseOverviewTab
              inventory={inventory}
              fulfillmentOrders={fulfillmentOrders}
              returns={returns}
              onOpenInbound={(skuId) => {
                setInboundPreselectSku(skuId);
                setIsInboundOpen(true);
              }}
              onOpenPacking={(order) => setPackingOrder(order)}
              onOpenShippingLabel={(order) => setShippingLabelOrder(order)}
              onSwitchTab={(tab) => setActiveTab(tab as typeof activeTab)}
            />
          )}

          {activeTab === "fulfillment" && (
            <WarehouseFulfillmentTab
              orders={fulfillmentOrders}
              onOpenPacking={(order) => setPackingOrder(order)}
              onOpenShippingLabel={(order) => setShippingLabelOrder(order)}
              onDispatchOrder={handleDispatchOrder}
            />
          )}

          {activeTab === "inventory" && (
            <WarehouseInventoryTab
              inventory={inventory}
              batches={batches}
              onOpenInbound={(skuId) => {
                setInboundPreselectSku(skuId);
                setIsInboundOpen(true);
              }}
              onOpenAdjustment={(item) => setAdjustmentItem(item)}
            />
          )}

          {activeTab === "movements" && (
            <WarehouseMovementsTab movements={movements} />
          )}

          {activeTab === "returns" && (
            <WarehouseReturnsTab
              returns={returns}
              onInspectReturn={handleInspectReturn}
            />
          )}
        </>
      )}

      {/* Inbound Modal */}
      <WarehouseInboundModal
        isOpen={isInboundOpen}
        onClose={() => setIsInboundOpen(false)}
        inventoryList={inventory}
        preselectedSkuId={inboundPreselectSku}
        onSubmit={handleInboundSubmit}
      />

      {/* Adjustment Modal */}
      <WarehouseAdjustmentModal
        isOpen={!!adjustmentItem}
        onClose={() => setAdjustmentItem(null)}
        item={adjustmentItem}
        onSubmit={handleAdjustmentSubmit}
      />

      {/* Packing Modal */}
      <WarehousePackingModal
        isOpen={!!packingOrder}
        onClose={() => setPackingOrder(null)}
        order={packingOrder}
        onConfirmPack={handleConfirmPack}
        onOpenShippingLabel={(order) => {
          setPackingOrder(null);
          setShippingLabelOrder(order);
        }}
      />

      {/* Shipping Label Modal */}
      <ShippingLabelModal
        isOpen={!!shippingLabelOrder}
        onClose={() => setShippingLabelOrder(null)}
        order={shippingLabelOrder}
      />
    </div>
  );
};
