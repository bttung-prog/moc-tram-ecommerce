import React, { useState, useEffect } from "react";
import type { InventorySummary } from "@/services/inventoryApi";
import { X, Scale, AlertTriangle } from "lucide-react";

interface WarehouseAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventorySummary | null;
  onSubmit: (data: {
    skuId: string;
    actualStock: number;
    reason: string;
  }) => Promise<void>;
}

export const WarehouseAdjustmentModal: React.FC<
  WarehouseAdjustmentModalProps
> = ({ isOpen, onClose, item, onSubmit }) => {
  const [actualStock, setActualStock] = useState<number>(item?.onHand || 0);
  const [reasonCategory, setReasonCategory] = useState("Kiểm kê định kỳ");
  const [detailReason, setDetailReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setActualStock(item.onHand);
      setDetailReason("");
      setError(null);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const diff = actualStock - item.onHand;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (actualStock < 0) {
      setError("Số lượng thực tế không được âm");
      return;
    }
    if (diff === 0) {
      setError(
        "Số lượng thực tế trùng khớp với số trên hệ thống (không có chênh lệch)",
      );
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const combinedReason = `${reasonCategory}${detailReason ? `: ${detailReason}` : ""}`;
      await onSubmit({
        skuId: item.skuId,
        actualStock,
        reason: combinedReason,
      });
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Có lỗi khi cân bằng tồn kho",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-700/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-agarwood-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-agarwood-100 px-6 py-4 bg-amber-50/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-charcoal-900">
                Kiểm Kê & Cân Bằng Tồn Kho
              </h3>
              <p className="text-xs text-charcoal-500">
                Điều chỉnh số lượng thực tế sau kiểm đếm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-charcoal-400 hover:bg-white hover:text-charcoal-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Item Info Card */}
          <div className="rounded-xl bg-ivory p-3.5 border border-agarwood-100 space-y-1 text-xs">
            <p className="font-bold text-agarwood-900 text-sm">
              {item.productName}
            </p>
            <p className="text-charcoal-500">
              Quy cách:{" "}
              <span className="font-medium text-charcoal-700">
                {item.specLabel}
              </span>
            </p>
            <div className="flex justify-between items-center pt-2 border-t border-agarwood-100 mt-2 text-charcoal-600">
              <span>
                Tồn hệ thống:{" "}
                <strong className="text-charcoal-900">{item.onHand}</strong>
              </span>
              <span>
                Đang giữ chỗ đơn:{" "}
                <strong className="text-amber-800">{item.committed}</strong>
              </span>
            </div>
          </div>

          {/* Actual Count Input */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Số lượng kiểm đếm thực tế <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={actualStock}
              onChange={(e) => setActualStock(parseInt(e.target.value) || 0)}
              className="w-full rounded-xl border border-agarwood-300 px-3.5 py-2.5 text-base font-mono font-bold text-charcoal-900 focus:border-agarwood-600 focus:outline-none"
              required
            />
          </div>

          {/* Diff Indicator */}
          <div
            className={`rounded-xl p-3 border text-xs flex items-center justify-between font-medium ${
              diff === 0
                ? "bg-charcoal-50 border-charcoal-200 text-charcoal-600"
                : diff > 0
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <span>Độ lệch chênh lệch:</span>
            <span className="font-mono text-sm font-bold">
              {diff > 0
                ? `+${diff} (Thừa hàng)`
                : diff < 0
                  ? `${diff} (Thiếu hàng / Hao hụt)`
                  : "Khớp số liệu"}
            </span>
          </div>

          {/* Reason Category */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Lý do điều chỉnh <span className="text-red-500">*</span>
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full rounded-xl border border-agarwood-200 px-3.5 py-2 text-xs text-charcoal-800 focus:border-agarwood-500 focus:outline-none"
            >
              <option value="Kiểm kê định kỳ tháng">
                Kiểm kê định kỳ tháng
              </option>
              <option value="Hao hụt tự nhiên / Bay hơi mùi hương">
                Hao hụt tự nhiên / Bay hơi mùi hương
              </option>
              <option value="Hư hỏng / Vỡ nứt trong lưu kho">
                Hư hỏng / Vỡ nứt trong lưu kho
              </option>
              <option value="Xuất làm mẫu thử tại Showroom">
                Xuất làm mẫu thử tại Showroom
              </option>
              <option value="Sai sót nhặt nhầm đơn trước đó">
                Sai sót nhặt nhầm đơn trước đó
              </option>
              <option value="Tìm thấy hàng thất lạc">
                Tìm thấy hàng thất lạc
              </option>
            </select>
          </div>

          {/* Detail Note */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Chi tiết biên bản kiểm kê
            </label>
            <input
              type="text"
              value={detailReason}
              onChange={(e) => setDetailReason(e.target.value)}
              placeholder="VD: Biên bản số 24/BB-KK do thủ kho Nguyễn Văn A lập"
              className="w-full rounded-xl border border-agarwood-200 px-3.5 py-2 text-xs text-charcoal-800 focus:border-agarwood-500 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-agarwood-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-charcoal-200 px-4 py-2 text-xs font-semibold text-charcoal-600 hover:bg-charcoal-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || diff === 0}
              className="rounded-xl bg-agarwood-700 px-5 py-2 text-xs font-semibold text-cream hover:bg-agarwood-800 transition-colors shadow-sm disabled:opacity-40"
            >
              {submitting ? "Đang xử lý..." : "Xác nhận Điều chỉnh tồn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
