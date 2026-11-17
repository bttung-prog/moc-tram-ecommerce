import React, { useState } from "react";
import type { TopProduct, InventoryAlert } from "@/services/adminDashboardApi";
import { formatVND } from "@/utils/format";
import { FRAGILITY_LABELS } from "@/constants/enums";
import { Flame, AlertTriangle, PackageCheck } from "lucide-react";

interface TopProductsListProps {
  topProducts: TopProduct[];
  inventoryAlerts: InventoryAlert[];
  loading?: boolean;
}

export const TopProductsList: React.FC<TopProductsListProps> = ({
  topProducts,
  inventoryAlerts,
  loading,
}) => {
  const [tab, setTab] = useState<"bestseller" | "lowstock">("bestseller");

  if (loading) {
    return (
      <div className="rounded-2xl border border-agarwood-100 bg-white p-4 sm:p-6 shadow-sm">
        <div className="h-5 w-1/3 skeleton mb-4" />
        <div className="space-y-3">
          <div className="h-16 skeleton w-full rounded-xl" />
          <div className="h-16 skeleton w-full rounded-xl" />
          <div className="h-16 skeleton w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-agarwood-100 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Header with Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 pb-3 sm:pb-4 border-b border-agarwood-50">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-agarwood-900">
            {tab === "bestseller"
              ? "Sản phẩm Bán chạy"
              : "Cảnh báo Tồn kho Thấp"}
          </h3>
          <p className="text-[11px] sm:text-xs text-charcoal-400 mt-0.5">
            {tab === "bestseller"
              ? "Xếp hạng theo doanh số thực tế"
              : "SKU có lượng tồn < 15 sp cần nhập thêm"}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center rounded-xl bg-agarwood-50 p-1 border border-agarwood-200/60 text-xs self-start sm:self-auto shrink-0">
          <button
            onClick={() => setTab("bestseller")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-all ${
              tab === "bestseller"
                ? "bg-agarwood-800 text-cream shadow-xs font-semibold"
                : "text-charcoal-500 hover:text-agarwood-800"
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span>Bán chạy</span>
          </button>
          <button
            onClick={() => setTab("lowstock")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-all ${
              tab === "lowstock"
                ? "bg-agarwood-800 text-cream shadow-xs font-semibold"
                : "text-charcoal-500 hover:text-agarwood-800"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span>Sắp hết</span>
            {inventoryAlerts.length > 0 && (
              <span className="rounded-full bg-amber-500/20 text-amber-700 px-1.5 text-[10px] font-bold">
                {inventoryAlerts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-6 space-y-2.5 sm:space-y-3">
        {tab === "bestseller" ? (
          topProducts.length > 0 ? (
            topProducts.map((prod, idx) => (
              <div
                key={prod.productId}
                className="flex items-center justify-between gap-2.5 sm:gap-3 rounded-xl border border-agarwood-100 p-2.5 sm:p-3 hover:border-agarwood-300 hover:bg-agarwood-50/20 transition-all"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md bg-agarwood-100 text-[10px] sm:text-xs font-bold text-agarwood-800 shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 overflow-hidden rounded-lg bg-agarwood-50 border border-agarwood-100">
                    <img
                      src={prod.image}
                      alt={prod.productName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%23B08D57" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-charcoal-600 truncate">
                      {prod.productName}
                    </div>
                    <div className="text-[11px] text-charcoal-400 truncate">
                      Quy cách: {prod.specLabel}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono text-xs font-bold text-agarwood-900">
                    {formatVND(prod.revenue)}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[10px] sm:text-[11px] text-charcoal-400 mt-0.5">
                    <span>
                      Đã bán:{" "}
                      <b className="text-charcoal-600">{prod.soldCount}</b>
                    </span>
                    <span>·</span>
                    <span
                      className={
                        prod.isLowStock
                          ? "text-rose-600 font-semibold"
                          : "text-emerald-600"
                      }
                    >
                      Còn: {prod.currentStock}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-charcoal-400">
              Chưa có dữ liệu sản phẩm bán ra
            </div>
          )
        ) : inventoryAlerts.length > 0 ? (
          inventoryAlerts.map((item) => (
            <div
              key={item.skuId}
              className="flex items-center justify-between gap-2.5 sm:gap-3 rounded-xl border border-amber-200/80 bg-amber-50/30 p-2.5 sm:p-3 hover:border-amber-300 transition-all"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-charcoal-600 truncate">
                    {item.productName}
                  </div>
                  <div className="text-[11px] text-charcoal-400 truncate flex items-center gap-1.5 flex-wrap">
                    <span>{item.specLabel}</span>
                    {item.fragilityLevel > 1 && (
                      <span className="text-[10px] text-rose-600 bg-rose-50 px-1 rounded">
                        {FRAGILITY_LABELS[item.fragilityLevel]}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-xs font-bold text-rose-600 bg-rose-100/70 px-2 py-0.5 rounded-md">
                  Còn {item.stock} sp
                </span>
                <div className="text-[10px] text-charcoal-400 mt-0.5">
                  Ngưỡng: {item.threshold}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-xs text-emerald-600 flex flex-col items-center gap-1.5">
            <PackageCheck className="h-6 w-6 text-emerald-500" />
            <span>Tồn kho hiện tại đều ở mức an toàn</span>
          </div>
        )}
      </div>
    </div>
  );
};
