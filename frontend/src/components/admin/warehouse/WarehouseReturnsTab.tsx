import React, { useState } from "react";
import type { ReturnRequest } from "@/types";
import { RotateCcw, CheckCircle2, Search, X } from "lucide-react";

interface WarehouseReturnsTabProps {
  returns: ReturnRequest[];
  onInspectReturn: (
    returnId: string,
    action: "RESTOCK" | "DAMAGED",
    note: string,
  ) => Promise<void>;
}

export const WarehouseReturnsTab: React.FC<WarehouseReturnsTabProps> = ({
  returns,
  onInspectReturn,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(
    null,
  );
  const [inspectAction, setInspectAction] = useState<"RESTOCK" | "DAMAGED">(
    "RESTOCK",
  );
  const [inspectNote, setInspectNote] = useState(
    "Đã kiểm tra kiện hàng hoàn: Vỏ hộp còn nguyên seal, sản phẩm không trầy xước, đủ phụ kiện.",
  );
  const [submitting, setSubmitting] = useState(false);

  const filteredReturns = returns.filter((r) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchCode = r.requestCode.toLowerCase().includes(q);
      const matchOrder = r.orderCode.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      if (!matchCode && !matchOrder && !matchDesc) return false;
    }
    return true;
  });

  const handleConfirmInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;

    try {
      setSubmitting(true);
      await onInspectReturn(selectedReturn.id, inspectAction, inspectNote);
      setSelectedReturn(null);
    } finally {
      setSubmitting(false);
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case "DAMAGED_IN_TRANSIT":
        return "Bị hỏng vỡ trong quá trình vận chuyển";
      case "WRONG_ITEM":
        return "Giao nhầm sản phẩm / quy cách";
      case "NOT_AS_DESCRIBED":
        return "Sản phẩm không đúng mô tả";
      default:
        return "Lý do khác";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-agarwood-100 shadow-sm">
        <div>
          <h3 className="font-serif text-sm font-bold text-agarwood-900">
            Quản Lý Kiện Hàng Hoàn & Đổi Trả Về Kho
          </h3>
          <p className="text-xs text-charcoal-400">
            Kiểm tra thực tế hàng đổi trả từ khách hoặc hàng shipper hoàn do
            không giao được
          </p>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-charcoal-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã yêu cầu, mã đơn..."
            className="w-full rounded-xl border border-agarwood-200 pl-8 pr-3 py-1.5 text-xs text-charcoal-800 focus:border-agarwood-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Returns List */}
      <div className="space-y-4">
        {filteredReturns.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-charcoal-200 bg-white p-12 text-center text-charcoal-400">
            <RotateCcw className="h-10 w-10 text-charcoal-300 mx-auto mb-3" />
            <p className="text-sm font-semibold">
              Hiện không có yêu cầu đổi trả / hoàn hàng nào
            </p>
          </div>
        ) : (
          filteredReturns.map((ret) => {
            const isReceived =
              ret.status === "ITEM_RECEIVED" || ret.status === "COMPLETED";

            return (
              <div
                key={ret.id}
                className="rounded-2xl bg-white border border-agarwood-100 shadow-sm p-5 hover:border-agarwood-300 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-charcoal-100 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-purple-900 text-sm">
                      {ret.requestCode}
                    </span>
                    <span className="text-charcoal-400">|</span>
                    <span className="text-charcoal-600">
                      Đơn gốc:{" "}
                      <strong className="font-mono text-agarwood-900">
                        {ret.orderCode}
                      </strong>
                    </span>
                    <span className="text-charcoal-400">|</span>
                    <span className="text-charcoal-400">
                      {new Date(ret.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <div>
                    {isReceived ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Đã tiếp nhận vào kho
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">
                        Chờ thủ kho kiểm hàng
                      </span>
                    )}
                  </div>
                </div>

                <div className="py-3 grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                  <div className="md:col-span-8 space-y-1.5">
                    <p className="text-charcoal-500">
                      Lý do khách gửi yêu cầu:{" "}
                      <strong className="text-charcoal-900 font-semibold">
                        {getReasonLabel(ret.reason)}
                      </strong>
                    </p>
                    <p className="text-charcoal-600 bg-charcoal-50 p-2.5 rounded-xl border border-charcoal-100">
                      {ret.description || "Không có ghi chú thêm từ khách hàng"}
                    </p>
                  </div>

                  <div className="md:col-span-4 flex items-center justify-end">
                    {!isReceived ? (
                      <button
                        onClick={() => {
                          setSelectedReturn(ret);
                          setInspectAction("RESTOCK");
                          setInspectNote(
                            "Đã kiểm tra kiện hàng hoàn: Vỏ hộp còn nguyên seal, sản phẩm không trầy xước, đủ phụ kiện.",
                          );
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 px-4 py-2.5 text-xs font-semibold text-cream shadow-sm transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Kiểm Tra & Nhập Kho Hoàn</span>
                      </button>
                    ) : (
                      <div className="text-right text-[11px] text-charcoal-400">
                        Kiện hàng này đã được thủ kho thẩm định và phân loại
                        xong.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Inspect & Restock Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-700/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-agarwood-100 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-agarwood-100 px-6 py-4 bg-purple-50/70">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-purple-700" />
                <h3 className="font-serif text-lg font-bold text-purple-950">
                  Kiểm Định Kiện Hàng Hoàn
                </h3>
              </div>
              <button
                onClick={() => setSelectedReturn(null)}
                className="rounded-lg p-1.5 text-charcoal-400 hover:bg-white hover:text-charcoal-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <form
              onSubmit={handleConfirmInspect}
              className="p-6 space-y-4 text-xs"
            >
              <div className="rounded-xl bg-ivory p-3 border border-agarwood-100 space-y-1">
                <p>
                  Mã yêu cầu:{" "}
                  <strong className="font-mono text-purple-900">
                    {selectedReturn.requestCode}
                  </strong>
                </p>
                <p>
                  Đơn hàng:{" "}
                  <strong className="font-mono text-agarwood-900">
                    {selectedReturn.orderCode}
                  </strong>
                </p>
              </div>

              {/* Action Choice */}
              <div>
                <label className="block font-semibold text-charcoal-700 mb-2">
                  Kết quả kiểm định thực tế của Thủ kho:
                </label>
                <div className="space-y-2">
                  <label
                    onClick={() => {
                      setInspectAction("RESTOCK");
                      setInspectNote(
                        "Hàng còn nguyên seal hộp Mộc Trầm, phụ kiện đầy đủ, đủ điều kiện nhập lại kho bán.",
                      );
                    }}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      inspectAction === "RESTOCK"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                        : "bg-white border-charcoal-200 text-charcoal-700 hover:bg-charcoal-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="inspectAction"
                      checked={inspectAction === "RESTOCK"}
                      onChange={() => {}}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="font-bold">
                        Đủ điều kiện nhập lại kho bán (Restock)
                      </p>
                      <p className="text-[11px] text-charcoal-500 mt-0.5">
                        Hệ thống sẽ tự động cộng lại số lượng tồn kho cho các
                        sản phẩm trong đơn.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => {
                      setInspectAction("DAMAGED");
                      setInspectNote(
                        "Hàng bị trầy xước / vỡ nứt / mất phụ kiện trong vận chuyển, chuyển khu vực phế phẩm chờ thanh lý.",
                      );
                    }}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      inspectAction === "DAMAGED"
                        ? "bg-red-50 border-red-300 text-red-950"
                        : "bg-white border-charcoal-200 text-charcoal-700 hover:bg-charcoal-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="inspectAction"
                      checked={inspectAction === "DAMAGED"}
                      onChange={() => {}}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-red-700">
                        Hàng lỗi / Hư hỏng (Defective)
                      </p>
                      <p className="text-[11px] text-charcoal-500 mt-0.5">
                        Không nhập lại kho bán thường. Chuyển vào kho phế phẩm
                        hoặc lập biên bản bồi thường hãng vận chuyển.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">
                  Biên bản kiểm tra thực tế:
                </label>
                <textarea
                  rows={3}
                  value={inspectNote}
                  onChange={(e) => setInspectNote(e.target.value)}
                  className="w-full rounded-xl border border-agarwood-200 p-2.5 focus:border-agarwood-500 focus:outline-none"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-agarwood-100">
                <button
                  type="button"
                  onClick={() => setSelectedReturn(null)}
                  className="rounded-xl border border-charcoal-200 px-4 py-2 font-semibold text-charcoal-600 hover:bg-charcoal-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-purple-700 hover:bg-purple-800 px-5 py-2 font-semibold text-cream transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Đang lưu..." : "Xác nhận kết quả"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
