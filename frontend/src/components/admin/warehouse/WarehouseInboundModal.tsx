import React, { useState } from "react";
import type {
  InventorySummary,
  InboundReceiptData,
} from "@/services/inventoryApi";
import { X, ArrowDownRight, PackagePlus, AlertCircle } from "lucide-react";

interface WarehouseInboundModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryList: InventorySummary[];
  preselectedSkuId?: string;
  onSubmit: (data: InboundReceiptData) => Promise<void>;
}

export const WarehouseInboundModal: React.FC<WarehouseInboundModalProps> = ({
  isOpen,
  onClose,
  inventoryList,
  preselectedSkuId,
  onSubmit,
}) => {
  const [skuId, setSkuId] = useState(
    preselectedSkuId || inventoryList[0]?.skuId || "",
  );
  const [quantity, setQuantity] = useState<number>(20);
  const [batchCode, setBatchCode] = useState(
    `LOT-${new Date().toISOString().slice(2, 7).replace("-", "")}-${Math.floor(100 + Math.random() * 900)}`,
  );
  const [receivedDate, setReceivedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [supplierOrWorkshop, setSupplierOrWorkshop] = useState(
    "Xưởng Hương Khê (Hà Tĩnh)",
  );
  const [note, setNote] = useState(
    "Nhập bổ sung định kỳ theo hợp đồng gia công",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedItem = inventoryList.find((i) => i.skuId === skuId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuId) {
      setError("Vui lòng chọn sản phẩm / SKU");
      return;
    }
    if (quantity <= 0) {
      setError("Số lượng nhập phải lớn hơn 0");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit({
        skuId,
        quantity,
        batchCode,
        receivedDate,
        supplierOrWorkshop,
        note,
      });
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi nhập kho",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-700/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-agarwood-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-agarwood-100 px-6 py-4 bg-agarwood-50/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-agarwood-100 text-agarwood-800">
              <PackagePlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-agarwood-900">
                Lập Phiếu Nhập Kho (Inbound)
              </h3>
              <p className="text-xs text-charcoal-400">
                Nhập hàng mới từ xưởng chế tác hoặc nhà cung cấp
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

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto max-h-[75vh]"
        >
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Chọn Sản phẩm & SKU */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Sản phẩm & Quy cách SKU <span className="text-red-500">*</span>
            </label>
            <select
              value={skuId}
              onChange={(e) => setSkuId(e.target.value)}
              className="w-full rounded-xl border border-agarwood-200 bg-white px-3.5 py-2.5 text-xs text-charcoal-800 focus:border-agarwood-500 focus:outline-none focus:ring-1 focus:ring-agarwood-500 shadow-sm"
              required
            >
              {inventoryList.map((item) => (
                <option key={item.skuId} value={item.skuId}>
                  {item.productName} — [{item.specLabel}] (Hiện có:{" "}
                  {item.onHand})
                </option>
              ))}
            </select>
          </div>

          {selectedItem && (
            <div className="rounded-xl bg-ivory p-3 border border-agarwood-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-charcoal-400">Tồn kho hiện tại:</span>{" "}
                <span className="font-bold text-agarwood-800">
                  {selectedItem.onHand} cái
                </span>
              </div>
              <div>
                <span className="text-charcoal-400">Sau khi nhập:</span>{" "}
                <span className="font-bold text-emerald-700">
                  {selectedItem.onHand + (Number(quantity) || 0)} cái
                </span>
              </div>
            </div>
          )}

          {/* Số lượng & Mã Lô */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Số lượng nhập <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 0))
                }
                className="w-full rounded-xl border border-agarwood-200 px-3.5 py-2 text-xs font-mono font-semibold text-charcoal-900 focus:border-agarwood-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Mã Lô hàng (Batch Code)
              </label>
              <input
                type="text"
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                placeholder="Ví dụ: LOT-2511-001"
                className="w-full rounded-xl border border-agarwood-200 px-3.5 py-2 text-xs font-mono text-charcoal-800 focus:border-agarwood-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Ngày nhập & Xưởng cung cấp */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Ngày nhập kho
              </label>
              <input
                type="date"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="w-full rounded-xl border border-agarwood-200 px-3.5 py-2 text-xs text-charcoal-800 focus:border-agarwood-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Xưởng / Nguồn gốc
              </label>
              <select
                value={supplierOrWorkshop}
                onChange={(e) => setSupplierOrWorkshop(e.target.value)}
                className="w-full rounded-xl border border-agarwood-200 px-3.5 py-2 text-xs text-charcoal-800 focus:border-agarwood-500 focus:outline-none"
              >
                <option value="Xưởng Hương Khê (Hà Tĩnh)">
                  Xưởng Hương Khê (Hà Tĩnh)
                </option>
                <option value="Xưởng Tiên Phước (Quảng Nam)">
                  Xưởng Tiên Phước (Quảng Nam)
                </option>
                <option value="Xưởng Vạn Giã (Khánh Hòa)">
                  Xưởng Vạn Giã (Khánh Hòa)
                </option>
                <option value="Xưởng Chế tác Mỹ Nghệ">
                  Xưởng Chế tác Mỹ Nghệ
                </option>
                <option value="Nhập khẩu nguyên liệu">
                  Nhập khẩu nguyên liệu
                </option>
              </select>
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Ghi chú chứng từ / kiểm tra chất lượng
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Kiểm tra độ ẩm đạt chuẩn < 12%, hàng nguyên seal, tem kiểm định..."
              className="w-full rounded-xl border border-agarwood-200 px-3.5 py-2 text-xs text-charcoal-800 focus:border-agarwood-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-agarwood-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-charcoal-200 px-4 py-2 text-xs font-semibold text-charcoal-600 hover:bg-charcoal-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-xl bg-agarwood-700 px-5 py-2 text-xs font-semibold text-cream hover:bg-agarwood-800 transition-colors shadow-sm disabled:opacity-50"
            >
              <ArrowDownRight className="h-4 w-4" />
              <span>{submitting ? "Đang lưu..." : "Xác nhận Nhập Kho"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
