import React, { useState } from "react";
import type { InventorySummary } from "@/services/inventoryApi";
import type { InventoryBatch } from "@/types";
import {
  Search,
  AlertTriangle,
  PlusCircle,
  Layers,
  CheckCircle,
  Boxes,
} from "lucide-react";

interface WarehouseInventoryTabProps {
  inventory: InventorySummary[];
  batches: InventoryBatch[];
  onOpenInbound: (skuId?: string) => void;
  onOpenAdjustment: (item: InventorySummary) => void;
}

export const WarehouseInventoryTab: React.FC<WarehouseInventoryTabProps> = ({
  inventory,
  batches,
  onOpenInbound,
  onOpenAdjustment,
}) => {
  const [viewMode, setViewMode] = useState<"skus" | "batches">("skus");
  const [searchTerm, setSearchTerm] = useState("");
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Filter SKUs
  const filteredSkus = inventory.filter((item) => {
    if (onlyLowStock && !item.lowStock) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = item.productName.toLowerCase().includes(q);
      const matchSku = item.skuId.toLowerCase().includes(q);
      const matchSpec = item.specLabel.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchSpec) return false;
    }
    return true;
  });

  // Filter Batches
  const filteredBatches = batches.filter((batch) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchCode = batch.batchCode.toLowerCase().includes(q);
      const matchName = batch.productName.toLowerCase().includes(q);
      const matchNote = batch.note.toLowerCase().includes(q);
      if (!matchCode && !matchName && !matchNote) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* View Switcher & Action Top Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-agarwood-100 shadow-sm">
        {/* Toggle SKUs vs Batches */}
        <div className="flex items-center gap-1.5 p-1 bg-charcoal-50 rounded-xl">
          <button
            onClick={() => setViewMode("skus")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === "skus"
                ? "bg-white text-agarwood-900 shadow-sm"
                : "text-charcoal-500 hover:text-charcoal-800"
            }`}
          >
            <Boxes className="h-4 w-4 text-agarwood-700" />
            <span>Tồn Kho Theo SKU ({inventory.length})</span>
          </button>
          <button
            onClick={() => setViewMode("batches")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === "batches"
                ? "bg-white text-agarwood-900 shadow-sm"
                : "text-charcoal-500 hover:text-charcoal-800"
            }`}
          >
            <Layers className="h-4 w-4 text-agarwood-700" />
            <span>Quản Lý Lô Hàng ({batches.length})</span>
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {viewMode === "skus" && (
            <button
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                onlyLowStock
                  ? "bg-red-50 text-red-700 border-red-200 font-semibold"
                  : "bg-white text-charcoal-600 border-charcoal-200 hover:bg-charcoal-50"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              <span>
                Chỉ xem sắp hết ({inventory.filter((i) => i.lowStock).length})
              </span>
            </button>
          )}

          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-charcoal-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                viewMode === "skus"
                  ? "Tìm theo tên, SKU..."
                  : "Tìm mã lô, xưởng..."
              }
              className="w-full rounded-xl border border-agarwood-200 pl-8 pr-3 py-1.5 text-xs text-charcoal-800 focus:border-agarwood-500 focus:outline-none"
            />
          </div>

          <button
            onClick={() => onOpenInbound()}
            className="flex items-center gap-1.5 rounded-xl bg-agarwood-700 hover:bg-agarwood-800 px-3.5 py-1.5 text-xs font-semibold text-cream transition-colors shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Tạo Phiếu Nhập Kho</span>
          </button>
        </div>
      </div>

      {/* Mode 1: SKUs Inventory Table */}
      {viewMode === "skus" && (
        <div className="rounded-2xl bg-white border border-agarwood-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-charcoal-700">
              <thead className="bg-ivory/80 border-b border-agarwood-100 text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
                <tr>
                  <th className="px-5 py-3.5">Sản Phẩm & Quy Cách</th>
                  <th className="px-4 py-3.5">Mã SKU</th>
                  <th className="px-4 py-3.5 text-right">Tồn Thực Tế</th>
                  <th className="px-4 py-3.5 text-right">Đang Giữ Chỗ</th>
                  <th className="px-4 py-3.5 text-right">Khả Dụng Bán</th>
                  <th className="px-4 py-3.5 text-center">Trạng Thái</th>
                  <th className="px-5 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {filteredSkus.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-charcoal-400"
                    >
                      Không tìm thấy SKU nào phù hợp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredSkus.map((item) => (
                    <tr
                      key={item.skuId}
                      className="hover:bg-charcoal-50/70 transition-colors"
                    >
                      {/* Product Name & Image */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="h-11 w-11 rounded-lg object-cover border border-charcoal-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/images/products/placeholder.jpg";
                            }}
                          />
                          <div>
                            <p className="font-semibold text-charcoal-900 line-clamp-1">
                              {item.productName}
                            </p>
                            <p className="text-[11px] text-charcoal-400">
                              {item.specLabel}
                              {item.weightG ? ` • ${item.weightG}g` : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* SKU Code */}
                      <td className="px-4 py-3 font-mono font-bold text-charcoal-700">
                        {item.skuId}
                      </td>

                      {/* On Hand */}
                      <td className="px-4 py-3 text-right font-mono font-bold text-charcoal-900 text-sm">
                        {item.onHand}
                      </td>

                      {/* Committed */}
                      <td className="px-4 py-3 text-right font-mono text-amber-700 font-semibold">
                        {item.committed}
                      </td>

                      {/* Available */}
                      <td className="px-4 py-3 text-right font-mono font-extrabold text-emerald-700 text-sm">
                        {item.available}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        {item.lowStock ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-700 border border-red-200">
                            <AlertTriangle className="h-3 w-3" /> Sắp hết hàng
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                            <CheckCircle className="h-3 w-3" /> An toàn
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => onOpenInbound(item.skuId)}
                            title="Lập phiếu nhập thêm cho SKU này"
                            className="rounded-lg bg-agarwood-50 px-2.5 py-1 text-[11px] font-semibold text-agarwood-700 hover:bg-agarwood-100 transition-colors border border-agarwood-200"
                          >
                            + Nhập
                          </button>
                          <button
                            onClick={() => onOpenAdjustment(item)}
                            title="Kiểm đếm và cân bằng lại tồn kho"
                            className="rounded-lg bg-charcoal-100 px-2.5 py-1 text-[11px] font-semibold text-charcoal-700 hover:bg-charcoal-200 transition-colors"
                          >
                            Cân bằng
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mode 2: Batches View */}
      {viewMode === "batches" && (
        <div className="rounded-2xl bg-white border border-agarwood-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-charcoal-700">
              <thead className="bg-ivory/80 border-b border-agarwood-100 text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
                <tr>
                  <th className="px-5 py-3.5">Mã Lô (Batch Code)</th>
                  <th className="px-5 py-3.5">Sản Phẩm & Quy Cách</th>
                  <th className="px-4 py-3.5">Mã SKU</th>
                  <th className="px-4 py-3.5 text-right">Số Lượng Nhập</th>
                  <th className="px-4 py-3.5">Ngày Nhập Kho</th>
                  <th className="px-5 py-3.5">Xưởng Xuất Xứ / Ghi Chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {filteredBatches.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-charcoal-400"
                    >
                      Không có thông tin lô hàng nào.
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map((batch) => (
                    <tr
                      key={batch.id}
                      className="hover:bg-charcoal-50/70 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-agarwood-900">
                        {batch.batchCode}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-charcoal-800">
                        {batch.productName}
                        <p className="text-[11px] text-charcoal-400 font-normal">
                          {batch.specLabel}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-charcoal-600">
                        {batch.skuId}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-800 text-sm">
                        +{batch.quantity}
                      </td>
                      <td className="px-4 py-3.5 text-charcoal-600">
                        {batch.receivedDate}
                      </td>
                      <td className="px-5 py-3.5 text-charcoal-600">
                        {batch.note || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
