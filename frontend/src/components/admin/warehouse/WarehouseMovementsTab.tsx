import React, { useState } from "react";
import type { InventoryMovement } from "@/types";
import { Search, ArrowDownRight, ArrowUpRight, RefreshCw } from "lucide-react";

interface WarehouseMovementsTabProps {
  movements: InventoryMovement[];
}

export const WarehouseMovementsTab: React.FC<WarehouseMovementsTabProps> = ({
  movements,
}) => {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMovements = movements.filter((m) => {
    if (filterType !== "ALL" && m.type !== filterType) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchSku = m.skuId.toLowerCase().includes(q);
      const matchName = m.productName.toLowerCase().includes(q);
      const matchReason = m.reason.toLowerCase().includes(q);
      if (!matchSku && !matchName && !matchReason) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-agarwood-100 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
              filterType === "ALL"
                ? "bg-agarwood-700 text-cream font-semibold shadow-sm"
                : "bg-charcoal-50 text-charcoal-600 hover:bg-charcoal-100"
            }`}
          >
            Tất cả ({movements.length})
          </button>
          <button
            onClick={() => setFilterType("IN")}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
              filterType === "IN"
                ? "bg-emerald-700 text-cream font-semibold shadow-sm"
                : "bg-charcoal-50 text-charcoal-600 hover:bg-charcoal-100"
            }`}
          >
            Nhập kho ({movements.filter((m) => m.type === "IN").length})
          </button>
          <button
            onClick={() => setFilterType("OUT")}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
              filterType === "OUT"
                ? "bg-orange-700 text-cream font-semibold shadow-sm"
                : "bg-charcoal-50 text-charcoal-600 hover:bg-charcoal-100"
            }`}
          >
            Xuất đơn ({movements.filter((m) => m.type === "OUT").length})
          </button>
          <button
            onClick={() => setFilterType("ADJUST")}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
              filterType === "ADJUST"
                ? "bg-purple-700 text-cream font-semibold shadow-sm"
                : "bg-charcoal-50 text-charcoal-600 hover:bg-charcoal-100"
            }`}
          >
            Kiểm kê điều chỉnh (
            {movements.filter((m) => m.type === "ADJUST").length})
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-charcoal-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo sản phẩm, mã SKU, chứng từ..."
            className="w-full rounded-xl border border-agarwood-200 pl-8 pr-3 py-1.5 text-xs text-charcoal-800 focus:border-agarwood-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Movements Table */}
      <div className="rounded-2xl bg-white border border-agarwood-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-charcoal-700">
            <thead className="bg-ivory/80 border-b border-agarwood-100 text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
              <tr>
                <th className="px-5 py-3.5">Thời Gian</th>
                <th className="px-4 py-3.5">Loại Biến Động</th>
                <th className="px-5 py-3.5">Sản Phẩm & Quy Cách</th>
                <th className="px-4 py-3.5">Mã SKU</th>
                <th className="px-4 py-3.5 text-right">Số Lượng</th>
                <th className="px-5 py-3.5">Lý Do / Chứng Từ Phát Sinh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-charcoal-400"
                  >
                    Chưa có nhật ký biến động kho nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => {
                  const isIn = m.type === "IN";
                  const isOut = m.type === "OUT";
                  const isAdjust = m.type === "ADJUST";

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-charcoal-50/70 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="px-5 py-3.5 font-mono text-charcoal-500 text-[11px]">
                        {new Date(m.timestamp).toLocaleString("vi-VN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Movement Type */}
                      <td className="px-4 py-3.5">
                        {isIn && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                            <ArrowDownRight className="h-3 w-3 text-emerald-600" />
                            Nhập kho
                          </span>
                        )}
                        {isOut && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-orange-800 border border-orange-200">
                            <ArrowUpRight className="h-3 w-3 text-orange-600" />
                            Xuất đơn
                          </span>
                        )}
                        {isAdjust && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-800 border border-purple-200">
                            <RefreshCw className="h-3 w-3 text-purple-600" />
                            Điều chỉnh
                          </span>
                        )}
                      </td>

                      {/* Product Name */}
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-charcoal-900">
                          {m.productName}
                        </p>
                        <p className="text-[11px] text-charcoal-400">
                          {m.specLabel}
                        </p>
                      </td>

                      {/* SKU */}
                      <td className="px-4 py-3.5 font-mono font-bold text-charcoal-700">
                        {m.skuId}
                      </td>

                      {/* Quantity */}
                      <td
                        className={`px-4 py-3.5 text-right font-mono text-sm font-extrabold ${
                          isIn
                            ? "text-emerald-700"
                            : isOut
                              ? "text-orange-700"
                              : "text-purple-700"
                        }`}
                      >
                        {isIn
                          ? `+${m.quantity}`
                          : isOut
                            ? `-${m.quantity}`
                            : `±${m.quantity}`}
                      </td>

                      {/* Reason */}
                      <td className="px-5 py-3.5 text-charcoal-600 text-xs">
                        {m.reason}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
