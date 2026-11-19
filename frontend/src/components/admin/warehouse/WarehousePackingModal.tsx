import React, { useState } from "react";
import type { Order } from "@/types";
import {
  X,
  CheckSquare,
  Square,
  Box,
  ShieldCheck,
  Printer,
} from "lucide-react";

interface WarehousePackingModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPack: (
    orderId: string,
    data: { carrier: string; trackingCode: string; note?: string },
  ) => Promise<void>;
  onOpenShippingLabel: (order: Order) => void;
}

export const WarehousePackingModal: React.FC<WarehousePackingModalProps> = ({
  order,
  isOpen,
  onClose,
  onConfirmPack,
  onOpenShippingLabel,
}) => {
  const [carrier, setCarrier] = useState("Giao Hàng Tiết Kiệm (GHTK)");
  const [trackingCode, setTrackingCode] = useState(
    `GHTK${Math.floor(100000000 + Math.random() * 900000000)}`,
  );
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [packingNote, setPackingNote] = useState(
    "Đã bọc màng xốp khí và túi chống ẩm",
  );
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const toggleItem = (skuId: string) => {
    setCheckedItems((prev) => ({ ...prev, [skuId]: !prev[skuId] }));
  };

  const allItemsChecked = order.items.every((i) => checkedItems[i.skuId]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allItemsChecked) {
      if (
        !confirm(
          "Chưa đánh dấu kiểm tra đủ toàn bộ sản phẩm. Bạn có chắc chắn muốn xác nhận đóng gói?",
        )
      ) {
        return;
      }
    }

    try {
      setSubmitting(true);
      await onConfirmPack(order.id, {
        carrier,
        trackingCode,
        note: packingNote,
      });
      onClose();
    } catch {
      // Error handled in parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-700/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-agarwood-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-agarwood-100 px-6 py-4 bg-agarwood-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-agarwood-100 text-agarwood-800">
              <Box className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-agarwood-900">
                Quy Trình Đóng Gói Đơn Hàng
              </h3>
              <p className="text-xs text-charcoal-400">
                Mã đơn:{" "}
                <span className="font-mono font-bold text-agarwood-800">
                  {order.orderCode}
                </span>
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

        {/* Content */}
        <form
          onSubmit={handleConfirm}
          className="p-6 space-y-4 overflow-y-auto max-h-[75vh]"
        >
          {/* Checklist Sản phẩm nhặt hàng */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
                1. Danh sách sản phẩm cần nhặt (Nhấp để tick kiểm)
              </span>
              <button
                type="button"
                onClick={() => {
                  const all: Record<string, boolean> = {};
                  order.items.forEach((i) => (all[i.skuId] = true));
                  setCheckedItems(all);
                }}
                className="text-[11px] font-semibold text-agarwood-700 hover:underline"
              >
                Nhặt tất cả
              </button>
            </div>

            <div className="space-y-2 border border-agarwood-100 rounded-xl p-3 bg-ivory">
              {order.items.map((item) => {
                const isChecked = !!checkedItems[item.skuId];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.skuId)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border ${
                      isChecked
                        ? "bg-emerald-50/80 border-emerald-300 text-emerald-900"
                        : "bg-white border-charcoal-200 text-charcoal-800 hover:bg-charcoal-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isChecked ? (
                        <CheckSquare className="h-5 w-5 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="h-5 w-5 text-charcoal-400 shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-semibold leading-tight">
                          {item.productName}
                        </p>
                        <p className="text-[11px] text-charcoal-500">
                          Quy cách: {item.specLabel}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-sm font-bold">
                        x{item.quantity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chọn Đơn vị vận chuyển & Mã vận đơn */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Đơn vị vận chuyển
              </label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full rounded-xl border border-agarwood-200 px-3 py-2 text-xs text-charcoal-800 focus:border-agarwood-500 focus:outline-none"
              >
                <option value="Giao Hàng Tiết Kiệm (GHTK)">GHTK</option>
                <option value="Viettel Post">Viettel Post</option>
                <option value="Giao Hàng Nhanh (GHN)">GHN Express</option>
                <option value="J&T Express">J&T Express</option>
                <option value="Hỏa tốc Nội thành (Ahamove)">Ahamove</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Mã vận đơn (Quét hoặc tự sinh)
              </label>
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="w-full rounded-xl border border-agarwood-200 px-3 py-2 text-xs font-mono font-semibold text-charcoal-800 focus:border-agarwood-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Tiêu chuẩn đóng gói hàng Trầm */}
          <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <ShieldCheck className="h-4 w-4 text-amber-700" />
              <span>Tiêu chuẩn đóng gói hàng Mộc Trầm:</span>
            </div>
            <ul className="list-disc pl-5 text-[11px] text-amber-800 space-y-0.5">
              <li>
                Chèn màng xốp bóng khí tối thiểu 3 lớp cho lư xông / tượng trầm.
              </li>
              <li>
                Bỏ kèm gói hút ẩm trong hộp nhang tăm, nhang nụ để tránh biến
                chất hương.
              </li>
              <li>Dán niêm phong tem chống hàng giả Mộc Trầm trên nắp hộp.</li>
            </ul>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Ghi chú đóng gói
            </label>
            <input
              type="text"
              value={packingNote}
              onChange={(e) => setPackingNote(e.target.value)}
              className="w-full rounded-xl border border-agarwood-200 px-3 py-2 text-xs text-charcoal-800 focus:border-agarwood-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-agarwood-100">
            <button
              type="button"
              onClick={() => onOpenShippingLabel(order)}
              className="flex items-center gap-1 text-xs font-semibold text-agarwood-700 hover:text-agarwood-900"
            >
              <Printer className="h-4 w-4" />
              <span>Xem trước tem in</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-charcoal-200 px-4 py-2 text-xs font-semibold text-charcoal-600 hover:bg-charcoal-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-xl bg-agarwood-700 px-5 py-2 text-xs font-semibold text-cream hover:bg-agarwood-800 transition-colors shadow-sm disabled:opacity-50"
              >
                <Box className="h-4 w-4" />
                <span>
                  {submitting ? "Đang xử lý..." : "Hoàn tất Đóng Gói"}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
